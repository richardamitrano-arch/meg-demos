/*!
 * scrub-hero.js
 * A section whose footage plays forward as the visitor scrolls down and backward
 * as they scroll up. Primary engine: a WebP frame sequence painted on <canvas>
 * from decoded ImageBitmaps. Fallback: a short-GOP video seeked through
 * currentTime. Static hold frame for reduced motion, Save-Data and errors.
 *
 * No dependencies. Load as a classic deferred script; every element with
 * [data-scrub] is mounted automatically. State for debugging and QA lives in
 * ScrubHero.instances[n].state.
 */
(function (global) {
  'use strict';

  var DEFAULTS = {
    manifest: 'manifest.json',
    engine: 'auto',           // 'auto' | 'canvas' | 'video' | 'static'
    smoothing: 0.085,         // seconds: time constant of the frame-rate independent ease (0 = none)
    dprCap: 2,                // device pixels per CSS pixel, at most
    maxCanvasPixels: 4200000, // hard ceiling for the canvas backing store (~2560 x 1640)
    upscaleLimit: 1.2,        // use the smallest variant that is enlarged at most this much
    memoryMB: 0,              // decoded-frame budget; 0 = auto (64 MB on phones, 192 MB otherwise)
    concurrency: 6,           // parallel frame requests
    decoders: 3,              // parallel decodes
    fade: 0.04,               // caption fade length, as a fraction of the section's progress
    hold: 'last',             // frame shown in static mode: 'last' | 'first'
    focus: [0.5, 0.5]         // cover-crop anchor x, y (0..1), like object-position
  };

  // ------------------------------------------------------------------ helpers

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function smoothstep(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }
  function nowMs() { return global.performance ? performance.now() : Date.now(); }
  function matches(q) { return !!(global.matchMedia && global.matchMedia(q).matches); }
  function assign(t) {
    for (var i = 1; i < arguments.length; i++) {
      var s = arguments[i]; if (!s) continue;
      for (var k in s) if (Object.prototype.hasOwnProperty.call(s, k)) t[k] = s[k];
    }
    return t;
  }
  function framePath(pattern, i) {
    return pattern.replace(/%0?(\d*)d/, function (_, w) {
      var s = String(i), n = +w || 0;
      while (s.length < n) s = '0' + s;
      return s;
    });
  }
  function dims(img) {
    return { w: img.naturalWidth || img.width, h: img.naturalHeight || img.height };
  }
  function release(img) { if (img && typeof img.close === 'function') img.close(); }

  function decodeBlob(blob) {
    // createImageBitmap decodes off the main thread and keeps the pixels ready,
    // so drawImage never pays for a lazy decode in the middle of a scroll.
    if (typeof global.createImageBitmap === 'function') return global.createImageBitmap(blob);
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(blob), img = new Image();
      img.onload = function () {
        var done = function () { URL.revokeObjectURL(url); resolve(img); };
        img.decode ? img.decode().then(done, done) : done();
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('image decode failed')); };
      img.src = url;
    });
  }

  // Coarse to fine: first + last, then every 64th, 32nd ... so a fast scrub
  // early on always finds a frame close to the one it wants.
  function fetchOrder(count) {
    var order = [], seen = new Uint8Array(count), step = 1, i;
    function add(n) { if (n >= 0 && n < count && !seen[n]) { seen[n] = 1; order.push(n); } }
    add(0); add(count - 1);
    while (step * 2 < count) step *= 2;
    for (; step >= 1; step /= 2) for (i = 0; i < count; i += step) add(i);
    return order;
  }

  function pickVariant(list, w, h, limit) {
    var portrait = h > w;
    var pool = list.filter(function (v) { return (v.h > v.w) === portrait; });
    if (!pool.length) pool = list.slice();
    pool.sort(function (a, b) { return a.w * a.h - b.w * b.h; });
    for (var i = 0; i < pool.length; i++) {
      if (Math.max(w / pool[i].w, h / pool[i].h) <= limit) return pool[i];
    }
    return pool[pool.length - 1];
  }

  function ringSize(v, count, mb) {
    if (!mb) {
      var small = matches('(pointer: coarse)') ||
        (navigator.deviceMemory && navigator.deviceMemory <= 4);
      mb = small ? 64 : 192;
    }
    return clamp(Math.floor(mb * 1048576 / (v.w * v.h * 4)), Math.min(12, count), count);
  }

  function readData(el) {
    var o = {}, d = el.dataset;
    if (d.manifest) o.manifest = d.manifest;
    if (d.engine) o.engine = d.engine;
    if (d.smoothing) o.smoothing = parseFloat(d.smoothing);
    if (d.memoryMb) o.memoryMB = parseFloat(d.memoryMb);
    if (d.hold) o.hold = d.hold;
    if (d.focus) {
      var f = d.focus.split(/[\s,]+/).map(parseFloat);
      if (f.length === 2 && !isNaN(f[0]) && !isNaN(f[1])) o.focus = f;
    }
    return o;
  }

  // --------------------------------------------------------------- FrameStore
  // Holds every compressed frame (small) and a ring of decoded frames (large)
  // around the current position. Frames outside the ring are closed.

  function FrameStore(variant, base, count, ring, opts, onFrame, onFail) {
    this.v = variant; this.base = base; this.count = count; this.ring = ring; this.opts = opts;
    this.onFrame = onFrame; this.onFail = onFail;
    this.blobs = new Array(count);
    this.imgs = new Array(count);
    this.st = new Uint8Array(count);   // 0 idle, 1 fetching, 2 blob, 3 decoding, 4 decoded, 5 failed
    this.tries = new Uint8Array(count);
    this.order = fetchOrder(count); this.qpos = 0;
    this.center = 0; this.dir = 1; this.lo = 0; this.hi = Math.min(count - 1, ring);
    this.fetching = 0; this.decoding = 0; this.failed = 0;
    this.frozen = false; this.dead = false;
    this.ctrl = typeof AbortController === 'function' ? new AbortController() : null;
  }

  FrameStore.prototype.url = function (i) {
    return new URL(framePath(this.v.pattern, i), this.base).href;
  };

  FrameStore.prototype.setCenter = function (i, dir) {
    this.center = clamp(i, 0, this.count - 1);
    if (dir) this.dir = dir;
    var ahead = Math.ceil(this.ring * 0.65), behind = this.ring - ahead, t;
    if (this.dir < 0) { t = ahead; ahead = behind; behind = t; }
    var lo = this.center - behind, hi = this.center + ahead;
    if (lo < 0) { hi -= lo; lo = 0; }
    if (hi > this.count - 1) { lo -= hi - (this.count - 1); hi = this.count - 1; }
    this.lo = Math.max(0, lo); this.hi = hi;
    this.pump();
  };

  FrameStore.prototype.pump = function () {
    if (this.dead || this.frozen) return;
    var i;
    for (i = 0; i < this.count; i++) {
      if (this.st[i] === 4 && (i < this.lo || i > this.hi)) {
        release(this.imgs[i]); this.imgs[i] = null; this.st[i] = 2;
      }
    }
    while (this.decoding < this.opts.decoders && (i = this.nextDecode()) >= 0) this.decode(i);
    while (this.fetching < this.opts.concurrency && (i = this.nextFetch()) >= 0) this.fetch(i);
  };

  FrameStore.prototype.nextDecode = function () {
    for (var d = 0; d <= this.count; d++) {
      var a = this.center + d * this.dir, b = this.center - d * this.dir;
      var aIn = a >= this.lo && a <= this.hi, bIn = b >= this.lo && b <= this.hi;
      if (!aIn && !bIn) break;
      if (aIn && this.st[a] === 2) return a;
      if (d && bIn && this.st[b] === 2) return b;
    }
    return -1;
  };

  FrameStore.prototype.nextFetch = function () {
    var d, a, b;
    for (d = 0; d < 8; d++) { // the frames the visitor is about to see come first
      a = this.center + d * this.dir; b = this.center - d * this.dir;
      if (a >= 0 && a < this.count && this.st[a] === 0) return a;
      if (b >= 0 && b < this.count && this.st[b] === 0) return b;
    }
    while (this.qpos < this.order.length) {
      a = this.order[this.qpos++];
      if (this.st[a] === 0) return a;
    }
    for (a = 0; a < this.count; a++) if (this.st[a] === 0) return a; // retries
    return -1;
  };

  FrameStore.prototype.fetch = function (i) {
    var self = this;
    this.st[i] = 1; this.fetching++;
    fetch(this.url(i), this.ctrl ? { signal: this.ctrl.signal } : undefined)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + r.url);
        return r.blob();
      })
      .then(function (blob) {
        self.fetching--;
        if (self.dead) return;
        self.blobs[i] = blob; self.st[i] = 2;
        self.pump();
      }, function (err) {
        self.fetching--;
        if (self.dead || self.frozen) return;
        self.tries[i]++;
        self.st[i] = self.tries[i] < 2 ? 0 : 5;
        if (self.st[i] === 5 && ++self.failed > Math.max(2, self.count * 0.05)) {
          self.onFail(err);
          return;
        }
        setTimeout(function () { self.pump(); }, 300);
      });
  };

  FrameStore.prototype.decode = function (i) {
    var self = this;
    this.st[i] = 3; this.decoding++;
    decodeBlob(this.blobs[i]).then(function (img) {
      self.decoding--;
      if (self.dead) { release(img); return; }
      if (i < self.lo || i > self.hi) { release(img); self.st[i] = 2; self.pump(); return; }
      self.imgs[i] = img; self.st[i] = 4;
      self.onFrame(i, self);
      self.pump();
    }, function () {
      self.decoding--;
      if (self.dead) return;
      self.st[i] = 5; self.failed++;
      self.pump();
    });
  };

  // Closest decoded frame, preferring the side the visitor is coming from so a
  // late decode never makes the picture step backwards against the scroll.
  FrameStore.prototype.nearest = function (i, dir) {
    if (this.st[i] === 4) return i;
    var back = dir < 0 ? 1 : -1, d, a, b;
    for (d = 1; d < this.count; d++) {
      b = i + d * back; a = i - d * back;
      if (b >= 0 && b < this.count && this.st[b] === 4) return b;
      if (d > 3 && a >= 0 && a < this.count && this.st[a] === 4) return a;
    }
    for (d = 1; d <= 3; d++) {
      a = i - d * back;
      if (a >= 0 && a < this.count && this.st[a] === 4) return a;
    }
    return -1;
  };

  FrameStore.prototype.freeze = function () {
    this.frozen = true;
    if (this.ctrl) this.ctrl.abort();
  };

  FrameStore.prototype.dispose = function () {
    this.dead = true;
    if (this.ctrl) this.ctrl.abort();
    for (var i = 0; i < this.count; i++) { release(this.imgs[i]); this.imgs[i] = null; this.st[i] = 0; }
    this.blobs = [];
  };

  // ---------------------------------------------------------------- ScrubHero

  function ScrubHero(section, options) {
    this.section = section;
    this.overrides = options || null;
    this.opts = assign({}, DEFAULTS, readData(section), options);
    this.stage = section.querySelector('.scrub__stage') || section;
    this.canvas = section.querySelector('canvas.scrub__canvas');
    this.scrim = section.querySelector('.scrub__scrim');
    this.posterImg = section.querySelector('.scrub__poster img, img.scrub__poster');
    this.captions = [].map.call(section.querySelectorAll('[data-in]'), function (el) {
      return {
        el: el,
        a: parseFloat(el.getAttribute('data-in')) || 0,
        b: el.hasAttribute('data-out') ? parseFloat(el.getAttribute('data-out')) : 1,
        o: -1
      };
    });
    this.state = {
      engine: 'pending', ready: false, reason: '', error: '', variant: '', ring: 0,
      count: 0, progress: 0, target: 0, current: 0, drawn: -1, exact: false, settled: false,
      layout: null, rafless: false, ticks: 0, draws: 0, firstDrawMs: 0
    };
    this._tick = this.tick.bind(this);
    this._wake = this.wake.bind(this);
    this._watchdog = this.watchdog.bind(this);
    this._onVisible = this.onVisible.bind(this);
    this._onResize = this.resize.bind(this);
    this._onOrient = function () { setTimeout(this._onResize, 250); }.bind(this);
    this.raf = 0; this.wd = 0; this.lastT = 0; this.dir = 1;
    this.needsDraw = true; this.live = false; this.dead = false;
    this.store = null; this.prev = null; this.drawnFrom = null; this.ro = null;
    this.video = null; this.blobUrl = null; this.swapped = [];
    this.ready = this.start();
  }

  ScrubHero.prototype.start = function () {
    var self = this, o = this.opts;
    var reduce = matches('(prefers-reduced-motion: reduce)');
    var conn = navigator.connection, save = !!(conn && conn.saveData);
    if (o.engine === 'static' || reduce || save) {
      return this.loadManifest().catch(function () { return null; }).then(function () {
        self.startStatic(reduce ? 'reduced-motion' : save ? 'save-data' : 'option');
      });
    }
    return this.loadManifest().then(function () {
      if (o.engine === 'video') return self.startVideo();
      return self.startCanvas().catch(function (err) {
        console.warn('[scrub-hero] frame sequence unavailable, trying the video fallback:', err);
        self.teardown();
        return self.startVideo();
      });
    }).catch(function (err) {
      console.warn('[scrub-hero] showing the static hold frame:', err);
      self.teardown();
      self.startStatic('error');
      self.state.error = String((err && err.message) || err);
    });
  };

  ScrubHero.prototype.loadManifest = function () {
    var self = this;
    var url = new URL(this.opts.manifest, document.baseURI).href;
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('manifest HTTP ' + r.status);
      return r.json();
    }).then(function (m) {
      if (!m || !(m.count > 1) || !m.variants || !m.variants.length) throw new Error('manifest lists no frames');
      self.manifest = m; self.base = url; self.state.count = m.count;
      return m;
    });
  };

  // ---- static: reduced motion, Save-Data, or nothing else worked
  ScrubHero.prototype.startStatic = function (reason) {
    var m = this.manifest, base = this.base, self = this;
    this.section.classList.add('scrub--static');
    this.section.classList.remove('scrub--live');
    var hold = m && (this.opts.hold === 'first' ? m.poster : m.end);
    if (hold && this.posterImg) {
      var swap = function (el, attr, file) {
        if (!file) return;
        self.swapped.push([el, attr, el.getAttribute(attr)]);
        el.setAttribute(attr, new URL(file, base).href);
      };
      var pic = this.posterImg.parentNode;
      if (pic && pic.nodeName === 'PICTURE') {
        [].forEach.call(pic.querySelectorAll('source'), function (s) {
          swap(s, 'srcset', /portrait/.test(s.media || '') ? (hold.portrait || hold.landscape) : hold.landscape);
        });
      }
      swap(this.posterImg, 'src', hold.landscape);
    }
    var s = this.state;
    s.engine = 'static'; s.reason = reason;
    s.drawn = m ? (this.opts.hold === 'first' ? 0 : m.count - 1) : -1;
    s.exact = true; s.settled = true; s.ready = true;
  };

  // ---- canvas image sequence (primary)
  ScrubHero.prototype.startCanvas = function () {
    if (!this.canvas) return Promise.reject(new Error('no canvas.scrub__canvas in the section'));
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    if (!this.ctx) return Promise.reject(new Error('2d canvas unavailable'));
    this.state.engine = 'canvas';
    this.listen();
    this.resize();
    this.state.ready = true;
    this.wake();
    return Promise.resolve();
  };

  ScrubHero.prototype.useVariant = function (v) {
    var self = this;
    if (this.prev) this.prev.dispose();
    this.prev = this.store;            // keeps painting until the new size has the frame
    if (this.prev) this.prev.freeze();
    var ring = ringSize(v, this.manifest.count, this.opts.memoryMB);
    this.store = new FrameStore(v, this.base, this.manifest.count, ring, this.opts,
      function (i, store) { self.onFrame(i, store); },
      function (err) { self.onStoreFail(err); });
    this.store.setCenter(Math.round(this.state.target), this.dir);
    this.state.variant = v.name; this.state.ring = ring;
  };

  ScrubHero.prototype.onFrame = function () {
    if (!this.state.exact || !this.live) this.wake();
  };

  ScrubHero.prototype.onStoreFail = function (err) {
    var self = this;
    console.warn('[scrub-hero] too many frames failed, trying the video fallback:', err);
    this.teardown();
    this.startVideo().catch(function (e) {
      console.warn('[scrub-hero] showing the static hold frame:', e);
      self.teardown();
      self.startStatic('error');
    });
  };

  ScrubHero.prototype.paint = function (img) {
    var c = this.canvas, d = dims(img), cw = c.width, ch = c.height;
    var k = Math.max(cw / d.w, ch / d.h), dw = d.w * k, dh = d.h * k;
    var dx = (cw - dw) * this.opts.focus[0], dy = (ch - dh) * this.opts.focus[1];
    this.ctx.drawImage(img, dx, dy, dw, dh);
    this.state.layout = { dx: dx, dy: dy, dw: dw, dh: dh, iw: d.w, ih: d.h, cw: cw, ch: ch };
  };

  ScrubHero.prototype.markLive = function () {
    if (this.live) return;
    this.live = true;
    this.state.firstDrawMs = Math.round(nowMs());
    this.section.classList.add('scrub--live');
  };

  ScrubHero.prototype.render = function (idx) {
    var s = this.state;
    if (s.engine === 'video') return this.seekVideo(idx);
    if (s.engine !== 'canvas' || !this.store) return;
    var src = this.store, j = src.nearest(idx, this.dir);
    if (j < 0 && this.prev) { src = this.prev; j = src.nearest(idx, this.dir); }
    if (j < 0) { s.exact = false; return; } // nothing decoded yet: the poster stays visible
    if (j !== s.drawn || src !== this.drawnFrom || this.needsDraw) {
      this.paint(src.imgs[j]);
      s.drawn = j; s.draws++;
      this.drawnFrom = src; this.needsDraw = false;
      this.canvas.setAttribute('data-frame', j);
      this.markLive();
    }
    s.exact = src === this.store && j === idx;
    if (s.exact && this.prev) { this.prev.dispose(); this.prev = null; }
  };

  // ---- video.currentTime (fallback)
  ScrubHero.prototype.startVideo = function () {
    var self = this, m = this.manifest, list = (m && m.video) || [], pick = null, i;
    var probe = document.createElement('video');
    for (i = 0; i < list.length; i++) if (probe.canPlayType(list[i].type)) { pick = list[i]; break; }
    if (!pick) return Promise.reject(new Error('no playable fallback video in the manifest'));
    // Download the whole file and play it from a Blob URL: seeking then never
    // depends on the host answering HTTP Range requests correctly.
    return fetch(new URL(pick.src, this.base).href).then(function (r) {
      if (!r.ok) throw new Error('video HTTP ' + r.status);
      return r.blob();
    }).then(function (blob) {
      var v = document.createElement('video');
      v.className = 'scrub__video';
      v.muted = true; v.defaultMuted = true; v.playsInline = true; v.preload = 'auto';
      v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
      v.setAttribute('aria-hidden', 'true'); v.setAttribute('tabindex', '-1');
      v.disablePictureInPicture = true; v.disableRemotePlayback = true;
      v.style.objectPosition = (self.opts.focus[0] * 100) + '% ' + (self.opts.focus[1] * 100) + '%';
      self.blobUrl = URL.createObjectURL(blob);
      v.src = self.blobUrl;
      var anchor = self.canvas || (self.posterImg && self.posterImg.closest('picture')) || self.posterImg;
      if (anchor) anchor.insertAdjacentElement('afterend', v); else self.stage.appendChild(v);
      self.video = v;
      return new Promise(function (resolve, reject) {
        v.addEventListener('loadeddata', resolve, { once: true });
        v.addEventListener('error', function () {
          reject(new Error('video error ' + (v.error ? v.error.code : '?')));
        }, { once: true });
      });
    }).then(function () {
      var v = self.video;
      self.fps = m.fps || m.count / v.duration;
      self.seekBusy = false; self.pending = -1; self.requested = -1;
      v.addEventListener('seeked', function () { self.onSeeked(); });
      // iOS Safari paints seeked frames reliably only once the element has played.
      var p = v.play();
      return p && p.then ? p.then(function () { v.pause(); }, function () {}) : null;
    }).then(function () {
      self.video.pause();
      self.state.engine = 'video'; self.state.variant = pick.src;
      self.listen();
      self.resize();
      self.state.ready = true;
      self.wake();
    });
  };

  ScrubHero.prototype.seekVideo = function (idx) {
    var v = this.video, s = this.state;
    if (!v) return;
    if (this.seekBusy) { this.pending = idx; s.exact = false; return; }
    if (idx === this.requested && !this.needsDraw) { s.exact = s.drawn === idx; return; }
    this.requested = idx; this.seekBusy = true; this.needsDraw = false; s.exact = false;
    // Aim at the middle of the frame so rounding never lands on its neighbour.
    v.currentTime = Math.min((idx + 0.5) / this.fps, Math.max(0, v.duration - 0.001));
  };

  ScrubHero.prototype.onSeeked = function () {
    var s = this.state;
    this.seekBusy = false;
    s.drawn = this.requested; s.draws++;
    this.markLive();
    if (this.pending >= 0 && this.pending !== this.requested) {
      var p = this.pending; this.pending = -1;
      this.seekVideo(p);
      return;
    }
    this.pending = -1;
    this.wake();
  };

  // ---- shared loop
  ScrubHero.prototype.listen = function () {
    global.addEventListener('scroll', this._wake, { passive: true });
    global.addEventListener('orientationchange', this._onOrient);
    document.addEventListener('visibilitychange', this._onVisible);
    global.addEventListener('pageshow', this._onVisible);
    if (this.canvas) this.canvas.addEventListener('contextrestored', this._onVisible); // GPU reset
    if (typeof ResizeObserver === 'function') {
      this.ro = new ResizeObserver(this._onResize);
      this.ro.observe(this.stage);
    } else {
      global.addEventListener('resize', this._onResize, { passive: true });
    }
  };

  ScrubHero.prototype.resize = function () {
    var r = this.stage.getBoundingClientRect();
    if (!r.width || !r.height || !this.manifest) return;
    this.stageH = r.height;
    if (this.state.engine === 'canvas') {
      var dpr = Math.min(global.devicePixelRatio || 1, this.opts.dprCap);
      var w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
      var k = Math.sqrt(this.opts.maxCanvasPixels / (w * h));
      if (k < 1) { w = Math.round(w * k); h = Math.round(h * k); }
      if (w !== this.canvas.width || h !== this.canvas.height) {
        this.canvas.width = w; this.canvas.height = h; // clears pixels and context state
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        this.needsDraw = true;
      }
      var v = pickVariant(this.manifest.variants, w, h, this.opts.upscaleLimit);
      if (!this.store || this.store.v !== v) this.useVariant(v);
    }
    // Paint now: a resized canvas is blank, and a ResizeObserver callback runs
    // before the browser paints, so the visitor never sees the empty frame.
    this.readScroll();
    this.render(Math.round(this.state.current));
    this.wake();
  };

  ScrubHero.prototype.readScroll = function () {
    var s = this.state, r = this.section.getBoundingClientRect();
    var travel = r.height - (this.stageH || this.stage.offsetHeight);
    var p = travel > 0 ? clamp(-r.top / travel, 0, 1) || 0 : 0; // || 0 turns -0 into 0
    var tgt = p * (s.count - 1);
    if (tgt !== s.target) {
      this.dir = tgt > s.target ? 1 : -1;
      if (this.store) this.store.setCenter(Math.round(tgt), this.dir);
    }
    s.progress = p; s.target = tgt;
  };

  ScrubHero.prototype.wake = function () {
    if (this.raf || this.dead || !this.state.ready && this.state.engine === 'pending') return;
    this.raf = requestAnimationFrame(this._tick);
    clearTimeout(this.wd);
    this.wd = setTimeout(this._watchdog, 150);
  };

  // rAF did not fire within 150 ms: a background tab or an embedded preview
  // that never paints. Draw once from the timer so the frame still matches.
  ScrubHero.prototype.watchdog = function () {
    if (!this.raf) return;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.state.rafless = true;
    this.tick(nowMs(), true);
  };

  ScrubHero.prototype.tick = function (t, fromTimer) {
    this.raf = 0;
    clearTimeout(this.wd);
    if (this.dead) return;
    var s = this.state;
    if (!fromTimer) s.rafless = false;
    var dt = this.lastT ? Math.min((t - this.lastT) / 1000, 0.1) : 1 / 60;
    this.lastT = t; s.ticks++;
    this.readScroll();
    // Exponential approach with a time constant: identical feel at 60, 120 or 30 Hz.
    var tau = s.rafless ? 0 : this.opts.smoothing, cur = s.current, tgt = s.target;
    cur = tau > 0 ? cur + (tgt - cur) * (1 - Math.exp(-dt / tau)) : tgt;
    // Frames are whole numbers: once the visible frame is the target frame, stop
    // easing the invisible fraction and let the loop sleep. The 0.02 floor ends
    // the approach when the target sits exactly between two frames (n + 0.5).
    var gap = Math.abs(tgt - cur);
    if (gap < 0.02 || (gap < 0.5 && Math.round(cur) === Math.round(tgt))) cur = tgt;
    s.current = cur;
    this.render(Math.round(cur));
    this.updateCaptions(cur / (s.count - 1));
    s.settled = cur === tgt && s.exact;
    if (cur !== tgt) this.wake();
    else { this.lastT = 0; this.restCaptions(); } // asleep until the next scroll, resize or decoded frame
  };

  // At rest, never leave a caption half-transparent (a visitor who stops inside a fade
  // would otherwise read grey text on a grey button): finish the nearest fade. The CSS
  // transition on .cap makes this, and the next scroll-driven value, ease instead of jump.
  ScrubHero.prototype.restCaptions = function () {
    var top = 0;
    for (var i = 0; i < this.captions.length; i++) {
      var c = this.captions[i];
      if (c.o > 0.002 && c.o < 0.998) {
        c.o = c.o >= 0.5 ? 1 : 0;
        c.el.style.opacity = String(c.o);
        c.el.style.transform = '';
        c.el.classList.toggle('is-on', c.o > 0.5);
      }
      if (c.o > top) top = c.o;
    }
    if (this.scrim) this.scrim.style.opacity = (0.35 + 0.65 * top).toFixed(3);
  };

  ScrubHero.prototype.updateCaptions = function (p) {
    var f = this.opts.fade, top = 0;
    for (var i = 0; i < this.captions.length; i++) {
      var c = this.captions[i];
      var o = Math.min(c.a <= 0 ? 1 : smoothstep((p - c.a) / f), c.b >= 1 ? 1 : smoothstep((c.b - p) / f));
      if (o > top) top = o;
      if (Math.abs(o - c.o) < 0.002) continue;
      c.o = o;
      c.el.style.opacity = o.toFixed(3);
      c.el.style.transform = o < 1 ? 'translate3d(0,' + ((1 - o) * 14).toFixed(1) + 'px,0)' : '';
      c.el.classList.toggle('is-on', o > 0.5);
    }
    if (this.scrim) this.scrim.style.opacity = (0.35 + 0.65 * top).toFixed(3);
  };

  ScrubHero.prototype.onVisible = function () {
    if (document.visibilityState === 'hidden') return;
    // Some mobile browsers drop canvas backing stores in the background: repaint.
    this.needsDraw = true; this.lastT = 0;
    this.wake();
  };

  ScrubHero.prototype.teardown = function () {
    global.removeEventListener('scroll', this._wake);
    global.removeEventListener('resize', this._onResize);
    global.removeEventListener('orientationchange', this._onOrient);
    document.removeEventListener('visibilitychange', this._onVisible);
    global.removeEventListener('pageshow', this._onVisible);
    if (this.canvas) this.canvas.removeEventListener('contextrestored', this._onVisible);
    if (this.ro) { this.ro.disconnect(); this.ro = null; }
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0; clearTimeout(this.wd);
    if (this.store) this.store.dispose();
    if (this.prev) this.prev.dispose();
    this.store = this.prev = this.drawnFrom = null;
    if (this.video) {
      this.video.removeAttribute('src'); this.video.load(); this.video.remove(); this.video = null;
    }
    if (this.blobUrl) { URL.revokeObjectURL(this.blobUrl); this.blobUrl = null; }
    this.swapped.forEach(function (x) {
      if (x[2] === null) x[0].removeAttribute(x[1]); else x[0].setAttribute(x[1], x[2]);
    });
    this.swapped = [];
    this.live = false; this.needsDraw = true;
    this.section.classList.remove('scrub--live', 'scrub--static');
    this.captions.forEach(function (c) {
      c.o = -1; c.el.style.opacity = ''; c.el.style.transform = ''; c.el.classList.remove('is-on');
    });
    if (this.scrim) this.scrim.style.opacity = '';
    var s = this.state;
    s.engine = 'pending'; s.ready = false; s.drawn = -1; s.exact = false; s.settled = false;
  };

  ScrubHero.prototype.destroy = function () {
    this.teardown();
    this.dead = true;
    var i = ScrubHero.instances.indexOf(this);
    if (i >= 0) ScrubHero.instances.splice(i, 1);
  };

  // ------------------------------------------------------------- auto mount

  ScrubHero.instances = [];
  ScrubHero.defaults = DEFAULTS;
  ScrubHero.mount = function (el, options) {
    var h = new ScrubHero(el, options);
    ScrubHero.instances.push(h);
    return h;
  };

  function autoMount() {
    document.documentElement.classList.add('js');
    // Debug / QA override: ?engine=canvas|video|static
    var forced = new URLSearchParams(global.location.search).get('engine');
    var opts = forced ? { engine: forced } : null;
    [].forEach.call(document.querySelectorAll('[data-scrub]'), function (el) {
      ScrubHero.mount(el, opts);
    });
    var mql = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)');
    if (!mql) return;
    var remount = function () {
      ScrubHero.instances.slice().forEach(function (h) {
        var el = h.section, o = h.overrides;
        h.destroy();
        ScrubHero.mount(el, o);
      });
    };
    if (mql.addEventListener) mql.addEventListener('change', remount);
    else if (mql.addListener) mql.addListener(remount);
  }

  global.ScrubHero = ScrubHero;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoMount);
  else autoMount();
})(window);

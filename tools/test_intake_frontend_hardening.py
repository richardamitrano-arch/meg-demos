#!/usr/bin/env python3
"""Offline checks for every public MEG intake form.

Use ``--deployment-ready`` only after the real public Turnstile site key has been
inserted; that mode intentionally fails while the safe placeholder is present.
"""

from __future__ import annotations

import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
PAGES = [
    ROOT / "index.html",
    ROOT / "meg" / "index.html",
    ROOT / "en" / "index.html",
    ROOT / "de" / "index.html",
]
deployment_ready = "--deployment-ready" in sys.argv
failures = []


for page in PAGES:
    html = page.read_text(encoding="utf-8")
    checks = {
        "honeypot": 'name="mws_hp_field"' in html and 'name="company_website"' not in html,
        "signed form timer": (
            'name="form_started_at"' in html
            and 'name="form_start_signature"' in html
            and "/start/form-token" in html
            and "formTokenReady" in html
        ),
        "Turnstile widget": 'class="cf-turnstile"' in html and 'data-action="meg_intake"' in html,
        "Turnstile script": "challenges.cloudflare.com/turnstile/v0/api.js" in html,
        "client token gate": 'input[name="cf-turnstile-response"]' in html,
        "session attribution": (
            "meg_session_attribution" in html
            and "utm_campaign" in html
            and "landing_url" in html
            and "session_referrer" in html
        ),
        "truthful success copy": "demo is on its way" not in html and "Demo ist auf dem Weg" not in html,
    }
    if deployment_ready:
        checks["real Turnstile site key"] = "__TURNSTILE_SITE_KEY__" not in html
    for label, ok in checks.items():
        print(("PASS" if ok else "FAIL"), page.relative_to(ROOT), label)
        if not ok:
            failures.append(f"{page.relative_to(ROOT)}: {label}")

print(f"\n{sum(1 for _ in PAGES) * (8 if deployment_ready else 7) - len(failures)} passed, {len(failures)} failed")
raise SystemExit(1 if failures else 0)

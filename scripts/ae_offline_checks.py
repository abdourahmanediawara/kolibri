#!/usr/bin/env python3
"""
AE Apprendre — offline / local Wi-Fi readiness checks (no Internet required).

Usage (optional live checks if the server is up):
  export KOLIBRI_HOME="$HOME/.kolibri-action-education-dev"
  python scripts/ae_offline_checks.py
  python scripts/ae_offline_checks.py --base-url http://127.0.0.1:8000
"""
from __future__ import print_function

import argparse
import json
import os
import sys
from pathlib import Path

try:
    from urllib.request import urlopen
except ImportError:  # pragma: no cover
    from urllib2 import urlopen  # type: ignore


REPO = Path(__file__).resolve().parents[1]
REMOTE_MARKERS = (
    "https://cdn.",
    "http://cdn.",
    "fonts.googleapis.com",
    "fonts.gstatic.com",
)


def ok(msg):
    print("[OK] {}".format(msg))


def fail(msg):
    print("[FAIL] {}".format(msg))
    return 1


def check_theme_logo():
    logo = REPO.joinpath(
        "action_education_theme/static/assets/action_education_theme/action-education-logo.png"
    )
    if not logo.is_file() or logo.stat().st_size < 100:
        return fail("Theme logo missing or empty: {}".format(logo))
    ok("Theme logo packaged locally")
    return 0


def check_sources_for_cdn():
    roots = [
        REPO / "action_education_theme",
        REPO / "action_education_portal" / "frontend",
        REPO / "action_education_training",
    ]
    bad = []
    for root in roots:
        if not root.exists():
            continue
        for path in root.rglob("*"):
            if path.suffix not in {".py", ".js", ".vue", ".scss", ".css", ".html", ".md"}:
                continue
            # Skip this checker and generated docs mentioning http URLs as examples.
            if path.name in {"ae_offline_checks.py", "AE_OFFLINE_WIFI.md", "AE_DEPLOYMENT.md"}:
                continue
            text = path.read_text(encoding="utf-8", errors="ignore")
            for marker in REMOTE_MARKERS:
                if marker in text:
                    bad.append("{} -> {}".format(path.relative_to(REPO), marker))
    if bad:
        for item in bad:
            fail(item)
        return 1
    ok("No CDN URLs in AE theme/portal/training sources")
    return 0


def check_plugins_order(kolibri_home):
    path = Path(kolibri_home) / "plugins.json"
    if not path.is_file():
        return fail("plugins.json not found at {}".format(path))
    data = json.loads(path.read_text(encoding="utf-8"))
    installed = data.get("INSTALLED_PLUGINS") or []
    disabled = set(data.get("DISABLED_PLUGINS") or [])
    if "action_education_theme" not in installed:
        return fail("action_education_theme not installed")
    if "kolibri.plugins.default_theme" not in disabled:
        return fail("kolibri.plugins.default_theme should be disabled")
    if "action_education_portal" not in installed:
        return fail("action_education_portal not installed")
    if "action_education_training" not in installed:
        return fail("action_education_training not installed")
    try:
        portal_i = installed.index("action_education_portal")
        learn_i = installed.index("kolibri.plugins.learn")
    except ValueError:
        return fail("learn or portal missing from INSTALLED_PLUGINS")
    if portal_i > learn_i:
        return fail(
            "action_education_portal must appear BEFORE kolibri.plugins.learn "
            "in plugins.json (currently portal index {}, learn index {})".format(
                portal_i, learn_i
            )
        )
    ok("Plugin order: portal before learn; AE theme active")
    return 0


def check_options_lan(kolibri_home):
    path = Path(kolibri_home) / "options.ini"
    if not path.is_file():
        return fail("options.ini missing")
    text = path.read_text(encoding="utf-8")
    # Defaults are fine: LISTEN_ADDRESS 0.0.0.0. Warn only if explicitly loopback.
    if "LISTEN_ADDRESS" in text and "127.0.0.1" in text.split("LISTEN_ADDRESS", 1)[-1][:80]:
        print(
            "[WARN] LISTEN_ADDRESS looks set to 127.0.0.1 — phones on Wi-Fi cannot connect. "
            "Use 0.0.0.0 for LAN."
        )
    else:
        ok("options.ini present (default LISTEN_ADDRESS 0.0.0.0 enables LAN)")
    return 0


def check_db_persists(kolibri_home):
    db = Path(kolibri_home) / "db.sqlite3"
    if not db.is_file():
        return fail("db.sqlite3 missing — has the device been provisioned?")
    if db.stat().st_size < 1000:
        return fail("db.sqlite3 looks empty")
    ok("Local SQLite database present ({:.1f} MB)".format(db.stat().st_size / 1e6))
    return 0


def check_live(base_url):
    errors = 0
    paths = [
        "/fr-fr/user/",
        "/fr-fr/portal/",
        "/fr-fr/learn/",
        "/fr-fr/facility/",
        "/fr-fr/device/",
    ]
    for path in paths:
        url = base_url.rstrip("/") + path
        try:
            resp = urlopen(url, timeout=8)
            code = getattr(resp, "status", None) or resp.getcode()
            body = resp.read(4000)
            if code >= 400:
                errors += fail("{} -> HTTP {}".format(url, code))
            elif b"http://cdn." in body or b"https://cdn." in body:
                errors += fail("{} HTML embeds CDN URL".format(url))
            else:
                ok("{} -> {}".format(path, code))
        except Exception as exc:
            errors += fail("{} unreachable ({})".format(url, exc))
    return errors


def ensure_portal_before_learn(kolibri_home, apply_fix):
    path = Path(kolibri_home) / "plugins.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    installed = list(data.get("INSTALLED_PLUGINS") or [])
    if "action_education_portal" not in installed or "kolibri.plugins.learn" not in installed:
        return 1
    portal_i = installed.index("action_education_portal")
    learn_i = installed.index("kolibri.plugins.learn")
    if portal_i < learn_i:
        return 0
    if not apply_fix:
        print("[HINT] Re-run with --fix-plugin-order to move portal before learn.")
        return 1
    installed.pop(portal_i)
    # After pop, learn index may shift if portal was after learn.
    learn_i = installed.index("kolibri.plugins.learn")
    installed.insert(learn_i, "action_education_portal")
    data["INSTALLED_PLUGINS"] = installed
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    ok("Rewrote plugins.json: portal now before learn")
    return 0


def main(argv=None):
    parser = argparse.ArgumentParser(description="AE offline / Wi-Fi readiness checks")
    parser.add_argument(
        "--kolibri-home",
        default=os.environ.get("KOLIBRI_HOME", ""),
        help="KOLIBRI_HOME path (default: env)",
    )
    parser.add_argument(
        "--base-url",
        default="",
        help="If set, also HTTP-smoke local pages (e.g. http://127.0.0.1:8000)",
    )
    parser.add_argument(
        "--fix-plugin-order",
        action="store_true",
        help="Rewrite plugins.json so action_education_portal is before learn",
    )
    args = parser.parse_args(argv)

    if not args.kolibri_home:
        print("Set KOLIBRI_HOME or pass --kolibri-home", file=sys.stderr)
        return 2

    errors = 0
    errors += check_theme_logo()
    errors += check_sources_for_cdn()
    errors += check_db_persists(args.kolibri_home)
    errors += check_options_lan(args.kolibri_home)
    if args.fix_plugin_order:
        errors += ensure_portal_before_learn(args.kolibri_home, apply_fix=True)
    errors += check_plugins_order(args.kolibri_home)
    if args.base_url:
        errors += check_live(args.base_url)

    if errors:
        print("\nResult: {} issue(s)".format(errors))
        return 1
    print("\nResult: all offline readiness checks passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())

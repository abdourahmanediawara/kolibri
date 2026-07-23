#!/usr/bin/env python3
import json
import sys
import time

try:
    from playwright.sync_api import sync_playwright
except Exception as e:
    print("no_playwright", e)
    sys.exit(0)

url = "http://127.0.0.1:8000/fr-fr/portal/"
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto(url, wait_until="networkidle", timeout=90000)
    time.sleep(2)
    info = page.evaluate(
        """() => ({
      hasFlapping: !!document.querySelector('.flapping-kolibri, #flapping-kolibri, [class*="flapping"]'),
      hasCore: typeof window.kolibriCoreAppGlobal !== 'undefined',
      title: document.title,
      bodyText: (document.body && document.body.innerText || '').slice(0, 1200),
      href: location.href,
    })"""
    )
    print(json.dumps(info, ensure_ascii=False, indent=2))
    browser.close()

#!/usr/bin/env python3
"""Generate Kolibri frontend message catalogs from portal strings.js."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
STRINGS = ROOT / "action_education_portal" / "frontend" / "strings.js"
LOCALE_ROOT = ROOT / "kolibri" / "locale"
BUNDLES = (
    "action_education_portal.app",
    "action_education_portal.side_nav",
)
LANG_DIRS = ("fr_FR", "en")


def decode_js_str(quoted: str) -> str:
    s = quoted[1:-1]
    out = []
    i = 0
    while i < len(s):
        if s[i] == "\\" and i + 1 < len(s):
            nxt = s[i + 1]
            if nxt == "n":
                out.append("\n")
            elif nxt == "t":
                out.append("\t")
            elif nxt in "\"'\\":
                out.append(nxt)
            elif nxt == "u" and i + 5 < len(s):
                out.append(chr(int(s[i + 2 : i + 6], 16)))
                i += 6
                continue
            else:
                out.append(nxt)
            i += 2
            continue
        out.append(s[i])
        i += 1
    return "".join(out)


def extract_messages(source: str) -> dict[str, str]:
    marker = "createTranslator('ActionEducationPortalStrings', {"
    start = source.find(marker)
    if start < 0:
        raise RuntimeError("ActionEducationPortalStrings not found in strings.js")
    brace = source.find("{", start)
    depth = 0
    end = None
    for j, ch in enumerate(source[brace:], brace):
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                end = j
                break
    body = source[brace + 1 : end]
    entries: dict[str, str] = {}
    for match in re.finditer(r"^  (\w+):\s*\{", body, re.M):
        key = match.group(1)
        start_b = match.end() - 1
        depth = 0
        block = None
        for j, ch in enumerate(body[start_b:], start_b):
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    block = body[start_b : j + 1]
                    break
        msg_m = re.search(
            r"message:\s*((?:'(?:\\'|[^'])*'|\"(?:\\\"|[^\"])*\"|\s*\+\s*)+)",
            block or "",
            re.S,
        )
        if not msg_m:
            raise RuntimeError(f"No message for key {key}")
        parts = re.findall(r"'(?:\\'|[^'])*'|\"(?:\\\"|[^\"])*\"", msg_m.group(1))
        entries[key] = "".join(decode_js_str(p) for p in parts)
    return entries


def main() -> None:
    entries = extract_messages(STRINGS.read_text(encoding="utf-8"))
    catalog = {
        f"ActionEducationPortalStrings.{key}": value
        for key, value in sorted(entries.items())
    }
    for lang_dir in LANG_DIRS:
        out_dir = LOCALE_ROOT / lang_dir / "LC_MESSAGES"
        out_dir.mkdir(parents=True, exist_ok=True)
        for bundle in BUNDLES:
            path = out_dir / f"{bundle}-messages.json"
            path.write_text(
                json.dumps(catalog, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            print(f"Wrote {path} ({len(catalog)} keys)")


if __name__ == "__main__":
    main()

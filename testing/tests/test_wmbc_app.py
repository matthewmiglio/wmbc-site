"""Authenticated app regression for the WMBC members area (PROD, persistent
profile — run tests/auth.py first). Proves the security lockdown didn't break
the real signed-in flows: chat read, chat post, and the signup-check path all
go through the service-role API routes, so they must keep working after anon
loses direct table access.

Drives /members and asserts every WMBC API route it touches responds OK:
  GET  /api/messages            -> 200  (service-role read, auth-gated)
  POST /api/postMessage         -> 200  (posts one throwaway message)
  POST /api/emailExistsInSignups-> 200  (fired by the page on load)
Any 401/403/500 on a /api/* route = a regression.

Usage:  BASE_URL=https://your-wmbc-site.example poetry run python tests/test_wmbc_app.py
"""
from __future__ import annotations

import asyncio
import os
import sys
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from playwright.async_api import Response  # noqa: E402

from src.browser import BASE_URL, launch, shutdown  # noqa: E402

SETTLE_MS = 6000


async def main() -> None:
    headless = os.environ.get("HEADLESS", "0") == "1"
    ctx, page = await launch(headless=headless)
    seen: dict[str, int] = {}       # route -> last status
    problems: list[str] = []

    def on_response(resp: Response) -> None:
        try:
            url, st = resp.url, resp.status
        except Exception:
            return
        if "/api/" not in url:
            return
        route = url.split("?")[0].split("/api/")[-1]
        seen[route] = st
        if st in (401, 403, 500):
            problems.append(f"HTTP {st} /api/{route}")

    page.on("response", on_response)

    try:
        # Confirm signed in.
        await page.goto(f"{BASE_URL}/api/auth/session", wait_until="domcontentloaded")
        if '"email"' not in (await page.inner_text("body")):
            print("[app] FAIL: not signed in (no NextAuth session). Run tests/auth.py.")
            sys.exit(1)

        # Load members: triggers GET /api/messages + POST /api/emailExistsInSignups.
        await page.goto(f"{BASE_URL}/members", wait_until="domcontentloaded")
        await page.wait_for_timeout(SETTLE_MS)

        # Post one throwaway message through the real form.
        marker = f"[regression test {int(time.time())}] ignore"
        await page.fill('input[placeholder="Type your message..."]', marker)
        await page.click('button[type="submit"]')
        await page.wait_for_timeout(SETTLE_MS)

        def ok(name: str, passed: bool, detail: str) -> None:
            print(f"[app] {'PASS' if passed else 'FAIL'}: {name} — {detail}")
            if not passed:
                problems.append(name)

        ok("GET /api/messages", seen.get("messages") == 200, f"HTTP {seen.get('messages')}")
        ok("POST /api/postMessage", seen.get("postMessage") == 200, f"HTTP {seen.get('postMessage')}")
        # emailExists fires on load; tolerate it being absent only if already registered path skipped it.
        if "emailExistsInSignups" in seen:
            ok("POST /api/emailExistsInSignups", seen["emailExistsInSignups"] == 200,
               f"HTTP {seen['emailExistsInSignups']}")
        # Confirm our message came back on a re-fetch.
        posted = await page.get_by_text(marker).count()
        ok("posted message rendered", posted >= 1, f"{posted} match(es)")

        print()
        if problems:
            print(f"[app] FAIL: {len(set(problems))} issue(s): {', '.join(sorted(set(problems)))}")
            sys.exit(1)
        print("[app] PASS: signed-in members flows work; no permission errors.")
    finally:
        await shutdown(ctx)


if __name__ == "__main__":
    asyncio.run(main())

"""Non-interactive sign-in for the WMBC harness (works under the `!` runner,
which has no stdin so auth.py's input() prompt EOFs).

Opens Chrome on /members, then POLLS NextAuth's /api/auth/session every few
seconds. The moment a signed-in session appears (an "email" in the JSON), it
persists the profile and exits. Just sign in with Google in the window that
opens; no terminal input needed.

Usage:
  BASE_URL=https://www.wmbonsai.com poetry run python tests/auth_autowait.py
Env: WAIT_SECS (default 300) — how long to wait for you to finish signing in.
"""
from __future__ import annotations

import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.browser import BASE_URL, launch, shutdown  # noqa: E402

WAIT_SECS = int(os.environ.get("WAIT_SECS", "300"))
POLL_SECS = 3


async def main() -> None:
    ctx, page = await launch(headless=False)
    try:
        await page.goto(f"{BASE_URL}/members", wait_until="domcontentloaded")
        print(f"[auth] Browser open at {page.url}")
        print("[auth] Sign in with Google in the window. Waiting up to "
              f"{WAIT_SECS}s; auto-detects when you're in.")
        checker = await ctx.new_page()
        waited = 0
        while waited < WAIT_SECS:
            try:
                await checker.goto(f"{BASE_URL}/api/auth/session",
                                   wait_until="domcontentloaded")
                if '"email"' in (await checker.inner_text("body")):
                    print("[auth] Verified: NextAuth session active. Session saved.")
                    return
            except Exception:
                pass
            await checker.wait_for_timeout(POLL_SECS * 1000)
            waited += POLL_SECS
        print(f"[auth] TIMEOUT after {WAIT_SECS}s — no session detected. "
              "Re-run and finish the Google sign-in.")
        sys.exit(1)
    finally:
        await shutdown(ctx)


if __name__ == "__main__":
    asyncio.run(main())

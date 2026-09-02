"""Interactive Google sign-in for the WMBC testing harness.

Opens installed Chrome with the persistent profile at
`testing/data/browser_profile/`, navigates to the members page, and waits for
you to sign in with Google. Once signed in and you type 'done', the NextAuth
session cookie is persisted and every other script in tests/ reuses it.

Usage:
  BASE_URL=https://your-wmbc-site.example poetry run python tests/auth.py
"""
from __future__ import annotations

import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.browser import BASE_URL, launch, shutdown  # noqa: E402


async def _confirm(prompt: str) -> None:
    """Block until the user types a confirmation word (not a stray newline)."""
    ans = ""
    while ans.strip().lower() not in ("done", "d", "y", "yes"):
        ans = await asyncio.get_event_loop().run_in_executor(None, input, prompt)


async def _signed_in(page) -> bool:
    """NextAuth exposes /api/auth/session — {} when logged out, {user:...} in."""
    for _ in range(10):
        await page.goto(f"{BASE_URL}/api/auth/session", wait_until="domcontentloaded")
        try:
            body = await page.inner_text("body")
            if '"email"' in body:
                return True
        except Exception:
            pass
        await page.wait_for_timeout(1000)
    return False


async def main() -> None:
    ctx, page = await launch(headless=False)
    try:
        await page.goto(f"{BASE_URL}/members", wait_until="domcontentloaded")
        print(f"[auth] Browser open at {page.url}")
        print("[auth] Click 'Please log in to chat' -> sign in with Google.")
        while True:
            await _confirm("[auth] Type 'done' + Enter once you're signed in >> ")
            print("[auth] Verifying (~10s)...")
            if await _signed_in(page):
                print("[auth] Verified: NextAuth session active. Session saved.")
                break
            print("[auth] Not signed in yet (no session). Try again.")
            await page.goto(f"{BASE_URL}/members", wait_until="domcontentloaded")
    finally:
        await shutdown(ctx)


if __name__ == "__main__":
    asyncio.run(main())

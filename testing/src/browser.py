"""Persistent-profile Playwright launcher for the WMBC testing harness.

Async Playwright + tf-playwright-stealth + installed Chrome (channel="chrome")
so the Google OAuth sign-in the members area uses doesn't bounce us as
"automated". The persistent user-data dir lives at `testing/data/browser_profile/`
so a session (NextAuth cookies) survives between scripts — sign in once via
tests/auth.py and every other script reuses it.

Set BASE_URL to the deployed site, e.g.
  BASE_URL=https://your-wmbc-site.example poetry run python tests/auth.py
"""
from __future__ import annotations

import os
from typing import Tuple

from playwright.async_api import BrowserContext, Page, async_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PROFILE_DIR = os.path.join(ROOT, "data", "browser_profile")

# Override with BASE_URL=... . No default: the harness targets production and
# the URL must be given explicitly so a test never silently hits the wrong site.
BASE_URL = os.environ.get("BASE_URL", "").rstrip("/")


_STEALTH_JS = r"""
Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
window.chrome = window.chrome || { runtime: {} };
const _origQuery = window.navigator.permissions && window.navigator.permissions.query;
if (_origQuery) {
  window.navigator.permissions.query = (parameters) => (
    parameters.name === 'notifications'
      ? Promise.resolve({ state: Notification.permission })
      : _origQuery(parameters)
  );
}
"""


async def launch(headless: bool = False) -> Tuple[BrowserContext, Page]:
    """Open Chrome with the persistent profile. Returns (context, page).

    The caller is responsible for `await shutdown(ctx)` when done.
    """
    if not BASE_URL:
        raise SystemExit("Set BASE_URL to the WMBC site, e.g. "
                         "BASE_URL=https://your-wmbc-site.example")
    os.makedirs(PROFILE_DIR, exist_ok=True)
    pw = await async_playwright().start()
    launch_kwargs = dict(
        user_data_dir=PROFILE_DIR,
        headless=headless,
        viewport={"width": 1440, "height": 900},
        user_agent=(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/131.0.0.0 Safari/537.36"
        ),
        args=[
            "--disable-blink-features=AutomationControlled",
            "--no-default-browser-check",
            "--no-first-run",
        ],
        ignore_default_args=["--enable-automation"],
    )
    # Prefer installed Chrome — Google OAuth's bot check is more lenient on it
    # than on bundled Chromium.
    try:
        context = await pw.chromium.launch_persistent_context(channel="chrome", **launch_kwargs)
    except Exception:
        context = await pw.chromium.launch_persistent_context(**launch_kwargs)

    await context.add_init_script(_STEALTH_JS)
    try:
        from playwright_stealth import Stealth  # type: ignore

        await Stealth().apply_stealth_async(context)
    except ImportError:
        pass

    page = context.pages[0] if context.pages else await context.new_page()
    context._pw = pw  # type: ignore[attr-defined]
    return context, page


async def shutdown(context: BrowserContext) -> None:
    """Close the context and stop Playwright without teardown warnings."""
    await context.close()
    pw = getattr(context, "_pw", None)
    if pw is not None:
        await pw.stop()

"""Authenticated API regression WITHOUT driving Google (which blocks automated
sign-in). You sign in once in your normal browser, paste your NextAuth session
cookie, and this replays it against the exact WMBC API routes the members page
uses — proving the signed-in flows still work after the anon lockdown.

Get the cookie:
  1. Sign in at https://www.wmbonsai.com/members in your normal Chrome.
  2. DevTools (F12) -> Application -> Cookies -> https://www.wmbonsai.com
  3. Copy the VALUE of `__Secure-next-auth.session-token`
     (older NextAuth/http: `next-auth.session-token`).

Run:
  BASE_URL=https://www.wmbonsai.com SESSION_COOKIE="<value>" \
    poetry run python tests/test_wmbc_app_cookie.py

Checks (all must be 200):
  GET  /api/auth/session          -> confirms the cookie authenticates
  GET  /api/messages              -> service-role chat read
  POST /api/emailExistsInSignups  -> signup-check path
  POST /api/postMessage           -> posts one throwaway chat message
"""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request

BASE_URL = os.environ.get("BASE_URL", "").rstrip("/")
COOKIE_VAL = os.environ.get("SESSION_COOKIE", "").strip()
# Try secure name first (https), then the plain name.
COOKIE_NAMES = ["__Secure-next-auth.session-token", "next-auth.session-token"]


def call(method: str, path: str, cookie_header: str, body=None) -> tuple[int, str]:
    data = json.dumps(body).encode() if body is not None else None
    headers = {"Cookie": cookie_header, "Content-Type": "application/json"}
    r = urllib.request.Request(f"{BASE_URL}{path}", data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(r, timeout=20) as resp:
            return resp.status, resp.read().decode()[:300]
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:300]
    except Exception as e:  # noqa: BLE001
        return -1, str(e)[:300]


def main() -> None:
    if not BASE_URL or not COOKIE_VAL:
        print("[app] FAIL: set BASE_URL and SESSION_COOKIE. See the docstring.")
        sys.exit(2)

    # Pick the cookie name that authenticates.
    cookie_header = email = None
    for name in COOKIE_NAMES:
        hdr = f"{name}={COOKIE_VAL}"
        s, b = call("GET", "/api/auth/session", hdr)
        if s == 200 and '"email"' in b:
            cookie_header = hdr
            try:
                email = json.loads(b).get("user", {}).get("email")
            except Exception:
                pass
            break
    if not cookie_header:
        print("[app] FAIL: cookie did not authenticate (session still empty). "
              "Copy a fresh `__Secure-next-auth.session-token` value.")
        sys.exit(1)
    print(f"[app] authenticated as {email}")

    fails: list[str] = []

    def ok(name: str, passed: bool, detail: str) -> None:
        print(f"[app] {'PASS' if passed else 'FAIL'}: {name} — {detail}")
        if not passed:
            fails.append(name)

    s, b = call("GET", "/api/messages", cookie_header)
    ok("GET /api/messages", s == 200, f"HTTP {s}")

    s, b = call("POST", "/api/emailExistsInSignups", cookie_header, body={})
    ok("POST /api/emailExistsInSignups", s == 200, f"HTTP {s} {b[:80]}")

    s, b = call("POST", "/api/postMessage", cookie_header,
                body={"content": "[regression test] ignore"})
    ok("POST /api/postMessage", s == 200, f"HTTP {s}")

    print()
    if fails:
        print(f"[app] FAIL: {len(fails)} route(s): {', '.join(fails)}")
        sys.exit(1)
    print("[app] PASS: signed-in members flows work (service-role API routes OK).")


if __name__ == "__main__":
    main()

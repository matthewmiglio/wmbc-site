"""Black-box security test for the WMBC tables, PROD, anon key only — plays the
attacker. No auth, no browser.

WMBC owns exactly two tables in the shared Supabase project: wmbc_messages and
wmbc_SIGNUPs. Neither should be reachable with the public anon key: the site
reads/writes both server-side via the service-role key behind a NextAuth
session. This asserts anon gets NOTHING from either.

The point of interest is wmbc_messages: before migration 0003 is applied it is
anon-SELECTable (a live leak of every chat message + member email), and this
test FAILS. After 0003 (revoke grant + drop the select policy) it PASSES.

Reads SUPABASE_URL / SUPABASE_ANON_KEY from ../.env (or the environment).
Usage:  poetry run python tests/test_wmbc_security.py
"""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ENV_PATH = os.path.join(ROOT, ".env")


def load_env() -> tuple[str, str]:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_ANON_KEY")
    if (not url or not key) and os.path.exists(ENV_PATH):
        with open(ENV_PATH, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("SUPABASE_URL="):
                    url = url or line.split("=", 1)[1].strip().strip('"')
                elif line.startswith("SUPABASE_ANON_KEY="):
                    key = key or line.split("=", 1)[1].strip().strip('"')
    if not url or not key:
        print(f"[sec] FAIL: missing SUPABASE_URL / SUPABASE_ANON_KEY (env or {ENV_PATH})")
        sys.exit(2)
    return url.rstrip("/"), key


def get(rest: str, table: str, key: str) -> tuple[int, str]:
    r = urllib.request.Request(
        f"{rest}/{table}?select=*&limit=5",
        headers={"apikey": key, "Authorization": f"Bearer {key}"},
    )
    try:
        with urllib.request.urlopen(r, timeout=20) as resp:
            return resp.status, resp.read().decode()[:400]
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:400]
    except Exception as e:  # noqa: BLE001
        return -1, str(e)[:400]


def main() -> None:
    base, key = load_env()
    rest = f"{base}/rest/v1"
    fails: list[str] = []

    def check(name: str, closed: bool, detail: str) -> None:
        print(f"[sec] {'PASS' if closed else 'FAIL'}: {name} — {detail}")
        if not closed:
            fails.append(name)

    for tbl in ("wmbc_messages", "wmbc_SIGNUPs"):
        s, b = get(rest, tbl, key)
        rows = None
        try:
            j = json.loads(b)
            rows = len(j) if isinstance(j, list) else None
        except Exception:
            pass
        # Closed = permission denied (no grant), OR an empty 200 (RLS with no
        # policy). Any returned rows = the anon key can read it = FAIL.
        closed = s == 401 or (s == 200 and rows == 0)
        detail = f"HTTP {s}" + (f", {rows} rows" if rows is not None else f" :: {b[:120]}")
        check(f"{tbl} not anon-readable", closed, detail)

    print()
    if fails:
        print(f"[sec] {len(fails)} FAILED: {', '.join(fails)}")
        sys.exit(1)
    print("[sec] PASS: neither WMBC table is reachable with the anon key.")


if __name__ == "__main__":
    main()

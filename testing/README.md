# WMBC testing harness

Playwright + persistent Chrome profile for exercising the live WMBC members
site, plus a black-box Supabase security check. Used to validate the Supabase
security lockdown (migration `0003`) PRE and POST, with no functional
regression.

## Setup

```bash
cd testing
poetry install
poetry run playwright install chromium
```

`testing/.env` holds the Supabase URL + public anon key for the black-box test
(gitignored). All scripts target production — pass the site URL via `BASE_URL`.

## Scripts

- `tests/auth.py` — opens Chrome, you sign in with Google once; the NextAuth
  session persists to `data/browser_profile/` for the other scripts.
- `tests/test_wmbc_security.py` — anon-key-only. Asserts neither `wmbc_messages`
  nor `wmbc_SIGNUPs` is readable with the public anon key. **Fails before
  migration `0003`** (chat + member emails were anon-readable), passes after.
- `tests/test_wmbc_app.py` — authenticated browser regression. Drives `/members`:
  chat read (`GET /api/messages`), chat post (`POST /api/postMessage`), and the
  signup-check path all return 200. Must pass both before and after the fix.

## Run

```bash
BASE_URL=https://your-wmbc-site.example poetry run python tests/auth.py
BASE_URL=https://your-wmbc-site.example poetry run python tests/test_wmbc_app.py
poetry run python tests/test_wmbc_security.py
```

## PRE / POST flow

1. `auth.py` (sign in once).
2. PRE: `test_wmbc_app` PASS (works today), `test_wmbc_security` FAIL
   (`wmbc_messages` leaks over the anon key).
3. Apply migration `0003` to prod.
4. POST: both PASS — leak closed, functionality intact.

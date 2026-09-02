# WMBC site — deployment notes

Next.js (pages router) app for the West Michigan Bonsai Club, hosted on Vercel.

## Domains

| Domain | Role |
|---|---|
| `www.wmbonsai.com` | **Production / canonical.** This is what members use. |
| `bonsai-app-3.vercel.app` | Vercel's default project domain. Same production deployment, secondary alias. |
| `localhost:3000` | Local dev. |

Both public domains serve the **same** production deployment — they are aliases, not separate environments.

## Auth (NextAuth v4 + Google OAuth)

Sign-in is Google OAuth via NextAuth. Config: `src/lib/authOptions.ts`, route `src/pages/api/auth/[...nextauth].ts`. Relevant env vars (set in Vercel): `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_AUTH_CLIENT_ID`, `GOOGLE_AUTH_CLIENT_SECRET`.

### ⚠️ Known gotcha: `NEXTAUTH_URL` must point at the canonical prod domain

NextAuth v4 builds its callback URL and OAuth state cookie from `NEXTAUTH_URL` — **not** from whatever host the request actually came in on. If `NEXTAUTH_URL` is the Vercel-default domain while users sign in on the custom domain, the state cookie is set on one host and the callback lands on another, the state can't be verified, and login fails with `?error=OAuthCallback` ("Try signing in with a different account").

We hit exactly this: `NEXTAUTH_URL` was `https://bonsai-app-3.vercel.app`, so login worked on `bonsai-app-3.vercel.app` but was broken on `www.wmbonsai.com`.

**Rule:** `NEXTAUTH_URL` must equal the canonical production domain:
```
NEXTAUTH_URL=https://www.wmbonsai.com
```
(https, no trailing slash, no path). After changing any env var you must **redeploy** — Vercel only picks up env changes on a new build.

Trade-off this creates (expected, fine): once `NEXTAUTH_URL` is the custom domain, direct sign-in on the raw `bonsai-app-3.vercel.app` URL may fail. Members use `www`, so that's acceptable.

### Google Cloud OAuth client — the three fields, don't blur them

APIs & Services → Credentials → the Web OAuth 2.0 Client:
- **Authorized redirect URIs** (full callback URLs) — must include:
  - `https://www.wmbonsai.com/api/auth/callback/google`
  - `https://bonsai-app-3.vercel.app/api/auth/callback/google`
  - `http://localhost:3000/api/auth/callback/google`
- **Authorized JavaScript origins** (full origins) — `https://www.wmbonsai.com`, the vercel.app origin, `http://localhost:3000`.
- **Authorized domains** (on the OAuth *consent screen*, a different page) — top-level registrable domains **only**: `wmbonsai.com`. This already covers every subdomain including `www`; it will reject `www.wmbonsai.com` ("must be a top private domain"), which is correct — don't try to add it.

## Deploy checklist when adding/changing a domain

1. Add the domain in Vercel → Settings → Domains.
2. Add its `…/api/auth/callback/google` to Google **Authorized redirect URIs** (and origin to JS origins).
3. If it becomes the canonical domain, update `NEXTAUTH_URL` to it.
4. **Redeploy**, then test sign-in on that exact domain.

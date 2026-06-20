# Deployment Guide — BioAnalytiX Website

This document describes how the rebuilt Next.js site is deployed and how to cut
the `bioanalytix.info` domain over from GitHub Pages to Vercel.

Production deploys are performed by the site operator. This repository only
contains the deployment configuration artifacts; nothing here triggers a live
deploy on its own.

> Traceability: Requirements 15.1 (single deploy target), 15.2 (domain
> repoint), 15.3 (Legacy exclusion).

## 1. Single deployment target: Vercel

The site is deployed to **Vercel as the single deployment target** (Requirement
15.1). No other target receives the build output.

Relevant artifacts:

- `vercel.json` — pins the framework preset to `nextjs`. Build command and
  output directory are intentionally left to Vercel's Next.js auto-detection,
  which is the supported, correct default for the App Router.
- `package.json` — `build` script is `next build` (the standard Vercel build).

### One-time project setup

1. In Vercel, create one project and link it to this repository.
2. Set the Production Branch to `main` (Settings → Git). A push to `main`
   produces exactly one production deployment; all other branches/PRs produce
   isolated preview deployments.
3. Leave Framework Preset as **Next.js** (matches `vercel.json`). Do not
   override Build Command or Output Directory.

## 2. Server-only environment variables

All form submission secrets are **server-only** and read inside Server Actions
(`app/actions/*`) and the server-side strategy (`lib/forms.ts`,
`lib/rate-limit.ts`). None are prefixed with `NEXT_PUBLIC_`, so they are never
shipped in the client bundle (Requirements 15.4, 6.5).

See `.env.example` for the authoritative list and inline notes. Summary:

| Variable | Required | Used by | Notes |
| --- | --- | --- | --- |
| `CONTACT_FORM_ENDPOINT` | Yes | `submit-contact.ts`, `lib/forms.ts` | Provider endpoint for contact submissions. If unset, the action returns a generic delivery failure and retains input. |
| `CONTACT_FORM_API_KEY` | Optional | `submit-contact.ts` | Bearer token for the contact endpoint. |
| `BETA_FORM_ENDPOINT` | Optional | `submit-beta.ts` | Beta/careers endpoint. Falls back to `CONTACT_FORM_ENDPOINT` when unset. |
| `BETA_FORM_KEY` | Optional | `submit-beta.ts` | Bearer token for the beta endpoint. Falls back to `CONTACT_FORM_KEY`. |
| `RATE_LIMIT_WINDOW_SECONDS` | Optional | `lib/rate-limit.ts` | Rolling window in seconds. Clamped 1–3600. Default 60. |
| `RATE_LIMIT_MAX_SUBMISSIONS` | Optional | `lib/rate-limit.ts` | Max submissions per window. Clamped 1–1000. Default 5. |

### Configuring them in Vercel

1. Project → Settings → **Environment Variables**.
2. Add each variable above for the **Production** (and **Preview**, if desired)
   environments. Keep them as plain (encrypted-at-rest) environment variables;
   do not add a `NEXT_PUBLIC_` prefix.
3. Redeploy after changing values so the new environment is picked up.

Never commit real secret values. `.env.example` documents names only.

## 3. Legacy/ exclusion (defense in depth)

The legacy GitHub Pages site under `Legacy/` is excluded from the build and the
deployed output so that no file or path under `Legacy/` is reachable in the
deployed site (Requirement 15.3). Three independent mechanisms enforce this:

1. **`.vercelignore`** — excludes `Legacy/` from the upload sent to Vercel, so
   the files are not part of the build context.
2. **`next.config.ts` → `outputFileTracingExcludes`** — excludes
   `./Legacy/**/*` from Next.js output file tracing, so nothing under `Legacy/`
   is traced into the serverless/deployed output.
3. **`tsconfig.json` → `exclude: ["node_modules", "Legacy"]`** — keeps the
   legacy files out of TypeScript compilation/type-checking.

Because `Legacy/` lives outside the `app/` tree, the App Router never maps a
route to it. No real deploy is required to confirm the configuration: verifying
the three settings above (plus a successful `next build`) is sufficient.

## 4. Repointing `bioanalytix.info` from GitHub Pages to Vercel

The repository root currently contains a `CNAME` file with the contents
`bioanalytix.info`. **That file is the GitHub Pages custom-domain marker** — it
is only meaningful to GitHub Pages and has no effect on a Vercel deployment.

After the Vercel cutover the `CNAME` file is **superseded** and can be removed.
Recommended action: **delete the root `CNAME` file once the domain is fully
serving from Vercel**, to avoid confusion and to prevent any accidental GitHub
Pages re-association. It is intentionally left in place here so the operator can
remove it as part of the cutover rather than ahead of it. (This task does not
delete it.)

### Cutover steps (operator)

1. **Add the domain in Vercel:** Project → Settings → **Domains** → add
   `bioanalytix.info` (and `www.bioanalytix.info` if used). Vercel will show the
   exact DNS records required.
2. **Update DNS at the registrar / DNS host:**
   - Apex `bioanalytix.info`: replace the GitHub Pages `A` records
     (`185.199.108–111.153`) with the record Vercel specifies — typically an
     `A` record to `76.76.21.21`, or an `ALIAS`/`ANAME` to
     `cname.vercel-dns.com` if the host supports apex aliasing.
   - `www` subdomain: point the `CNAME` to `cname.vercel-dns.com`.
   - Remove any GitHub Pages-specific DNS records that are no longer needed.
3. **Disable the GitHub Pages custom domain:** in the GitHub repo Settings →
   Pages, clear the custom domain so GitHub stops claiming `bioanalytix.info`.
4. **Remove the root `CNAME` file** from the repository (it only mattered to
   GitHub Pages) and commit the removal.
5. **Verify:** wait for DNS propagation, then confirm `https://bioanalytix.info`
   resolves to the Vercel deployment over HTTPS and is no longer served by
   GitHub Pages (Requirement 15.2). Confirm Vercel has issued the TLS
   certificate for the domain.

## 5. Pre-deploy verification checklist

- [ ] `npm run build` completes successfully.
- [ ] `vercel.json` present with `framework: "nextjs"`.
- [ ] Server-only env vars configured in Vercel (no `NEXT_PUBLIC_` prefix).
- [ ] `Legacy/` excluded via `.vercelignore`, `outputFileTracingExcludes`, and
      `tsconfig.json`.
- [ ] DNS repointed and GitHub Pages custom domain cleared.
- [ ] Root `CNAME` file removed after cutover.

# Deploying

`npm run build` produces a fully static `dist/` folder — no server, no adapter, works on any static host. Cloudflare Pages is the fastest free path; Netlify and Vercel both work too.

## Environment variables

Set these on whichever host you use (see `.env.example`):

| Variable | Required | Purpose |
|---|---|---|
| `PUBLIC_WAITLIST_ENDPOINT` | Yes, unless `LAUNCHFOLD_ALLOW_NO_WAITLIST=1` | Where the waitlist form POSTs. [Web3Forms](https://web3forms.com) is the free-tier default this kit is built around, but any endpoint accepting a plain HTML form POST works. |
| `PUBLIC_WEB3FORMS_KEY` | No | Your Web3Forms access key, if using it. Web3Forms keys are public by design — safe to expose client-side. |
| `LAUNCHFOLD_ALLOW_NO_WAITLIST` | No | Set to `1` to allow a production build with no waitlist endpoint configured. Forms render "Waitlist opens soon" instead of failing the build. |

If `PUBLIC_WAITLIST_ENDPOINT` is empty and `LAUNCHFOLD_ALLOW_NO_WAITLIST` isn't set, `npm run build` fails on purpose — it's better to catch a missing endpoint at build time than after you've shared the link.

## Cloudflare Pages

1. Push this repo to GitHub (or GitLab).
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**, pick the repo.
3. Build settings: build command `npm run build`, output directory `dist`. Framework preset can stay "None" — the build command already does everything.
4. Add the environment variables above under **Settings → Environment variables**.
5. Deploy. Cloudflare gives you a `*.pages.dev` preview URL immediately; attach a custom domain under **Custom domains** whenever you're ready.

## Netlify

1. Push the repo to GitHub/GitLab/Bitbucket.
2. **Add new site → Import an existing project**, pick the repo.
3. Build command `npm run build`, publish directory `dist`.
4. Add the environment variables under **Site configuration → Environment variables**.
5. Deploy.

## Vercel

Works the same way (`npm run build`, output `dist`, "Other" framework preset) — but the **free Hobby tier's terms restrict it to non-commercial use**. If this is going to be a paid or otherwise commercial product, you need a Pro plan (or use Cloudflare/Netlify instead, both of which allow commercial use on their free tiers).

## Security headers

`public/_headers` (Cloudflare Pages and Netlify both read this format automatically) ships with `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` (camera/mic/geolocation off), `X-Frame-Options: DENY`, and a long immutable cache for hashed `/_astro/*` assets.

A Content-Security-Policy isn't shipped by default, because a strict one needs exact hashes of this kit's two inline scripts (the no-flash theme script in `Base.astro`, the theme-toggle/mobile-nav script in `Header.astro`) — and those hashes break the moment you edit either script. If you want one, add this to `public/_headers` under the `/*` block, adjusting `form-action` to your actual waitlist endpoint's origin:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'sha256-/NqnQWqyFquo8fRZudy3PuG+Ll3DiGtMkiHtPKh/Z9Q=' 'sha256-OwowTBEP6TfTSPzZLMIt4PC3PwmtNrIksUZL2biwLrU='; style-src 'self' 'unsafe-inline'; img-src 'self' data:; form-action 'self' https://api.web3forms.com; frame-ancestors 'none'
```

Those two hashes are current for this kit's unmodified scripts. If you edit either inline `<script>`, regenerate its hash:

```sh
# copy the script's exact contents (no <script> tags) into script.js, then:
openssl dgst -sha256 -binary script.js | openssl base64
```

`style-src 'unsafe-inline'` is needed because `Base.astro` sets the brand accent/radius CSS variables via an inline `style=""` attribute on `<html>` (sourced from `site.config.ts`). Astro's own scoped component styles are bundled into the linked stylesheet, not inlined, so they don't need it — but that one attribute does.

## After deploying

- Update `site.url` in `src/site.config.ts` to your real domain, then rebuild — it drives canonical URLs, the sitemap, JSON-LD, and OG/Twitter tags.
- Turn off `demoNotice` in `src/site.config.ts` once you've replaced the Shipnote demo content with your own.
- Submit `/sitemap-index.xml` to Google Search Console.

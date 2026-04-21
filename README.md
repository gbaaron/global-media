# Global Media

Client portal for entertainers, musicians, leagues, podcasters, and personalities. Parallel product to Global Storefront, tuned for entertainment-industry clients.

## What it does

- Public pitch site at `/` — hero, services, process, comparison, CTA.
- Client login card on the landing page → routes to the client's preview project URL.
- Admin portal at `/admin.html` — analytics, client CRUD, project pipeline, and inbound lead management.
- Sales deck at `/sales.html` — expandable pitch deliverable to share with prospects.
- About / contact at `/about.html`.
- Printable business card at `/business-card.html`.

## Stack

- Plain HTML/CSS/JS, no build step.
- Netlify Functions for auth and Airtable CRUD.
- Airtable base `appQax4vlEgH15RZt` (5 tables — see `AIRTABLE_SCHEMA.md`).
- `airtable`, `bcryptjs`, `jsonwebtoken` npm deps.

## Environment variables

Set in Netlify dashboard:

```
AIRTABLE_API_KEY=pat...
AIRTABLE_BASE_ID=appQax4vlEgH15RZt
JWT_SECRET=<random 32+ chars>
```

## Demo credentials

- **Admin:** `aaron@globalmedia.com` / `globalmediademo2026`
- **Demo client:** `demoartist` / `demo2026`

Rotate all of these before production use.

## Deploy

1. Push to GitHub.
2. Connect repo to Netlify.
3. Set env vars in Netlify dashboard.
4. Deploy — no build command, `publish = "."`.

## Brand

Per `CLAUDE.md` §3, Global Media is the sub-brand for entertainment-industry clients (musicians, podcasters, leagues, personalities, athletes, creators). Footer on sites built under this brand: "Powered by Global Media".

Aesthetic: deeper black background with electric violet accent and Playfair Display italic accents, distinguishing it from Global Storefront's navy-and-gold retail palette.

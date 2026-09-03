# Global Media — Airtable Schema

**Base name:** Global Media
**Base ID:** `appQax4vlEgH15RZt`

## Environment variables (Netlify)

```
AIRTABLE_API_KEY=pat...           # PAT with create/read/write on this base
AIRTABLE_BASE_ID=appQax4vlEgH15RZt
JWT_SECRET=...                    # random 32+ char string
```

## Tables

### AdminUsers (`tblbg4mFPaiDXEjUu`)
Global Media operators who can manage clients, projects, and leads.

| Field | Type | Notes |
|---|---|---|
| Name | singleLineText | Display name |
| Email | email | Login key |
| Password | singleLineText | Plain text, on purpose. Readable so a password can be handed back to a client. Nothing sensitive sits behind this login. |
| CreatedAt | singleLineText | ISO date string |

### Clients (`tblr4zP0plQo56kff`)
Entertainer / league / personality clients with login access to preview their project.

| Field | Type | Notes |
|---|---|---|
| Name | singleLineText | Person's real name |
| Email | email | |
| Username | singleLineText | Login identifier (alternative to email) |
| Password | singleLineText | Plain text, on purpose. See AdminUsers note. |
| Company | singleLineText | Artist name / league / brand |
| ProjectURL | url | Where the preview site lives |
| ClientType | singleSelect | Musician / Podcaster / League / Personality / Athlete / Creator / Other |
| Status | singleSelect | Active / Pending / Archived |
| CreatedAt | singleLineText | ISO string |
| LastLogin | singleLineText | ISO string, updated on login |
| Notes | multilineText | Admin-only context |

### PageViews (`tblfGOTWeGk4P0cM6`)
Fire-and-forget visit tracking from the public site.

| Field | Type | Notes |
|---|---|---|
| Page | singleLineText | home, sales, about, admin, etc. |
| Referrer | singleLineText | `document.referrer` or empty |
| UserAgent | singleLineText | |
| IP | singleLineText | |
| Timestamp | singleLineText | ISO string |

### Projects (`tblRqJ2VgAIucQsC2`)
Work items tied to clients — WIP, in review, live, archived.

| Field | Type | Notes |
|---|---|---|
| ProjectName | singleLineText | |
| ClientEmail | email | Soft link to Clients.Email |
| ProjectType | singleSelect | Fan Hub / League Site / Card Game / Manager Sim / Music Site / Podcast Hub / Landing Page / Other |
| Stage | singleSelect | Discovery / In Build / Review / Live / Archived |
| PreviewURL | url | Pre-launch / Global Media portal URL |
| LiveURL | url | Post-launch custom domain |
| StartDate | singleLineText | |
| LaunchDate | singleLineText | |
| Notes | multilineText | |

### PipelineLeads (`tbl2hLelrHXHsA543`)
Inbound leads from the public contact form.

| Field | Type | Notes |
|---|---|---|
| Name | singleLineText | |
| Email | email | |
| Brand | singleLineText | Artist/league/show name |
| Category | singleSelect | Musician / Podcaster / League / Personality / Athlete / Creator / Other |
| Message | multilineText | |
| Stage | singleSelect | New / Contacted / Qualified / Won / Lost |
| Source | singleLineText | Form location on site |
| Submitted | singleLineText | ISO string |

## Hard limits to respect

- 5 requests/second per base
- 10 records per batch POST
- Long-text fields cap at ~100k chars
- Pagination server-side only

## Notes

- Demo admin password convention: `globalmediademo2026`
- `aaron@globalmedia.com` is the canonical admin account
- Per CLAUDE.md §3, Global Media is Aaron's sub-brand for entertainers / musicians / leagues
- Portal mirrors Global Storefront architecture (Section 2) but rebranded for entertainment clients

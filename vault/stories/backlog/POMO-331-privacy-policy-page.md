---
type: story
status: backlog
priority: p1
effort: 2
feature: "[[features/gdpr-data-privacy]]"
created: 2026-01-31
updated: 2026-01-31
done_date: null
tags: [gdpr, privacy, legal, page]
---

# POMO-331: Privacy Policy Page

## User Story

> As a **user**,
> I want to **read the privacy policy**,
> so that **I understand how my data is used**.

## Context

Link: [[features/gdpr-data-privacy]]

GDPR requirement: Transparent information about data processing.

## Acceptance Criteria

- [ ] Dedicated page at `/privacy`
- [ ] All GDPR-required disclosures included
- [ ] US data transfer clearly documented
- [ ] List of all sub-processors
- [ ] Contact information provided
- [ ] Link in app footer
- [ ] Link in Privacy Settings

## Content (Structure)

```markdown
# Privacy Policy

Last updated: [Date]

## 1. Controller
[Name/Company]
[Address]
[Email]

## 2. What Data We Collect
- Account data (email)
- Usage data (sessions, projects)
- AI Coach data (chat history, insights)
- Payment data (via Stripe)

## 3. Why We Collect This Data
- Providing the service
- Personalization (AI Coach)
- Billing

## 4. How Long We Keep Data
- Until account deletion
- 30-day cooling-off after deletion request
- After that: permanent deletion

## 5. Who We Share Data With

### Sub-processors
| Provider | Purpose | Location | Legal Basis |
|----------|---------|----------|-------------|
| Supabase Inc. | Database | USA | DPF, SCCs |
| Clerk Inc. | Authentication | USA | SCCs |
| Stripe Inc. | Payments | USA | DPF, SCCs |
| Anthropic PBC | AI Coach | USA | DPA |

## 6. Data Transfers to the USA
Your data is stored and processed in the USA.
[Detailed explanation of DPF, SCCs]

## 7. Your Rights
- Access (data export)
- Erasure (delete account)
- Objection (disable analytics)
- Lodge complaint with supervisory authority

## 8. Analytics
We use PostHog in cookieless mode.
[Details]

## 9. Changes
We'll notify you by email of significant changes.

## 10. Contact
[Email for privacy inquiries]
```

## Technical Details

### Files

```
src/
├── app/
│   └── privacy/
│       └── page.tsx              # NEW
└── components/
    └── layout/
        └── Footer.tsx            # Add link
```

### Implementation Notes

- Static page (no dynamic content)
- MDX or plain JSX
- SEO optimized (title, meta)
- Print-friendly CSS

## UI/UX

- Clean, readable layout
- Good typography (headings, lists)
- Table of contents at top (optional)
- "Last updated: [Date]" prominent
- Back link to app

## Definition of Done

- [ ] Privacy policy text written
- [ ] Page accessible at /privacy
- [ ] Link in footer
- [ ] Link in Privacy Settings
- [ ] Mobile-optimized
- [ ] Print CSS

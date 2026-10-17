# Tartan Tickets

## Security spec audit

This audit covers today's browse-events-only prototype. Features that are not
part of this prototype, such as sign-in, ticket purchases, and check-in, are not
implemented.

| Requirement | Status | Why |
|---|---|---|
| SEC-1 | Not at all | The events page is public; CMU SSO authentication and password-handling controls are not implemented. |
| SEC-2 | Not at all | The build has no sign-in sessions or inactivity-expiration behavior. |
| SEC-3 | Not at all | HTTPS enforcement and HSTS are not configured; local development serves the page over HTTP. |
| SEC-4 | Not at all | There are no roles, club memberships, or server-side authorization checks. |
| SEC-5 | Not at all | Club-scoped resources, access-denied handling, and access-attempt logging are not implemented. |
| SEC-6 | Not at all | There are no tickets or student-specific ticket access checks. |
| SEC-7 | Not at all | The prototype has no checkout or Stripe integration. |
| SEC-8 | Not at all | There are no charges or server-side price calculations at checkout. |
| SEC-9 | Not at all | There is no Stripe webhook endpoint or signature verification. |
| SEC-10 | Not at all | Stripe events are not processed, so webhook deduplication is not implemented. |
| SEC-11 | Partly | No Stripe secrets are present in the source, but secrets-manager storage and production-only live-key controls are not implemented. |
| SEC-12 | Not at all | Connected Stripe accounts and approval workflows do not exist in this build. |
| SEC-13 | Not at all | The prototype does not issue QR codes or random ticket tokens. |
| SEC-14 | Not at all | Ticket scanning and concurrent check-in handling are not implemented. |
| SEC-15 | Not at all | There is no scanning account, invalid-scan rate limit, or officer notification. |
| SEC-16 | Not at all | There is no checkout flow or checkout rate limit. |
| SEC-17 | Partly | The prototype collects no purchase data, but has no purchase flow or purchase-record handling to verify the required field limit. |
| SEC-18 | Not at all | Attendee records, event-end retention tracking, and 90-day personal-data removal are not implemented. |
| SEC-19 | Not at all | Attendee lists, CSV exports, officer authorization, and export logging are not implemented. |
| SEC-20 | Partly | React renders the sample event text as escaped text, but officer-entered event content and its display path are not implemented. |
| SEC-21 | Not at all | Role changes, refunds, cancellations, Stripe account changes, and exports are not implemented or audit-logged. |
| SEC-22 | Not at all | There is no audit-log storage, append-only protection, admin-only access, or one-year retention. |

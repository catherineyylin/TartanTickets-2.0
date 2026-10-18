# Tartan Tickets

## HW3 scope: Story 3 — Buy tickets

- **Real payments are a non-goal.** The “Simulated payment” button never charges a card.
- **Real authentication is a non-goal.** Buyers type their name; no sign-in provider is used.
- **Real email is a non-goal.** The receipt is displayed on screen and is not sent.
- Checkout and ticket data live in server memory and reset on every deploy. In-memory
  data is also local to a running server instance, so separate Vercel instances do
  not share seat reservations; this prototype cannot guarantee one-seat-only results
  across multiple deployed instances.
- Simulated payment declines are covered by automated tests, not a user-facing control.

## Security spec audit

This audit covers the Story 3 simulated-ticket prototype. Features outside that
scope, including real sign-in, real payments, Stripe webhooks, and check-in, are
not implemented.

| Requirement | Status | Why |
|---|---|---|
| SEC-1 | Not at all | The events page is public; CMU SSO authentication and password-handling controls are not implemented. |
| SEC-2 | Not at all | The build has no sign-in sessions or inactivity-expiration behavior. |
| SEC-3 | Not at all | HTTPS enforcement and HSTS are not configured; local development serves the page over HTTP. |
| SEC-4 | Not at all | There are no roles, club memberships, or server-side authorization checks. |
| SEC-5 | Not at all | Club-scoped resources, access-denied handling, and access-attempt logging are not implemented. |
| SEC-6 | Not at all | There are no tickets or student-specific ticket access checks. |
| SEC-7 | Not at all | Checkout uses a simulation, not Stripe-hosted Checkout; no card data is collected. |
| SEC-8 | Partly | The server calculates the simulated order total from its event price and quantity, but no real charge is made. |
| SEC-9 | Not at all | There is no Stripe webhook endpoint or signature verification. |
| SEC-10 | Not at all | Stripe events are not processed, so webhook deduplication is not implemented. |
| SEC-11 | Partly | No Stripe secrets are present in the source, but secrets-manager storage and production-only live-key controls are not implemented. |
| SEC-12 | Not at all | Connected Stripe accounts and approval workflows do not exist in this build. |
| SEC-13 | Partly | Purchases receive random 128-bit QR tokens with no personal data, but check-in lookup of those tokens is not implemented. |
| SEC-14 | Not at all | Ticket scanning and concurrent check-in handling are not implemented. |
| SEC-15 | Not at all | There is no scanning account, invalid-scan rate limit, or officer notification. |
| SEC-16 | Not at all | Checkout has no per-account rate limit or hoarding protection. |
| SEC-17 | Not at all | In-memory purchases include event, quantity, and QR-token details beyond the listed fields; no Stripe payment ID exists in the simulation. |
| SEC-18 | Not at all | Attendee records, event-end retention tracking, and 90-day personal-data removal are not implemented. |
| SEC-19 | Not at all | Attendee lists, CSV exports, officer authorization, and export logging are not implemented. |
| SEC-20 | Partly | React renders the sample event text as escaped text, but officer-entered event content and its display path are not implemented. |
| SEC-21 | Not at all | Role changes, refunds, cancellations, Stripe account changes, and exports are not implemented or audit-logged. |
| SEC-22 | Not at all | There is no audit-log storage, append-only protection, admin-only access, or one-year retention. |

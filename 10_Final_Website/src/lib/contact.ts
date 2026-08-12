/**
 * Single source of truth for where "Book a free automation audit" goes.
 *
 * Calendly's "Free Automation Audit" event type — 30 min, Google Meet, free.
 * Real booking (time slots, calendar invite, confirmation email) rather than an
 * open-ended chat message.
 *
 * ## Why this slug changed on 2026-08-12
 *
 * The previous value was `/30min`, and on that date it rendered **"This
 * Calendly URL is not valid"** — every CTA on the site led there. The Calendly
 * API returned an empty `event_types` collection at both user and organization
 * scope: the event had been deleted some time after the 2026-08-07 verification
 * recorded in `lib/booking.ts`.
 *
 * The event was recreated through the API, and Calendly derives an event's slug
 * from its name rather than accepting one — so "Free Automation Audit" is
 * necessarily `/free-automation-audit`. `/30min` was never a name, it was the
 * default event's slug, which is why it could not be restored by recreating it.
 *
 * ## What this URL is checked against, and what it is not
 *
 * `booking.spec.ts` pins the *prefill parameter names* — it asserts the form
 * emits `name`, `email` and `a1`. It passed on every run while this constant
 * pointed at a dead page, because a parameter name is not a destination. No
 * test in this repository can see that the far end exists; the far end lives in
 * someone's Calendly account and can be deleted without touching this code.
 *
 * So if the booking page stops converting, **check the event still exists
 * before checking anything here.** The recreated event's own facts, read back
 * from the API on creation: duration 30, `locations: [google_conference]`, and
 * one custom question at position 0 — "Please share anything that will help
 * prepare for our meeting." — which is exactly the `a1` field `booking.ts`
 * composes into. Availability is Mon–Fri 09:00–17:00, **Asia/Calcutta**.
 */
export const BOOKING_URL = 'https://calendly.com/sheetflow51/free-automation-audit';

/**
 * WhatsApp click-to-chat — kept as the fallback contact channel.
 * Matches the same pattern already proven on SheetFlow's own client work
 * (see Demo Website/n8n-dental-booking-workflow.json).
 */
export const WHATSAPP_NUMBER = '919756072538';

const AUDIT_MESSAGE = "Hi! I'd like to book a free automation audit for my business.";

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(AUDIT_MESSAGE)}`;

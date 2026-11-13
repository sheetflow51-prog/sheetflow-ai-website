# SF-I1 hybrid intake: the `sf.intake.v1` envelope

Status (2026-11-13, D46): built and tested on the branch `feat/hybrid-intake`. **Not deployed.** The /book form
does not post to `/api/intake` yet: that frontend change waits for the founder's approval. D26 still holds (the
booking page is never embedded; the visitor is redirected with prefill), and D45's Calendly relay stays until the
Cal.com cutover.

This file is the contract between the website (`src/lib/intake.ts`, `src/lib/cal-webhook.ts`,
`src/lib/sf-intake.ts`) and the n8n intake workflow SF-I1. Every example below uses dummy data.

## The flow

1. The visitor fills the /book form. It posts to `POST /api/intake`, which validates the answers, sends a
   `lead.submitted` envelope to SF-I1, and answers `303 See Other` to the Cal.com booking link with `name`, `email`
   and `notes` prefilled and the lead id in `metadata[sf_lead_id]`.
2. The visitor picks a slot on Cal.com. Cal.com posts `BOOKING_CREATED` to `POST /api/cal-webhook`, which checks
   the signature and sends a `booking.created` envelope to SF-I1.
3. Later changes arrive the same way: `booking.rescheduled` and `booking.cancelled`.

n8n upserts one Google Sheets CRM row per person from these four events (join rules below).

## Transport

| | |
|---|---|
| Method and URL | `POST` to `SF_INTAKE_URL`, i.e. `https://<tunnel host>/webhook/sf-discovery-intake` |
| `content-type` | `application/json` |
| Secret header | `SF_INTAKE_HEADER_NAME` (default `X-SF-Intake`): `SF_INTAKE_SECRET`, the n8n Header Auth value |
| Also sent | `ngrok-skip-browser-warning: 1`, `user-agent: sheetflow-site-relay/1` |
| Redirects | refused (a redirect would carry the secret elsewhere) |
| Timeout | 6 s from `/api/intake` (awaited before the visitor is redirected); 8 s from `/api/cal-webhook` (run after Cal.com has had its answer) |
| Retries | none. A non-2xx is logged as `upstream_<status>`, an ngrok error as `ngrok_ERR_NGROK_<n>` |

SF-I1 should answer 2xx as soon as it has the body (n8n's Webhook node set to respond immediately), because the
visitor waits on the lead forward.

## Keys every envelope has

| Key | Meaning |
|---|---|
| `schema` | always `sf.intake.v1` |
| `event` | `lead.submitted`, `booking.created`, `booking.rescheduled` or `booking.cancelled` |
| `eventId` | unique per event: `lead.submitted:<leadId>` or `<event>:<booking uid>`; deduplicate on it |
| `occurredAt` | ISO 8601. For leads, the server's receipt time; for bookings, Cal.com's `createdAt` (the send time), or the receipt time if that is missing or malformed |
| `source` | `site:/book` or `cal.com` |
| `leadId` | the UUID minted by `/api/intake`; on booking events only when Cal.com returned it, otherwise `null` |

Optional keys are **omitted** when they have no value; n8n never has to tell `null` from absent, except for
`leadId`, which is always present.

## `lead.submitted`

```json
{
  "schema": "sf.intake.v1",
  "event": "lead.submitted",
  "eventId": "lead.submitted:6f1c2b9e-3d4a-4f5b-8c7d-112233445566",
  "occurredAt": "2026-11-13T08:58:40.512Z",
  "source": "site:/book",
  "leadId": "6f1c2b9e-3d4a-4f5b-8c7d-112233445566",
  "contact": {
    "name": "Priya Sharma",
    "email": "priya+leads@example.test"
  },
  "lead": {
    "sector": "Real estate",
    "bottleneck": "Invoices need chasing",
    "notes": "Leads come in on WhatsApp and get lost.",
    "consent": true
  },
  "attribution": {
    "utm_source": "linkedin",
    "utm_medium": "social",
    "page": "/book"
  },
  "geo": {
    "country": "IN"
  }
}
```

- `contact.name`: 1 to 120 characters, whitespace collapsed. `contact.email`: one sane address, at most 254
  characters, as typed (trimmed).
- `lead.sector` and `lead.bottleneck`: exactly one of the options the form offers (`SECTORS` and `BOTTLENECKS` in
  `src/lib/booking.ts`). `lead.notes`: up to 1500 characters, line breaks as `\n`, possibly empty.
- `lead.consent`: recorded, not yet required (the consent line is part of the pending form change). `false` when
  the box was not ticked or is not on the form.
- `attribution`: any of `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` (at most 120
  characters of `[A-Za-z0-9_.~%+ -]`) and `page` (a path on this site); invalid values are dropped. Absent when empty.
- `geo.country`: Vercel's two-letter country code, only when well-formed. Absent otherwise.
- Never sent: the IP address, the user agent, or anything else about the request.

## `booking.created`

```json
{
  "schema": "sf.intake.v1",
  "event": "booking.created",
  "eventId": "booking.created:k3Jd8sP2qWmX7vYt1aBcDe",
  "occurredAt": "2026-11-13T09:00:01.123Z",
  "source": "cal.com",
  "leadId": "6f1c2b9e-3d4a-4f5b-8c7d-112233445566",
  "contact": {
    "name": "Priya Sharma",
    "email": "priya+leads@example.test"
  },
  "booking": {
    "uid": "k3Jd8sP2qWmX7vYt1aBcDe",
    "bookingId": 100,
    "eventSlug": "discovery-20",
    "title": "20 Min Discovery between Organiser Person and Priya Sharma",
    "startTime": "2026-11-20T10:00:00Z",
    "endTime": "2026-11-20T10:20:00Z",
    "timeZone": "Asia/Kolkata",
    "meetUrl": "https://meet.google.com/abc-defg-hij",
    "status": "ACCEPTED",
    "notes": "Business: Real estate. Biggest gap: Invoices need chasing. Leads come in on WhatsApp and get lost.",
    "answers": {
      "company": "Sharma Realty"
    }
  }
}
```

## `booking.rescheduled`

A reschedule is a **new** Cal.com booking: `uid` is new, and `previousUid` is the booking it replaces. Cal.com
passes only the new request's link metadata, so `leadId` is usually `null` here.

```json
{
  "schema": "sf.intake.v1",
  "event": "booking.rescheduled",
  "eventId": "booking.rescheduled:Zx9Lm2Qp7RtY4uWv8sNbHc",
  "occurredAt": "2026-11-14T08:30:00.456Z",
  "source": "cal.com",
  "leadId": null,
  "contact": {
    "name": "Priya Sharma",
    "email": "priya+leads@example.test"
  },
  "booking": {
    "uid": "Zx9Lm2Qp7RtY4uWv8sNbHc",
    "bookingId": 101,
    "eventSlug": "discovery-20",
    "title": "20 Min Discovery between Organiser Person and Priya Sharma",
    "startTime": "2026-11-21T11:00:00Z",
    "endTime": "2026-11-21T11:20:00Z",
    "timeZone": "Asia/Kolkata",
    "meetUrl": "https://meet.google.com/abc-defg-hij",
    "status": "ACCEPTED",
    "notes": "Business: Real estate. Biggest gap: Invoices need chasing. Leads come in on WhatsApp and get lost.",
    "answers": {
      "company": "Sharma Realty"
    },
    "previousUid": "k3Jd8sP2qWmX7vYt1aBcDe",
    "previousStartTime": "2026-11-20T10:00:00Z",
    "previousEndTime": "2026-11-20T10:20:00Z",
    "rescheduledBy": "priya+leads@example.test"
  }
}
```

## `booking.cancelled`

Cancellations carry no metadata and no meeting link, and Cal.com writes their times as `+00:00` rather than `Z`;
both forms are passed through unchanged.

```json
{
  "schema": "sf.intake.v1",
  "event": "booking.cancelled",
  "eventId": "booking.cancelled:Zx9Lm2Qp7RtY4uWv8sNbHc",
  "occurredAt": "2026-11-15T07:00:00.000Z",
  "source": "cal.com",
  "leadId": null,
  "contact": {
    "name": "Priya Sharma",
    "email": "priya+leads@example.test"
  },
  "booking": {
    "uid": "Zx9Lm2Qp7RtY4uWv8sNbHc",
    "bookingId": 101,
    "eventSlug": "discovery-20",
    "title": "20 Min Discovery between Organiser Person and Priya Sharma",
    "startTime": "2026-11-21T11:00:00+00:00",
    "endTime": "2026-11-21T11:20:00+00:00",
    "timeZone": "Asia/Kolkata",
    "status": "CANCELLED",
    "cancellationReason": "I am no longer able to attend this session.",
    "cancelledBy": "priya+leads@example.test",
    "requestReschedule": false
  }
}
```

When the organiser uses Cal.com's **Request reschedule**, Cal.com sends a cancellation too, with
`"requestReschedule": true`, no `status`, `cancelledBy` set to the organiser, and a reason starting
`Please reschedule.`. The attendee's later rebooking then arrives as `booking.rescheduled`.

## `booking` fields

| Key | From the Cal.com payload | Notes |
|---|---|---|
| `uid` | `uid` | always present; `[A-Za-z0-9_-]{1,128}`, else the delivery is refused (422) |
| `bookingId` | `bookingId` | integer |
| `eventSlug` | `type` | the event type's slug |
| `title` | `title` | max 300 |
| `startTime`, `endTime` | `startTime`, `endTime` | ISO 8601 as given |
| `timeZone` | `attendees[0].timeZone` | IANA name |
| `meetUrl` | `metadata.videoCallUrl`, else `location` | https only; when both are https and differ, `location` wins (it cannot be edited by the visitor). Absent without a connected Google Calendar |
| `status` | `status` | `ACCEPTED` or `CANCELLED`; absent on a reschedule request |
| `notes` | `responses.notes.value`, else `additionalNotes` | max 2000, line breaks kept |
| `answers` | `userFieldsResponses` | custom questions: `slug -> string` or `string[]`, at most 20, each value max 1000 |
| `previousUid`, `previousStartTime`, `previousEndTime` | `rescheduleUid`, `rescheduleStartTime`, `rescheduleEndTime` | reschedules only |
| `rescheduledBy`, `cancelledBy` | same names | an email, max 254 |
| `cancellationReason` | same name | max 1000 |
| `requestReschedule` | same name | cancellations only |

`contact` comes from `attendees[0]`, falling back to `responses.name.value` and `responses.email.value`. Never
forwarded: the organiser, other attendees and guests, iCal data, `appsStatus`, ICS content, or the raw payload.

## Join rules for n8n

1. **Deduplicate on `eventId`** before anything else: keep the processed ids (a column or a small sheet) and skip
   one already seen. Cal.com signs no timestamp, so a captured delivery could be replayed; it would carry the same
   `eventId`.
2. **`lead.submitted` creates the row**, keyed by `leadId` (a Lead ID column). Status: lead, no booking yet.
3. **`booking.created` joins by `leadId`, then by email.** If `leadId` is not null and a row has it, update that
   row. Otherwise find the most recent row with the same email (trimmed, compared case-insensitively) and no booking
   uid yet. Otherwise append a new row: someone booked without a captured lead (the tunnel was down, or they used the
   link directly). Write the uid, times, `meetUrl` and status booked.
4. **`booking.rescheduled` finds the row by `previousUid`** (the row's current booking uid), then replaces the uid
   with the new `uid` and updates the times. Keep the old uid in a history column if useful. If no row matches, fall
   back to rule 3.
5. **`booking.cancelled` finds the row by `uid`** and sets the status to cancelled, or to reschedule requested when
   `requestReschedule` is true, with the reason and who cancelled. If no row matches, append a row flagged for review.
6. Compare `occurredAt` before overwriting: an older event must not undo a newer one.

Writing to the Sheet:

- Write values as **raw input** (Google Sheets `valueInputOption: RAW`), never as user-entered input, so a name or
  note that starts with `=`, `+`, `-` or `@` is stored as text and not evaluated as a formula.
- The booking `uid` works like a password: `https://cal.com/booking/<uid>?cancel=true` and
  `https://cal.com/reschedule/<uid>` let anyone holding it cancel or move the booking. Keep the Sheet private and
  never paste a uid into a message. The website never logs it.
- Times are UTC (`Z` or `+00:00`); use `timeZone` only for display.

## Known limits

- **Cal.com delivers at most once.** It does not retry a non-2xx and keeps no delivery log. `/api/cal-webhook`
  acknowledges at once and forwards afterwards (Cal.com waits inside the booker's own request), so if the tunnel is
  down at that moment the booking event is lost; the outcome is logged (`[cal-webhook] event=... outcome=...`), and
  Vercel Hobby keeps runtime logs for one hour only. **Reconcile from the Cal.com API v2**: a scheduled n8n workflow
  calling `GET https://api.cal.com/v2/bookings` with `Authorization: Bearer <API key>`, `afterUpdatedAt=<last run>`
  and an explicitly pinned `cal-api-version` (Cal.com's own pages disagree between `2026-05-01` and `2024-08-13`, and
  a missing header silently selects an old shape), then upserting by uid. Each listed booking carries its
  `metadata` (so `sf_lead_id`) and its booking-field answers.
- **Tunnel down when the lead is submitted:** the visitor is still sent to book (they are never blocked), but the
  `lead.submitted` event is lost unless a fallback is added (a durable queue or a second store). If they then book,
  `booking.created` still carries the `leadId`, finds no row, falls back to email, and appends a row.
- **The lead id is a join hint, not identity.** It travels in the booking link, which the visitor can edit; the
  prefilled name and email stay editable on Cal.com too, so the booking's email can differ from the lead's.
- **Rate limit** (5 forwarded leads per 10 minutes per address) is kept in memory per function instance: best
  effort, reset by a cold start. A visitor over the limit can still book; their lead is not captured.
- **Not yet confirmed in the account:** that webhooks are available on Cal.com's free plan (the pricing page does not
  say; the FAQ implies it), and that Google Meet links appear (they need a connected Google Calendar).
- Event types that **require confirmation** send `BOOKING_REQUESTED` first, which is acknowledged and ignored; leave
  that setting off. Do not add a **custom payload template** to the webhook: it changes the signed body and can
  produce invalid JSON.
- Hosted Cal.com has been closed source since 2026-04-15; the payload shapes here come from its docs and the last
  public source snapshot. Check one real delivery before relying on any field.

# SF-I1 hybrid intake: the `sf.intake.v1` envelope

Status (2026-11-15, D46 and D47): built and tested on the branch `feat/hybrid-intake`. **Not deployed.** Since D47
the /book form posts to `/api/intake` (native `<form method="post">`, with or without JavaScript), every lead carries
a consent record (`lead.consent`, below), and the pricing tiers and structured data link to /book, so no booking
skips the capture. D26 still holds (the booking page is never embedded; the visitor is redirected with prefill), and
D45's Calendly relay stays until the Cal.com cutover.

This file is the contract between the website (`src/lib/intake.ts`, `src/lib/cal-webhook.ts`,
`src/lib/sf-intake.ts`) and the n8n intake workflow SF-I1. Every example below uses dummy data.

## The flow

1. The visitor fills the /book form. It posts to `POST /api/intake`, which validates the answers, sends a
   `lead.submitted` envelope to SF-I1, and answers `303 See Other` to the Cal.com booking link with `name`, `email`
   and `notes` prefilled and the lead id in `metadata[sf_lead_id]`.
2. The visitor picks a slot on Cal.com. Cal.com posts `BOOKING_CREATED` to `POST /api/cal-webhook`, which checks
   the signature and sends a `booking.created` envelope to SF-I1.
3. Later changes arrive the same way: `booking.rescheduled` and `booking.cancelled`.

n8n upserts the Google Sheets CRM from these four events: one row per person who asked for a call, completed by
their booking, and a separate row for any further booking they make (join rules below). While the visitor is still
sent to Calendly, booking events come from D45 instead (see "The Calendly overlap").

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
    "consent": {
      "aiTraining": true,
      "noticeVersion": "2026-11-15.1"
    }
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
- `lead.consent`: always present, an object (D47; it was a boolean in D46).
  - `aiTraining`: `true` only when the visitor ticked the optional, unticked-by-default checkbox "let SheetFlow use
    my answers (business type, biggest gap and notes), with my name and email removed, to improve its AI
    assistants" (`ai_training=yes`). Otherwise `false`. It never affects the booking, so a lead with `false` is a
    normal lead.
  - `noticeVersion`: the version of the privacy notice the form showed, for example `2026-11-15.1`. The form sends
    the version it was rendered with as the hidden field `notice_version`; the server records it when it is one of
    the published versions (`PRIVACY_NOTICE_VERSIONS` in `src/content/privacy.ts`), and otherwise the current
    `PRIVACY_NOTICE_VERSION`, so a tab left open across a notice change still records what its visitor read. Store
    it with the row: it is the proof of what the visitor was told when they gave (or did not give) the AI consent.
  - Booking itself needs no consent flag: the visitor sends the form to get the session, and the notice above the
    button says what is used and why (DPDP Act s.7(a)). There is no marketing consent; the row must not be used for
    newsletters or marketing.
- `attribution`: any of `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` (at most 120
  characters of `[A-Za-z0-9_.~%+ -]`) and `page` (a path on this site, the path only: any `?query` or `#fragment` is
  removed, since it can carry ad click ids or an email address; a backslash or a leading `//` drops the value);
  invalid values are dropped. Absent when empty, and always absent when the visitor's browser runs no JavaScript
  (the form copies these from its own address after loading). A pricing-tier CTA arrives as
  `utm_source=sheetflow-site`, `utm_medium=pricing`, `utm_content=tier-<tier id>` (D47).
- `geo.country`: Vercel's two-letter country code, only when well-formed. Absent otherwise.
- Never sent: the IP address, the user agent, or anything else about the request.

## Using a lead for AI improvement (D47)

The privacy notice (`/privacy#ai-training`) promises the following, so SF-I1 and anything downstream must hold to it:

1. **Only when `lead.consent.aiTraining` is `true`.** A row with `false`, or written before D47 (no consent object),
   is never used for AI improvement, and nothing may turn it on except a new tick on the form.
2. **Only three fields:** `lead.sector`, `lead.bottleneck` and `lead.notes`. Never `contact.name`, `contact.email`,
   attribution, geo, booking details or the lead id.
3. **Scrub the notes first.** Remove anything that could identify the person or their business: personal names,
   phone numbers, email addresses, company or shop names, street addresses, URLs and handles. When in doubt, drop
   the note and keep the two answers.
4. **Keep the way back out of the training data.** To honour a withdrawal the de-identified record must be
   findable, so store the link from `leadId` to the training record in the private CRM row, never in the training
   data itself.
5. **The training record never outlives the row.** When the row is deleted, at the end of the retention period
   `/privacy` states (`retentionMonths`) or on the visitor's request to delete their details, delete the derived
   training record with it. `/privacy` promises exactly that, and it is what keeps "withdraw at any time" true: while
   the row exists the record can be found and removed, and once the row is gone there is no record left. A deletion
   request removes the training record even if the visitor did not also say "withdraw".
6. **Name the provider first.** Before de-identified answers go to any outside AI provider for this purpose, the
   provider must be named on `/privacy` (the notice says so).

Withdrawal (the visitor writes to the privacy contact by email or WhatsApp, identified by the email used on the
form; one message is enough):

- Set the row's AI flag to withdrawn with the date, keep the original `noticeVersion` and tick date (the record of
  what was agreed and when stays), and stop using the answers for AI improvement at once.
- Remove the derived training records within the number of days `/privacy` states (`aiTrainingRemovalDays`, a founder
  decision still open). The booking and the rest of the row are not affected.
- Use before the withdrawal stays lawful, and the notice does not promise that an already-trained assistant forgets
  what it learned; do not tell the visitor otherwise.
- Reply within 30 days, the period `/privacy` publishes, and repeat the privacy contact in the reply.

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
| `eventSlug` | `type`, else `eventSlug` | the event type's slug (a request-reschedule cancellation names it `eventSlug`) |
| `title` | `title` | max 300 |
| `startTime`, `endTime` | `startTime`, `endTime` | ISO 8601 as given |
| `timeZone` | `attendees[0].timeZone` | IANA name |
| `meetUrl` | `location`, else `metadata.videoCallUrl` | https only. Cal.com sets `location` to the link whenever it made one, and the visitor cannot edit it. `metadata.videoCallUrl` is used only when `location` is not a URL and it is a Google Meet or Cal Video link, because a visitor can write it by adding `metadata[videoCallUrl]=...` to the booking link. Absent without a connected Google Calendar |
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
2. **`lead.submitted` creates the row**, keyed by `leadId` (a Lead IDs column). Status: lead, no booking yet. One
   exception: if a row with the same email (trimmed, compared case-insensitively) and no booking uid yet was written
   in the last 24 hours, update that row's answers and add the new `leadId` to its Lead IDs cell instead of appending.
   A double click or a resubmit after the back button sends a second `lead.submitted` with a new `leadId` and
   `eventId`, so deduplicating on `eventId` alone would leave a second, never-booked row.
3. **`booking.created` joins by `leadId`, then by email, and only onto a row with no booking yet.** If `leadId` is
   not null and a row lists it and has no booking uid yet, update that row. Otherwise find the most recent row with
   the same email and no booking uid yet. Otherwise append a new row (copying the lead's answers when a row lists the
   `leadId`): someone booked without a captured lead (the tunnel was down, or they used the link directly), or made a
   second booking from the same prefilled link, which carries the same `leadId` and must not overwrite the first
   booking's uid. Write the uid, times, `meetUrl` and status booked.
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

## The Calendly overlap

Until `CAL_BOOKING_URL` holds a valid Cal.com link, `/api/intake` still sends `lead.submitted`, but the visitor is
sent to Calendly (today's link, which carries no lead id), and D45's `/api/calendly` relay forwards Calendly's
`invitee.created` delivery to the same SF-I1 URL **unchanged**: Calendly's own JSON, with no `schema` key and a
top-level `"event": "invitee.created"`. So SF-I1 receives two kinds of body during this period:

1. **Branch on `schema` first.** `schema === "sf.intake.v1"`: apply the rules above. No `schema` key: a raw Calendly
   body from D45.
2. **A raw Calendly `invitee.created` joins by email.** Take `payload.email` (trimmed, compared case-insensitively) and
   update the most recent row with that email and no booking yet, as rule 3 does; otherwise append a row. It carries
   no lead id to join on and no Cal.com uid, so the `booking.*` rules never match it, and it has no `eventId`:
   deduplicate it on Calendly's own invitee identifier instead.
3. Once the Cal.com cutover is done and D45 is retired, the second branch receives nothing and can be removed.

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
- **Rate limit** (5 forwarded leads per 10 minutes per address; an IPv6 address counts by its /64, since one client
  can rotate addresses inside it) is kept in memory per function instance: best effort, reset by a cold start. A
  visitor over the limit can still book; their lead is not captured.
- **An invalid or oversize submission sends the visitor back to `/book?intake=invalid#intake-invalid`** with no
  booking link, and their answers are not kept. Since D47 the form caps its fields at the server's limits (name 120,
  email 254, notes 1500), so this is rare, and /book shows "Something in the form didn't go through. Please check your
  answers and try again, or message us on WhatsApp.": from the query with JavaScript, and through the fragment (CSS
  `:target`) without it, because the static page cannot read its query on the server.
- **Not yet confirmed in the account:** that webhooks are available on Cal.com's free plan (the pricing page does not
  say; the FAQ implies it), and that Google Meet links appear (they need a connected Google Calendar).
- Event types that **require confirmation** send `BOOKING_REQUESTED` first, which is acknowledged and ignored; leave
  that setting off. Do not add a **custom payload template** to the webhook: it changes the signed body and can
  produce invalid JSON.
- Hosted Cal.com has been closed source since 2026-04-15; the payload shapes here come from its docs and the last
  public source snapshot. Check one real delivery before relying on any field.

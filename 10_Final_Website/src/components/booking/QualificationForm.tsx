'use client';

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { ArrowRight } from 'lucide-react';

import { INTAKE_ACTION, SECTORS, BOTTLENECKS } from '@/lib/booking';
import { WHATSAPP_URL } from '@/lib/contact';
import {
  AI_TRAINING_HELP,
  AI_TRAINING_LABEL,
  BOOK_NOTICE,
  PRIVACY_NOTICE_VERSION,
  PRIVACY_SECTION_IDS,
} from '@/content/privacy';
import { useAnalytics } from '@/lib/hooks/useAnalytics';

/**
 * The qualification step before the booking page (D47).
 *
 * ## It is a real form that posts to our own server
 *
 * `method="post"` to `/api/intake`. The server validates the answers, records
 * the lead in our booking records through the n8n intake, and only then
 * answers `303 See Other` to the booking page with the name, email and a notes
 * line prefilled (composed on the server from the two selects and the notes).
 * So the lead exists even if the visitor never picks a slot. With JavaScript
 * disabled the browser's native POST and that 303 are the whole flow; the
 * script below adds the analytics event, campaign attribution, the double-submit
 * guard and the invalid-answer message, and nothing depends on it.
 *
 * ## Why so few fields
 *
 * Four questions, one of which is optional. Every additional field on a booking
 * form costs completions, and the 20-minute session exists precisely to ask the
 * rest. The fields that survived are the ones that change how the call opens.
 * The length limits match the server's (`NAME_MAX`, `EMAIL_MAX` and `NOTES_MAX`
 * in `lib/intake.ts`, which this client file cannot import because it uses
 * `node:crypto`); `scripts/test-intake.mjs` checks they agree. Without them an
 * over-long answer would be refused only after the round trip.
 *
 * ## Consent
 *
 * Booking needs no tick-box: the notice above the button says what is used and
 * why, and the visitor sends the form to get the session (DPDP Act s.7(a)). The
 * one separate purpose, AI improvement, has its own checkbox, optional and
 * unticked, whose value the server records and never acts on for the booking.
 * Both texts live in `content/privacy.ts`, next to the notice version the
 * server records with each lead.
 *
 * ## Validation
 *
 * Native constraint validation, not a custom engine — `required` and
 * `type="email"` are already announced correctly by screen readers and already
 * localised by the browser. The only custom behaviour is deferring the styling
 * of the invalid state until a submit has been attempted, so a half-typed
 * address is not flagged as wrong while it is being typed. An invalid form
 * never fires `submit` (the browser reports it instead), so the attempt is
 * noticed through each control's `invalid` event.
 *
 * The email field also carries `EMAIL_PATTERN`, because `type="email"` accepts
 * a domain with no dot (`name@gmail`), the commonest typo, while the server's
 * `isSaneEmail` refuses it. Refused on the server, the visitor would come back
 * through a full page load to an emptied form; refused here, nothing they typed
 * is lost. `scripts/test-intake.mjs` checks that the pattern never blocks an
 * address the server accepts.
 */

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

/** The server's limits, see the header comment. */
const NAME_MAX = 120;
const EMAIL_MAX = 254;
const NOTES_MAX = 1500;

/**
 * A dotted domain whose last label has a letter, as `isSaneEmail` requires.
 * Browsers compile `pattern` with the `v` (or older `u`) flag, so `\p{L}`
 * accepts the Unicode domains the server accepts; a browser that cannot compile
 * it ignores it, and the server still checks.
 */
const EMAIL_PATTERN = String.raw`[^@\s]+@[^@\s]+\.[^@\s.]*\p{L}[^@\s.]*`;

/**
 * The id of the "didn't go through" message. `/api/intake` redirects a
 * refused submission to `/book?intake=invalid#intake-invalid` (`INVALID_REDIRECT_PATH`
 * in `lib/intake.ts`), so without JavaScript CSS can still show the message as
 * the `:target`.
 */
const INVALID_ANCHOR = 'intake-invalid';

/**
 * How long a submit may stay "in flight" before the button works again. The
 * server answers within its 15-second limit; if the visitor stopped the page
 * load instead, they must not be left with a form that ignores them.
 */
const RESUBMIT_AFTER_MS = 20_000;

/**
 * The privacy links inside the form open in a new tab. Following one in the
 * same tab would leave the page, and the answers typed so far would be gone
 * when the visitor came back; reading the notice must never cost the booking.
 */
const NEW_TAB = { target: '_blank', rel: 'noopener noreferrer' } as const;

const subscribeNever = () => () => {};

/**
 * Reads part of the page address after hydration. The server renders this
 * static page without a query string, so the server snapshot is empty, and
 * React swaps in the real value right after hydrating, without a mismatch.
 * Nothing subscribes, because the form only needs the address it loaded with.
 */
function useLocationPart(part: 'search' | 'pathname'): string {
  return useSyncExternalStore(subscribeNever, () => window.location[part], () => '');
}

export function QualificationForm() {
  const baseId = useId();
  const noticeId = `${baseId}-notice`;
  const aiHelpId = `${baseId}-ai-help`;
  const { track } = useAnalytics();
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // The state drives the label; the ref answers a second submit in the same tick.
  const submittingRef = useRef(false);

  const search = useLocationPart('search');
  const pathname = useLocationPart('pathname');
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const invalid = params.get('intake') === 'invalid';
  // Only the campaign tags this page arrived with, and only the path (never the
  // query) as the page: the query can carry ad click ids or an email address.
  const attribution = UTM_KEYS.flatMap((key) => {
    const value = params.get(key);
    return value ? [[key, value] as const] : [];
  });

  useEffect(() => {
    // A page restored from the back/forward cache comes back exactly as it was
    // left, mid-submit; it must accept a new submission.
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      submittingRef.current = false;
      setSubmitting(false);
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  useEffect(() => {
    if (!submitting) return;
    const timer = window.setTimeout(() => {
      submittingRef.current = false;
      setSubmitting(false);
    }, RESUBMIT_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [submitting]);

  const markAttempted = () => setAttempted(true);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setAttempted(true);

    // A second click while the first submission is still loading would start a
    // second POST, and with it a second lead row.
    if (submittingRef.current) {
      event.preventDefault();
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);

    // The two select answers only, never the name, email or notes: PII must not
    // enter the analytics stream.
    const data = new FormData(event.currentTarget);
    track('booking_qualified', {
      sector: String(data.get('sector') ?? '') || 'unspecified',
      bottleneck: String(data.get('bottleneck') ?? '') || 'unspecified',
      has_notes: String(data.get('notes') ?? '').trim().length > 0,
    });

    // No preventDefault: the browser's own POST carries the form to /api/intake,
    // exactly as it does with JavaScript off.
  };

  const field =
    'h-11 w-full rounded-lg border bg-white/[0.03] px-3 text-[15px] text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent-bright/30 focus:border-accent-bright/50';
  // `:invalid` only bites after a submit attempt — otherwise every empty
  // required field is red before the visitor has typed anything.
  const border = attempted
    ? 'border-white/[0.1] [&:invalid]:border-red-400/60'
    : 'border-white/[0.1]';
  const link =
    'text-white underline decoration-white/25 underline-offset-4 transition-colors hover:decoration-white';

  return (
    <div>
      {/* Shown when /api/intake refused the last submission. With JavaScript the
          query decides; without it, the `#intake-invalid` fragment makes this
          the :target. The browser scrolls the fragment's target to the top of
          the window, where the fixed 64px header would cover it, so the scroll
          margin keeps it below the header, as /privacy does for its headings. */}
      <p
        id={INVALID_ANCHOR}
        role="alert"
        className={`${invalid ? 'block' : 'hidden target:block'} mb-6 scroll-mt-28 rounded-xl border border-signal-danger/40 bg-signal-danger/[0.06] px-5 py-4 text-[14px] leading-relaxed text-white`}
      >
        Something in the form didn&rsquo;t go through. Please check your answers and try again, or
        message us on{' '}
        <a href={WHATSAPP_URL} className={link} data-cursor="hover">
          WhatsApp
        </a>
        .
      </p>

      <form
        action={INTAKE_ACTION}
        method="post"
        onSubmit={handleSubmit}
        aria-busy={submitting}
        className="relative rounded-2xl glass p-7 md:p-9"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor={`${baseId}-name`} className="text-[14px] font-medium text-white">
              Your name
            </label>
            <input
              id={`${baseId}-name`}
              name="name"
              type="text"
              required
              maxLength={NAME_MAX}
              autoComplete="name"
              onInvalid={markAttempted}
              className={`${field} ${border}`}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor={`${baseId}-email`} className="text-[14px] font-medium text-white">
              Email
            </label>
            <input
              id={`${baseId}-email`}
              name="email"
              type="email"
              required
              maxLength={EMAIL_MAX}
              pattern={EMAIL_PATTERN}
              title="Please include the full address, like name@gmail.com"
              autoComplete="email"
              onInvalid={markAttempted}
              className={`${field} ${border}`}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor={`${baseId}-sector`} className="text-[14px] font-medium text-white">
              What kind of business?
            </label>
            <select
              id={`${baseId}-sector`}
              name="sector"
              required
              defaultValue=""
              onInvalid={markAttempted}
              className={`${field} ${border}`}
            >
              <option value="" disabled>
                Select one…
              </option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor={`${baseId}-bottleneck`} className="text-[14px] font-medium text-white">
              Where are you losing the most?
            </label>
            <select
              id={`${baseId}-bottleneck`}
              name="bottleneck"
              required
              defaultValue=""
              onInvalid={markAttempted}
              className={`${field} ${border}`}
            >
              <option value="" disabled>
                Select one…
              </option>
              {BOTTLENECKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label htmlFor={`${baseId}-notes`} className="text-[14px] font-medium text-white">
              Anything else worth knowing?{' '}
              <span className="font-normal text-ink-400">(optional)</span>
            </label>
            <textarea
              id={`${baseId}-notes`}
              name="notes"
              rows={3}
              maxLength={NOTES_MAX}
              className="w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2.5 text-[15px] leading-relaxed text-white transition-colors focus:border-accent-bright/50 focus:outline-none focus:ring-2 focus:ring-accent-bright/30"
            />
          </div>

          {/* Optional and unticked, and the server books identically either way:
              a consent that changes the service is not freely given. */}
          <div className="flex items-start gap-3 md:col-span-2">
            <input
              id={`${baseId}-ai`}
              name="ai_training"
              type="checkbox"
              value="yes"
              aria-describedby={aiHelpId}
              className="mt-[3px] h-4 w-4 shrink-0 cursor-pointer accent-accent-bright focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-bright/50"
            />
            <div className="flex flex-col gap-1">
              <label
                htmlFor={`${baseId}-ai`}
                className="cursor-pointer text-[13px] leading-relaxed text-ink-200"
              >
                {AI_TRAINING_LABEL}
              </label>
              <p id={aiHelpId} className="text-[12px] leading-relaxed text-ink-300">
                {AI_TRAINING_HELP} See{' '}
                <a
                  href={`/privacy#${PRIVACY_SECTION_IDS.aiTraining}`}
                  {...NEW_TAB}
                  className={link}
                  data-cursor="hover"
                >
                  how withdrawing works
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Honeypot. People never see or reach it: off-screen, out of the tab
            order and hidden from assistive technology. A bot that fills every
            field fills this one, and the server then answers as if the lead had
            been captured while forwarding nothing. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-[10000px] top-0 h-px w-px overflow-hidden"
        >
          <label htmlFor={`${baseId}-website`}>Leave this field empty</label>
          <input
            id={`${baseId}-website`}
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </div>

        {/* The version of the notice this page was rendered with. Static HTML,
            so it is sent with or without JavaScript; the server records it with
            the AI-training choice when it is a published version. */}
        <input type="hidden" name="notice_version" value={PRIVACY_NOTICE_VERSION} />

        {/* Attribution, filled in after hydration from this page's own address.
            Without JavaScript these are simply absent. */}
        {attribution.map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
        {pathname && <input type="hidden" name="page" value={pathname} />}

        <div className="mt-8 flex flex-col gap-5 border-t border-white/[0.06] pt-7">
          {/* The notice must make sense on its own (DPDP Rules r.3(a)), so it is
              full text here, directly above the button, not just a link. */}
          <p id={noticeId} className="text-[12px] leading-relaxed text-ink-300">
            {BOOK_NOTICE}{' '}
            <a href="/privacy" {...NEW_TAB} className={link} data-cursor="hover">
              Read our privacy notice
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            .
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-sm text-[12px] leading-relaxed text-ink-300">
              Next step is choosing a time. Your answers travel with the booking, so the call
              starts with your situation rather than with questions you have already answered.
            </p>
            <button
              type="submit"
              aria-describedby={noticeId}
              aria-disabled={submitting || undefined}
              className="btn btn-primary h-12 px-6 text-[15px]"
              data-cursor="hover"
            >
              <span>{submitting ? 'Taking you to the calendar…' : 'Choose a time'}</span>
              <ArrowRight className="arrow h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

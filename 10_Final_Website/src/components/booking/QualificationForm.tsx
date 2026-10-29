'use client';

import { useId, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';

import { BOOKING_URL } from '@/lib/contact';
import {
  buildBookingUrl,
  NOTES_PARAM,
  SECTORS,
  BOTTLENECKS,
  type QualificationAnswers,
} from '@/lib/booking';
import { useAnalytics } from '@/lib/hooks/useAnalytics';

/**
 * The qualification step before Calendly.
 *
 * ## It is a real form, not a JavaScript widget
 *
 * `action` points at the live Calendly URL and `method` is GET, with the two
 * critical inputs named `name` and `email` — Calendly's own prefill parameters.
 * With JavaScript disabled the browser submits it natively and the visitor
 * still lands on a prefilled booking page. Everything below only improves that
 * baseline; nothing is required for it to work.
 *
 * ## Why so few fields
 *
 * Four questions, one of which is optional. Every additional field on a booking
 * form costs completions, and the 20-minute session exists precisely to ask the rest.
 * The fields that survived are the ones that change how the call opens.
 *
 * ## Validation
 *
 * Native constraint validation, not a custom engine — `required` and
 * `type="email"` are already announced correctly by screen readers and already
 * localised by the browser. The only custom behaviour is deferring the styling
 * of the invalid state until a submit has been attempted, so a half-typed
 * address is not flagged as wrong while it is being typed.
 */
export function QualificationForm() {
  const baseId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const { track } = useAnalytics();
  const [attempted, setAttempted] = useState(false);
  const [answers, setAnswers] = useState<QualificationAnswers>({
    name: '',
    email: '',
    sector: '',
    bottleneck: '',
    notes: '',
  });

  const update = <K extends keyof QualificationAnswers>(
    key: K,
    value: QualificationAnswers[K],
  ) => setAnswers((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setAttempted(true);

    const form = formRef.current;
    if (form && !form.checkValidity()) {
      // Let the browser report it. Preventing default here would suppress the
      // native message without providing a replacement.
      return;
    }

    // From here we take over: the enriched URL folds the structured answers
    // into the notes parameter, which a native GET submission cannot do.
    event.preventDefault();

    track('booking_qualified', {
      sector: answers.sector || 'unspecified',
      bottleneck: answers.bottleneck || 'unspecified',
      has_notes: answers.notes.trim().length > 0,
    });

    window.location.href = buildBookingUrl(answers);
  };

  const field =
    'h-11 w-full rounded-lg border bg-white/[0.03] px-3 text-[15px] text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent-bright/30 focus:border-accent-bright/50';
  // `:invalid` only bites after a submit attempt — otherwise every empty
  // required field is red before the visitor has typed anything.
  const border = attempted
    ? 'border-white/[0.1] [&:invalid]:border-red-400/60'
    : 'border-white/[0.1]';

  return (
    <form
      ref={formRef}
      action={BOOKING_URL}
      method="get"
      onSubmit={handleSubmit}
      noValidate={false}
      className="rounded-2xl glass p-7 md:p-9"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor={`${baseId}-name`} className="text-[14px] font-medium text-white">
            Your name
          </label>
          <input
            id={`${baseId}-name`}
            // Calendly's prefill parameter. Renaming this breaks the no-JS path.
            name="name"
            type="text"
            required
            autoComplete="name"
            value={answers.name}
            onChange={(e) => update('name', e.target.value)}
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
            autoComplete="email"
            value={answers.email}
            onChange={(e) => update('email', e.target.value)}
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
            value={answers.sector}
            onChange={(e) => update('sector', e.target.value)}
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
            value={answers.bottleneck}
            onChange={(e) => update('bottleneck', e.target.value)}
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
            // Named as Calendly's custom-question parameter so the no-JS path
            // still carries this text through. With JS, it is replaced by the
            // composed version that also includes the two selects.
            name={NOTES_PARAM}
            rows={3}
            value={answers.notes}
            onChange={(e) => update('notes', e.target.value)}
            className="w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2.5 text-[15px] leading-relaxed text-white transition-colors focus:border-accent-bright/50 focus:outline-none focus:ring-2 focus:ring-accent-bright/30"
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-white/[0.06] pt-7 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-[12px] leading-relaxed text-ink-300">
          Next step is choosing a time. Your answers travel with the booking, so the call starts
          with your situation rather than with questions you have already answered.
        </p>
        <button type="submit" className="btn btn-primary h-12 px-6 text-[15px]" data-cursor="hover">
          <span>Choose a time</span>
          <ArrowRight className="arrow h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}

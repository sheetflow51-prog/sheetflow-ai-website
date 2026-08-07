'use client';

import { useId, useState } from 'react';

/**
 * The recovery calculator.
 *
 * ## Why this one is honest, when most are not
 *
 * A typical agency ROI calculator hard-codes the flattering variable — "recover
 * 40% of missed leads!" — and presents the output as a projection. That 40% is
 * a fabricated outcome claim, and this project forbids those (see
 * `content/proof.ts`, and D24 on the case studies).
 *
 * Here, **every** input is the visitor's, including the recovery rate. Nothing
 * SheetFlow has done enters the arithmetic, so the output cannot be a claim
 * about SheetFlow's results. It is the reader's own estimate, multiplied out —
 * which is the only version of this tool we are entitled to publish.
 *
 * The copy says so plainly rather than burying it in a footnote, because a
 * reader who thinks the number is our forecast has been misled regardless of
 * how the code works.
 *
 * ## Why it is a client component when nothing else on the page is
 *
 * It needs state. The cost is bounded: three controlled number inputs and a
 * multiplication, no effects, no observers, no animation. It is also the only
 * interactive element on `/pricing`, so it is the only thing that hydrates.
 */

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

interface FieldProps {
  id: string;
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (value: number) => void;
}

function Field({ id, label, hint, value, min, max, step, suffix, onChange }: FieldProps) {
  const hintId = `${id}-hint`;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[14px] font-medium text-white">
        {label}
      </label>
      <p id={hintId} className="text-[12px] leading-relaxed text-ink-300">
        {hint}
      </p>
      <div className="flex items-center gap-3">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          value={value}
          min={min}
          max={max}
          step={step}
          aria-describedby={hintId}
          onChange={(e) => {
            const next = Number(e.target.value);
            // Guard the arithmetic rather than the keystroke: clamping while
            // typing fights the user (deleting "10" to type "5" briefly gives
            // an empty field). NaN and out-of-range collapse to the bound.
            if (Number.isNaN(next)) return onChange(min);
            onChange(Math.min(max, Math.max(min, next)));
          }}
          className="h-11 w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 text-[15px] text-white transition-colors focus:border-accent-bright/50 focus:outline-none focus:ring-2 focus:ring-accent-bright/30"
        />
        {suffix && (
          <span className="shrink-0 font-mono text-[11px] uppercase tracking-widest text-ink-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export function RecoveryCalculator() {
  const baseId = useId();
  const [missed, setMissed] = useState(10);
  const [value, setValue] = useState(5000);
  const [recovery, setRecovery] = useState(25);

  const perMonth = Math.round(missed * 4.33 * value * (recovery / 100));
  const perYear = perMonth * 12;

  return (
    <div className="rounded-2xl glass p-7 md:p-9">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-12">
        <div className="flex flex-col gap-6">
          <Field
            id={`${baseId}-missed`}
            label="Enquiries you miss or answer late, per week"
            hint="Your estimate. Calls during treatment, forms nobody opened, messages answered the next day."
            value={missed}
            min={0}
            max={500}
            step={1}
            suffix="per week"
            onChange={setMissed}
          />
          <Field
            id={`${baseId}-value`}
            label="What one converted customer is worth to you"
            hint="Average value of a customer, not of a single transaction."
            value={value}
            min={0}
            max={10_000_000}
            step={500}
            suffix="₹"
            onChange={setValue}
          />
          <Field
            id={`${baseId}-recovery`}
            label="Share of those you think you would recover"
            hint="Your judgement, not our claim. We have published no recovery figure because none has been measured."
            value={recovery}
            min={0}
            max={100}
            step={1}
            suffix="%"
            onChange={setRecovery}
          />
        </div>

        <div className="flex flex-col justify-center gap-6 border-t border-white/[0.06] pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
          {/* aria-live so the figure is announced as inputs change, rather than
              silently updating for anyone not watching this region. */}
          <div aria-live="polite" aria-atomic="true" className="flex flex-col gap-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-ink-400">
                On your numbers, per month
              </p>
              <p className="mt-2 font-display text-4xl font-semibold text-accent-gradient md:text-5xl">
                {INR.format(perMonth)}
              </p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-ink-400">
                Per year
              </p>
              <p className="mt-2 font-display text-2xl font-semibold text-white">
                {INR.format(perYear)}
              </p>
            </div>
          </div>

          <p className="border-t border-white/[0.06] pt-5 text-[12px] leading-relaxed text-ink-300">
            This is your three figures multiplied together, using 4.33 weeks per month. It is
            arithmetic on your estimates — <span className="text-white/80">not a forecast</span>,
            and not a claim about what SheetFlow has achieved for anyone.
          </p>
        </div>
      </div>
    </div>
  );
}

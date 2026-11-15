import type { Metadata } from 'next';
import Link from 'next/link';

import { ServiceBreadcrumb } from '@/components/sections/ServiceBreadcrumb';
import {
  FOUNDER_DECISIONS,
  PRIVACY_EFFECTIVE_DATE,
  PRIVACY_NOTICE_VERSION,
  PRIVACY_SECTION_IDS,
  PROVIDER_FACTS_CHECKED,
  assertPrivacyDecisionsComplete,
  isUnfilled,
  pendingMarker,
  type RequiredDecision,
} from '@/content/privacy';
import { WHATSAPP_NUMBER } from '@/lib/contact';

/**
 * `/privacy` — the privacy notice (D47).
 *
 * ## The production gate runs here
 *
 * The call below runs when this module loads, which for a static page is
 * during `next build`. On a Vercel production build (`VERCEL_ENV=production`)
 * it throws while any founder decision in `content/privacy.ts` is still a
 * placeholder, so the build fails instead of publishing "[To be confirmed by
 * SheetFlow: ...]" as the site's legal notice. Preview and local builds render
 * the markers, so the page can be reviewed before the decisions are made. The
 * site has no CI; this is the only check between a merge and the live notice.
 *
 * ## How the copy was written
 *
 * Plain English, short sentences, one fact per line, and nothing stated that
 * has not been checked: vendor facts come from each provider's documentation
 * (read on `PROVIDER_FACTS_CHECKED`) and are attributed to the vendor where
 * they are the vendor's claim ("Vercel states..."). It says what the DPDP Act
 * 2023 and the SPDI Rules 2011 ask a notice to say: the itemised data, each
 * purpose, the providers, retention, the rights and how to use them, the
 * grievance route, and the Board. It claims no certification or compliance
 * status, and the contact is titled "Grievance Officer / privacy contact",
 * never "Data Protection Officer", which is a statutory role this business
 * does not have. The query-string sentence under Vercel Web Analytics is true
 * only because `SiteAnalytics` strips it; keep the two together.
 */
assertPrivacyDecisionsComplete(process.env);

export const metadata: Metadata = {
  title: 'Privacy notice',
  description:
    'What SheetFlow AI collects through this website and the booking form for the free 20-minute discovery & help session, why, who helps us handle it, how long we keep it, and what you can ask us to do.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'Privacy notice · SheetFlow AI',
    description:
      'What we collect when you book a free 20-minute session, why, who helps us handle it, and your rights.',
    url: '/privacy',
    type: 'website',
  },
};

/** A WhatsApp chat opened with a neutral first line, so a privacy request does not start as a booking. */
const PRIVACY_WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  'Hi, I have a privacy request about my details.',
)}`;

const SECTIONS = [
  { id: PRIVACY_SECTION_IDS.contact, title: 'Who we are and how to contact us' },
  { id: 'what-we-collect', title: 'What we collect' },
  { id: 'why', title: 'Why we use it' },
  { id: 'providers', title: 'Who else handles your details' },
  { id: 'retention', title: 'How long we keep it' },
  { id: PRIVACY_SECTION_IDS.rights, title: 'Your rights' },
  { id: 'security', title: 'How we keep it safe' },
  { id: 'breaches', title: 'If something goes wrong' },
  { id: 'children', title: 'Children' },
  ...(FOUNDER_DECISIONS.otherLanguagesOnRequest ? [{ id: 'languages', title: 'Other languages' }] : []),
  { id: 'law', title: 'The law we follow' },
  { id: 'changes', title: 'Changes to this notice' },
];
const titleOf = (id: string) => SECTIONS.find((s) => s.id === id)!.title;

const h2 = 'scroll-mt-28 font-display text-[24px] font-semibold leading-snug text-white md:text-[28px]';
const h3 = 'scroll-mt-28 text-[17px] font-semibold leading-snug text-white';
const body = 'text-[15px] leading-relaxed text-ink-200 text-pretty';
const list = 'flex list-disc flex-col gap-2 pl-5 text-[15px] leading-relaxed text-ink-200 marker:text-ink-400';
const link =
  'text-white underline decoration-white/25 underline-offset-4 transition-colors hover:decoration-white';

/** The visible stand-in for a decision the founder has not made yet (never on a production build). */
function Pending({ decision }: { decision: RequiredDecision }) {
  return (
    <span
      data-pending-decision={decision}
      className="rounded-md border border-dashed border-white/30 px-1.5 py-0.5 font-mono text-[0.85em] text-white"
    >
      {pendingMarker(decision)}
    </span>
  );
}

/** A text decision, or its marker. */
function DecisionText({ decision }: { decision: 'grievanceOfficerName' | 'postalAddress' }) {
  const value = FOUNDER_DECISIONS[decision];
  return isUnfilled(value) ? <Pending decision={decision} /> : <>{value}</>;
}

/** A count of days or months, or its marker. */
function Count({ decision, unit }: { decision: 'retentionMonths' | 'aiTrainingRemovalDays'; unit: 'day' | 'month' }) {
  const value = FOUNDER_DECISIONS[decision];
  if (isUnfilled(value) || typeof value !== 'number') return <Pending decision={decision} />;
  return <>{`${value} ${unit}${value === 1 ? '' : 's'}`}</>;
}

function PrivacyEmail() {
  const value = FOUNDER_DECISIONS.privacyEmail;
  if (isUnfilled(value)) return <Pending decision="privacyEmail" />;
  return (
    <a href={`mailto:${value}`} className={link} data-cursor="hover">
      {value}
    </a>
  );
}

/** One numbered part of the notice. The heading carries the id, so `/privacy#<id>` lands on it. */
function Section({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-5 border-t border-white/[0.06] pt-10">
      <h2 id={id} className={h2}>
        {titleOf(id)}
      </h2>
      {children}
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <section className="section pt-28 md:pt-36" aria-labelledby="privacy-heading">
      <div className="container-edge">
        <ServiceBreadcrumb
          trail={[
            { name: 'Home', href: '/' },
            { name: 'Privacy notice', href: '/privacy' },
          ]}
        />

        <div className="max-w-3xl">
          <span className="kicker">Your details</span>
          <h1 id="privacy-heading" className="headline-section text-fade text-balance mt-5">
            Privacy notice
          </h1>
          <p className="mt-7 text-[17px] leading-relaxed text-ink-200 text-pretty">
            This notice explains what SheetFlow AI collects when you visit this website, fill in the
            booking form or message us, why we collect it, who helps us handle it, and what you can
            ask us to do with it. We have kept it short and plain. If anything is unclear, just ask.
          </p>
          <p className="mt-4 font-mono text-[12px] text-ink-300">
            Version {PRIVACY_NOTICE_VERSION} · Effective {PRIVACY_EFFECTIVE_DATE}
          </p>

          <nav aria-label="On this page" className="mt-10">
            <ul className="flex flex-col gap-1">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="inline-flex min-h-[24px] items-center text-[14px] text-ink-300 transition-colors hover:text-white"
                    data-cursor="hover"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-12 flex flex-col gap-12">
            <Section id={PRIVACY_SECTION_IDS.contact}>
              <p className={body}>
                SheetFlow AI (&ldquo;SheetFlow&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) runs this
                website and the free 20-minute discovery &amp; help session. SheetFlow collects the
                details described in this notice, and SheetFlow keeps them.
              </p>
              <h3 className={h3}>Grievance Officer / privacy contact</h3>
              <dl className="grid gap-x-6 gap-y-2 text-[15px] leading-relaxed sm:grid-cols-[10rem_1fr]">
                <dt className="text-ink-300">Name</dt>
                <dd className="text-ink-200">
                  <DecisionText decision="grievanceOfficerName" />
                </dd>
                <dt className="text-ink-300">Email</dt>
                <dd className="text-ink-200">
                  <PrivacyEmail />
                </dd>
                <dt className="text-ink-300">WhatsApp</dt>
                <dd className="text-ink-200">
                  <a href={PRIVACY_WHATSAPP_URL} className={link} data-cursor="hover">
                    Message us on WhatsApp
                  </a>
                </dd>
                <dt className="text-ink-300">Postal address</dt>
                <dd className="text-ink-200">
                  <DecisionText decision="postalAddress" />
                </dd>
              </dl>
              <p className={body}>
                Write to this contact with any question about your details, to use any of{' '}
                <a href={`#${PRIVACY_SECTION_IDS.rights}`} className={link} data-cursor="hover">
                  your rights
                </a>
                , or to make a complaint. We reply within 30 days.
              </p>
            </Section>

            <Section id="what-we-collect">
              <p className={body}>Only what we need to arrange and run your session:</p>
              <ul className={list}>
                <li>
                  <strong className="font-semibold text-white">What you type into the booking form:</strong>{' '}
                  your name, your email address, the kind of business you run, where you are losing
                  the most, and anything you add in the optional notes box.
                </li>
                <li>
                  <strong className="font-semibold text-white">Your choice on the optional AI-improvement box</strong>,
                  and which version of this notice the form showed you.
                </li>
                <li>
                  <strong className="font-semibold text-white">Which page or link brought you:</strong>{' '}
                  the page the form was on (its address without anything after a &ldquo;?&rdquo;),
                  and the campaign tags in the link you followed, if it had any, such as which post
                  or pricing option it came from.
                </li>
                <li>
                  <strong className="font-semibold text-white">Your approximate country:</strong> our
                  website host works it out from your IP address and passes us a two-letter code. We
                  do not save your IP address in our records.
                </li>
                <li>
                  <strong className="font-semibold text-white">Your booking:</strong> when you pick a
                  time, the booking page collects that time, the name and email you confirm there,
                  and any answers you give on it.
                </li>
                <li>
                  <strong className="font-semibold text-white">WhatsApp messages:</strong> if you
                  message us, we see your WhatsApp number and name and what you write.
                </li>
                <li>
                  <strong className="font-semibold text-white">How the website is used:</strong> page
                  views and loading-speed measurements, described under Vercel below.
                </li>
              </ul>
              <p className={body}>
                We don&rsquo;t ask for health, financial or password details. Please don&rsquo;t put
                them in your notes.
              </p>
            </Section>

            <Section id="why">
              <h3 id="purpose-booking" className={h3}>
                To arrange your session
              </h3>
              <p className={body}>
                We use the details from the form, and your booking, to reply to your request, arrange
                and hold your free 20-minute session, and follow up with you about that session. You
                give us these details for that, so booking needs no tick-box. If you no longer want
                our help, tell us and we will stop using them.
              </p>

              <h3 id="purpose-attribution" className={h3}>
                To see which pages and links bring enquiries
              </h3>
              <p className={body}>
                The page and campaign tags show us which pages, posts and links lead people to book,
                so we know what is useful. They are stored with your enquiry and used for nothing
                else.
              </p>

              <h3 id={PRIVACY_SECTION_IDS.aiTraining} className={h3}>
                To improve our AI assistants, only if you agree
              </h3>
              <p className={body}>
                This is optional, and it is off unless you tick the box on the booking form. Your
                booking is the same either way.
              </p>
              <ul className={list}>
                <li>
                  <strong className="font-semibold text-white">What we use:</strong>{' '}your answers to
                  &ldquo;What kind of business?&rdquo; and &ldquo;Where are you losing the
                  most?&rdquo;, and your notes. We remove your name and email first, and anything in
                  your notes that could identify you, such as names, phone numbers or company names.
                </li>
                <li>
                  <strong className="font-semibold text-white">What for:</strong> to improve the AI
                  assistants SheetFlow builds. Before any outside AI provider receives these answers
                  for this, we will name it on this page.
                </li>
                <li>
                  <strong className="font-semibold text-white">How to withdraw:</strong> tell us at any
                  time, by email to our{' '}
                  <a href={`#${PRIVACY_SECTION_IDS.contact}`} className={link} data-cursor="hover">
                    privacy contact
                  </a>{' '}
                  or on WhatsApp, with the email you used on the form. One message is enough.
                </li>
                <li>
                  <strong className="font-semibold text-white">What happens then:</strong> we stop
                  using your answers for AI improvement and remove them from our training data within{' '}
                  <Count decision="aiTrainingRemovalDays" unit="day" />. Your booking and our other
                  records of your enquiry are not affected.
                </li>
                <li>
                  <strong className="font-semibold text-white">What it cannot undo:</strong> use
                  before you withdrew stays lawful, and an assistant that has already learned from
                  de-identified answers cannot always unlearn them. That is one reason we only ever
                  use them with your name and details removed.
                </li>
              </ul>
              <p className={body}>We don&rsquo;t use your details for any other purpose without asking you first.</p>
            </Section>

            <Section id="providers">
              <p className={body}>
                A few service providers help us run the website, the booking page and our records.
                They handle your details for the purposes above:
              </p>
              <ul className={list}>
                <li>
                  <strong className="font-semibold text-white">Vercel Inc.</strong>{' '}hosts this
                  website. When you load a page or send the form, Vercel processes technical details
                  of the request (your IP address, your browser, the page address including anything
                  after a &ldquo;?&rdquo;, and the time) to deliver the site and run the form. On our
                  current plan, the request logs we can see are kept for 1 hour. Vercel says its main
                  processing facilities are in the United States.
                </li>
                <li>
                  <strong className="font-semibold text-white">Vercel Web Analytics</strong>{' '}counts
                  visits. Vercel states that it uses no cookies and tells visits apart with a code
                  made from the request, which resets every day. It records the page you viewed, the
                  site that sent you, your approximate location (country, region and city), and your
                  device type, operating system and browser. We remove anything after a
                  &ldquo;?&rdquo; or &ldquo;#&rdquo; from page addresses before anything is sent.
                </li>
                <li>
                  <strong className="font-semibold text-white">Vercel Speed Insights</strong>{' '}
                  measures how fast our pages load. It records performance measurements with the
                  page address (shortened the same way), your country, device type, operating
                  system, browser and connection speed. Vercel states these measurements are not
                  tied to an individual visitor or IP address.
                </li>
                <li>
                  <strong className="font-semibold text-white">Our own automation (n8n)</strong> runs
                  on our own computer. It receives the form and booking details from our website and
                  writes them into our booking records. On the way they pass through{' '}
                  <strong className="font-semibold text-white">ngrok, Inc.</strong>, which connects
                  our website to that computer. ngrok records connection details (the connecting IP
                  address, which is our website host&rsquo;s server rather than your device, its
                  approximate location, the path, and the names but not the values of any query
                  parameters) and deletes them after 24 hours. We keep its option to store the
                  contents of requests turned off.
                </li>
                <li>
                  <strong className="font-semibold text-white">Google LLC.</strong> Our booking
                  records are kept in a Google Sheet in our Google account, which Google provides
                  under its own terms and privacy policy. The session itself is a Google Meet call,
                  and its invitation is in Google Calendar.
                </li>
                <li>
                  <strong className="font-semibold text-white">Cal.com, Inc.</strong> runs the
                  booking page you are taken to after the form. It processes your name, email, the
                  time you pick and any answers you give there on our behalf, and sends your booking
                  confirmation and reminder emails. Cal.com says it processes data in the United
                  States. Its own privacy policy also applies on that page.
                </li>
                <li>
                  <strong className="font-semibold text-white">WhatsApp</strong>, part of Meta,
                  carries your messages if you write to us there, under WhatsApp&rsquo;s own terms
                  and privacy policy.
                </li>
              </ul>
              <p className={body}>
                These providers are based in the United States and may process your information
                there or in other countries where they operate.
              </p>
              <p className={body}>
                We do not sell your personal data. We share it only with the providers listed here,
                for the purposes above, or when the law requires us to.
              </p>
            </Section>

            <Section id="retention">
              <p className={body}>
                We keep your enquiry and booking records for{' '}
                <Count decision="retentionMonths" unit="month" /> after our last contact with you,
                and then delete them. If you ask us to delete them sooner, we will, unless the law
                requires us to keep something. If you allowed AI improvement, the de-identified
                answers stay in our training data until you withdraw.
              </p>
              <p className={body}>
                Our providers keep their own records for their own periods. As they described them
                on {PROVIDER_FACTS_CHECKED}:
              </p>
              <ul className={list}>
                <li>Vercel&rsquo;s request logs: 1 hour on our current plan.</li>
                <li>
                  Vercel Web Analytics: at least 1 month on our current plan; Vercel says it may keep
                  the data longer.
                </li>
                <li>ngrok&rsquo;s connection records: 24 hours.</li>
                <li>
                  Cal.com: for as long as our account is open, and normally deleted within 90 days
                  after it closes.
                </li>
                <li>The Google Sheet: until we delete the row.</li>
              </ul>
              <p className={body}>
                From May 2027, Indian rules may require us to keep some records of how data was
                processed for at least a year.
              </p>
            </Section>

            <Section id={PRIVACY_SECTION_IDS.rights}>
              <p className={body}>You can ask us, at any time:</p>
              <ul className={list}>
                <li>
                  for a summary of the personal data we hold about you, how we use it, and who we
                  have shared it with;
                </li>
                <li>to correct, complete or update it;</li>
                <li>to delete it;</li>
                <li>
                  to withdraw your consent to{' '}
                  <a href={`#${PRIVACY_SECTION_IDS.aiTraining}`} className={link} data-cursor="hover">
                    AI improvement
                  </a>
                  ;
                </li>
                <li>to look into a complaint about how we have handled your details.</li>
              </ul>
              <p className={body}>
                You can also name someone to use these rights for you if you die or become unable to.
              </p>
              <p className={body}>
                <strong className="font-semibold text-white">How to ask:</strong> write to our{' '}
                <a href={`#${PRIVACY_SECTION_IDS.contact}`} className={link} data-cursor="hover">
                  Grievance Officer / privacy contact
                </a>{' '}
                by email or on WhatsApp. Tell us the email address you used on the form, so we can
                find your records. We may ask you to confirm it is yours before we act.
              </p>
              <p className={body}>
                <strong className="font-semibold text-white">When we answer:</strong> within 30 days.
              </p>
              <p className={body}>
                <strong className="font-semibold text-white">If you are not satisfied:</strong> once
                you have raised it with us, you can complain to the Data Protection Board of India.
              </p>
            </Section>

            <Section id="security">
              <p className={body}>
                Connections to this website, and from it to our booking records and providers, are
                encrypted. Only SheetFlow can open our booking records. The passwords and keys that
                connect our systems are kept on the server and never reach your browser. And we
                collect only what the session needs, so there is less to protect.
              </p>
            </Section>

            <Section id="breaches">
              <p className={body}>
                If a security problem affects your personal data, we will tell you without undue
                delay, explain what happened and what you can do, and notify the authorities as
                Indian law requires.
              </p>
            </Section>

            <Section id="children">
              <p className={body}>
                This service is for adults running or working in a business. Please don&rsquo;t use
                the booking form if you are under 18. If we learn that we have received a
                child&rsquo;s details, we will delete them.
              </p>
            </Section>

            {FOUNDER_DECISIONS.otherLanguagesOnRequest && (
              <Section id="languages">
                <p className={body}>
                  Would you like this notice in Hindi or another Indian language? Ask our{' '}
                  <a href={`#${PRIVACY_SECTION_IDS.contact}`} className={link} data-cursor="hover">
                    privacy contact
                  </a>{' '}
                  and we will send it to you.
                </p>
              </Section>
            )}

            <Section id="law">
              <p className={body}>
                We have written this notice to the standard of India&rsquo;s Digital Personal Data
                Protection Act, 2023, most of whose provisions take effect in May 2027, and of the
                rules under the Information Technology Act, 2000 that apply today.
              </p>
            </Section>

            <Section id="changes">
              <p className={body}>
                This is version {PRIVACY_NOTICE_VERSION}, effective {PRIVACY_EFFECTIVE_DATE}. If we
                change what we collect or why, we will update this page and its version number. The
                booking form records which version you were shown.
              </p>
              <p className={body}>
                Ready to talk?{' '}
                <Link href="/book" className={link} data-cursor="hover">
                  Book your free 20-minute session
                </Link>
                .
              </p>
            </Section>
          </div>
        </div>
      </div>
    </section>
  );
}

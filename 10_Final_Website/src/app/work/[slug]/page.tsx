import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowRight, Check, FileCode2, Info } from 'lucide-react';

import { JsonLd } from '@/components/seo/JsonLd';
import { ServiceBreadcrumb } from '@/components/sections/ServiceBreadcrumb';
import { Button } from '@/components/ui/Button';
import { SectionHandoff } from '@/components/signature/SectionHandoff';
import { ArchitectureFlow } from '@/components/work/ArchitectureFlow';
import { WorkflowGlyph } from '@/components/work/WorkflowGlyph';
import {
  getProject,
  projects,
  relatedProjects,
  NOT_DISCLOSED_LABEL,
  INTERNAL_ONLY_LABEL,
  DEMO_BUILD_LABEL,
  CONFIDENTIAL_CLIENT_LABEL,
  type WorkProject,
} from '@/content/work';
import { getService } from '@/content/services';
import { workProjectGraph } from '@/lib/structured-data';
import { cn } from '@/lib/utils';

/**
 * `/work/[slug]` — one case study per delivered build.
 *
 * ## The shape of the argument
 *
 * These pages cannot sell on results, because none have been measured (D24).
 * So they sell on the thing that *is* verifiable: how the build works. Each
 * page states the problem, shows the data flow, lists the observed stack,
 * explains the decisions and — critically — tells the reader how to confirm
 * every one of them on the live site.
 *
 * That is a stronger position than it first appears. A figure asks for trust;
 * "open the booking form and view source" does not.
 *
 * ## Statically generated, exhaustively
 *
 * Same contract as `/services/[slug]`: `generateStaticParams` enumerates every
 * slug and `dynamicParams = false` 404s anything else rather than rendering an
 * empty shell.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  return {
    title: project.metaTitle,
    description: project.metaDescription,
    // Overrides the layout's `canonical: '/'`. Without it every case study
    // would declare the homepage canonical and ask to be de-indexed for it.
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title: project.metaTitle,
      description: project.metaDescription,
      url: `/work/${project.slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: project.metaTitle,
      description: project.metaDescription,
    },
  };
}

/**
 * The evidence block for an internal build — what stands in for "click the link
 * and check".
 *
 * A case study about work nobody can open has to earn its place differently. It
 * does that by being specific: named files with line counts, named outputs,
 * a test count and the date it was run. Every row here is a claim somebody
 * could contradict by looking, which is the property a vague description of
 * unreachable work would lack.
 *
 * It renders no image and no outbound link, because the `internal` variant
 * carries neither — see `ProjectEvidence` in `content/work.ts`.
 */
/**
 * The animated pipeline panel.
 *
 * ## Why it now appears on all ten case studies
 *
 * RC2 introduced this for the five internal builds, which have no deployment to
 * screenshot, and recorded the asymmetry as a deliberate-but-arguable call
 * (`docs/RC2_SUMMARY.md` § 6, item 4): client pages lead with a real capture,
 * which is stronger evidence than any diagram, so they never showed it.
 *
 * That reasoning holds for what sits **above** the fold and is preserved — a
 * client page still opens with its screenshot. But it does not justify the
 * system never being drawn at all, and RC3's brief asks for an animated
 * workflow visualisation on *every* case study. So the panel now follows the
 * screenshot rather than replacing it: the photograph proves the thing shipped,
 * the diagram explains how it works.
 *
 * It stays `aria-hidden`. Every label in it is a stage name the architecture
 * section announces in full further down the page, and a screen reader
 * receiving the same pipeline twice gains nothing.
 */
function SystemPanel({
  stages,
  className,
}: {
  stages: WorkProject['architecture'];
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'signature-edge relative overflow-hidden rounded-2xl glass px-6 py-10 md:px-12 md:py-14',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 signature-grid opacity-70" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 65% 130% at 50% 0%, rgb(var(--color-accent) / 0.14), transparent 72%)',
        }}
      />
      <p className="relative mb-9 text-center font-mono text-[10px] uppercase tracking-widest text-ink-300">
        System pipeline
      </p>
      <WorkflowGlyph
        stages={stages}
        variant="panel"
        withDetail
        className="relative mx-auto max-w-4xl"
      />
    </div>
  );
}

function Evidence({
  evidence,
  stages,
}: {
  evidence: Extract<WorkProject['evidence'], { kind: 'internal' }>;
  stages: WorkProject['architecture'];
}) {
  return (
    <section className="mt-14" aria-labelledby="evidence-heading">
      {/* The visual anchor an internal build has instead of a screenshot.
          Before RC2 these five pages ran breadcrumb → headline → lede →
          evidence ledger, with nothing to look at, while the five client pages
          were showing a full-bleed 1280×800 capture at the same scroll position
          (`docs/RC2_VISUAL_AUDIT.md` § V2). */}
      <SystemPanel stages={stages} className="mb-6" />

      <div className="rounded-2xl glass p-8 md:p-10">
        <div className="flex items-start gap-3">
          <FileCode2
            className="mt-0.5 h-5 w-5 shrink-0 text-accent-bright/80"
            strokeWidth={1.8}
            aria-hidden="true"
          />
          <div>
            <h2 id="evidence-heading" className="font-display text-[20px] font-semibold text-white">
              {INTERNAL_ONLY_LABEL}
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-200 text-pretty">
              {evidence.reason}
            </p>
          </div>
        </div>

        <dl className="mt-8 divide-y divide-white/[0.06] border-t border-white/[0.06]">
          {evidence.artifacts.map((artifact) => (
            <div
              key={artifact.name}
              className="grid gap-1.5 py-5 sm:grid-cols-[minmax(0,280px)_1fr] sm:gap-6"
            >
              <dt className="font-mono text-[12px] leading-relaxed text-accent-bright/80">
                {artifact.name}
              </dt>
              <dd className="text-[15px] leading-relaxed text-ink-200 text-pretty">
                {artifact.detail}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/**
 * The disclosure every anonymized build carries (D39), in the page's own voice
 * and above the screenshot.
 *
 * It replaces two older notices: the demonstration notice (D32), whose sense
 * survives as `origin: 'demonstration'`, and the companion caption, whose
 * seeded-data qualification now lives in `disclosure`. A visitor who reads the
 * headline, looks at the picture and leaves must still have passed the sentence
 * saying who this is not, and why nothing links out.
 */
function ConfidentialNotice({
  origin,
  disclosure,
}: {
  origin: 'client' | 'demonstration';
  disclosure: string;
}) {
  return (
    <aside className="mt-10 rounded-2xl border border-white/[0.10] bg-white/[0.03] p-6 md:p-7">
      <div className="flex items-start gap-3">
        <Info
          className="mt-0.5 h-5 w-5 shrink-0 text-accent-bright/80"
          strokeWidth={1.8}
          aria-hidden="true"
        />
        <div>
          <p className="font-display text-[17px] font-semibold text-white">
            {origin === 'demonstration' ? DEMO_BUILD_LABEL : CONFIDENTIAL_CLIENT_LABEL}
          </p>
          <p className="mt-2.5 max-w-2xl text-[15px] leading-relaxed text-ink-200 text-pretty">
            {disclosure}
          </p>
        </div>
      </div>
    </aside>
  );
}

/**
 * The outcome block.
 *
 * The `not-disclosed` branch is not a placeholder awaiting content — it is the
 * published state, and it explains itself. A reader who notices there is no
 * number should find the reason here rather than inferring one.
 */
function Outcome({ project }: { project: WorkProject }) {
  if (project.outcome.disclosure === 'measured') {
    return (
      <div className="rounded-2xl glass p-8 md:p-10">
        <div className="font-display text-4xl font-semibold text-accent-gradient md:text-5xl">
          {project.outcome.metric}
        </div>
        <p className="mt-2 text-[15px] text-ink-200">{project.outcome.metricLabel}</p>
        <p className="mt-5 border-t border-white/[0.06] pt-5 text-[12px] leading-relaxed text-ink-300">
          {project.outcome.verification.methodology} · Confirmed with the client on{' '}
          {project.outcome.verification.verifiedOn} · Source:{' '}
          {project.outcome.verification.source}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl glass p-8 md:p-10">
      <div className="flex items-start gap-3">
        <Info
          className="mt-0.5 h-5 w-5 shrink-0 text-accent-bright/80"
          strokeWidth={1.8}
          aria-hidden="true"
        />
        <div>
          <p className="font-display text-[20px] font-semibold text-white">
            {NOT_DISCLOSED_LABEL}
          </p>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-200 text-pretty">
            No business outcome has been measured against a stated method and confirmed with
            this client, so no figure is published. We would rather show you the system and let
            you judge it than print a number nobody verified.
          </p>
        </div>
      </div>
    </div>
  );
}

export default async function WorkProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const related = relatedProjects(project);
  const linkedServices = project.services
    .map(getService)
    .filter((s): s is NonNullable<typeof s> => s !== undefined);

  return (
    <>
      <JsonLd graph={workProjectGraph(project)} />

      {/* ---------------------------------------------------------- Header */}
      <section className="section pt-28 md:pt-36" aria-labelledby="project-heading">
        <div className="container-edge">
          <ServiceBreadcrumb
            trail={[
              { name: 'Home', href: '/' },
              { name: 'Work', href: '/work' },
              { name: project.shortLabel, href: `/work/${project.slug}` },
            ]}
          />

          <div className="max-w-4xl">
            <span className="kicker">{project.kicker}</span>
            <h1 id="project-heading" className="headline-cinematic text-fade text-balance mt-5">
              {project.headline}
            </h1>
            <p className="mt-7 max-w-2xl text-[17px] leading-relaxed text-ink-200 text-pretty md:text-[19px]">
              {project.lede}
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <span className="font-mono text-[11px] uppercase tracking-widest text-ink-400">
              {project.sector} · {project.location}
            </span>
          </div>

          {/* The disclosure sits above the screenshot, not below it: placed after
              the fold it would be technically present and practically invisible. */}
          {project.evidence.kind === 'confidential' && (
            <ConfidentialNotice
              origin={project.evidence.origin}
              disclosure={project.evidence.disclosure}
            />
          )}

          {project.evidence.kind === 'confidential' ? (
            project.evidence.shot && (
              <figure className="mt-14">
                <div className="rounded-2xl glass overflow-hidden p-0">
                  <Image
                    src={project.evidence.shot.src}
                    alt={project.evidence.shot.alt}
                    width={project.evidence.shot.width}
                    height={project.evidence.shot.height}
                    sizes="(min-width: 1280px) 1100px, 94vw"
                    className="h-auto w-full"
                    priority
                  />
                </div>
                <figcaption className="mt-4 text-[12px] text-ink-400">
                  {project.client}, captured from the{' '}
                  {project.evidence.origin === 'demonstration' ? 'demonstration build' : 'production build'}.
                  Identifying details are redacted and the deployment is not linked.
                </figcaption>
              </figure>
            )
          ) : (
            <Evidence evidence={project.evidence} stages={project.architecture} />
          )}

          {/* The diagram follows the photograph (or stands in for it where no
              frame could be redacted honestly). Internal builds get theirs from
              `Evidence`, which is the only visual those pages have. */}
          {project.evidence.kind === 'confidential' && (
            <SystemPanel stages={project.architecture} className="mt-6" />
          )}
        </div>
      </section>

      <SectionHandoff />

      {/* ----------------------------------------------------------- Brief */}
      <section className="section" aria-labelledby="brief-heading">
        <div className="container-edge">
          <span className="kicker">The problem</span>
          <h2 id="brief-heading" className="headline-section text-fade text-balance mt-5 max-w-3xl">
            What the build had to solve.
          </h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {project.brief.map((item, i) => (
              <li key={item} className="rounded-2xl glass flex flex-col gap-4 p-6">
                <span
                  className="font-mono text-[11px] font-medium tracking-widest text-accent-bright/80"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-[15px] leading-relaxed text-ink-200 text-pretty">{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SectionHandoff />

      {/* ---------------------------------------------------- Architecture */}
      <section className="section" aria-labelledby="architecture-heading">
        <div className="container-edge">
          <span className="kicker">Architecture</span>
          <h2
            id="architecture-heading"
            className="headline-section text-fade text-balance mt-5 max-w-3xl"
          >
            {project.evidence.kind === 'internal'
              ? 'How the work moves through it.'
              : 'How an enquiry moves through it.'}
          </h2>
          <ArchitectureFlow stages={project.architecture} className="mt-12" />
        </div>
      </section>

      <SectionHandoff />

      {/* ----------------------------------------------------------- Build */}
      <section className="section" aria-labelledby="build-heading">
        <div className="container-edge">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
            <div>
              <span className="kicker">The build</span>
              <h2 id="build-heading" className="headline-section text-fade text-balance mt-5">
                What it is made of.
              </h2>
              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ink-300 text-pretty">
                {project.evidence.kind === 'internal'
                  ? 'Every row was read off the source, not from a project brief. Line counts, versions and limits are the ones in the files listed above.'
                  : 'Every row was read off the deployed build at inspection, not from a project brief; the decisions below give the date each was checked. The deployment is not linked, because the business is not named.'}
              </p>
            </div>

            <dl className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
              {project.build.map((fact) => (
                <div key={fact.label} className="grid gap-1 py-4 sm:grid-cols-[160px_1fr] sm:gap-6">
                  <dt className="font-mono text-[11px] uppercase tracking-widest text-ink-400">
                    {fact.label}
                  </dt>
                  <dd className="text-[15px] leading-relaxed text-ink-100 text-pretty">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <SectionHandoff />

      {/* ------------------------------------------------------- Decisions */}
      <section className="section" aria-labelledby="decisions-heading">
        <div className="container-edge">
          <span className="kicker">Engineering decisions</span>
          <h2
            id="decisions-heading"
            className="headline-section text-fade text-balance mt-5 max-w-3xl"
          >
            The choices, and why they went that way.
          </h2>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {project.decisions.map((d) => (
              <article key={d.title} className="rounded-2xl glass flex flex-col gap-4 p-7">
                <h3 className="font-display text-[19px] font-semibold leading-snug text-white text-balance">
                  {d.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-ink-200 text-pretty">
                  {d.rationale}
                </p>
                <p className="mt-auto flex items-start gap-2.5 border-t border-white/[0.06] pt-4 text-[12px] leading-relaxed text-ink-300">
                  <Check
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-bright/80"
                    strokeWidth={2.4}
                    aria-hidden="true"
                  />
                  <span>
                    <span className="text-white/70">Verify: </span>
                    {d.evidence}
                  </span>
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SectionHandoff />

      {/* --------------------------------------------------------- Outcome */}
      <section className="section" aria-labelledby="outcome-heading">
        <div className="container-edge">
          <span className="kicker">Business outcome</span>
          <h2
            id="outcome-heading"
            className="headline-section text-fade text-balance mt-5 max-w-3xl"
          >
            What we can prove, and what we cannot.
          </h2>
          <div className="mt-10 max-w-3xl">
            <Outcome project={project} />
          </div>
        </div>
      </section>

      <SectionHandoff />

      {/* ------------------------------------------------------------ FAQs */}
      <section className="section" aria-labelledby="project-faq-heading">
        <div className="container-edge">
          <span className="kicker">Questions</span>
          <h2
            id="project-faq-heading"
            className="headline-section text-fade text-balance mt-5 max-w-3xl"
          >
            About this project.
          </h2>

          {/* Open by default and not a disclosure widget: answers must be in
              the DOM without interaction, or an answer engine quoting the page
              sees empty question nodes. */}
          <dl className="mt-12 max-w-3xl divide-y divide-white/[0.06] border-t border-white/[0.06]">
            {project.faqs.map((f) => (
              <div key={f.id} id={f.id} className="scroll-mt-28 py-7">
                <dt className="font-display text-[19px] font-semibold leading-snug text-white text-balance">
                  {f.question}
                </dt>
                <dd className="mt-3 text-[15px] leading-relaxed text-ink-200 text-pretty">
                  {f.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <SectionHandoff />

      {/* ------------------------------------------------- Links & closing */}
      <section className="section" aria-labelledby="project-next-heading">
        <div className="container-edge">
          <div className="cta-panel">
            <h2
              id="project-next-heading"
              className="headline-section text-fade text-balance max-w-3xl"
            >
              Want the same systems?
            </h2>

            {linkedServices.length > 0 && (
              <>
                <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ink-300 text-pretty">
                  This build uses the following SheetFlow services:
                </p>
                <ul className="mt-5 flex flex-wrap gap-2.5">
                  {linkedServices.map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={`/services/${s.slug}`}
                        className="inline-flex min-h-[36px] items-center gap-2 rounded-full border border-white/[0.1] px-4 text-[13px] text-ink-200 transition-colors hover:border-white/25 hover:text-white"
                        data-cursor="hover"
                      >
                        {s.name}
                        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="mt-12 flex flex-wrap items-center gap-3">
              <Button variant="primary" size="lg" href="/book">
                Book your free 20-minute session
              </Button>
              <Link
                href="/pricing"
                className="inline-flex min-h-[24px] items-center text-[14px] text-ink-300 transition-colors hover:text-white"
                data-cursor="hover"
              >
                See pricing
              </Link>
            </div>
          </div>

          {related.length > 0 && (
            <div className="mt-20 border-t border-white/[0.06] pt-10">
              <h3 className="font-mono text-[11px] uppercase tracking-widest text-ink-400">
                More work
              </h3>
              <ul className="mt-6 grid gap-4 md:grid-cols-2">
                {related.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/work/${p.slug}`}
                      className="card-interactive group flex flex-col gap-2 p-6"
                      data-cursor="hover"
                    >
                      <span className="kicker-bare">
                        {p.kicker}
                      </span>
                      <span className="font-display text-[19px] font-semibold text-white">
                        {p.client}
                      </span>
                      <span className="mt-1 inline-flex items-center gap-2 text-[13px] text-ink-300">
                        Read the case study
                        <ArrowRight
                          className="h-4 w-4 transition-transform duration-300 ease-cinematic group-hover:translate-x-1"
                          strokeWidth={2.2}
                          aria-hidden="true"
                        />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

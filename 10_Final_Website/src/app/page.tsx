import { Hero } from '@/components/sections/Hero';
import { AutomationUniverse } from '@/components/sections/AutomationUniverse';
import { AIDashboard } from '@/components/sections/AIDashboard';
import { WorkflowPipeline } from '@/components/sections/WorkflowPipeline';
import { FeatureStorytelling } from '@/components/sections/FeatureStorytelling';
import { CaseStudy } from '@/components/sections/CaseStudy';
import { DigitalCraft } from '@/components/sections/DigitalCraft';
import { AIInfrastructure } from '@/components/sections/AIInfrastructure';
import { Faq } from '@/components/sections/Faq';
import { FinalCTA } from '@/components/sections/FinalCTA';
import { SectionHandoff } from '@/components/signature/SectionHandoff';
import { JsonLd } from '@/components/seo/JsonLd';
import { homeGraph } from '@/lib/structured-data';
import { liveProjects, toCard } from '@/content/work';

export default function HomePage() {
  return (
    <>
      {/* One linked @graph rather than four loose blocks. Every node carries an
          @id and references the others, so a consumer resolves the whole entity
          set — organisation, site, page, questions — in a single pass instead
          of guessing how separate blocks relate. Emitted per route, not from
          the layout: a sub-page needs its own WebPage and its own questions. */}
      <JsonLd graph={homeGraph()} />
      <Hero />
      <SectionHandoff />
      <AutomationUniverse />
      <SectionHandoff />
      <AIDashboard />
      <SectionHandoff />
      <WorkflowPipeline />
      <SectionHandoff />
      <FeatureStorytelling />
      <SectionHandoff />
      {/* Narrowed here, on the server. `CaseStudy` is a client component, and
          importing the case-study corpus inside it shipped every project's full
          prose to the browser to render three cards. */}
      <CaseStudy cards={liveProjects().map(toCard)} />
      <SectionHandoff />
      <DigitalCraft />
      <SectionHandoff />
      <AIInfrastructure />
      <SectionHandoff />
      {/* Placed last before the CTA: objections are answered at the moment a
          visitor is deciding, and the section doubles as the page's
          answer-engine surface. */}
      <Faq />
      <FinalCTA />
    </>
  );
}

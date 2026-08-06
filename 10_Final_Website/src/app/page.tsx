import { Hero } from '@/components/sections/Hero';
import { WorkflowUniverse } from '@/components/sections/WorkflowUniverse';
import { AIDashboard } from '@/components/sections/AIDashboard';
import { WorkflowPipeline } from '@/components/sections/WorkflowPipeline';
import { FeatureStorytelling } from '@/components/sections/FeatureStorytelling';
import { CaseStudy } from '@/components/sections/CaseStudy';
import { DigitalCraft } from '@/components/sections/DigitalCraft';
import { AIInfrastructure } from '@/components/sections/AIInfrastructure';
import { Faq } from '@/components/sections/Faq';
import { FinalCTA } from '@/components/sections/FinalCTA';
import { SectionHandoff } from '@/components/signature/SectionHandoff';

export default function HomePage() {
  return (
    <>
      <Hero />
      <SectionHandoff />
      <WorkflowUniverse />
      <SectionHandoff />
      <AIDashboard />
      <SectionHandoff />
      <WorkflowPipeline />
      <SectionHandoff />
      <FeatureStorytelling />
      <SectionHandoff />
      <CaseStudy />
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

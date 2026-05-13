import { Hero } from '@/components/sections/Hero';
import { WorkflowUniverse } from '@/components/sections/WorkflowUniverse';
import { AIDashboard } from '@/components/sections/AIDashboard';
import { FeatureStorytelling } from '@/components/sections/FeatureStorytelling';
import { CaseStudy } from '@/components/sections/CaseStudy';
import { AIInfrastructure } from '@/components/sections/AIInfrastructure';
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
      <FeatureStorytelling />
      <SectionHandoff />
      <CaseStudy />
      <SectionHandoff />
      <AIInfrastructure />
      <FinalCTA />
    </>
  );
}

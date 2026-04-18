import { HOW_IT_WORKS_STEPS } from '../constants/sections-data';
import { WorkStep } from './work-step';
import { SectionContainer, SectionHeader } from './ui/section-container';
import { useScrollAnimation } from '../hooks/use-scroll-animation';

interface HowItWorksSectionProps {
  steps?: typeof HOW_IT_WORKS_STEPS;
}

export function HowItWorksSection({ steps = HOW_IT_WORKS_STEPS }: HowItWorksSectionProps) {
  const ref = useScrollAnimation({ delay: 0.1, duration: 0.9 });

  return (
    <SectionContainer
      background="white"
      ref={ref as React.RefObject<HTMLDivElement>}
    >
      <div className="container">
        <SectionHeader
          title="Cara Kerjanya Sangat Mudah"
          subtitle="Hanya 4 langkah sederhana untuk menemukan dan bergabung dengan event impianmu."
        />

        <div className="mx-auto max-w-2xl">
          {steps.map((step, idx) => (
            <WorkStep
              key={step.id}
              step={step}
              isLast={idx === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}

import { ECOSYSTEM_FEATURES } from '../constants/sections-data';
import { FeatureCard } from './feature-card';
import { SectionContainer, SectionHeader } from './ui/section-container';
import { useScrollAnimationStagger } from '../hooks/use-scroll-animation';

interface FeaturesSectionProps {
  features?: typeof ECOSYSTEM_FEATURES;
}

export function FeaturesSection({ features = ECOSYSTEM_FEATURES }: FeaturesSectionProps) {
  const containerRef = useScrollAnimationStagger({ delay: 0.1, stagger: 0.15 });

  return (
    <SectionContainer
      background="light"
      ref={containerRef as React.RefObject<HTMLDivElement>}
    >
      <div className="container">
        <SectionHeader
          title="Fitur Unggulan (The Ecosystem)"
          subtitle="Ekosistem lengkap yang dirancang untuk memberikan pengalaman belajar yang optimal dan terintegrasi."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.id} data-animate>
              <FeatureCard feature={feature} />
            </div>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}

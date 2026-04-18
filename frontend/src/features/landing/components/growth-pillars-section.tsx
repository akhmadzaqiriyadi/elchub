import { GROWTH_PILLARS } from '../constants/sections-data';
import { PillarCard } from './pillar-card';
import { SectionContainer, SectionHeader } from './ui/section-container';
import { useScrollAnimationStagger } from '../hooks/use-scroll-animation';

interface GrowthPillarsSectionProps {
  pillars?: typeof GROWTH_PILLARS;
}

export function GrowthPillarsSection({ pillars = GROWTH_PILLARS }: GrowthPillarsSectionProps) {
  const containerRef = useScrollAnimationStagger({ delay: 0.1, stagger: 0.2 });

  return (
    <SectionContainer
      background="light"
      ref={containerRef as React.RefObject<HTMLDivElement>}
    >
      <div className="container">
        <SectionHeader
          title="Pilih Cara Kamu Berkembang"
          subtitle="UCH Connection menawarkan tiga pilar utama untuk mendukung perjalanan belajar Anda dengan cara yang paling sesuai."
        />

        <div className="grid gap-8 md:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar.id} data-animate>
              <PillarCard pillar={pillar} />
            </div>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}

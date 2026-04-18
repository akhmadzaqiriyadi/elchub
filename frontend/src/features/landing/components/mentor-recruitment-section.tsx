import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionContainer } from './ui/section-container';
import { useScrollAnimation } from '../hooks/use-scroll-animation';

interface MentorRecruitmentSectionProps {
  onMentorCta?: () => void;
}

export function MentorRecruitmentSection({
  onMentorCta,
}: MentorRecruitmentSectionProps) {
  const ref = useScrollAnimation({ delay: 0.2, duration: 0.8 });

  return (
    <SectionContainer
      background="white"
      ref={ref as React.RefObject<HTMLDivElement>}
    >
      <div className="container">
        <div className="mx-auto max-w-2xl rounded-lg border border-[#2E417B]/10 bg-white p-12 text-center dark:border-white/10 dark:bg-slate-900/50">
          <h2 className="text-3xl font-bold text-[#2E417B] dark:text-white sm:text-4xl">
            Punya Keahlian untuk Dibagikan?
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Bergabunglah sebagai Mentor di UCH Connection dan bantu generasi muda mencapai
            potensi mereka. Bagikan pengalaman Anda dan tumbuh bersama komunitas kami.
          </p>
          <Button
            onClick={onMentorCta}
            size="lg"
            className="mt-8 bg-[#2E417B] hover:bg-[#1f2a52] dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Daftar Sebagai Mentor
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </SectionContainer>
  );
}

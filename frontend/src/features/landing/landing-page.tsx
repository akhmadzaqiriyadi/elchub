'use client';

import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { useRouter } from 'next/navigation';

import { EventHighlightsSection } from './components/event-highlights-section';
import { FeaturesSection } from './components/features-section';
import { GrowthPillarsSection } from './components/growth-pillars-section';
import { HeroSection } from './components/hero-section';
import { HowItWorksSection } from './components/how-it-works-section';
import { MentorRecruitmentSection } from './components/mentor-recruitment-section';

export function LandingPage() {
  const router = useRouter();

  const handleHeroCtaPrimary = () => {
    // Scroll to events section
    document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleHeroCtaSecondary = () => {
    // Navigate to auth/register
    router.push('/register');
  };

  const handleEventAction = (eventId: string) => {
    // Navigate to event detail
    router.push(`/events/${eventId}`);
  };

  const handleMentorCta = () => {
    // Navigate to mentor registration
    router.push('/mentor/register');
  };

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_38%),linear-gradient(180deg,_#fbf7f2_0%,_#f6efe6_100%)] text-slate-900 dark:bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_36%),linear-gradient(180deg,_#0b1220_0%,_#111827_100%)] dark:text-slate-100">
      {/* Hero Section */}
      <HeroSection
        onCtaPrimary={handleHeroCtaPrimary}
        onCtaSecondary={handleHeroCtaSecondary}
      />

      {/* Event Highlights */}
      <div id="events">
        <EventHighlightsSection onEventAction={handleEventAction} />
      </div>

      {/* Growth Pillars */}
      <GrowthPillarsSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Features/Ecosystem */}
      <FeaturesSection />

      {/* Mentor Recruitment CTA */}
      <MentorRecruitmentSection onMentorCta={handleMentorCta} />

      {/* Floating Scroll to Top Button */}
      <ScrollToTop />
    </main>
  );
}
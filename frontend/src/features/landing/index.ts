// Main page export
export { LandingPage } from './landing-page';

// Section components
export { HeroSection } from './components/hero-section';
export { EventHighlightsSection } from './components/event-highlights-section';
export { GrowthPillarsSection } from './components/growth-pillars-section';
export { HowItWorksSection } from './components/how-it-works-section';
export { FeaturesSection } from './components/features-section';
export { MentorRecruitmentSection } from './components/mentor-recruitment-section';

// Atomic components
export { EventCard } from './components/event-card';
export { PillarCard } from './components/pillar-card';
export { WorkStep } from './components/work-step';
export { FeatureCard } from './components/feature-card';
export { Badge } from './components/ui/badge';
export { SectionContainer, SectionHeader } from './components/ui/section-container';

// Animation components & hooks
export { AnimatedSection, AnimatedContainer } from './components/animated-section';
export { useScrollAnimation, useScrollAnimationStagger } from './hooks/use-scroll-animation';

// Legacy components (kept for backward compatibility)
export { BackendStatusCard } from './components/backend-status-card';
export { HighlightCard } from './components/highlight-card';

// Data & Constants
export { GROWTH_PILLARS, HOW_IT_WORKS_STEPS, ECOSYSTEM_FEATURES } from './constants/sections-data';
export { LANDING_COLORS } from './constants/colors';

// Types
export type { Event, EventStatus, EventType } from './types/event';
export type { GrowthPillar, HowItWorksStep, EcosystemFeature } from './types/pillar';

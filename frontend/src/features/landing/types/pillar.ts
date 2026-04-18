import type { LucideIcon } from 'lucide-react';

export interface GrowthPillar {
  id: string;
  title: string;
  description: string;
  details: string[];
  icon: LucideIcon;
  benefits: string[];
}

export interface HowItWorksStep {
  id: string;
  step: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface EcosystemFeature {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

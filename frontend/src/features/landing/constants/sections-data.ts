import { BookOpen, Clock, MessageSquare, Sparkles, Users, Zap } from 'lucide-react';

import type { EcosystemFeature, GrowthPillar, HowItWorksStep } from '../types/pillar';

export const GROWTH_PILLARS: GrowthPillar[] = [
  {
    id: 'webinar',
    title: 'Webinar & Talkshow',
    description: 'Sesi inspiratif sekali duduk dengan berbagai narasumber ahli',
    details: ['Daftar, pantau countdown', 'Join lewat link yang disediakan'],
    icon: Users,
    benefits: ['Free & Paid Options', 'Real-time interaction', 'Recording tersedia'],
  },
  {
    id: 'mentoring',
    title: 'Mentoring Class (Intensive)',
    description: 'Belajar mendalam dengan kurikulum tetap dan feedback langsung',
    details: ['Pengumpulan tugas', 'Feedback direct dari mentor'],
    icon: Zap,
    benefits: ['Structured learning', 'Personal guidance', 'Sertifikat included'],
  },
  {
    id: 'library',
    title: 'Digital Library',
    description: 'Akses materi (PDF/Video) dari event sebelumnya secara mandiri',
    details: ['Self-paced learning', 'Akses kapan saja'],
    icon: BookOpen,
    benefits: ['On-demand content', 'High quality materials', 'Lifetime access'],
  },
];

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    id: 'find',
    step: 1,
    title: 'Temukan',
    description: 'Pilih event atau kelas yang sesuai minatmu di katalog kami',
    icon: Sparkles,
  },
  {
    id: 'secure',
    step: 2,
    title: 'Amankan Slot',
    description: 'Klik "Daftar". Jika berbayar, upload bukti transfer',
    icon: Clock,
  },
  {
    id: 'monitor',
    step: 3,
    title: 'Pantau Dashboard',
    description: 'Cek status verifikasi dan hitung mundur jadwal live-mu',
    icon: Users,
  },
  {
    id: 'connect',
    step: 4,
    title: 'Koneksi Langsung',
    description: 'Join sesi via Zoom/Meet dan dapatkan rekaman + sertifikat',
    icon: MessageSquare,
  },
];

export const ECOSYSTEM_FEATURES: EcosystemFeature[] = [
  {
    id: 'calendar',
    title: 'Integrated Calendar',
    description: 'Jangan lewatkan event penting dengan fitur pengingat di dashboard',
    icon: Clock,
  },
  {
    id: 'feedback',
    title: 'Personalized Feedback',
    description: 'Interaksi dua arah dengan mentor untuk pembelajaran yang lebih baik',
    icon: MessageSquare,
  },
  {
    id: 'certificate',
    title: 'E-Certificate Center',
    description: 'Semua sertifikat tersimpan rapi dan bisa diunduh kapan saja',
    icon: Sparkles,
  },
  {
    id: 'chat',
    title: 'Community Chat',
    description: 'Akses langsung ke mentor untuk tanya jawab yang lebih mendalam',
    icon: Users,
  },
];

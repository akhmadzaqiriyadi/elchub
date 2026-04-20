/**
 * Mentor Detail & Booking Page
 * Shows detailed mentor profile and allows booking sessions
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  MentoringPackageCard,
  AvailabilitySlots,
  MentoringStats,
  MentoringLevel,
} from '@/features/mentoring';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

// Mock mentor details with packages
const mockMentorDetails: Record<string, any> = {
  '1': {
    id: '1',
    name: 'Riza Fahmi',
    title: 'Senior Frontend Engineer',
    bio: 'Expert dalam React dan modern JavaScript dengan 8+ tahun pengalaman di startup dan perusahaan besar seperti Tokopedia dan GrabFood.',
    fullBio:
      'Saya adalah senior frontend engineer yang passionate tentang mentoring developer muda untuk mencapai potensi penuh mereka. Dengan 8+ tahun experience dalam React ecosystem, saya telah help ratusan developer level up skill mereka dari junior hingga senior level.',
    expertise: ['React', 'TypeScript', 'Performance Optimization', 'System Design', 'Redux', 'Next.js', 'Testing'],
    yearsExperience: 8,
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 250000,
    image: '',
    availability: 'Tersedia hari Senin - Jumat, 14:00 - 20:00',
    badge: 'expert' as const,
    stats: [
      { label: 'Mentee', value: '500+', icon: '👥' },
      { label: 'Rating', value: '4.9/5', icon: '⭐' },
      { label: 'Tahun Exp', value: '8+', icon: '📅' },
      { label: 'Response', value: '<5min', icon: '⚡' },
    ],
    packages: [
      {
        id: 'p1',
        name: 'Starter Pack',
        duration: 1,
        sessions: 4,
        price: 800000,
        description: 'Cocok untuk yang baru mulai atau butuh bantuan specific topic',
        features: [
          '4 sesi mentoring (1 jam/sesi)',
          'Chat support unlimited',
          'Code review 1 project',
          'Resource & learning materials',
        ],
      },
      {
        id: 'p2',
        name: 'Professional Pack',
        duration: 2,
        sessions: 8,
        price: 1500000,
        description: 'Best value untuk comprehensive learning dan career guidance',
        features: [
          '8 sesi mentoring (1-2 jam/sesi)',
          'Priority chat support',
          'Code review unlimited',
          'Resume & interview prep',
          'Career path planning',
        ],
        mostPopular: true,
      },
      {
        id: 'p3',
        name: 'Expert Pack',
        duration: 3,
        sessions: 12,
        price: 2100000,
        description: 'Premium mentoring dengan personalized learning journey',
        features: [
          '12 sesi mentoring (2-3 jam/sesi)',
          '24/7 priority support',
          'Unlimited code review',
          'Build 2 portfolio projects together',
          'Interview coaching (10 sessions)',
          'Exclusive WhatsApp community',
        ],
      },
    ],
    slots: [
      {
        date: '22 Apr 2026',
        day: 'Senin',
        times: ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
      },
      {
        date: '23 Apr 2026',
        day: 'Selasa',
        times: ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
      },
      {
        date: '24 Apr 2026',
        day: 'Rabu',
        times: ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
      },
      {
        date: '25 Apr 2026',
        day: 'Kamis',
        times: ['14:00', '15:30', '16:00', '17:00', '18:00', '19:00'],
      },
      {
        date: '26 Apr 2026',
        day: 'Jumat',
        times: ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
      },
    ],
    testimonials: [
      {
        name: 'Ahmad Rizki',
        role: 'Junior Developer',
        text: 'Riza sangat helpful dan patient. Dalam 3 bulan mentoring, skill react saya meningkat drastis. Highly recommended!',
        rating: 5,
      },
      {
        name: 'Siti Nurhaliza',
        role: 'Self-taught Developer',
        text: 'Best investment for my career. Clear explanations dan practical examples. Can\'t ask for better mentor!',
        rating: 5,
      },
    ],
  },
};

export default function MentorDetailPage() {
  const params = useParams();
  const mentorId = params.mentorId as string | undefined;
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  // Using first mentor as default if mentorId not provided
  const mentor = mentorId ? mockMentorDetails[mentorId] : mockMentorDetails['1'];

  if (!mentor) {
    return (
      <main className="min-h-[calc(100vh-160px)] bg-slate-50 dark:bg-slate-900 py-8 sm:py-12">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-primary/20 dark:border-slate-700 bg-white dark:bg-slate-800 p-12 text-center">
            <p className="text-lg font-semibold text-primary dark:text-slate-100">
              Mentor tidak ditemukan
            </p>
          </div>
        </div>
      </main>
    );
  }

  const handleBooking = async () => {
    if (!selectedPackage || !selectedSlot) {
      toast.error('Pilih paket dan jadwal terlebih dahulu');
      return;
    }

    setIsBooking(true);
    try {
      // TODO: Call API to create booking
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Booking berhasil! Cek email untuk konfirmasi.');
      // Reset selections
      setSelectedPackage(null);
      setSelectedSlot(null);
    } catch (error) {
      toast.error('Booking gagal. Coba lagi.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-160px)] bg-slate-50 dark:bg-slate-900 py-8 sm:py-12">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <a
          href="/mentoring"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary dark:text-blue-400 hover:opacity-70 mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Mentoring
        </a>

        {/* Mentor Header */}
        <div className="rounded-xl border border-primary/15 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-r from-[#2E417B] to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center flex-shrink-0">
              <span className="text-4xl sm:text-5xl font-bold text-white">
                {mentor.name
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase()}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-primary dark:text-slate-100">
                    {mentor.name}
                  </h1>
                  <p className="text-sm sm:text-base text-primary/70 dark:text-slate-400 font-medium">
                    {mentor.title}
                  </p>
                </div>
                {mentor.badge && <MentoringLevel level={mentor.badge} />}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-sm ${i < Math.floor(mentor.rating) ? '⭐' : '☆'}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-primary dark:text-slate-100">
                  {mentor.rating.toFixed(1)}
                </span>
                <span className="text-xs text-primary/60 dark:text-slate-400">
                  ({mentor.reviewCount} ulasan)
                </span>
              </div>

              <p className="text-primary/70 dark:text-slate-400">{mentor.bio}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <MentoringStats stats={mentor.stats} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section className="rounded-lg border border-primary/15 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
              <h2 className="text-xl font-bold text-primary dark:text-slate-100 mb-4">
Tentang Mentor
              </h2>
              <p className="text-primary/70 dark:text-slate-400 leading-relaxed mb-4">
                {mentor.fullBio}
              </p>
              <p className="text-sm text-primary/60 dark:text-slate-400">{mentor.availability}</p>
            </section>

            {/* Expertise */}
            <section className="rounded-lg border border-primary/15 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
              <h2 className="text-xl font-bold text-primary dark:text-slate-100 mb-4">
                Keahlian
              </h2>
              <div className="flex flex-wrap gap-2">
                {mentor.expertise.map((exp: string) => (
                  <span
                    key={exp}
                    className="px-3 py-2 text-sm bg-primary/10 dark:bg-slate-700 text-primary dark:text-slate-300 rounded-lg"
                  >
                    {exp}
                  </span>
                ))}
              </div>
            </section>

            {/* Testimonials */}
            {mentor.testimonials && (
              <section className="rounded-lg border border-primary/15 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
                <h2 className="text-xl font-bold text-primary dark:text-slate-100 mb-4">
                  Testimoni
                </h2>
                <div className="space-y-4">
                  {mentor.testimonials.map((testimonial: any, index: number) => (
                    <div
                      key={index}
                      className="pb-4 border-b border-primary/10 dark:border-slate-700 last:border-b-0 last:pb-0"
                    >
                      <div className="flex gap-1 mb-2">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <span key={i} className="text-yellow-400">⭐</span>
                        ))}
                      </div>
                      <p className="text-primary/70 dark:text-slate-400 mb-2 italic">
                        "{testimonial.text}"
                      </p>
                      <p className="font-semibold text-primary dark:text-slate-100">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-primary/60 dark:text-slate-400">{testimonial.role}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Packages */}
            <section>
              <h2 className="text-2xl font-bold text-primary dark:text-slate-100 mb-6">
                Paket Mentoring
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {mentor.packages.map((pkg: any) => (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className="cursor-pointer"
                  >
                    <MentoringPackageCard
                      {...pkg}
                      mentorId={mentor.id}
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Booking */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Selected Package Info */}
              {selectedPackage && (
                <div className="rounded-lg border border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-900/10 p-4">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    ✓ Paket dipilih
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    {mentor.packages.find((p: any) => p.id === selectedPackage)?.name}
                  </p>
                </div>
              )}

              {/* Availability Slots */}
              <AvailabilitySlots
                slots={mentor.slots}
                onSelectSlot={(date, time) => setSelectedSlot({ date, time })}
              />

              {/* Selected Slot Info */}
              {selectedSlot && (
                <div className="rounded-lg border border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-900/10 p-4">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    ✓ Jadwal dipilih
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    {selectedSlot.date} - {selectedSlot.time}
                  </p>
                </div>
              )}

              {/* Booking Button */}
              <Button
                onClick={handleBooking}
                disabled={isBooking || !selectedPackage || !selectedSlot}
                className="w-full rounded-lg bg-[#2E417B] hover:bg-[#1f2a52] text-white dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBooking ? 'Memproses...' : 'Booking Sekarang'}
              </Button>

              {!selectedPackage && (
                <p className="text-xs text-primary/60 dark:text-slate-400 text-center">
                  Pilih paket untuk melanjutkan
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

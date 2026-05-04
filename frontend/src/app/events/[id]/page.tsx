/**
 * Event Detail Page
 * Shows detailed information about a specific event
 */

'use client';

import { Button } from '@/components/ui/button';
import { SpeakerCard, EventStats, EventRegistrationModal, useEventRegistration, usePaymentProofUpload } from '@/features/events';
import { useAuth } from '@/features/auth';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

// Mock event details
const mockEventDetails: Record<
  string,
  {
    id: string;
    title: string;
    description: string;
    fullDescription: string;
    date: string;
    time: string;
    location: string;
    category: string;
    image?: string;
    price: number;
    isFree: boolean;
    formSchema?: any[] | null;
    attendees: number;
    capacity: number;
    speakers: any[];
    agenda: any[];
    requirements: string[];
  }
> = {
  '1': {
    id: '1',
    title: 'React Advanced Patterns Workshop',
    description: 'Pelajari advanced patterns dalam React untuk membuat aplikasi yang lebih scalable.',
    fullDescription:
      'Workshop intensif ini dirancang untuk developer React yang ingin meningkatkan skill mereka. Kami akan membahas berbagai advanced patterns dan best practices dalam mengembangkan aplikasi React yang production-ready.',
    date: '20 Apr 2026',
    time: '14:00 - 17:00',
    location: 'Online via Zoom',
    category: 'Workshop',
    price: 150000,
    isFree: false,
    formSchema: [
      {
        id: 'question_1',
        type: 'textarea',
        label: 'Mengapa Anda ingin mengikuti event ini?',
        required: true,
      }
    ],
    attendees: 156,
    capacity: 500,
    speakers: [
      {
        name: 'Riza Fahmi',
        title: 'Senior Frontend Engineer',
        bio: 'Expert dalam React dan modern JavaScript dengan 8+ tahun pengalaman.',
        expertise: ['React', 'JavaScript', 'Performance'],
        email: 'riza@example.com',
        linkedin: 'https://linkedin.com/in/riza',
      },
    ],
    agenda: [
      { time: '14:00 - 14:15', title: 'Welcome & Icebreaker' },
      { time: '14:15 - 15:00', title: 'Advanced Hooks Patterns' },
      { time: '15:00 - 15:45', title: 'State Management Deep Dive' },
      { time: '15:45 - 16:00', title: 'Break' },
      { time: '16:00 - 16:45', title: 'Component Composition Strategies' },
      { time: '16:45 - 17:00', title: 'Q&A & Closing' },
    ],
    requirements: [
      'Pemahaman dasar React (hooks, components)',
      'Node.js dan npm sudah terinstall',
      'Code editor (VS Code recommended)',
      'Koneksi internet stabil',
    ],
  },
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const { token, isAuthenticated } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const registerMutation = useEventRegistration();
  const uploadMutation = usePaymentProofUpload();

  let event = mockEventDetails[eventId];

  if (!event) {
    // Fallback for events not in mockEventDetails but present in mockEvents list
    const priceMap: Record<string, number> = { '2': 150000, '3': 0, '4': 500000, '5': 0, '6': 0 };
    const price = priceMap[eventId] ?? 0;
    
    event = {
      id: eventId,
      title: `Event Dummy ${eventId}`,
      description: 'Ini adalah event dummy untuk testing integrasi UI.',
      fullDescription: 'Detail event ini di-generate secara otomatis karena belum ada endpoint public GET /api/events/:id di backend.',
      date: 'TBD',
      time: 'TBD',
      location: 'Online',
      category: 'General',
      price: price,
      isFree: price === 0,
      formSchema: price === 0 ? null : [
        {
          id: 'question_1',
          type: 'text',
          label: 'Dari mana Anda mengetahui event ini?',
          required: true,
        }
      ],
      attendees: 10,
      capacity: 100,
      speakers: [],
      agenda: [],
      requirements: ['Koneksi internet stabil'],
    };
  }

  if (!event) {
    return (
      <main className="min-h-[calc(100vh-160px)] bg-slate-50 dark:bg-slate-900 py-8 sm:py-12">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-primary/20 dark:border-slate-700 bg-white dark:bg-slate-800 p-12 text-center">
            <p className="text-lg font-semibold text-primary dark:text-slate-100">
              Event tidak ditemukan
            </p>
          </div>
        </div>
      </main>
    );
  }

  const handleRegisterClick = () => {
    if (!isAuthenticated) {
      toast.error('Silakan login terlebih dahulu untuk mendaftar event.');
      router.push(`/login?callbackUrl=/events/${eventId}`);
      return;
    }
    
    // Show registration modal if event is paid or has a custom form
    if (!event.isFree || (event.formSchema && event.formSchema.length > 0)) {
      setIsModalOpen(true);
    } else {
      handleDirectRegister();
    }
  };

  const handleDirectRegister = async () => {
    try {
      await registerMutation.mutateAsync({
        eventId,
        token,
        input: { customAnswers: null, paymentProofUrl: null },
      });
      toast.success('Berhasil daftar! Cek email untuk konfirmasi.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mendaftar. Coba lagi.');
    }
  };

  const handleModalSubmit = async (payload: { customAnswers: Record<string, any> | null; paymentProofUrl: string | null }) => {
    await registerMutation.mutateAsync({
      eventId,
      token,
      input: payload,
    });
    setIsModalOpen(false);
    toast.success('Berhasil daftar! Cek email untuk konfirmasi.');
  };

  const handleUploadPaymentProof = async (file: File) => {
    const result = await uploadMutation.mutateAsync({ file, token });
    return result;
  };

  const stats = [
    { label: 'Peserta', value: event.attendees, icon: '👥' },
    { label: 'Kapasitas', value: event.capacity, icon: '📊' },
    { label: 'Durasi', value: '3 jam', icon: '⏱️' },
    { label: 'Harga', value: event.price === 0 ? 'Gratis' : `Rp ${event.price.toLocaleString('id-ID')}`, icon: '💳' },
  ];

  return (
    <main className="min-h-[calc(100vh-160px)] bg-slate-50 dark:bg-slate-900 py-8 sm:py-12">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <a
          href="/events"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary dark:text-blue-400 hover:opacity-70 mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Events
        </a>

        {/* Hero Image */}
        {event.image && (
          <div className="mb-8 rounded-xl overflow-hidden h-96">
            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <span className="inline-block bg-[#2E417B] dark:bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
                {event.category}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-primary dark:text-slate-100">
                {event.title}
              </h1>
            </div>
          </div>

          <p className="text-base text-primary/70 dark:text-slate-400">{event.description}</p>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <EventStats stats={stats} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <section className="rounded-lg border border-primary/15 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
              <h2 className="text-xl font-bold text-primary dark:text-slate-100 mb-4">
                Tentang Event
              </h2>
              <p className="text-primary/70 dark:text-slate-400 leading-relaxed">
                {event.fullDescription}
              </p>

              {/* Event Details Grid */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-primary/10 dark:border-slate-700">
                <div>
                  <p className="text-sm font-medium text-primary/60 dark:text-slate-400">Tanggal</p>
                  <p className="text-base font-semibold text-primary dark:text-slate-100">{event.date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-primary/60 dark:text-slate-400">Waktu</p>
                  <p className="text-base font-semibold text-primary dark:text-slate-100">{event.time}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-primary/60 dark:text-slate-400">Lokasi</p>
                  <p className="text-base font-semibold text-primary dark:text-slate-100">{event.location}</p>
                </div>
              </div>
            </section>

            {/* Agenda */}
            <section className="rounded-lg border border-primary/15 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
              <h2 className="text-xl font-bold text-primary dark:text-slate-100 mb-4">Agenda</h2>
              <div className="space-y-3">
                {event.agenda.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-3 border-b border-primary/10 dark:border-slate-700 last:border-b-0 last:pb-0">
                    <div className="flex-shrink-0">
                      <span className="text-sm font-semibold text-[#2E417B] dark:text-blue-400 bg-primary/10 dark:bg-slate-700 px-3 py-1 rounded">
                        {item.time}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-primary dark:text-slate-100">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Requirements */}
            <section className="rounded-lg border border-primary/15 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
              <h2 className="text-xl font-bold text-primary dark:text-slate-100 mb-4">
                Persyaratan
              </h2>
              <ul className="space-y-2">
                {event.requirements.map((req, index) => (
                  <li key={index} className="flex gap-3 text-primary dark:text-slate-300">
                    <span className="text-lg">✓</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Speakers */}
            {event.speakers.length > 0 && (
              <section className="rounded-lg border border-primary/15 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
                <h2 className="text-xl font-bold text-primary dark:text-slate-100 mb-6">
                  Pembicara
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {event.speakers.map((speaker, index) => (
                    <SpeakerCard
                      key={index}
                      name={speaker.name}
                      title={speaker.title}
                      bio={speaker.bio}
                      expertise={speaker.expertise}
                      email={speaker.email}
                      linkedin={speaker.linkedin}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Register Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-lg border border-primary/15 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
              {/* Price */}
              <div className="mb-6 pb-6 border-b border-primary/10 dark:border-slate-700">
                <p className="text-sm text-primary/60 dark:text-slate-400 mb-2">Harga</p>
                <p className="text-3xl font-bold text-primary dark:text-slate-100">
                  {event.price === 0 ? 'Gratis' : `Rp ${event.price.toLocaleString('id-ID')}`}
                </p>
              </div>

              {/* Attendees Info */}
              <div className="mb-6 pb-6 border-b border-primary/10 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary/60 dark:text-slate-400">Peserta Terdaftar</span>
                  <span className="text-2xl font-bold text-primary dark:text-slate-100">
                    {event.attendees}
                  </span>
                </div>
                <div className="w-full h-2 bg-primary/10 dark:bg-slate-700 rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{
                      width: `${(event.attendees / event.capacity) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-primary/60 dark:text-slate-400 mt-2">
                  {event.capacity - event.attendees} slot tersisa
                </p>
              </div>

              {/* Register Button */}
              <Button
                onClick={handleRegisterClick}
                disabled={registerMutation.isPending}
                className="w-full rounded-lg bg-[#2E417B] hover:bg-[#1f2a52] text-white dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {registerMutation.isPending ? 'Mendaftar...' : 'Daftar Sekarang'}
              </Button>

              {/* Additional Info */}
              <p className="text-xs text-primary/60 dark:text-slate-400 text-center mt-4">
                Cek email Anda untuk link undangan
              </p>
            </div>
          </div>
        </div>
      </div>

      {event && (
        <EventRegistrationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          event={event as any}
          onSubmit={handleModalSubmit}
          onUploadPaymentProof={handleUploadPaymentProof}
        />
      )}
    </main>
  );
}

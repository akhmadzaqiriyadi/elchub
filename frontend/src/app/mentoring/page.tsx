/**
 * Mentoring Listing Page
 * Browse and filter available mentors
 */

'use client';

import { useState } from 'react';
import { MentorCard, MentoringFilter } from '@/features/mentoring';
import { Spinner } from '@/components/ui/spinner';

// Mock mentors data
const mockMentors = [
  {
    id: '1',
    name: 'Riza Fahmi',
    title: 'Senior Frontend Engineer',
    expertise: ['React', 'TypeScript', 'Performance Optimization', 'System Design'],
    yearsExperience: 8,
    rating: 4.9,
    reviewCount: 127,
    bio: 'Expert dalam React dan modern JavaScript dengan pengalaman di startup dan perusahaan besar.',
    hourlyRate: 250000,
    availability: 'Tersedia hari Senin - Jumat',
    badge: 'expert' as const,
  },
  {
    id: '2',
    name: 'Ayu Maharani',
    title: 'Full Stack Developer',
    expertise: ['Node.js', 'React', 'MongoDB', 'AWS'],
    yearsExperience: 6,
    rating: 4.8,
    reviewCount: 98,
    bio: 'Passionate tentang mentoring dan membantu developer berkembang dari junior hingga senior.',
    hourlyRate: 200000,
    availability: 'Tersedia setiap hari',
    badge: 'certified' as const,
  },
  {
    id: '3',
    name: 'Bambang Sutrisno',
    title: 'Data Science & Python Expert',
    expertise: ['Python', 'Machine Learning', 'Data Analysis', 'TensorFlow'],
    yearsExperience: 10,
    rating: 4.95,
    reviewCount: 156,
    bio: 'Spesialis data science dengan track record membantu 500+ developer mastering Python dan ML.',
    hourlyRate: 300000,
    availability: 'Tersedia hari Selasa - Minggu',
    badge: 'top' as const,
  },
  {
    id: '4',
    name: 'Sarah Chen',
    title: 'UI/UX Design Lead',
    expertise: ['Figma', 'Design System', 'User Research', 'Accessibility'],
    yearsExperience: 7,
    rating: 4.85,
    reviewCount: 89,
    bio: 'Design leader berpengalaman membantu tim build world-class user experiences.',
    hourlyRate: 280000,
    availability: 'Tersedia weekday',
    badge: 'featured' as const,
  },
  {
    id: '5',
    name: 'Doni Wijaya',
    title: 'Backend & DevOps Engineer',
    expertise: ['JavaScript', 'Docker', 'Kubernetes', 'CI/CD', 'Microservices'],
    yearsExperience: 9,
    rating: 4.75,
    reviewCount: 112,
    bio: 'Cloud infrastructure expert helping developers build scalable backend systems.',
    hourlyRate: 270000,
    availability: 'Tersedia hari Senin - Kamis',
    badge: 'certified' as const,
  },
  {
    id: '6',
    name: 'Lina Kusuma',
    title: 'Product Manager & Mentor',
    expertise: ['Product Strategy', 'User Analytics', 'Agile', 'Leadership'],
    yearsExperience: 5,
    rating: 4.7,
    reviewCount: 67,
    bio: 'Product manager yang passionate mentoring aspiring PM dan tech professionals.',
    hourlyRate: 220000,
    availability: 'Tersedia weekend',
  },
];

interface FilterState {
  level: string | null;
  expertise: string[];
  minRate: number;
  maxRate: number;
  searchQuery: string;
}

export default function MentoringPage() {
  const [filters, setFilters] = useState<FilterState>({
    level: null,
    expertise: [],
    minRate: 0,
    maxRate: 1000000,
    searchQuery: '',
  });
  const [isLoading] = useState(false);

  const filteredMentors = mockMentors.filter((mentor) => {
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      if (!mentor.name.toLowerCase().includes(query) && !mentor.title.toLowerCase().includes(query)) {
        return false;
      }
    }

    if (filters.expertise.length > 0) {
      const hasExpertise = filters.expertise.some((exp) =>
        mentor.expertise.some((e) => e.toLowerCase().includes(exp.toLowerCase()))
      );
      if (!hasExpertise) return false;
    }

    if (mentor.hourlyRate < filters.minRate || mentor.hourlyRate > filters.maxRate) {
      return false;
    }

    return true;
  });

  return (
    <main className="min-h-[calc(100vh-160px)] bg-slate-50 dark:bg-slate-900 py-8 sm:py-12">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary dark:text-slate-100">
            Mentoring Eksklusif
          </h1>
          <p className="mt-2 text-sm sm:text-base text-primary/70 dark:text-slate-400">
            Belajar langsung dari expert dan senior developer untuk akselerasi karir Anda
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filter */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <MentoringFilter onFilter={setFilters} />
            </div>
          </div>

          {/* Mentors Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="h-8 w-8" />
              </div>
            ) : filteredMentors.length > 0 ? (
              <>
                {/* Results Summary */}
                <div className="mb-6">
                  <p className="text-sm text-primary/70 dark:text-slate-400">
                    Menampilkan <span className="font-semibold">{filteredMentors.length}</span> dari{' '}
                    <span className="font-semibold">{mockMentors.length}</span> mentor
                  </p>
                </div>

                {/* Mentors Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {filteredMentors.map((mentor) => (
                    <MentorCard key={mentor.id} {...mentor} />
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-primary/20 dark:border-slate-700 bg-white dark:bg-slate-800 p-12 text-center">
                <svg
                  className="w-12 h-12 mx-auto text-primary/30 dark:text-slate-600 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <p className="text-base font-medium text-primary dark:text-slate-100">
                  Tidak ada mentor yang sesuai
                </p>
                <p className="text-sm text-primary/60 dark:text-slate-400 mt-1">
                  Coba ubah filter untuk menemukan mentor yang cocok
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

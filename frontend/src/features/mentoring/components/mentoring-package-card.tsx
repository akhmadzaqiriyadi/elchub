/**
 * Mentoring Package Card Component
 * Shows different mentoring packages/tiers
 */

import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface MentoringPackageCardProps {
  id: string;
  name: string;
  duration: number; // in hours
  sessions: number;
  price: number;
  features: string[];
  mostPopular?: boolean;
  description: string;
  mentorId: string;
}

export function MentoringPackageCard({
  id,
  name,
  duration,
  sessions,
  price,
  features,
  mostPopular,
  description,
  mentorId,
}: MentoringPackageCardProps) {
  return (
    <div
      className={`rounded-lg border-2 transition-all ${
        mostPopular
          ? 'border-[#2E417B] dark:border-blue-600 bg-gradient-to-br from-[#2E417B]/5 to-blue-600/5 dark:from-blue-600/10 dark:to-blue-700/10'
          : 'border-primary/15 dark:border-slate-700 bg-white dark:bg-slate-800'
      }`}
    >
      {/* Header */}
      <div className="p-6 border-b border-primary/10 dark:border-slate-700">
        {mostPopular && (
          <div className="mb-3">
            <span className="inline-block px-3 py-1 text-xs font-bold text-white bg-[#2E417B] dark:bg-blue-600 rounded-full">
              PALING POPULER
            </span>
          </div>
        )}
        <h3 className="text-xl font-bold text-primary dark:text-slate-100">{name}</h3>
        <p className="text-sm text-primary/70 dark:text-slate-400 mt-2">{description}</p>
      </div>

      {/* Price */}
      <div className="p-6 border-b border-primary/10 dark:border-slate-700 bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-primary dark:text-slate-100">
            Rp {price.toLocaleString('id-ID')}
          </span>
          <span className="text-sm text-primary/60 dark:text-slate-400">/bulan</span>
        </div>
        <p className="text-sm text-primary/60 dark:text-slate-400 mt-2">
          {sessions} sesi × {duration} jam
        </p>
      </div>

      {/* Features */}
      <div className="p-6 border-b border-primary/10 dark:border-slate-700">
        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex gap-3 text-sm text-primary dark:text-slate-300">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="p-6">
        <Link href={`/mentoring/${mentorId}/book?package=${id}`} className="block">
          <Button
            className={`w-full rounded-lg ${
              mostPopular
                ? 'bg-[#2E417B] hover:bg-[#1f2a52] text-white dark:bg-blue-600 dark:hover:bg-blue-700'
                : 'border border-primary/30 text-primary hover:bg-primary/5 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            Booking Sekarang
          </Button>
        </Link>
      </div>
    </div>
  );
}

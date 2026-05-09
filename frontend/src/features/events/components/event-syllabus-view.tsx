'use client';

import { useEventSyllabus } from '../hooks/use-event-syllabus';
import { SectionItem, MaterialItem } from '@/features/management/types';
import { Video, FileText, HelpCircle, Play, Lock, CheckCircle2, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function EventSyllabusView({ eventId, token }: { eventId: string; token?: string }) {
  const { data: sections, isLoading } = useEventSyllabus(eventId, token);

  if (isLoading) return <div className="animate-pulse space-y-4">
    {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800" />)}
  </div>;

  if (!sections || sections.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-800 dark:bg-slate-900/50">
        <p className="text-slate-500 font-medium">Syllabus belum tersedia untuk event ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((section: SectionItem) => (
        <div key={section.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-all hover:shadow-md">
          <div className="bg-slate-50/50 px-5 py-4 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-slate-100">{section.title}</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{section.materials.length} Materi</p>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {section.materials.map((material: MaterialItem) => {
              // Logic to check if content is accessible
              const isLocked = !material.isPreview && !token; 
              const isCompleted = material.userProgress?.isCompleted;

              const Wrapper = isLocked ? 'div' : Link;

              return (
                <Wrapper 
                  key={material.id} 
                  href={isLocked ? '#' : `/learning/${eventId}?materialId=${material.id}`}
                  className={cn(
                    "flex items-center justify-between px-5 py-4 transition-all group",
                    isLocked ? "bg-slate-50/30 opacity-70 grayscale cursor-not-allowed" : "hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
                      material.type === 'VIDEO' ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30" :
                      material.type === 'ARTICLE' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30" :
                      material.type === 'DOCUMENT' ? "bg-rose-50 text-rose-600 dark:bg-rose-900/30" :
                      "bg-amber-50 text-amber-600 dark:bg-amber-900/30"
                    )}>
                      {material.type === 'VIDEO' && <Video className="h-5 w-5" />}
                      {material.type === 'ARTICLE' && <FileText className="h-5 w-5" />}
                      {material.type === 'DOCUMENT' && <File className="h-5 w-5" />}
                      {material.type === 'QUIZ' && <HelpCircle className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{material.title}</p>
                      <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase">
                        {material.durationMin ? `${material.durationMin} Menit` : 'Pembelajaran'} 
                        {material.isPreview && <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">Gratis Preview</span>}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {isCompleted && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                    {isLocked ? (
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                        <Lock className="h-4 w-4 text-slate-400" />
                      </div>
                    ) : (
                      <div className="rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-bold text-white dark:bg-slate-100 dark:text-slate-900 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/10">
                        {material.type === 'VIDEO' ? 'Tonton' : material.type === 'DOCUMENT' ? 'Unduh' : 'Baca'}
                      </div>
                    )}
                  </div>
                </Wrapper>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

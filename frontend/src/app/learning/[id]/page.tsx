'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { useEventSyllabus, useMaterialProgress } from '@/features/events/hooks/use-event-syllabus';
import { useEventDetail } from '@/features/events/hooks/use-event-detail';
import { SectionItem, MaterialItem } from '@/features/management/types';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  Video, 
  FileText, 
  HelpCircle, 
  Menu, 
  X,
  ArrowLeft,
  ArrowRight,
  MonitorPlay
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import * as React from 'react';

export default function LearningPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const eventId = resolvedParams.id;
  const { token } = useAuth();

  const searchParams = useSearchParams();
  const router = useRouter();
  const materialId = searchParams.get('materialId');

  const { data: syllabusData, isLoading, refetch } = useEventSyllabus(eventId, token ?? undefined);
  const sections = syllabusData?.sections;
  const { complete, uncomplete } = useMaterialProgress(token ?? '');

  const [activeMaterial, setActiveMaterial] = useState<any | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Set active material from URL or default to first material
  useEffect(() => {
    if (sections && sections.length > 0) {
      if (materialId) {
        // Find material by ID
        for (const section of sections) {
          const found = section.materials.find((m) => m.id === materialId);
          if (found) {
            setActiveMaterial(found);
            return;
          }
        }
      }
      // Default to first material of first section
      if (sections[0].materials.length > 0) {
        setActiveMaterial(sections[0].materials[0]);
      }
    }
  }, [sections, materialId]);

  const handleMaterialClick = (material: any) => {
    setActiveMaterial(material);
    router.push(`/learning/${eventId}?materialId=${material.id}`);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleToggleComplete = async () => {
    if (!activeMaterial) return;
    if (activeMaterial.userProgress?.isCompleted) {
      await uncomplete(activeMaterial.id);
    } else {
      await complete(activeMaterial.id);
    }
    refetch();
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
      }
      return url;
    } catch (e) {
      return url;
    }
  };

  const allMaterials = React.useMemo(() => {
    return sections?.flatMap(s => s.materials) || [];
  }, [sections]);


  const currentIndex = allMaterials.findIndex(m => m.id === activeMaterial?.id);
  const prevMaterial = currentIndex > 0 ? allMaterials[currentIndex - 1] : null;
  const nextMaterial = currentIndex < allMaterials.length - 1 ? allMaterials[currentIndex + 1] : null;

  const handlePrev = () => prevMaterial && handleMaterialClick(prevMaterial);
  const handleNext = () => nextMaterial && handleMaterialClick(nextMaterial);

  const detailQuery = useEventDetail(eventId, token ?? undefined);
  const eventName = detailQuery.data?.title || 'Ruang Belajar';

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-slate-900 text-white font-medium italic">Memasuki Ruang Belajar...</div>;

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href={`/events/${eventId}`} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors group">
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div className="hidden sm:block">
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Ruang Belajar</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 max-w-[150px] sm:max-w-xs">
            <span className="text-[10px] sm:text-xs font-black tracking-tighter text-black dark:text-white truncate uppercase border-l-2 border-slate-200 dark:border-slate-800 pl-3 py-1">
              {eventName}
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-80 transform border-r border-slate-200 bg-slate-50 transition-transform duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 pt-16 lg:pt-0",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Daftar Materi</span>
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {sections?.map((section, idx: number) => (
                <div key={section.id} className="mb-2">
                  <div className="bg-slate-100/50 px-4 py-2 text-[10px] font-bold text-slate-500 uppercase dark:bg-slate-800/50">
                    Bab {idx + 1}: {section.title}
                  </div>
                  <div className="p-1 space-y-0.5">
                    {section.materials.map((material) => (
                      <button
                        key={material.id}
                        onClick={() => handleMaterialClick(material)}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-all",
                          activeMaterial?.id === material.id
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                            : "hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                        )}
                      >
                        <div className="mt-0.5">
                          {material.userProgress?.isCompleted ? (
                            <CheckCircle2 className={cn("h-4 w-4", activeMaterial?.id === material.id ? "text-white" : "text-emerald-500")} />
                          ) : (
                            <div className={cn("h-4 w-4 rounded-full border-2", activeMaterial?.id === material.id ? "border-white/50" : "border-slate-300")} />
                          )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-xs font-semibold leading-tight truncate">{material.title}</p>
                          <div className="flex items-center gap-1.5 mt-1 opacity-70">
                            {material.type === 'VIDEO' && <Video className="h-3 w-3" />}
                            {material.type === 'ARTICLE' && <FileText className="h-3 w-3" />}
                            <span className="text-[9px] font-medium">{material.durationMin || 0} menit</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Content Viewer */}
        <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-950 p-4 lg:p-8">
          <div className="mx-auto max-w-4xl">
            {activeMaterial ? (
              <div className="space-y-6 animate-in fade-in duration-500">
                {/* Title & Progress */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-[10px] font-bold text-blue-600 uppercase mb-2">
                      {activeMaterial.type}
                    </span>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                      {activeMaterial.title}
                    </h2>
                  </div>
                  <Button 
                    onClick={handleToggleComplete}
                    className={cn(
                      "rounded-full px-6 transition-all",
                      activeMaterial.userProgress?.isCompleted 
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                        : "bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
                    )}
                  >
                    {activeMaterial.userProgress?.isCompleted ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" /> Selesai
                      </span>
                    ) : (
                      "Tandai Selesai"
                    )}
                  </Button>
                </div>

                {/* Content Area */}
                <div className="min-h-[400px]">
                  {activeMaterial.type === 'VIDEO' && (
                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-2xl">
                      {activeMaterial.videoUrl ? (
                        <iframe 
                          src={getEmbedUrl(activeMaterial.videoUrl)} 
                          className="h-full w-full"
                          allowFullScreen
                        />
                      ) : (

                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                          <MonitorPlay className="h-12 w-12 mb-2 opacity-20" />
                          <p>Video URL belum disematkan</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeMaterial.type === 'ARTICLE' && (
                    <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-a:text-blue-600">
                      {activeMaterial.content ? (
                        <div dangerouslySetInnerHTML={{ __html: activeMaterial.content }} />
                      ) : (
                        <p className="text-slate-400 italic">Isi materi belum tersedia.</p>
                      )}
                    </div>
                  )}

                  {activeMaterial.type === 'DOCUMENT' && (
                    <div className="space-y-6">
                      {activeMaterial.fileUrl ? (
                        <>
                          {/* Preview logic */}
                          {activeMaterial.fileUrl.toLowerCase().endsWith('.pdf') ? (
                            <div className="aspect-[4/5] sm:aspect-[3/4] md:aspect-auto md:h-[800px] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-slate-100 dark:bg-slate-900">
                              <iframe 
                                src={`${activeMaterial.fileUrl}#view=FitH`} 
                                className="h-full w-full border-none"
                                title="Document Preview"
                              />
                            </div>
                          ) : activeMaterial.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <div className="w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-slate-100 dark:bg-slate-900">
                              <img 
                                src={activeMaterial.fileUrl} 
                                alt={activeMaterial.title} 
                                className="w-full h-auto max-h-[800px] object-contain mx-auto" 
                              />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center p-12 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">
                              <FileText className="h-16 w-16 text-slate-300 mb-4" />
                              <h3 className="text-lg font-bold mb-2">Dokumen Pendukung</h3>
                              <p className="text-sm text-slate-500 mb-4 text-center max-w-xs">
                                Tipe file ini tidak mendukung preview langsung. Silakan unduh untuk melihat kontennya.
                              </p>
                            </div>
                          )}

                          {/* Download Button always available */}
                          <div className="flex flex-col items-center gap-3 py-4">
                            <a 
                              href={activeMaterial.fileUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
                            >
                              <FileText className="h-5 w-5" />
                              Unduh Dokumen Lengkap
                            </a>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Klik tombol di atas jika preview tidak muncul</p>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-12 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">
                          <FileText className="h-16 w-16 text-slate-300 mb-4" />
                          <h3 className="text-lg font-bold mb-2">Dokumen Pendukung</h3>
                          <span className="text-xs text-rose-500 font-bold italic">Link file tidak ditemukan atau sudah kadaluarsa</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Navigation */}
                <div className="flex items-center justify-between pt-12 border-t border-slate-100 dark:border-slate-800 mt-12">
                   <Button 
                     variant="ghost" 
                     className="gap-2 text-slate-500"
                     onClick={handlePrev}
                     disabled={!prevMaterial}
                   >
                      <ArrowLeft className="h-4 w-4" /> Materi Sebelumnya
                   </Button>
                   <Button 
                     variant="ghost" 
                     className="gap-2 text-blue-600 font-bold"
                     onClick={handleNext}
                     disabled={!nextMaterial}
                   >
                      Materi Berikutnya <ArrowRight className="h-4 w-4" />
                   </Button>
                </div>

              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center p-12">
                <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4">
                  <MonitorPlay className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">Pilih Materi</h3>
                <p className="text-slate-500 max-w-xs">Silakan pilih materi di samping kiri untuk memulai pembelajaran Anda.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

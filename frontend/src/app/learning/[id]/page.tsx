'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { useEventSyllabus, useMaterialProgress } from '@/features/events/hooks/use-event-syllabus';
import { useEventDetail } from '@/features/events/hooks/use-event-detail';
import { useEventAssignments, useEventAssignment, useSubmitAssignment } from '@/features/events/hooks/use-event-assignments';
import { SectionItem, MaterialItem } from '@/features/management/types';
import { ApiClientError } from '@/lib/api-client';
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
  const assignmentId = searchParams.get('assignmentId');

  const [activeTab, setActiveTab] = useState<'materi' | 'tugas'>('materi');

  const { data: syllabusData, isLoading: isSyllabusLoading, refetch } = useEventSyllabus(eventId, token ?? undefined);
  const sections = syllabusData?.sections;
  const { complete, uncomplete } = useMaterialProgress(token ?? '');

  const { 
    data: assignmentsData, 
    isLoading: isAssignmentsLoading,
    error: assignmentsError,
    isError: isAssignmentsError
  } = useEventAssignments(eventId, token ?? undefined);
  const assignments = assignmentsData?.items || [];

  const { 
    data: activeAssignmentDetails, 
    isLoading: isAssignmentDetailLoading,
    error: assignmentDetailError,
    isError: isAssignmentDetailError
  } = useEventAssignment(
    eventId,
    assignmentId || '',
    token ?? undefined
  );

  const submitMutation = useSubmitAssignment(eventId, token ?? '');

  const [activeMaterial, setActiveMaterial] = useState<any | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [answerText, setAnswerText] = useState('');
  const [answerUrl, setAnswerUrl] = useState('');

  // Sync tab from URL query params
  useEffect(() => {
    if (assignmentId) {
      setActiveTab('tugas');
    } else if (materialId) {
      setActiveTab('materi');
    }
  }, [assignmentId, materialId]);

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
      // Default to first material of first section if not viewing an assignment
      if (!assignmentId && sections[0].materials.length > 0) {
        setActiveMaterial(sections[0].materials[0]);
      }
    }
  }, [sections, materialId, assignmentId]);

  // Prefill assignment submission form
  useEffect(() => {
    if (activeAssignmentDetails?.userSubmission) {
      setAnswerText(activeAssignmentDetails.userSubmission.answerText || '');
      setAnswerUrl(activeAssignmentDetails.userSubmission.answerUrl || '');
    } else {
      setAnswerText('');
      setAnswerUrl('');
    }
  }, [activeAssignmentDetails]);

  // Combined loading state
  const isLoading = isSyllabusLoading || isAssignmentsLoading;

  const handleMaterialClick = (material: any) => {
    setActiveMaterial(material);
    router.push(`/learning/${eventId}?materialId=${material.id}`);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleAssignmentClick = (assignment: any) => {
    router.push(`/learning/${eventId}?assignmentId=${assignment.id}`);
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim() && !answerUrl.trim()) {
      alert('Mohon isi jawaban tertulis atau sertakan tautan berkas tugas Anda.');
      return;
    }

    try {
      await submitMutation.mutateAsync({
        assignmentId: assignmentId || '',
        input: {
          answerText: answerText.trim() || null,
          answerUrl: answerUrl.trim() || null,
        },
      });
      alert('Tugas berhasil dikumpulkan!');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Gagal mengirim tugas. Silakan coba lagi.');
    }
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

  // Assignment states & calculations
  const dueAtDate = activeAssignmentDetails?.dueAt ? new Date(activeAssignmentDetails.dueAt) : null;
  const isDeadlinePassed = dueAtDate ? new Date() > dueAtDate : false;
  const isLateAllowed = activeAssignmentDetails?.allowLate || false;
  const canSubmit = !isDeadlinePassed || isLateAllowed;

  let deadlineText = '-';
  let timeRemainingText = '';
  let isTimeRemainingCritical = false;

  if (dueAtDate) {
    deadlineText = dueAtDate.toLocaleString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const diffMs = dueAtDate.getTime() - new Date().getTime();
    if (diffMs > 0) {
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) {
        timeRemainingText = `Sisa waktu: ${diffDays} hari ${diffHours % 24} jam`;
      } else if (diffHours > 0) {
        timeRemainingText = `Sisa waktu: ${diffHours} jam ${diffMins % 60} menit`;
        if (diffHours < 6) isTimeRemainingCritical = true;
      } else {
        timeRemainingText = `Sisa waktu: ${diffMins} menit lagi!`;
        isTimeRemainingCritical = true;
      }
    } else {
      timeRemainingText = 'Batas waktu telah berakhir';
    }
  }

  const submission = activeAssignmentDetails?.userSubmission;
  let submissionStatusBadge = null;

  if (submission) {
    if (submission.status === 'SUBMITTED') {
      submissionStatusBadge = (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          Sudah Dikumpulkan
        </span>
      );
    } else if (submission.status === 'GRADED') {
      submissionStatusBadge = (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          Sudah Dinilai
        </span>
      );
    } else if (submission.status === 'RETURNED') {
      submissionStatusBadge = (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800 dark:bg-rose-950/30 dark:text-rose-400">
          <X className="h-3.5 w-3.5 text-rose-500" />
          Revisi
        </span>
      );
    } else if (submission.status === 'DRAFT') {
      submissionStatusBadge = (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-950/30 dark:text-blue-400">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          Draft
        </span>
      );
    }
  } else {
    submissionStatusBadge = (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-300">
        <Circle className="h-3.5 w-3.5 text-slate-400" />
        Belum Mengumpulkan
      </span>
    );
  }

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
            <div className="border-b border-slate-200 dark:border-slate-800 p-2">
              <div className="flex items-center justify-between mb-2 px-2 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {activeTab === 'materi' ? 'Materi Belajar' : 'Tugas / Assignment'}
                </span>
                <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                <button
                  onClick={() => {
                    setActiveTab('materi');
                    if (activeMaterial) {
                      router.push(`/learning/${eventId}?materialId=${activeMaterial.id}`);
                    } else if (sections && sections.length > 0 && sections[0].materials.length > 0) {
                      router.push(`/learning/${eventId}?materialId=${sections[0].materials[0].id}`);
                    } else {
                      router.push(`/learning/${eventId}`);
                    }
                  }}
                  className={cn(
                    "rounded-lg py-1.5 text-xs font-semibold transition-all",
                    activeTab === 'materi'
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-slate-100"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                  )}
                >
                  Materi
                </button>
                <button
                  onClick={() => {
                    setActiveTab('tugas');
                    if (assignments.length > 0) {
                      router.push(`/learning/${eventId}?assignmentId=${assignments[0].id}`);
                    } else {
                      router.push(`/learning/${eventId}`);
                    }
                  }}
                  className={cn(
                    "rounded-lg py-1.5 text-xs font-semibold transition-all",
                    activeTab === 'tugas'
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-slate-100"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                  )}
                >
                  Tugas
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
              {activeTab === 'materi' ? (
                sections?.map((section, idx: number) => (
                  <div key={section.id} className="mb-2">
                    <div className="bg-slate-100/50 px-4 py-2 text-[10px] font-bold text-slate-500 uppercase dark:bg-slate-800/50 rounded-lg">
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
                ))
              ) : (
                <div className="space-y-1 p-1">
                  {isAssignmentsError ? (
                    <div className="p-4 text-center">
                      <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center mb-3 mx-auto">
                        <X className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                        {assignmentsError instanceof ApiClientError && assignmentsError.status === 403 
                          ? 'Akses Terbatas' 
                          : 'Gagal Memuat'}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                        {assignmentsError instanceof ApiClientError && assignmentsError.status === 403 
                          ? 'Anda belum terdaftar atau pendaftaran belum disetujui.' 
                          : 'Terjadi kesalahan saat mengambil tugas.'}
                      </p>
                      <Link 
                        href={`/events/${eventId}`} 
                        className="inline-block w-full text-center rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
                      >
                        Detail & Daftar Event
                      </Link>
                    </div>
                  ) : (
                    <>
                      {assignments.map((assignment) => {
                        const isSelected = assignmentId === assignment.id;
                        const submission = assignment.userSubmission;

                        let statusText = 'Belum Dikumpulkan';
                        let statusColorClass = 'text-slate-500 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800';
                        if (submission) {
                          if (submission.status === 'SUBMITTED') {
                            statusText = 'Submitted';
                            statusColorClass = 'text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20';
                          } else if (submission.status === 'GRADED') {
                            statusText = `Graded (${submission.score ?? '-'})`;
                            statusColorClass = 'text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20';
                          } else if (submission.status === 'RETURNED') {
                            statusText = 'Returned';
                            statusColorClass = 'text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/20';
                          } else if (submission.status === 'DRAFT') {
                            statusText = 'Draft';
                            statusColorClass = 'text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/20';
                          }
                        }

                        return (
                          <button
                            key={assignment.id}
                            onClick={() => handleAssignmentClick(assignment)}
                            className={cn(
                              "flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-all",
                              isSelected
                                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                : "hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                            )}
                          >
                            <div className="flex-1 overflow-hidden">
                              <p className="text-xs font-semibold leading-tight truncate">{assignment.title}</p>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                <span className={cn(
                                  "text-[9px] font-bold px-1.5 py-0.5 rounded-full border",
                                  isSelected ? "bg-white/20 text-white border-transparent" : statusColorClass
                                )}>
                                  {statusText}
                                </span>
                                {assignment.dueAt && (
                                  <span className="text-[9px] font-medium opacity-70">
                                    DL: {new Date(assignment.dueAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                      {assignments.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                          <HelpCircle className="h-8 w-8 mb-2 opacity-20" />
                          <p className="text-xs font-medium">Belum ada tugas untuk event ini.</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Content Viewer */}
        <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-950 p-4 lg:p-8">
          <div className="mx-auto max-w-4xl">
            {activeTab === 'tugas' ? (
              isAssignmentsError ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border border-slate-200 dark:border-slate-800 animate-in fade-in duration-500">
                  <div className="h-16 w-16 rounded-full bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center mb-4">
                    <X className="h-8 w-8 text-rose-600 dark:text-rose-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">
                    {assignmentsError instanceof ApiClientError && assignmentsError.status === 403 
                      ? 'Akses Tugas Terbatas' 
                      : 'Gagal Memuat Tugas'}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6 text-sm leading-relaxed">
                    {assignmentsError instanceof ApiClientError && assignmentsError.status === 403 
                      ? 'Anda belum terdaftar sebagai peserta aktif di event ini. Silakan lakukan pendaftaran terlebih dahulu untuk mengakses tugas.' 
                      : (assignmentsError as any)?.message || 'Terjadi kesalahan saat memuat daftar tugas.'}
                  </p>
                  <Link href={`/events/${eventId}`} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all cursor-pointer">
                    Kembali ke Detail & Daftar Event
                  </Link>
                </div>
              ) : assignmentId ? (
                isAssignmentDetailLoading ? (
                  <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
                    <p className="text-sm font-medium animate-pulse">Memuat detail tugas...</p>
                  </div>
                ) : isAssignmentDetailError ? (
                  <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border border-slate-200 dark:border-slate-800 animate-in fade-in duration-500">
                    <div className="h-16 w-16 rounded-full bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center mb-4">
                      <X className="h-8 w-8 text-rose-600 dark:text-rose-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">
                      {assignmentDetailError instanceof ApiClientError && assignmentDetailError.status === 403 
                        ? 'Akses Tugas Terbatas' 
                        : 'Gagal Memuat Tugas'}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6 text-sm leading-relaxed">
                      {assignmentDetailError instanceof ApiClientError && assignmentDetailError.status === 403 
                        ? 'Anda belum terdaftar sebagai peserta aktif di event ini. Silakan lakukan pendaftaran terlebih dahulu untuk mengakses tugas.' 
                        : (assignmentDetailError as any)?.message || 'Terjadi kesalahan saat memuat detail tugas.'}
                    </p>
                    <Link href={`/events/${eventId}`} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all cursor-pointer">
                      Kembali ke Detail & Daftar Event
                    </Link>
                  </div>
                ) : !activeAssignmentDetails ? (
                  <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
                    <HelpCircle className="h-12 w-12 mb-2 opacity-20" />
                    <p className="text-sm font-medium">Tugas tidak ditemukan.</p>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    {/* Title & Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-[10px] font-bold text-blue-600 uppercase mb-2">
                          Tugas / Assignment
                        </span>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                          {activeAssignmentDetails.title}
                        </h2>
                      </div>
                      <div className="flex items-center gap-2">
                        {submissionStatusBadge}
                      </div>
                    </div>

                    {/* Assignment Info Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nilai Maksimal</span>
                        <span className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-2">
                          {activeAssignmentDetails.maxScore ?? '-'} Poin
                        </span>
                      </div>
                      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Batas Waktu</span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 mt-2 leading-relaxed">
                          {dueAtDate ? dueAtDate.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'Tidak ada batas waktu'}
                        </span>
                      </div>
                      <div className={cn(
                        "rounded-2xl border p-4 flex flex-col justify-between",
                        isTimeRemainingCritical && !isDeadlinePassed
                          ? "border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-900/10 text-amber-800 dark:text-amber-300"
                          : isDeadlinePassed
                            ? "border-rose-200 bg-rose-50/50 dark:border-rose-900/30 dark:bg-rose-950/10 text-rose-800 dark:text-rose-300"
                            : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-300"
                      )}>
                        <span className="text-[10px] font-black uppercase opacity-60 tracking-wider">Sisa Waktu</span>
                        <span className="text-xs font-bold mt-2">
                          {isDeadlinePassed 
                            ? (isLateAllowed ? 'Terlambat (Diizinkan)' : 'Ditutup') 
                            : (timeRemainingText || 'Selalu Terbuka')}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    {activeAssignmentDetails.description && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider">Deskripsi Tugas</h3>
                        <div 
                          className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: activeAssignmentDetails.description }}
                        />
                      </div>
                    )}

                    {/* Instructions */}
                    {activeAssignmentDetails.instructions && (
                      <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-5 dark:border-blue-900/20 dark:bg-blue-900/10 space-y-2">
                        <h3 className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">Instruksi Pengerjaan</h3>
                        <div 
                          className="prose prose-blue dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: activeAssignmentDetails.instructions }}
                        />
                      </div>
                    )}

                    {/* Evaluation Score & Feedback Card */}
                    {submission && (submission.status === 'GRADED' || submission.status === 'RETURNED') && (
                      <div className={cn(
                        "rounded-2xl border p-6 space-y-3 shadow-sm",
                        submission.status === 'GRADED'
                          ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/30 dark:bg-emerald-950/10"
                          : "border-amber-200 bg-amber-50/40 dark:border-amber-900/30 dark:bg-amber-950/10"
                      )}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-slate-100">
                              {submission.status === 'GRADED' ? 'Hasil Evaluasi' : 'Revisi Diperlukan'}
                            </h4>
                            <span className="text-[10px] text-slate-400">
                              Dinilai pada: {submission.gradedAt ? new Date(submission.gradedAt).toLocaleString('id-ID') : '-'}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className={cn(
                              "text-3xl font-black",
                              submission.status === 'GRADED' ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                            )}>
                              {submission.score ?? '-'}
                            </span>
                            <span className="text-xs text-slate-500"> / {activeAssignmentDetails.maxScore ?? 100}</span>
                          </div>
                        </div>
                        {submission.feedback && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Catatan Mentor:</span>
                            <p className="text-sm text-slate-700 dark:text-slate-300 bg-white/90 dark:bg-slate-900/80 p-4 rounded-xl border border-slate-100 dark:border-slate-800 whitespace-pre-wrap">
                              {submission.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Submission Content (If Submitted or Graded/Returned) */}
                    {submission && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/30 p-6 dark:border-slate-800 dark:bg-slate-900/20 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                          <h4 className="font-bold text-slate-900 dark:text-slate-100">Jawaban yang Dikirim</h4>
                          <span className="text-[10px] text-slate-400">
                            Tanggal kirim: {new Date(submission.submittedAt).toLocaleString('id-ID')}
                          </span>
                        </div>

                        {submission.answerText && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Jawaban Essay:</span>
                            <div className="text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 whitespace-pre-wrap">
                              {submission.answerText}
                            </div>
                          </div>
                        )}

                        {submission.answerUrl && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Tautan Berkas Pendukung:</span>
                            <a 
                              href={submission.answerUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline dark:text-blue-400 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-medium"
                            >
                              <FileText className="h-4 w-4" />
                              {submission.answerUrl}
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Form Submit (If no submission, or if draft, or if returned/revision requested) */}
                    {(!submission || submission.status === 'DRAFT' || submission.status === 'RETURNED') && (
                      <form onSubmit={handleFormSubmit} className="rounded-2xl border border-slate-200 bg-slate-50/30 p-6 dark:border-slate-800 dark:bg-slate-900/20 space-y-5">
                        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                          <h4 className="font-bold text-slate-900 dark:text-slate-100">
                            {submission?.status === 'RETURNED' ? 'Kirim Ulang Jawaban Tugas' : 'Form Pengumpulan Tugas'}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            Selesaikan tugas ini dengan mengisi jawaban tertulis di bawah, atau sertakan tautan berkas pendukung Anda.
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Jawaban Essay / Teks <span className="text-slate-400">(Bisa dikosongkan jika melampirkan berkas)</span>
                          </label>
                          <textarea
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            disabled={!canSubmit || submitMutation.isPending}
                            placeholder="Tulis lembar jawaban Anda di sini (mendukung Markdown)..."
                            rows={8}
                            className="w-full rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-700 dark:bg-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-200"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tautan Berkas Pendukung (Opsional)</label>
                          <input
                            type="url"
                            value={answerUrl}
                            onChange={(e) => setAnswerUrl(e.target.value)}
                            disabled={!canSubmit || submitMutation.isPending}
                            placeholder="Contoh: https://github.com/username/repo atau https://drive.google.com/..."
                            className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm dark:border-slate-700 dark:bg-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-200"
                          />
                        </div>

                        {isDeadlinePassed && isLateAllowed && (
                          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-xs text-amber-800 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-300">
                            ⚠️ <strong>Perhatian:</strong> Batas waktu pengumpulan telah berlalu. Pengiriman tugas saat ini akan ditandai sebagai <strong>terlambat</strong>.
                          </div>
                        )}

                        {!canSubmit && (
                          <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-3 text-xs text-rose-800 dark:border-rose-900/30 dark:bg-rose-900/10 dark:text-rose-300">
                            🚫 <strong>Pengumpulan Ditutup:</strong> Batas waktu pengumpulan telah berakhir ({dueAtDate?.toLocaleString('id-ID')}) dan pengumpulan terlambat tidak diizinkan untuk tugas ini.
                          </div>
                        )}

                        <div className="flex justify-end pt-2">
                          <Button
                            type="submit"
                            disabled={!canSubmit || submitMutation.isPending || (!answerText.trim() && !answerUrl.trim())}
                            className={cn(
                              "rounded-xl px-8 py-3.5 font-bold text-white transition-all",
                              canSubmit && (answerText.trim() || answerUrl.trim()) && !submitMutation.isPending
                                ? "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 cursor-pointer"
                                : "bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none"
                            )}
                          >
                            {submitMutation.isPending 
                              ? 'Sedang Mengirim...' 
                              : submission?.status === 'RETURNED'
                                ? 'Kirim Ulang Jawaban'
                                : 'Kumpulkan Tugas'}
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                )
              ) : assignments.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border border-slate-200 dark:border-slate-800 animate-in fade-in duration-500">
                  <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <HelpCircle className="h-8 w-8 text-slate-400 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">Belum Ada Tugas</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md text-sm">
                    Belum ada tugas yang dipublikasikan untuk event ini.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border border-slate-200 dark:border-slate-800 animate-in fade-in duration-500">
                  <div className="h-16 w-16 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">Pilih Tugas</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md text-sm leading-relaxed">
                    Silakan pilih salah satu tugas dari daftar di samping kiri untuk melihat detail instruksi dan mengirimkan jawaban Anda.
                  </p>
                </div>
              )
            ) : activeMaterial ? (
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

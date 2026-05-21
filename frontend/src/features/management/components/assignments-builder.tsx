'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { useEventSyllabus } from '@/features/events/hooks/use-event-syllabus';
import { useManagementAssignments, useAssignmentSubmissions } from '../hooks/use-management-assignments';
import {
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  Pencil,
  Trash2,
  Plus,
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BaseModal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { WarningModal } from '@/components/ui/warning-modal';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { CustomDropdown } from './custom-dropdown';
import { ManagementEventDatetimeInput } from './management-event-datetime-input';

// Helper to format ISO string to YYYY-MM-DDTHH:MM for datetime-local inputs
function formatToDateTimeLocal(dateStr?: string | null) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const pad = (num: number) => String(num).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export function AssignmentsBuilder({ eventId }: { eventId: string }) {
  const { token } = useAuth();

  // Queries
  const { data: syllabusData } = useEventSyllabus(eventId, token ?? undefined);
  const sections = syllabusData?.sections ?? [];

  const {
    page,
    setPage,
    assignmentsQuery,
    createAssignment,
    updateAssignment,
    deleteAssignment,
  } = useManagementAssignments(eventId, token ?? '');

  const assignments = assignmentsQuery.data?.data?.items ?? [];
  const pagination = assignmentsQuery.data?.data?.pagination;

  // Selected state for Submissions View
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    instructions: '',
    sectionId: null as string | null,
    releaseAt: '',
    dueAt: '',
    allowLate: false,
    maxScore: 100,
    isPublished: true,
    order: 0,
  });

  const handleOpenFormModal = (assignment?: any) => {
    if (assignment) {
      setEditingAssignment(assignment);
      setForm({
        title: assignment.title,
        description: assignment.description || '',
        instructions: assignment.instructions || '',
        sectionId: assignment.section?.id || null,
        releaseAt: formatToDateTimeLocal(assignment.releaseAt),
        dueAt: formatToDateTimeLocal(assignment.dueAt),
        allowLate: assignment.allowLate,
        maxScore: assignment.maxScore ?? 100,
        isPublished: assignment.isPublished,
        order: assignment.order,
      });
    } else {
      setEditingAssignment(null);
      setForm({
        title: '',
        description: '',
        instructions: '',
        sectionId: null,
        releaseAt: '',
        dueAt: '',
        allowLate: false,
        maxScore: 100,
        isPublished: true,
        order: 0,
      });
    }
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingAssignment(null);
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;

    const payload = {
      ...form,
      releaseAt: form.releaseAt ? new Date(form.releaseAt).toISOString() : null,
      dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : null,
      sectionId: form.sectionId || null,
      maxScore: Number(form.maxScore),
      order: Number(form.order),
    };

    try {
      if (editingAssignment) {
        await updateAssignment.mutateAsync({
          assignmentId: editingAssignment.id,
          input: payload,
        });
      } else {
        await createAssignment.mutateAsync(payload);
      }
      handleCloseFormModal();
      assignmentsQuery.refetch();
    } catch (err) {
      alert('Gagal menyimpan tugas.');
    }
  };

  const handleConfirmDelete = (id: string) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteAssignment = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteAssignment.mutateAsync(deleteTargetId);
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
      assignmentsQuery.refetch();
    } catch (err) {
      alert('Gagal menghapus tugas.');
    }
  };

  if (selectedAssignment) {
    return (
      <SubmissionsPanel
        eventId={eventId}
        assignment={selectedAssignment}
        onBack={() => {
          setSelectedAssignment(null);
          assignmentsQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Daftar Tugas / Assignment</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Buat dan kelola tugas untuk melatih kemampuan mahasiswa.</p>
        </div>
        <Button
          onClick={() => handleOpenFormModal()}
          className="rounded-xl bg-[#2E417B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#23306a] dark:bg-blue-600 dark:hover:bg-blue-700 transition-all shadow-md flex items-center gap-2 self-start sm:self-auto active:scale-95"
        >
          <Plus className="h-4.5 w-4.5" />
          Tambah Tugas
        </Button>
      </div>

      {assignmentsQuery.isLoading ? (
        <div className="py-12 text-center animate-pulse text-slate-400 font-medium">Memuat tugas...</div>
      ) : assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center dark:border-slate-800 bg-slate-50/30">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <FileText className="h-10 w-10 text-slate-400" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-sans">Belum ada tugas</h4>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">Mulai buat tugas pertama dengan menentukan tenggat waktu dan kriteria penilaian.</p>
          <Button
            className="mt-6 bg-[#2E417B] hover:bg-[#23306a] rounded-xl px-6"
            onClick={() => handleOpenFormModal()}
          >
            Buat Tugas Pertama
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Judul Tugas</th>
                    <th className="px-6 py-4">Bab (Syllabus Section)</th>
                    <th className="px-6 py-4">Release & Deadline</th>
                    <th className="px-6 py-4">Status & Max Score</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {assignments.map((assignment: any) => {
                    const hasPassed = assignment.dueAt && new Date(assignment.dueAt) < new Date();
                    return (
                      <tr key={assignment.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[240px]">{assignment.title}</span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mt-0.5">Order: {assignment.order}</span>
                        </td>
                        <td className="px-6 py-4">
                          {assignment.section ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                              {assignment.section.title}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Global (Tanpa Bab)</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              <span>Rilis: {assignment.releaseAt ? new Date(assignment.releaseAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : 'Segera'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              <span className={hasPassed ? 'text-rose-500 font-medium' : ''}>
                                Deadline: {assignment.dueAt ? new Date(assignment.dueAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : 'Tidak ada'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${assignment.isPublished
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}>
                              {assignment.isPublished ? 'PUBLISHED' : 'DRAFT'}
                            </span>
                            <div className="text-xs text-slate-500">Max Score: <span className="font-bold text-slate-700 dark:text-slate-300">{assignment.maxScore ?? 'N/A'}</span></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedAssignment(assignment)}
                              className="h-8.5 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-all flex items-center gap-1"
                            >
                              <GraduationCap className="h-3.5 w-3.5" />
                              Nilai Tugas
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8.5 w-8.5 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all rounded-lg"
                              onClick={() => handleOpenFormModal(assignment)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8.5 w-8.5 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all rounded-lg"
                              onClick={() => handleConfirmDelete(assignment.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4 px-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="rounded-lg"
              >
                Sebelumnya
              </Button>
              <span className="text-xs text-slate-500">Halaman {page} dari {pagination.totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded-lg"
              >
                Berikutnya
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Save Modal */}
      <BaseModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        title={editingAssignment ? "Ubah Tugas" : "Tambah Tugas Baru"}
        description="Silakan tentukan judul, petunjuk pengerjaan, dan tenggat waktu tugas."
        className="max-w-4xl"
      >
        <form onSubmit={handleSaveAssignment} className="space-y-4 pt-4 max-h-[75vh] overflow-y-auto px-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Judul Tugas</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Contoh: Hands-on Membuat API dengan Elysia"
                className="rounded-xl border-slate-200"
                required
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deskripsi Tugas</label>
              <RichTextEditor
                value={form.description}
                onChange={(content) => setForm({ ...form, description: content })}
                placeholder="Jelaskan gambaran umum tugas..."
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Instruksi Pengerjaan</label>
              <RichTextEditor
                value={form.instructions}
                onChange={(content) => setForm({ ...form, instructions: content })}
                placeholder="Tulis langkah-langkah atau format jawaban yang diinginkan..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hubungkan dengan Bab (Syllabus)</label>
              <CustomDropdown
                value={form.sectionId || ''}
                onChange={(value) => setForm({ ...form, sectionId: value || null })}
                options={[
                  { value: '', label: 'Tanpa Bab (Global)' },
                  ...sections.map((sec) => ({ value: sec.id, label: sec.title }))
                ]}
                placeholder="Pilih Bab (Syllabus)"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Skor Maksimum</label>
              <Input
                type="number"
                value={form.maxScore}
                onChange={(e) => setForm({ ...form, maxScore: parseInt(e.target.value) || 0 })}
                className="rounded-xl border-slate-200"
                min={1}
              />
            </div>

            <div className="space-y-1.5">
              <ManagementEventDatetimeInput
                label="Waktu Rilis"
                value={form.releaseAt}
                onChange={(value) => setForm({ ...form, releaseAt: value })}
              />
              <span className="text-[10px] text-slate-400 block mt-1">Kosongkan jika ingin langsung dirilis setelah dipublish.</span>
            </div>

            <div className="space-y-1.5">
              <ManagementEventDatetimeInput
                label="Tenggat Waktu (Deadline)"
                value={form.dueAt}
                onChange={(value) => setForm({ ...form, dueAt: value })}
              />
              <span className="text-[10px] text-slate-400 block mt-1">Batas waktu penyerahan jawaban.</span>
            </div>

            <div className="flex flex-col md:flex-row gap-4 py-2 md:col-span-2">
              <label className="flex-1 flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.allowLate}
                  onChange={(e) => setForm({ ...form, allowLate: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700 dark:text-white">Perbolehkan Terlambat (Allow Late Submission)</span>
                  <span className="text-[10px] text-slate-400">Jika aktif, siswa masih dapat submit tugas meskipun deadline sudah lewat.</span>
                </div>
              </label>

              <label className="flex-1 flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700 dark:text-white">Publikasikan Langsung (Published)</span>
                  <span className="text-[10px] text-slate-400">Jika tidak aktif, tugas ini akan disimpan sebagai draft terlebih dahulu.</span>
                </div>
              </label>
            </div>

            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Urutan Tampilan (Order)</label>
              <Input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                className="rounded-xl border-slate-200"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={handleCloseFormModal}>Batal</Button>
            <Button
              type="submit"
              className="flex-1 bg-[#2E417B] text-white rounded-xl shadow-lg shadow-blue-900/10 hover:bg-[#23306a]"
              disabled={createAssignment.isPending || updateAssignment.isPending}
            >
              {createAssignment.isPending || updateAssignment.isPending ? 'Menyimpan...' : 'Simpan Tugas'}
            </Button>
          </div>
        </form>
      </BaseModal>

      {/* Delete Confirmation */}
      <WarningModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAssignment}
        title="Hapus Tugas?"
        message="Menghapus tugas ini juga akan menghapus seluruh data submission siswa secara permanen."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        isLoading={deleteAssignment.isPending}
      />
    </div>
  );
}

// ============================================================================
// Submissions Panel Component
// ============================================================================
function SubmissionsPanel({
  eventId,
  assignment,
  onBack
}: {
  eventId: string;
  assignment: any;
  onBack: () => void;
}) {
  const { token } = useAuth();

  // Queries
  const { submissionsQuery, gradeSubmission } = useAssignmentSubmissions(
    eventId,
    assignment.id,
    token ?? ''
  );

  const submissions = submissionsQuery.data?.data ?? [];

  // Grading Modal States
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);

  // Grade Form State
  const [gradeForm, setGradeForm] = useState({
    score: '',
    feedback: '',
    status: 'GRADED' as 'GRADED' | 'RETURNED',
  });

  const handleOpenGradeModal = (sub: any) => {
    setSelectedSubmission(sub);
    setGradeForm({
      score: sub.score !== null ? String(sub.score) : '',
      feedback: sub.feedback || '',
      status: (sub.status === 'RETURNED' ? 'RETURNED' : 'GRADED') as 'GRADED' | 'RETURNED',
    });
    setIsGradeModalOpen(true);
  };

  const handleCloseGradeModal = () => {
    setIsGradeModalOpen(false);
    setSelectedSubmission(null);
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    const scoreNum = gradeForm.score === '' ? null : Number(gradeForm.score);

    if (scoreNum !== null && (isNaN(scoreNum) || scoreNum < 0 || (assignment.maxScore && scoreNum > assignment.maxScore))) {
      alert(`Nilai harus berupa angka di antara 0 dan ${assignment.maxScore}`);
      return;
    }

    try {
      await gradeSubmission.mutateAsync({
        userId: selectedSubmission.userId,
        input: {
          score: scoreNum,
          feedback: gradeForm.feedback || null,
          status: gradeForm.status,
        },
      });
      handleCloseGradeModal();
      submissionsQuery.refetch();
    } catch (err) {
      alert('Gagal menyimpan penilaian.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-10 w-10 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kembali ke Daftar Tugas</span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-sans">{assignment.title}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">Detail & Panduan Tugas</h4>
            {assignment.description && (
              <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: assignment.description }} />
            )}
            {assignment.instructions && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">Instruksi Pengerjaan</span>
                <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: assignment.instructions }} />
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-between items-center">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Daftar Pengumpulan Jawaban ({submissions.length})</h4>
            </div>

            {submissionsQuery.isLoading ? (
              <div className="py-12 text-center animate-pulse text-slate-400 font-medium">Memuat pengumpulan...</div>
            ) : submissions.length === 0 ? (
              <div className="py-16 text-center text-slate-400 dark:text-slate-400">
                <AlertCircle className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-medium">Belum ada siswa yang mengumpulkan tugas ini.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {submissions.map((sub: any) => (
                  <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#2E417B]/10 dark:bg-blue-900/30 flex items-center justify-center font-bold text-[#2E417B] dark:text-blue-400 text-sm uppercase shrink-0">
                        {sub.user?.profilePhotoUrl ? (
                          <img src={sub.user.profilePhotoUrl} alt="" className="h-full w-full rounded-full object-cover" />
                        ) : (
                          (sub.user?.name || sub.user?.email || 'M').charAt(0)
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block leading-tight">{sub.user?.name || 'Mahasiswa'}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-400 block mt-0.5">{sub.user?.email}</span>
                        <span className="text-[10px] text-slate-400 block mt-1">Submitted: {new Date(sub.submittedAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${sub.status === 'GRADED'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                            : sub.status === 'RETURNED'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                              : 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                          }`}>
                          {sub.status}
                        </span>
                        {sub.score !== null && (
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">Nilai: {sub.score} / {assignment.maxScore}</div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenGradeModal(sub)}
                        className="rounded-lg h-9 text-xs font-semibold"
                      >
                        {sub.status === 'GRADED' ? 'Re-Grade / Ubah Nilai' : 'Nilai Sekarang'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm pb-2 border-b border-slate-100 dark:border-slate-800">Ringkasan Tugas</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Batas Pengumpulan</span>
                <span className="font-semibold text-slate-800 dark:text-slate-300">
                  {assignment.dueAt ? new Date(assignment.dueAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : 'Tidak ada'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Terlambat Dibolehkan</span>
                <span className={`font-semibold ${assignment.allowLate ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {assignment.allowLate ? 'Ya' : 'Tidak'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Skor Maksimum</span>
                <span className="font-semibold text-slate-800 dark:text-slate-300">{assignment.maxScore ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Total Terkumpul</span>
                <span className="font-bold text-blue-600">{submissions.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Belum Dinilai</span>
                <span className="font-bold text-amber-600">
                  {submissions.filter((s: any) => s.status === 'SUBMITTED').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grading Modal */}
      {selectedSubmission && (
        <BaseModal
          isOpen={isGradeModalOpen}
          onClose={handleCloseGradeModal}
          title={`Penilaian Tugas - ${(selectedSubmission.user?.name || 'Siswa')}`}
          description={`Pengumpulan untuk tugas "${assignment.title}"`}
          className="max-w-3xl"
        >
          <form onSubmit={handleSaveGrade} className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto px-1">
            <div className="space-y-3">
              {/* Answer Text */}
              {selectedSubmission.answerText && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Jawaban Teks / Essay</label>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                    {selectedSubmission.answerText}
                  </div>
                </div>
              )}

              {/* Answer URL */}
              {selectedSubmission.answerUrl && (
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Lampiran Berkas / Tautan</label>
                  <a
                    href={selectedSubmission.answerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/45 transition-colors text-sm font-semibold"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Buka Link Jawaban Siswa
                  </a>
                </div>
              )}
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nilai (Maks: {assignment.maxScore ?? 100})</label>
                <Input
                  type="number"
                  value={gradeForm.score}
                  onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })}
                  placeholder={`Masukkan nilai 0-${assignment.maxScore ?? 100}`}
                  className="rounded-xl border-slate-200"
                  max={assignment.maxScore ?? 100}
                  min={0}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status Evaluasi</label>
                <div className="flex gap-3">
                  <label className="flex-1 flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={gradeForm.status === 'GRADED'}
                      onChange={() => setGradeForm({ ...gradeForm, status: 'GRADED' })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-150">GRADED</span>
                      <span className="text-[10px] text-slate-400">Selesai dinilai</span>
                    </div>
                  </label>
                  <label className="flex-1 flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={gradeForm.status === 'RETURNED'}
                      onChange={() => setGradeForm({ ...gradeForm, status: 'RETURNED' })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-150">RETURNED</span>
                      <span className="text-[10px] text-slate-400">Perlu perbaikan</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Catatan Umpan Balik (Feedback)</label>
                <Textarea
                  value={gradeForm.feedback}
                  onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                  placeholder="Berikan umpan balik atau saran evaluasi bagi siswa..."
                  className="rounded-xl border-slate-200 min-h-[100px]"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={handleCloseGradeModal}>Batal</Button>
              <Button
                type="submit"
                className="flex-1 bg-[#2E417B] text-white rounded-xl shadow-lg shadow-blue-900/10 hover:bg-[#23306a]"
                disabled={gradeSubmission.isPending}
              >
                {gradeSubmission.isPending ? 'Menyimpan...' : 'Simpan Nilai'}
              </Button>
            </div>
          </form>
        </BaseModal>
      )}
    </div>
  );
}

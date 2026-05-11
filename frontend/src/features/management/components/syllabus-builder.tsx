'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { useEventSyllabus } from '@/features/events/hooks/use-event-syllabus';
import { useManagementSyllabus } from '../hooks/use-management-syllabus';
import { SectionItem, MaterialItem } from '../types';
import { Plus, GripVertical, Video, FileText, HelpCircle, Eye, Lock, Pencil, Trash2, X, Upload, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BaseModal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { WarningModal } from '@/components/ui/warning-modal';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

export function SyllabusBuilder({ eventId }: { eventId: string }) {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: sections, isLoading, refetch } = useEventSyllabus(eventId, token ?? undefined);
  const { 
    createSection, updateSection, deleteSection, 
    createMaterial, updateMaterial, deleteMaterial,
    uploadMaterial
  } = useManagementSyllabus(eventId, token ?? '');

  // Modal States
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Edit States
  const [editingSection, setEditingSection] = useState<SectionItem | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<MaterialItem | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'section' | 'material'; id: string } | null>(null);

  // Form States
  const [sectionTitle, setSectionTitle] = useState('');
  const [materialForm, setMaterialForm] = useState({
    title: '',
    type: 'ARTICLE' as MaterialItem['type'],
    content: '',
    videoUrl: '',
    fileUrl: '',
    isPreview: false,
    durationMin: 0
  });

  const handleSaveSection = async () => {
    if (!sectionTitle) return;
    if (editingSection) {
      await updateSection.mutateAsync({ sectionId: editingSection.id, input: { title: sectionTitle } });
    } else {
      await createSection.mutateAsync({ title: sectionTitle });
    }
    closeSectionModal();
    refetch();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadMaterial.mutateAsync(file);
      setMaterialForm({ ...materialForm, fileUrl: result.data.fileUrl });
    } catch (error) {
      alert('Gagal mengunggah file. Pastikan ukuran file < 20MB.');
    }
  };

  const handleSaveMaterial = async () => {
    if (!materialForm.title) return;
    
    const payload = {
      ...materialForm,
      // Clean up fields based on type
      content: materialForm.type === 'ARTICLE' ? materialForm.content : null,
      videoUrl: materialForm.type === 'VIDEO' ? materialForm.videoUrl : null,
      fileUrl: materialForm.type === 'DOCUMENT' ? materialForm.fileUrl : null,
    };

    if (editingMaterial) {
      await updateMaterial.mutateAsync({ materialId: editingMaterial.id, input: payload });
    } else if (activeSectionId) {
      await createMaterial.mutateAsync({ sectionId: activeSectionId, input: payload });
    }
    closeMaterialModal();
    refetch();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'section') {
      await deleteSection.mutateAsync(deleteTarget.id);
    } else {
      await deleteMaterial.mutateAsync(deleteTarget.id);
    }
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
    refetch();
  };

  const openSectionModal = (section?: SectionItem) => {
    if (section) {
      setEditingSection(section);
      setSectionTitle(section.title);
    } else {
      setEditingSection(null);
      setSectionTitle('');
    }
    setIsSectionModalOpen(true);
  };

  const closeSectionModal = () => {
    setIsSectionModalOpen(false);
    setEditingSection(null);
    setSectionTitle('');
  };

  const openMaterialModal = (sectionId: string, material?: MaterialItem) => {
    setActiveSectionId(sectionId);
    if (material) {
      setEditingMaterial(material);
      setMaterialForm({
        title: material.title,
        type: material.type,
        content: material.content || '',
        videoUrl: material.videoUrl || '',
        fileUrl: material.fileUrl || '',
        isPreview: material.isPreview,
        durationMin: material.durationMin || 0
      });
    } else {
      setEditingMaterial(null);
      setMaterialForm({ 
        title: '', 
        type: 'ARTICLE', 
        content: '', 
        videoUrl: '', 
        fileUrl: '', 
        isPreview: false, 
        durationMin: 0 
      });
    }
    setIsMaterialModalOpen(true);
  };

  const closeMaterialModal = () => {
    setIsMaterialModalOpen(false);
    setEditingMaterial(null);
    setActiveSectionId(null);
    setMaterialForm({ 
      title: '', 
      type: 'ARTICLE', 
      content: '', 
      videoUrl: '', 
      fileUrl: '', 
      isPreview: false, 
      durationMin: 0 
    });
  };

  const confirmDelete = (type: 'section' | 'material', id: string) => {
    setDeleteTarget({ type, id });
    setIsDeleteModalOpen(true);
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse text-slate-400 font-medium">Memuat Silabus...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Kurikulum & Materi</h3>
        <Button 
          onClick={() => openSectionModal()}
          className="rounded-lg bg-[#2E417B] px-4 py-2 text-sm font-medium text-white hover:bg-[#23306a] dark:bg-blue-600 dark:hover:bg-blue-700 transition-all shadow-md active:scale-95"
        >
          Tambah Bab
        </Button>

      </div>


      <div className="space-y-6">
        {sections?.map((section: SectionItem) => (
          <div key={section.id} className="group rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 overflow-hidden transition-all hover:shadow-md">
            <div className="flex items-center justify-between bg-slate-50/50 px-5 py-4 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <GripVertical className="h-6 w-6 text-slate-400 cursor-move" />
                <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200">{section.title}</h4>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-10 w-10 p-0 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all rounded-full"
                  onClick={() => openMaterialModal(section.id)}
                >
                  <Plus className="h-5 w-5" strokeWidth={3} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 w-10 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all rounded-full"
                  onClick={() => openSectionModal(section)}
                >
                  <Pencil className="h-5 w-5" strokeWidth={2.5} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 w-10 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all rounded-full"
                  onClick={() => confirmDelete('section', section.id)}
                >
                  <Trash2 className="h-5 w-5" strokeWidth={2.5} />
                </Button>
              </div>
            </div>
            
            <div className="p-2 space-y-1">
              {section.materials.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-slate-400 italic">Belum ada materi di bab ini.</p>
                  <button 
                    onClick={() => openMaterialModal(section.id)}
                    className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                  >
                    + Tambah Materi Pertama
                  </button>
                </div>
              ) : (
                section.materials.map((material: MaterialItem) => (
                  <div key={material.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group/item">
                    <div className="flex items-center gap-4">
                      <GripVertical className="h-5 w-5 text-slate-300 cursor-move opacity-0 group-hover/item:opacity-100 transition-opacity" />
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 shadow-sm">
                        {material.type === 'VIDEO' && <Video className="h-6 w-6 text-blue-500" strokeWidth={2.5} />}
                        {material.type === 'ARTICLE' && <FileText className="h-6 w-6 text-emerald-500" strokeWidth={2.5} />}
                        {material.type === 'DOCUMENT' && <File className="h-6 w-6 text-rose-500" strokeWidth={2.5} />}
                        {material.type === 'QUIZ' && <HelpCircle className="h-6 w-6 text-amber-500" strokeWidth={2.5} />}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{material.title}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">{material.type}</span>
                          {material.isPreview && (
                            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold uppercase">Preview</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-9 w-9 p-0 text-slate-400 opacity-0 group-hover/item:opacity-100 transition-all hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full"
                        onClick={() => openMaterialModal(section.id, material)}
                      >
                        <Pencil className="h-5 w-5" strokeWidth={2.5} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-9 w-9 p-0 text-rose-400 opacity-0 group-hover/item:opacity-100 transition-all hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full"
                        onClick={() => confirmDelete('material', material.id)}
                      >
                        <Trash2 className="h-5 w-5" strokeWidth={2.5} />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}

        {sections?.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center dark:border-slate-800 bg-slate-50/30">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800">
              <FileText className="h-10 w-10 text-slate-300" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">Silabus Kosong</h4>
            <p className="mt-1 text-sm text-slate-500 max-w-xs">Mulai susun kurikulum event Anda dengan menambahkan Bab pertama.</p>
            <Button 
              className="mt-6 bg-[#2E417B] hover:bg-[#23306a] rounded-xl px-8" 
              onClick={() => openSectionModal()}
            >
              Add Your First Section
            </Button>
          </div>
        )}
      </div>

      {/* Section Modal */}
      <BaseModal
        isOpen={isSectionModalOpen}
        onClose={closeSectionModal}
        title={editingSection ? "Ubah Bab" : "Tambah Bab Baru"}
        description="Berikan judul untuk bab pembelajaran ini."
      >
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Judul Bab</label>
            <Input 
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="Contoh: Pendahuluan & Persiapan"
              className="rounded-xl border-slate-200"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={closeSectionModal}>Batal</Button>
            <Button 
              className="flex-1 bg-[#2E417B] rounded-xl shadow-lg shadow-blue-900/10" 
              onClick={handleSaveSection}
              disabled={!sectionTitle || createSection.isPending || updateSection.isPending}
            >
              {(createSection.isPending || updateSection.isPending) ? 'Menyimpan...' : 'Simpan Bab'}
            </Button>
          </div>
        </div>
      </BaseModal>

      {/* Material Modal */}
      <BaseModal
        isOpen={isMaterialModalOpen}
        onClose={closeMaterialModal}
        title={editingMaterial ? "Ubah Materi" : "Tambah Materi"}
        description="Tambahkan materi pembelajaran baru ke dalam bab ini."
        className="max-w-6xl"
      >


        <div className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto px-1">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Judul Materi</label>
            <Input 
              value={materialForm.title}
              onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
              placeholder="Contoh: Pengenalan Dasar React"
              className="rounded-xl border-slate-200"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipe Materi</label>
            <div className="grid grid-cols-3 gap-2">
              {(['ARTICLE', 'VIDEO', 'DOCUMENT'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setMaterialForm({ ...materialForm, type })}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                    materialForm.type === type 
                    ? 'border-blue-600 bg-blue-50 text-blue-600' 
                    : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                  }`}
                >
                  {type === 'ARTICLE' && <FileText className="h-7 w-7 mb-2" strokeWidth={2.5} />}
                  {type === 'VIDEO' && <Video className="h-7 w-7 mb-2" strokeWidth={2.5} />}
                  {type === 'DOCUMENT' && <File className="h-7 w-7 mb-2" strokeWidth={2.5} />}
                  <span className="text-[10px] font-bold uppercase">{type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Type Specific Fields */}
          {materialForm.type === 'VIDEO' && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">YouTube / Video URL</label>
              <Input 
                value={materialForm.videoUrl}
                onChange={(e) => setMaterialForm({ ...materialForm, videoUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                className="rounded-xl border-slate-200"
              />
            </div>
          )}

          {materialForm.type === 'ARTICLE' && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Isi Materi (Teks/Markdown)</label>
              <RichTextEditor 
                value={materialForm.content}
                onChange={(nextValue) => setMaterialForm({ ...materialForm, content: nextValue })}
                placeholder="Tulis materi artikel di sini..."
              />
            </div>
          )}

          {materialForm.type === 'DOCUMENT' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upload File (PDF/ZIP/DOCX)</label>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.zip,.docx,.rar"
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                  materialForm.fileUrl 
                  ? 'border-emerald-200 bg-emerald-50/30' 
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {uploadMaterial.isPending ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    <span className="text-xs font-medium text-blue-600">Mengunggah...</span>
                  </div>
                ) : materialForm.fileUrl ? (
                  <div className="flex flex-col items-center gap-1 text-emerald-600">
                    <Eye className="h-10 w-10 mb-2 text-emerald-500" />
                    <span className="text-xs font-bold">File Terunggah!</span>
                    <span className="text-[10px] text-emerald-500 truncate max-w-[200px]">{materialForm.fileUrl.split('/').pop()}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-400">
                    <Upload className="h-10 w-10 mb-2 text-blue-500" />
                    <span className="text-xs font-bold">Klik untuk Pilih File</span>
                    <span className="text-[10px]">Max size: 20MB</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Durasi (Menit)</label>
              <Input 
                type="number"
                value={materialForm.durationMin}
                onChange={(e) => setMaterialForm({ ...materialForm, durationMin: parseInt(e.target.value) || 0 })}
                className="rounded-xl border-slate-200"
              />
            </div>
            <div className="flex flex-col justify-end">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100">
                <input 
                  type="checkbox" 
                  id="isPreview"
                  checked={materialForm.isPreview}
                  onChange={(e) => setMaterialForm({ ...materialForm, isPreview: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                <div className="flex flex-col">
                  <label htmlFor="isPreview" className="text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer uppercase">
                    Preview Materi
                  </label>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Jika aktif, materi ini bisa dilihat secara gratis oleh calon peserta sebelum mendaftar/membayar.
                  </p>
                </div>
              </div>
            </div>

          </div>

          <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={closeMaterialModal}>Batal</Button>
            <Button 
              className="flex-1 bg-[#2E417B] rounded-xl shadow-lg shadow-blue-900/10" 
              onClick={handleSaveMaterial}
              disabled={
                !materialForm.title || 
                createMaterial.isPending || 
                updateMaterial.isPending || 
                uploadMaterial.isPending ||
                (materialForm.type === 'DOCUMENT' && !materialForm.fileUrl)
              }
            >
              {(createMaterial.isPending || updateMaterial.isPending) ? 'Menyimpan...' : 'Simpan Materi'}
            </Button>
          </div>
        </div>
      </BaseModal>

      {/* Delete Confirmation Modal */}
      <WarningModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={deleteTarget?.type === 'section' ? "Hapus Bab?" : "Hapus Materi?"}
        message={deleteTarget?.type === 'section' 
          ? "Menghapus bab akan menghapus semua materi di dalamnya secara permanen." 
          : "Materi ini akan dihapus secara permanen."}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        isLoading={deleteSection.isPending || deleteMaterial.isPending}
      />
    </div>
  );
}

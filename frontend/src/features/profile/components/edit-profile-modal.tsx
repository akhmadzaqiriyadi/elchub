'use client';

import { useState } from 'react';
import { BaseModal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useUpdateProfile } from '../hooks/use-update-profile';

type EditProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentName: string | null;
};

export function EditProfileModal({ isOpen, onClose, currentName }: EditProfileModalProps) {
  const [name, setName] = useState(currentName || '');
  const updateProfileMutation = useUpdateProfile();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Nama tidak boleh kosong');
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({ name });
      toast.success('Profil berhasil diperbarui');
      onClose();
    } catch (error) {
      toast.error('Gagal memperbarui profil');
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profil"
      description="Perbarui informasi dasar akun Anda."
    >
      <form onSubmit={handleSave} className="space-y-4 pt-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-primary dark:text-slate-200">
            Nama Lengkap
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm text-primary transition-colors focus:border-primary/50 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Masukkan nama Anda"
            disabled={updateProfileMutation.isPending}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={updateProfileMutation.isPending}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="flex-1"
          >
            {updateProfileMutation.isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}

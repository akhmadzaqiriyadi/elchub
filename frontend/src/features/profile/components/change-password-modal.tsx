'use client';

import { useState } from 'react';
import { BaseModal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { toast } from 'sonner';
import { useChangePassword } from '../hooks/use-change-password';

type ChangePasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const changePasswordMutation = useChangePassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.newPassword.length < 8) {
      toast.error('Password baru minimal 8 karakter');
      return;
    }
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password berhasil diganti');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengganti password');
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Ganti Password"
      description="Gunakan password yang kuat untuk keamanan akun Anda."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-primary dark:text-slate-200">
            Password Saat Ini
          </label>
          <PasswordInput
            required
            value={passwords.currentPassword}
            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
            disabled={changePasswordMutation.isPending}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-primary dark:text-slate-200">
            Password Baru
          </label>
          <PasswordInput
            required
            minLength={8}
            value={passwords.newPassword}
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            disabled={changePasswordMutation.isPending}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-primary dark:text-slate-200">
            Konfirmasi Password Baru
          </label>
          <PasswordInput
            required
            value={passwords.confirmPassword}
            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
            disabled={changePasswordMutation.isPending}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={changePasswordMutation.isPending}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="flex-1"
          >
            {changePasswordMutation.isPending ? 'Memproses...' : 'Ganti Password'}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}

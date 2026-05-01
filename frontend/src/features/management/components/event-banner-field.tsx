'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { ImageUp, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/features/auth/auth-context';

import { uploadManagementEventBanner } from '../api';

type EventBannerFieldProps = {
  title: string;
  value: string;
  onChange: (nextValue: string) => void;
};

const maxBannerSize = 5 * 1024 * 1024;

export function EventBannerField({ title, value, onChange }: EventBannerFieldProps) {
  const { token } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handlePickFile = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Pilih file gambar yang valid');
      event.target.value = '';
      return;
    }

    if (file.size > maxBannerSize) {
      toast.error('Ukuran banner maksimal 5MB');
      event.target.value = '';
      return;
    }

    if (!token) {
      toast.error('Unauthorized');
      event.target.value = '';
      return;
    }

    setIsUploading(true);

    try {
      const response = await uploadManagementEventBanner(file, token);
      onChange(response.data.imageUrl);
      toast.success('Banner berhasil diupload');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal upload banner');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 lg:max-w-md">
          {value ? (
            <img src={value} alt={title || 'Event banner preview'} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full min-h-52 flex-col items-center justify-center gap-2 px-4 text-center text-slate-500 dark:text-slate-400">
              <ImageUp className="h-10 w-10" />
              <p className="text-sm font-medium">Belum ada banner</p>
              <p className="text-xs">Upload gambar untuk ditampilkan di event card dan detail page.</p>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Banner Event</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Gunakan gambar lebar 16:9 agar tampil bagus di list dan halaman detail.
            </p>
          </div>

          <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handlePickFile}
              disabled={isUploading}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2E417B] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ImageUp className="h-4 w-4" />
              {isUploading ? 'Uploading...' : value ? 'Ganti Banner' : 'Upload Banner'}
            </button>

            {value && (
              <button
                type="button"
                onClick={handleClear}
                disabled={isUploading}
                className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-950/20"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Format: JPG, PNG, WebP, GIF. Maksimal 5MB.
          </p>
        </div>
      </div>
    </div>
  );
}
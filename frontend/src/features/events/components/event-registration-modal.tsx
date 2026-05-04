import { useState, FormEvent, ChangeEvent } from 'react';
import { BaseModal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { FormSchemaField } from '@/features/management/types';

export type EventRegistrationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: string;
    title: string;
    isFree: boolean;
    price?: number;
    formSchema?: FormSchemaField[] | null;
  };
  onSubmit: (payload: { customAnswers: Record<string, any> | null; paymentProofUrl: string | null }) => Promise<void>;
  onUploadPaymentProof: (file: File) => Promise<{ imageUrl: string }>;
};

export function EventRegistrationModal({
  isOpen,
  onClose,
  event,
  onSubmit,
  onUploadPaymentProof,
}: EventRegistrationModalProps) {
  const [customAnswers, setCustomAnswers] = useState<Record<string, string | number | boolean>>({});
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when closed
  if (!isOpen) return null;

  const handleFieldChange = (fieldId: string, value: string | number | boolean) => {
    setCustomAnswers((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let paymentProofUrl: string | null = null;

      // Validate and upload payment proof if not free
      if (!event.isFree) {
        if (!paymentFile) {
          toast.error('Bukti pembayaran wajib diunggah');
          setIsSubmitting(false);
          return;
        }

        const uploadResult = await onUploadPaymentProof(paymentFile);
        paymentProofUrl = uploadResult.imageUrl;
      }

      await onSubmit({
        customAnswers: event.formSchema && event.formSchema.length > 0 ? customAnswers : null,
        paymentProofUrl,
      });

      // Cleanup happens on success by parent component via onClose
    } catch (error) {
      // Error handled by parent or toast here
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan saat mendaftar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      title="Pendaftaran Event"
      description={`Silakan lengkapi data untuk mendaftar event: ${event.title}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1 py-2">
        {/* Dynamic Form Schema */}
        {event.formSchema && event.formSchema.length > 0 && (
          <div className="space-y-4 pb-4 border-b border-primary/10 dark:border-slate-700">
            <h3 className="font-semibold text-primary dark:text-slate-200">Informasi Tambahan</h3>
            {event.formSchema.map((field) => (
              <div key={field.id} className="space-y-1">
                <Label htmlFor={field.id} className="text-sm font-medium">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.id}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-100"
                    placeholder={field.placeholder}
                    required={field.required}
                    value={(customAnswers[field.id] as string) || ''}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  />
                ) : field.type === 'select' && field.options ? (
                  <select
                    id={field.id}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-100"
                    required={field.required}
                    value={(customAnswers[field.id] as string) || ''}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  >
                    <option value="" disabled>
                      Pilih salah satu
                    </option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'checkbox' ? (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id={field.id}
                      required={field.required}
                      checked={(customAnswers[field.id] as boolean) || false}
                      onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={field.id} className="text-sm text-primary/70 dark:text-slate-400">
                      Ya, saya setuju
                    </label>
                  </div>
                ) : (
                  <Input
                    id={field.id}
                    type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
                    placeholder={field.placeholder}
                    required={field.required}
                    value={(customAnswers[field.id] as string | number) || ''}
                    onChange={(e) =>
                      handleFieldChange(
                        field.id,
                        field.type === 'number' ? Number(e.target.value) : e.target.value
                      )
                    }
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Payment Proof Field */}
        {!event.isFree && (
          <div className="space-y-4">
            <h3 className="font-semibold text-primary dark:text-slate-200">Pembayaran</h3>
            <p className="text-sm text-primary/70 dark:text-slate-400">
              Total yang harus dibayar: <strong>Rp {event.price?.toLocaleString('id-ID')}</strong>
            </p>
            <div className="space-y-1">
              <Label htmlFor="paymentProof" className="text-sm font-medium">
                Upload Bukti Pembayaran <span className="text-red-500">*</span>
              </Label>
              <Input
                id="paymentProof"
                type="file"
                accept="image/*"
                required
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setPaymentFile(file);
                }}
              />
              <p className="text-xs text-primary/60 dark:text-slate-500 mt-1">
                Format: JPG, PNG. Maksimal 5MB.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            className="dark:border-slate-700 dark:text-slate-300"
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#2E417B] hover:bg-[#1f2a52] text-white dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            {isSubmitting ? 'Memproses...' : 'Kirim Pendaftaran'}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}

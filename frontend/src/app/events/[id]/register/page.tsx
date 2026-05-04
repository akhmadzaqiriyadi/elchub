'use client';

import { useState, FormEvent, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth';
import { useEventDetail, useEventRegistration, usePaymentProofUpload } from '@/features/events';
import { CustomDropdown } from '@/features/management/components/custom-dropdown';

export default function EventRegistrationPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const { token, isAuthenticated } = useAuth();

  const detailQuery = useEventDetail(eventId);
  const registerMutation = useEventRegistration();
  const uploadMutation = usePaymentProofUpload();

  const [customAnswers, setCustomAnswers] = useState<Record<string, string | number | boolean>>({});
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const event = useMemo(() => {
    if (!detailQuery.data) return null;
    const data = detailQuery.data;
    return {
      id: data.id,
      title: data.title,
      isFree: data.isFree,
      price: data.price || 0,
      formSchema: data.formSchema,
    };
  }, [detailQuery.data]);

  // Protect route
  if (!isAuthenticated && !detailQuery.isLoading) {
    router.push(`/login?callbackUrl=/events/${eventId}/register`);
    return null;
  }

  if (detailQuery.isLoading) {
    return (
      <main className="min-h-[calc(100vh-160px)] bg-slate-50 dark:bg-slate-900 py-8 sm:py-12">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-primary/20 dark:border-slate-700 bg-white dark:bg-slate-800 p-12 text-center">
            <p className="text-lg font-semibold text-primary dark:text-slate-100">
              Memuat form pendaftaran...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (detailQuery.isError || !event) {
    return (
      <main className="min-h-[calc(100vh-160px)] bg-slate-50 dark:bg-slate-900 py-8 sm:py-12">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-primary/20 dark:border-slate-700 bg-white dark:bg-slate-800 p-12 text-center">
            <p className="text-lg font-semibold text-primary dark:text-slate-100">
              Event tidak ditemukan
            </p>
            <Button onClick={() => router.push('/events')} className="mt-4 bg-[#2E417B] hover:bg-[#1f2a52] text-white dark:bg-blue-600 dark:hover:bg-blue-700">
              Kembali ke Events
            </Button>
          </div>
        </div>
      </main>
    );
  }

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

        const uploadResult = await uploadMutation.mutateAsync({ file: paymentFile, token });
        paymentProofUrl = uploadResult.imageUrl;
      }

      await registerMutation.mutateAsync({
        eventId,
        token,
        input: {
          customAnswers: event.formSchema && event.formSchema.length > 0 ? customAnswers : null,
          paymentProofUrl,
        },
      });

      toast.success('Berhasil daftar! Cek email untuk konfirmasi.');
      router.push(`/events/${eventId}?success=true`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan saat mendaftar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-160px)] bg-slate-50 dark:bg-slate-900 py-8 sm:py-12">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push(`/events/${eventId}`)}
            className="flex items-center gap-2 text-primary dark:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Detail Event
          </Button>
        </div>

        <div className="rounded-xl border border-primary/15 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="border-b border-primary/15 px-6 py-5 dark:border-slate-700">
            <h1 className="text-2xl font-bold text-primary dark:text-slate-100">
              Pendaftaran Event
            </h1>
            <p className="mt-1 text-sm text-primary/70 dark:text-slate-400">
              Silakan lengkapi data untuk mendaftar event: <span className="font-semibold text-primary dark:text-slate-200">{event.title}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Dynamic Form Schema */}
            {event.formSchema && event.formSchema.length > 0 && (
              <div className="space-y-5 pb-6 border-b border-primary/10 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-primary dark:text-slate-200">Informasi Tambahan</h3>
                <div className="space-y-4">
                  {event.formSchema.map((field: any) => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={field.id} className="text-sm font-medium">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </Label>
                      {field.type === 'textarea' ? (
                        <textarea
                          id={field.id}
                          className="flex min-h-[80px] py-2 w-full rounded-xl border border-primary/20 bg-white px-3 text-sm text-primary outline-none transition-colors placeholder:text-primary/55 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-slate-500 dark:focus:ring-slate-700/60"
                          placeholder={field.placeholder}
                          required={field.required}
                          value={(customAnswers[field.id] as string) || ''}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        />
                      ) : field.type === 'select' && field.options ? (
                        <div className="relative">
                          <CustomDropdown
                            value={(customAnswers[field.id] as string) || ''}
                            onChange={(val) => handleFieldChange(field.id, val)}
                            placeholder="Pilih salah satu"
                            options={field.options.map((opt: string) => ({ value: opt, label: opt }))}
                          />
                          <input
                            type="text"
                            className="absolute bottom-0 left-1/2 -z-10 h-0 w-0 -translate-x-1/2 opacity-0"
                            required={field.required}
                            value={(customAnswers[field.id] as string) || ''}
                            onChange={() => {}}
                            tabIndex={-1}
                          />
                        </div>
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
              </div>
            )}

            {/* Payment Proof Field */}
            {!event.isFree && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary dark:text-slate-200">Pembayaran</h3>
                <div className="rounded-lg bg-primary/5 dark:bg-slate-700/30 p-4 border border-primary/10 dark:border-slate-700">
                  <p className="text-sm text-primary/70 dark:text-slate-400">Total yang harus dibayar</p>
                  <p className="text-2xl font-bold text-primary dark:text-slate-100">Rp {event.price?.toLocaleString('id-ID')}</p>
                </div>
                <div className="space-y-2 mt-4">
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
                  <p className="text-xs text-primary/60 dark:text-slate-500">
                    Format: JPG, PNG. Maksimal 5MB.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t border-primary/10 dark:border-slate-700">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push(`/events/${eventId}`)}
                disabled={isSubmitting}
                className="dark:border-slate-700 dark:text-slate-300"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#2E417B] hover:bg-[#1f2a52] text-white dark:bg-blue-600 dark:hover:bg-blue-700 px-6"
              >
                {isSubmitting ? 'Memproses...' : 'Kirim Pendaftaran'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

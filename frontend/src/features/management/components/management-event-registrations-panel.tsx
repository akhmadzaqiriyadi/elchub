'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

import { useAuth } from '@/features/auth/auth-context';
import { useManagementEventRegistrations, useUpdateRegistration } from '../hooks/use-management-registrations';
import { getManagementEventById } from '../api';
import { useQuery } from '@tanstack/react-query';
import { CustomDropdown } from './custom-dropdown';
import { Pagination } from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import { BaseModal } from '@/components/ui/modal';
import { AgreeModal } from '@/components/ui/agree-modal';
import { DeclineModal } from '@/components/ui/decline-modal';
import { Button } from '@/components/ui/button';

export function ManagementEventRegistrationsPanel({ eventId }: { eventId: string }) {
  const { token } = useAuth();
  
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // Modal states
  const [approvingReg, setApprovingReg] = useState<{ id: string; name: string } | null>(null);
  const [rejectingReg, setRejectingReg] = useState<{ id: string; name: string } | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  
  const { data, isLoading } = useManagementEventRegistrations(eventId, {
    token: token || '',
  });
  
  const { mutate: updateRegistration, isPending: isUpdating } = useUpdateRegistration(eventId, token || '');

  // Fetch event detail to get form schema
  const { data: eventData } = useQuery({
    queryKey: ['management', 'events', 'detail', eventId],
    queryFn: () => getManagementEventById(eventId, token || ''),
    enabled: Boolean(token && eventId),
  });

  const formSchema = eventData?.data?.formSchema as Array<{ id: string; label: string }> | undefined;
  const formFieldMap = (formSchema || []).reduce((acc, field) => {
    acc[field.id] = field.label;
    return acc;
  }, {} as Record<string, string>);

  const rawItems = Array.isArray(data?.data) ? data.data : [];
  
  // Client-side search filtering
  const filteredItems = rawItems.filter(reg => {
    if (!searchInput) return true;
    const s = searchInput.toLowerCase();
    return (
      (reg.user?.name || '').toLowerCase().includes(s) ||
      (reg.user?.email || '').toLowerCase().includes(s)
    );
  });

  // Client-side pagination
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const safePage = Math.min(page, totalPages);
  
  const startIndex = (safePage - 1) * limit;
  const endIndex = startIndex + limit;
  const items = filteredItems.slice(startIndex, endIndex);

  const pagination = totalItems > 0 ? {
    page: safePage,
    limit,
    total: totalItems,
    totalPages,
  } : null;

  const handleApprove = (registrationId: string) => {
    updateRegistration({
      registrationId,
      input: { paymentStatus: 'PAID', statusCode: 'REGISTERED' }
    }, {
      onSuccess: () => setApprovingReg(null)
    });
  };

  const handleReject = (registrationId: string) => {
    updateRegistration({
      registrationId,
      input: { paymentStatus: 'REJECTED', statusCode: 'REJECTED' }
    }, {
      onSuccess: () => setRejectingReg(null)
    });
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Verifikasi Pendaftar
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Kelola dan verifikasi user yang telah mendaftar ke event ini.
          </p>
        </div>
        <Link
          href={`/management/events/${eventId}`}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Event
        </Link>
      </div>

      <div className="mb-5">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Cari nama atau email pendaftar..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-800/60">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Bukti Bayar</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status Pembayaran</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status Registrasi</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-5 text-center text-sm text-slate-500 dark:text-slate-400">Memuat data...</td>
              </tr>
            )}
            {!isLoading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-5 text-center text-sm text-slate-500 dark:text-slate-400">Belum ada pendaftar atau tidak ditemukan</td>
              </tr>
            )}
            {items.map((reg) => (
              <tr key={reg.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{reg.user.name || '-'}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{reg.user.email}</div>
                  {reg.customAnswers && Object.keys(reg.customAnswers).length > 0 && (
                    <div className="mt-3 space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Jawaban Form:</span>
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50 space-y-2">
                        {Object.entries(reg.customAnswers).map(([key, value]) => {
                          const label = formFieldMap[key] || key;
                          return (
                            <div key={key} className="text-xs">
                              <span className="block font-medium text-slate-700 dark:text-slate-300">{label}</span>
                              <span className="mt-0.5 block text-slate-600 dark:text-slate-400">
                                {typeof value === 'boolean' ? (value ? 'Ya' : 'Tidak') : String(value)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {reg.paymentProofUrl ? (
                    <button 
                      onClick={() => setPreviewImageUrl(reg.paymentProofUrl)}
                      className="text-blue-600 hover:underline dark:text-blue-400 font-medium"
                    >
                      Lihat Bukti
                    </button>
                  ) : (
                    <span className="text-slate-500 dark:text-slate-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    reg.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    reg.paymentStatus === 'WAITING_VERIFICATION' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    reg.paymentStatus === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {reg.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    reg.statusCode === 'REGISTERED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    reg.statusCode === 'REJECTED' || reg.statusCode === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {reg.statusCode}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setApprovingReg({ id: reg.id, name: reg.user.name || reg.user.email })}
                      disabled={isUpdating || reg.paymentStatus === 'PAID'}
                      className="rounded-full p-1.5 text-emerald-600 hover:bg-emerald-50 focus:outline-none disabled:opacity-50 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                      title="Setujui"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setRejectingReg({ id: reg.id, name: reg.user.name || reg.user.email })}
                      disabled={isUpdating || reg.statusCode === 'REJECTED'}
                      className="rounded-full p-1.5 text-red-600 hover:bg-red-50 focus:outline-none disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/30"
                      title="Tolak"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center justify-end gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-300">Items per page</span>
            <div className="w-24">
              <CustomDropdown
                value={String(limit)}
                onChange={(nextValue) => {
                  setPage(1);
                  setLimit(Number(nextValue));
                }}
                placeholder="Limit"
                options={[
                  { value: '10', label: '10' },
                  { value: '20', label: '20' },
                  { value: '50', label: '50' },
                ]}
              />
            </div>
          </div>

          <Pagination
            page={pagination.page}
            limit={pagination.limit}
            total={pagination.total}
            totalPages={pagination.totalPages}
            isLoading={isLoading}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Approve Confirmation Modal */}
      <AgreeModal
        isOpen={!!approvingReg}
        onClose={() => setApprovingReg(null)}
        onAgree={() => { if (approvingReg) handleApprove(approvingReg.id); }}
        title="Setujui Pendaftaran"
        message={`Apakah Anda yakin ingin menyetujui pendaftaran untuk ${approvingReg?.name}? User ini akan otomatis terdaftar ke event.`}
        agreeText="Ya, Setujui"
        declineText="Batal"
        isLoading={isUpdating}
      />

      {/* Reject Confirmation Modal */}
      <DeclineModal
        isOpen={!!rejectingReg}
        onClose={() => setRejectingReg(null)}
        onDecline={() => { if (rejectingReg) handleReject(rejectingReg.id); }}
        title="Tolak Pendaftaran"
        message={`Apakah Anda yakin ingin menolak pendaftaran untuk ${rejectingReg?.name}? Tindakan ini tidak dapat dibatalkan.`}
        declineText="Ya, Tolak"
        cancelText="Batal"
        isLoading={isUpdating}
      />

      {/* Image Preview Modal */}
      <BaseModal
        isOpen={!!previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
        title="Bukti Pembayaran"
        className="max-w-2xl"
      >
        <div className="flex flex-col items-center">
          {previewImageUrl && (
            <div className="relative w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900">
              <img 
                src={previewImageUrl} 
                alt="Bukti Pembayaran" 
                className="h-auto w-full max-h-[70vh] object-contain"
              />
            </div>
          )}
          <div className="mt-6 flex w-full justify-end">
            <Button onClick={() => setPreviewImageUrl(null)} variant="secondary">
              Tutup
            </Button>
          </div>
        </div>
      </BaseModal>
    </section>
  );
}

'use client';

import { Input } from '@/components/ui/input';

type EventPricingSectionProps = {
  isFree: boolean;
  price: string;
  onIsFreeChange: (isFree: boolean) => void;
  onPriceChange: (price: string) => void;
  priceError?: string;
};

export function EventPricingSection({
  isFree,
  price,
  onIsFreeChange,
  onPriceChange,
  priceError,
}: EventPricingSectionProps) {
  return (
    <div className="md:col-span-2">
      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 dark:border-slate-700 dark:from-slate-800/50 dark:to-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Pricing
            </label>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
              Tentukan apakah event ini gratis atau berbayar.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onIsFreeChange(true)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                isFree
                  ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-700'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600'
              }`}
            >
              Gratis
            </button>
            <button
              type="button"
              onClick={() => onIsFreeChange(false)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                !isFree
                  ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-700'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600'
              }`}
            >
              Berbayar
            </button>
          </div>
        </div>

        {!isFree && (
          <div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Harga Tiket (IDR) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                Rp
              </span>
              <Input
                type="number"
                min={0}
                value={price}
                onChange={(e) => onPriceChange(e.target.value)}
                placeholder="150000"
                className="h-auto rounded-lg border-slate-300 py-2 pl-10 dark:border-slate-600 dark:bg-slate-800"
              />
            </div>
            {priceError && <p className="mt-1 text-xs text-red-600">{priceError}</p>}
            {price && Number(price) > 0 && (
              <p className="mt-1 text-xs text-slate-400">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(price))}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

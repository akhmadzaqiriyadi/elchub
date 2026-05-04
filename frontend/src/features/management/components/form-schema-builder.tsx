'use client';

import { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { CustomDropdown } from './custom-dropdown';
import type { FormSchemaField, FormSchemaFieldType } from '../types';

const FIELD_TYPE_OPTIONS: { value: FormSchemaFieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Select' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
];

function generateFieldId() {
  return `field_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

type FormSchemaBuilderProps = {
  value: FormSchemaField[];
  onChange: (nextValue: FormSchemaField[]) => void;
  error?: string;
};

export function FormSchemaBuilder({ value, onChange, error }: FormSchemaBuilderProps) {
  const addField = useCallback(() => {
    const newField: FormSchemaField = {
      id: generateFieldId(),
      type: 'text',
      label: '',
      required: false,
    };
    onChange([...(value || []), newField]);
  }, [value, onChange]);

  const removeField = useCallback(
    (index: number) => {
      const next = [...(value || [])];
      next.splice(index, 1);
      onChange(next);
    },
    [value, onChange],
  );

  const updateField = useCallback(
    (index: number, patch: Partial<FormSchemaField>) => {
      const next = [...(value || [])];
      next[index] = { ...next[index], ...patch };
      onChange(next);
    },
    [value, onChange],
  );

  const moveField = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const next = [...value];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      onChange(next);
    },
    [value, onChange],
  );

  const addOption = useCallback(
    (fieldIndex: number) => {
      const field = value[fieldIndex];
      const options = [...(field.options ?? []), ''];
      updateField(fieldIndex, { options });
    },
    [value, updateField],
  );

  const removeOption = useCallback(
    (fieldIndex: number, optionIndex: number) => {
      const field = value[fieldIndex];
      const options = [...(field.options ?? [])];
      options.splice(optionIndex, 1);
      updateField(fieldIndex, { options });
    },
    [value, updateField],
  );

  const updateOption = useCallback(
    (fieldIndex: number, optionIndex: number, optionValue: string) => {
      const field = value[fieldIndex];
      const options = [...(field.options ?? [])];
      options[optionIndex] = optionValue;
      updateField(fieldIndex, { options });
    },
    [value, updateField],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Tambahkan pertanyaan kustom untuk form pendaftaran peserta.
          </p>
        </div>
        <button
          type="button"
          onClick={addField}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
          </svg>
          Add Question
        </button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {(!value || value.length === 0) && (
        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/30">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-slate-400">
              <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Belum ada pertanyaan kustom.
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Klik &quot;Add Question&quot; untuk menambahkan pertanyaan pada form pendaftaran.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {value?.map((field, index) => (
          <div
            key={field.id}
            className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#2E417B] text-[10px] font-bold text-white">
                  {index + 1}
                </span>
                Question {index + 1}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveField(index, 'up')}
                  disabled={index === 0}
                  className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 dark:hover:bg-slate-700"
                  title="Move up"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                    <path fillRule="evenodd" d="M8 14a.75.75 0 0 1-.75-.75V4.56L4.03 7.78a.75.75 0 0 1-1.06-1.06l4.5-4.5a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06L8.75 4.56v8.69A.75.75 0 0 1 8 14Z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => moveField(index, 'down')}
                  disabled={index === value.length - 1}
                  className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 dark:hover:bg-slate-700"
                  title="Move down"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                    <path fillRule="evenodd" d="M8 2a.75.75 0 0 1 .75.75v8.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.22 3.22V2.75A.75.75 0 0 1 8 2Z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => removeField(index)}
                  className="rounded p-1 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                  title="Remove question"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                    <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  value={field.label}
                  onChange={(e) => updateField(index, { label: e.target.value })}
                  placeholder="Contoh: Apa alasan kamu ikut event ini?"
                  className="h-auto rounded-lg border-slate-300 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                />
              </div>

              <div>
                <CustomDropdown
                  value={field.type}
                  onChange={(nextType) => {
                    const patch: Partial<FormSchemaField> = { type: nextType as FormSchemaFieldType };
                    if (nextType !== 'select') {
                      patch.options = undefined;
                    } else if (!field.options || field.options.length === 0) {
                      patch.options = [''];
                    }
                    updateField(index, patch);
                  }}
                  placeholder="Select type"
                  options={FIELD_TYPE_OPTIONS}
                />
              </div>

              <div>
                <Input
                  value={field.placeholder ?? ''}
                  onChange={(e) => updateField(index, { placeholder: e.target.value || undefined })}
                  placeholder="Placeholder text..."
                  className="h-auto rounded-lg border-slate-300 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => updateField(index, { required: !field.required })}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    field.required ? 'bg-[#2E417B]' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                      field.required ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  {field.required ? 'Wajib diisi' : 'Opsional'}
                </span>
              </div>
            </div>

            {field.type === 'select' && (
              <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-900/50">
                <div className="mb-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => addOption(index)}
                    className="text-[11px] font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
                  >
                    + Add Option
                  </button>
                </div>
                <div className="space-y-1.5">
                  {(field.options ?? []).map((option, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-200 text-[10px] font-bold text-slate-500 dark:bg-slate-700">
                        {optIdx + 1}
                      </span>
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, optIdx, e.target.value)}
                        placeholder={`Option ${optIdx + 1}`}
                        className="h-auto flex-1 rounded-md border-slate-300 py-1.5 text-xs dark:border-slate-600 dark:bg-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(index, optIdx)}
                        className="rounded p-1 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                        title="Remove option"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                          <path d="M3.75 7.25a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
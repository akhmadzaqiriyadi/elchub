import { z } from 'zod';

import type { ManagementEventMutationInput, FormSchemaField } from '../types';

export type EventFormState = {
  title: string;
  description: string;
  imageUrl: string;
  meetLink: string;
  typeId: string;
  modeId: string;
  levelId: string;
  statusId: string;
  startAt: string;
  endAt: string;
  registrationOpenAt: string;
  registrationCloseAt: string;
  timezone: string;
  capacity: string;
  isFree: boolean;
  price: string;
  formSchema: FormSchemaField[];
};

export type EventFormErrors = Partial<Record<keyof EventFormState, string>>;

export const initialEventFormState: EventFormState = {
  title: '',
  description: '',
  imageUrl: '',
  meetLink: '',
  typeId: '',
  modeId: '',
  levelId: '',
  statusId: '',
  startAt: '',
  endAt: '',
  registrationOpenAt: '',
  registrationCloseAt: '',
  timezone: 'Asia/Jakarta',
  capacity: '',
  isFree: true,
  price: '',
  formSchema: [],
};

const eventFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required'),
    description: z.string().optional(),
    meetLink: z
      .string()
      .trim()
      .refine((value) => value === '' || isValidHttpUrl(value), {
        message: 'Meet link must be a valid URL',
      }),
    typeId: z.string().min(1, 'Type is required'),
    modeId: z.string().min(1, 'Mode is required'),
    levelId: z.string().optional(),
    statusId: z.string().min(1, 'Status is required'),
    startAt: z.string().optional(),
    endAt: z.string().optional(),
    registrationOpenAt: z.string().optional(),
    registrationCloseAt: z.string().optional(),
    timezone: z.string().trim().min(1, 'Timezone is required'),
    capacity: z
      .string()
      .trim()
      .refine((value) => value === '' || (/^\d+$/.test(value) && Number(value) >= 1), {
        message: 'Capacity must be at least 1 when quota is enabled',
      }),
    isFree: z.boolean(),
    price: z
      .string()
      .trim()
      .refine((value) => value === '' || (/^\d+(\.\d+)?$/.test(value) && Number(value) >= 0), {
        message: 'Price must be a non-negative number',
      }),
  })
  .superRefine((value, ctx) => {
    const startAt = parseDate(value.startAt);
    const endAt = parseDate(value.endAt);
    const registrationOpenAt = parseDate(value.registrationOpenAt);
    const registrationCloseAt = parseDate(value.registrationCloseAt);

    if (value.startAt && !startAt) {
      ctx.addIssue({ code: 'custom', path: ['startAt'], message: 'Start time is invalid' });
    }

    if (value.endAt && !endAt) {
      ctx.addIssue({ code: 'custom', path: ['endAt'], message: 'End time is invalid' });
    }

    if (value.registrationOpenAt && !registrationOpenAt) {
      ctx.addIssue({
        code: 'custom',
        path: ['registrationOpenAt'],
        message: 'Registration open time is invalid',
      });
    }

    if (value.registrationCloseAt && !registrationCloseAt) {
      ctx.addIssue({
        code: 'custom',
        path: ['registrationCloseAt'],
        message: 'Registration close time is invalid',
      });
    }

    if (startAt && endAt && endAt <= startAt) {
      ctx.addIssue({
        code: 'custom',
        path: ['endAt'],
        message: 'End time must be after start time',
      });
    }

    if (registrationOpenAt && registrationCloseAt && registrationOpenAt > registrationCloseAt) {
      ctx.addIssue({
        code: 'custom',
        path: ['registrationOpenAt'],
        message: 'Registration open time must be before registration close time',
      });
    }

    if (registrationCloseAt && startAt && registrationCloseAt > startAt) {
      ctx.addIssue({
        code: 'custom',
        path: ['registrationCloseAt'],
        message: 'Registration close time cannot be after event start time',
      });
    }
  });

function parseDate(value?: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isValidHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function toIsoOrNull(value: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function validateEventForm(input: EventFormState, modeOptions?: Array<{ id: string; slug?: string }>) {
  const result = eventFormSchema.safeParse(input);

  const conditionalErrors: EventFormErrors = {};

  const selectedMode = modeOptions?.find((mode) => mode.id === input.modeId);
  const isOnlineMode = selectedMode?.slug?.toLowerCase() === 'online';

  if (isOnlineMode && !input.meetLink.trim()) {
    conditionalErrors.meetLink = 'Meet link is required for online mode';
  }

  // Price validation: required when isFree is false
  if (!input.isFree) {
    const priceValue = input.price.trim();
    if (!priceValue) {
      conditionalErrors.price = 'Price is required for paid events';
    } else if (Number(priceValue) < 0) {
      conditionalErrors.price = 'Price must be a non-negative number';
    }
  }

  // FormSchema validation: each field must have an id and label
  for (let i = 0; i < input.formSchema.length; i++) {
    const field = input.formSchema[i];
    if (!field.label.trim()) {
      conditionalErrors[`formSchema` as keyof EventFormState] = `Question ${i + 1} must have a label`;
      break;
    }
    if (field.type === 'select' && (!field.options || field.options.filter(Boolean).length < 1)) {
      conditionalErrors[`formSchema` as keyof EventFormState] = `Question ${i + 1} (select) must have at least one option`;
      break;
    }
  }

  if (result.success && Object.keys(conditionalErrors).length === 0) {
    return {
      isValid: true,
      fieldErrors: {} as EventFormErrors,
      summaryErrors: [] as string[],
    };
  }

  const fieldErrors: EventFormErrors = { ...conditionalErrors };

  if (!result.success) {
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (typeof key !== 'string') continue;

      if (!fieldErrors[key as keyof EventFormState]) {
        fieldErrors[key as keyof EventFormState] = issue.message;
      }
    }
  }

  const summaryErrors = Array.from(
    new Set(
      [
        ...Object.values(conditionalErrors).filter((value): value is string => Boolean(value)),
        ...(!result.success ? result.error.issues.map((issue) => issue.message) : []),
      ].filter(Boolean),
    ),
  );

  return {
    isValid: false,
    fieldErrors,
    summaryErrors,
  };
}

export function buildManagementEventPayload(formState: EventFormState): ManagementEventMutationInput {
  const isFree = formState.isFree;
  const price = isFree ? null : (formState.price ? Number(formState.price) : null);
  const formSchema = formState.formSchema?.length > 0 ? formState.formSchema : null;

  return {
    title: formState.title.trim(),
    description: formState.description.trim() || undefined,
    imageUrl: (formState.imageUrl || '').trim() || null,
    meetLink: formState.meetLink.trim() || undefined,
    typeId: formState.typeId,
    modeId: formState.modeId,
    levelId: formState.levelId || null,
    statusId: formState.statusId,
    startAt: toIsoOrNull(formState.startAt),
    endAt: toIsoOrNull(formState.endAt),
    registrationOpenAt: toIsoOrNull(formState.registrationOpenAt),
    registrationCloseAt: toIsoOrNull(formState.registrationCloseAt),
    timezone: formState.timezone.trim() || 'Asia/Jakarta',
    capacity: formState.capacity ? Number(formState.capacity) : null,
    isFree,
    price,
    formSchema,
  };
}

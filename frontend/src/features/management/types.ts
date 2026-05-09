// ============================================================================
// Form Schema Types (Custom Registration Forms)
// ============================================================================

export type FormSchemaFieldType = 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'email';

export type FormSchemaField = {
  id: string;
  type: FormSchemaFieldType;
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
};

// ============================================================================
// Event Types
// ============================================================================

export type EventListItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image: string | null;
  meetLink: string | null;
  startAt: string | null;
  endAt: string | null;
  registrationOpenAt: string | null;
  registrationCloseAt: string | null;
  timezone: string | null;
  capacity: number | null;
  isFree: boolean;
  price: number | null;
  formSchema: FormSchemaField[] | null;
  type: {
    name: string;
    slug: string;
  };
  mode: {
    name: string;
    slug: string;
  };
  level: {
    id: string;
    name: string;
    slug: string;
  } | null;
  status: {
    code: string;
    name: string;
  };
  organizer: {
    id: string;
    name: string | null;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type EventListPayload = {
  success: true;
  data: {
    items: EventListItem[];
    pagination: PaginationMeta;
  };
};

export type MasterDataOption = {
  id: string;
  name: string;
  slug?: string;
  code?: string;
};

export type EventMasterDataPayload = {
  success: true;
  data: {
    types: MasterDataOption[];
    topics: MasterDataOption[];
    modes: MasterDataOption[];
    levels: MasterDataOption[];
    eventStatuses: MasterDataOption[];
    registrationStatuses: MasterDataOption[];
  };
};

export type EventListParams = {
  token?: string;
  q?: string;
  typeSlug?: string;
  modeSlug?: string;
  statusCode?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'startAt' | 'endAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
};

export type ManagementEventMutationInput = {
  title: string;
  description?: string;
  imageUrl?: string | null;
  meetLink?: string;
  typeId: string;
  modeId: string;
  levelId?: string | null;
  statusId: string;
  startAt?: string | null;
  endAt?: string | null;
  registrationOpenAt?: string | null;
  registrationCloseAt?: string | null;
  timezone?: string;
  capacity?: number | null;
  isFree?: boolean;
  price?: number | null;
  formSchema?: FormSchemaField[] | null;
};

export type ManagementEventDetailPayload = {
  success: true;
  data: EventListItem;
};

export type ManagementEventMutationPayload = {
  success: boolean;
  message: string;
};

export type MasterDataKind = 'types' | 'topics' | 'modes' | 'levels' | 'statuses';

export type MasterDataRow = {
  id: string;
  name: string;
  slug: string | null;
  code: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type MasterDataListPayload = {
  success: true;
  data: {
    items: MasterDataRow[];
    pagination: PaginationMeta;
  };
};

export type MasterDataListParams = {
  token: string;
  q?: string;
  page?: number;
  limit?: number;
};

export type MasterDataMutationInput = {
  name?: string;
  slug?: string;
  code?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type MasterDataMutationPayload = {
  success: boolean;
  message: string;
};

// ============================================================================
// Users Management Types
// ============================================================================

export type UserRole = 'USER' | 'ORGANIZER' | 'MENTOR' | 'ADMIN';

export type UserListItem = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  isActive: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserListPayload = {
  success: true;
  data: {
    items: UserListItem[];
    pagination: PaginationMeta;
  };
};

export type UserDetailPayload = {
  success: true;
  data: UserListItem;
};

export type UserListParams = {
  token?: string;
  q?: string;
  role?: UserRole;
  isActive?: boolean;
  page?: number;
  limit?: number;
};

export type CreateUserInput = {
  email: string;
  password: string;
  name?: string;
  role?: UserRole;
  isActive?: boolean;
};

export type UpdateUserInput = {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
};

export type UserMutationPayload = {
  success: boolean;
  message?: string;
  data?: UserListItem;
};

// ============================================================================
// Event Registrations Management Types
// ============================================================================

export type ManagementRegistrationItem = {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  status: string;
  statusCode: string;
  paymentStatus: string;
  paymentProofUrl: string | null;
  customAnswers: Record<string, any> | null;
  createdAt: string;
};

export type ManagementRegistrationListPayload = {
  success: true;
  data: ManagementRegistrationItem[];
};

export type ManagementRegistrationListParams = {
  token: string;
  q?: string;
  page?: number;
  limit?: number;
};

export type ManagementRegistrationUpdateInput = {
  statusCode?: string;
  paymentStatus?: string;
};

export type ManagementRegistrationMutationPayload = {
  success: boolean;
  message?: string;
};

// ============================================================================
// LMS / Syllabus Types
// ============================================================================

export type MaterialType = 'VIDEO' | 'ARTICLE' | 'DOCUMENT' | 'QUIZ';

export type MaterialItem = {
  id: string;
  sectionId: string;
  title: string;
  type: MaterialType;
  content: string | null;
  videoUrl: string | null;
  fileUrl: string | null;
  durationMin: number | null;
  isPreview: boolean;
  order: number;
  userProgress?: {
    isCompleted: boolean;
    completedAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type SectionItem = {
  id: string;
  eventId: string;
  title: string;
  order: number;
  isActive: boolean;
  materials: MaterialItem[];
  createdAt: string;
  updatedAt: string;
};

export type SectionMutationInput = {
  title: string;
  order?: number;
  isActive?: boolean;
};

export type MaterialMutationInput = {
  title: string;
  type: MaterialType;
  content?: string | null;
  videoUrl?: string | null;
  fileUrl?: string | null;
  durationMin?: number | null;
  isPreview?: boolean;
  order?: number;
};

export type SyllabusPayload = {
  success: true;
  data: SectionItem[];
};


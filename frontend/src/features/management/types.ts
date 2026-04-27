export type EventListItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  meetLink: string | null;
  startAt: string | null;
  endAt: string | null;
  registrationOpenAt: string | null;
  registrationCloseAt: string | null;
  timezone: string | null;
  capacity: number | null;
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
};

export type ManagementEventMutationInput = {
  title: string;
  description?: string;
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

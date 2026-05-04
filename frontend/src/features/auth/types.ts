export type UserRole = 'USER' | 'ORGANIZER' | 'MENTOR' | 'ADMIN' | (string & {});

export type AuthUser = {
  id: string;
  name: string | null;
  email: string;
  profilePhotoUrl?: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type AuthSuccessPayload = {
  success: true;
  data: {
    user: AuthUser;
    accessToken: string;
  };
};

export type AuthMePayload = {
  success: true;
  data: {
    user: AuthUser;
    appUrl: string;
  };
};

export type AuthLogoutPayload = {
  success: true;
  message: string;
};

export type AuthForgotPasswordPayload = {
  success: true;
  message: string;
};

export type AuthResetPasswordPayload = {
  success: true;
  message: string;
};
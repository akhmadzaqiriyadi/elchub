"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ApiClientError } from "@/lib/api-client";

import {
  forgotPassword,
  getMe,
  login,
  logout,
  register,
  resetPassword,
} from "../api";
import {
  authTokenCookieKey,
  authTokenStorageKey,
  initialAuthFormErrors,
  initialRecoveryFormErrors,
} from "../auth-panel.constants";
import {
  readBackendFieldErrors,
  readBackendRecoveryErrors,
  readCookieToken,
  validateAuthForm,
  validateForgotPasswordForm,
  validateResetPasswordForm,
} from "../auth-panel.utils";
import type {
  AuthFormErrors,
  Mode,
  RecoveryFormErrors,
} from "../auth-panel.types";
import type { AuthUser } from "../types";

export function useAuthPanel() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [errors, setErrors] = useState<AuthFormErrors>(initialAuthFormErrors);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetTokenInput, setResetTokenInput] = useState("");
  const [resetPasswordInput, setResetPasswordInput] = useState("");
  const [resetConfirmPasswordInput, setResetConfirmPasswordInput] =
    useState("");
  const [recoveryErrors, setRecoveryErrors] = useState<RecoveryFormErrors>(
    initialRecoveryFormErrors,
  );

  const title = useMemo(() => {
    if (mode === "login") {
      return "Login ke backend";
    }

    if (mode === "register") {
      return "Buat akun baru";
    }

    return "Pemulihan password";
  }, [mode]);

  const meQuery = useQuery<AuthUser>({
    queryKey: ["auth", "me", token],
    queryFn: async () => {
      const response = await getMe(token);
      return response.data.user;
    },
    enabled: Boolean(token),
    staleTime: 2 * 60_000,
    gcTime: 10 * 60_000,
  });

  const registerMutation = useMutation({
    mutationFn: register,
  });

  const loginMutation = useMutation({
    mutationFn: login,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPassword,
  });

  const resetPasswordMutation = useMutation({
    mutationFn: resetPassword,
  });

  const isSubmitting = registerMutation.isPending || loginMutation.isPending;
  const isCheckingSession = meQuery.isFetching;
  const me = meQuery.data ?? null;

  useEffect(() => {
    const localToken =
      typeof window !== "undefined"
        ? (localStorage.getItem(authTokenStorageKey) ?? "")
        : "";
    const cookieToken = readCookieToken();
    const restoredToken = localToken || cookieToken;

    if (restoredToken) {
      setToken(restoredToken);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const tokenFromQuery = params.get("token");

    if (tokenFromQuery) {
      setResetTokenInput(tokenFromQuery);
      setMode("recovery");
    }
  }, []);

  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setErrors(initialAuthFormErrors);
  }

  function resetRecoveryForm() {
    setForgotEmail("");
    setResetTokenInput("");
    setResetPasswordInput("");
    setResetConfirmPasswordInput("");
    setRecoveryErrors(initialRecoveryFormErrors);
  }

  function persistToken(nextToken: string) {
    setToken(nextToken);
    localStorage.setItem(authTokenStorageKey, nextToken);
    document.cookie = `${authTokenCookieKey}=${encodeURIComponent(nextToken)}; Path=/; Max-Age=900; SameSite=Lax`;
  }

  function clearSession() {
    setToken("");
    localStorage.removeItem(authTokenStorageKey);
    document.cookie = `${authTokenCookieKey}=; Path=/; Max-Age=0; SameSite=Lax`;
    queryClient.removeQueries({ queryKey: ["auth"] });
  }

  function applyAuthSuccess(
    nextToken: string,
    user: AuthUser,
    successMessage: string,
  ) {
    persistToken(nextToken);
    queryClient.setQueryData(["auth", "me", nextToken], user);
    toast.success(successMessage);
    resetForm();
  }

  function applyAuthError(error: unknown) {
    if (error instanceof ApiClientError) {
      const fieldErrors = readBackendFieldErrors(error.payload);
      const hasFieldErrors = Object.values(fieldErrors).some(
        (item) => item.length > 0,
      );

      if (hasFieldErrors) {
        setErrors(fieldErrors);
      }
    }

    const message =
      error instanceof Error ? error.message : "Gagal memproses auth.";
    toast.error(message);
  }

  function applyRecoveryError(error: unknown) {
    if (error instanceof ApiClientError) {
      const fieldErrors = readBackendRecoveryErrors(error.payload);
      const hasFieldErrors = Object.values(fieldErrors).some(
        (item) => item.length > 0,
      );

      if (hasFieldErrors) {
        setRecoveryErrors(fieldErrors);
      }
    }

    const message =
      error instanceof Error
        ? error.message
        : "Gagal memproses reset password.";
    toast.error(message);
  }

  function validate() {
    const nextErrors = validateAuthForm({
      mode,
      name,
      email,
      password,
      confirmPassword,
    });

    setErrors(nextErrors);

    return Object.values(nextErrors).every((item) => item.length === 0);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setErrors(initialAuthFormErrors);

    try {
      if (mode === "register") {
        const response = await registerMutation.mutateAsync({
          name: name.trim(),
          email: email.trim(),
          password,
        });

        applyAuthSuccess(
          response.data.accessToken,
          response.data.user,
          "Register berhasil. Kamu sudah login otomatis.",
        );
      } else {
        const response = await loginMutation.mutateAsync({
          email: email.trim(),
          password,
        });

        applyAuthSuccess(
          response.data.accessToken,
          response.data.user,
          "Login berhasil.",
        );
      }
    } catch (error) {
      applyAuthError(error);
    }
  }

  async function checkSession() {
    if (!token) {
      toast.warning("Token belum ada. Login atau register dulu.");
      return;
    }

    const result = await meQuery.refetch();

    if (result.error) {
      const message =
        result.error instanceof Error
          ? result.error.message
          : "Session check gagal.";
      toast.error(message);
      return;
    }

    if (result.data) {
      toast.success("Session valid di backend.");
    }
  }

  async function onLogout() {
    if (!token) {
      clearSession();
      toast.info("Session lokal sudah dibersihkan.");
      return;
    }

    try {
      await logoutMutation.mutateAsync(token);
      clearSession();
      toast.success("Logout berhasil.");
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        clearSession();
        toast.info("Session sudah tidak valid. Token lokal dibersihkan.");
        return;
      }

      const message = error instanceof Error ? error.message : "Gagal logout.";
      toast.error(message);
    }
  }

  async function onForgotPasswordSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const nextErrors = validateForgotPasswordForm(forgotEmail);
    setRecoveryErrors(nextErrors);

    if (Object.values(nextErrors).some((item) => item.length > 0)) {
      return;
    }

    try {
      const response = await forgotPasswordMutation.mutateAsync(
        forgotEmail.trim(),
      );
      toast.success(response.message);
      setForgotEmail("");
      setRecoveryErrors((previous) => ({ ...previous, forgotEmail: "" }));
    } catch (error) {
      applyRecoveryError(error);
    }
  }

  async function onResetPasswordSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const nextErrors = validateResetPasswordForm({
      token: resetTokenInput,
      password: resetPasswordInput,
      confirmPassword: resetConfirmPasswordInput,
    });

    setRecoveryErrors(nextErrors);

    if (Object.values(nextErrors).some((item) => item.length > 0)) {
      return;
    }

    try {
      const response = await resetPasswordMutation.mutateAsync({
        token: resetTokenInput.trim(),
        password: resetPasswordInput,
      });

      toast.success(response.message);
      resetRecoveryForm();
    } catch (error) {
      applyRecoveryError(error);
    }
  }

  return {
    mode,
    setMode,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    token,
    errors,
    setErrors,
    title,
    me,
    isSubmitting,
    isCheckingSession,
    isLoggingOut: logoutMutation.isPending,
    onSubmit,
    checkSession,
    onLogout,
    forgotEmail,
    setForgotEmail,
    resetTokenInput,
    setResetTokenInput,
    resetPasswordInput,
    setResetPasswordInput,
    resetConfirmPasswordInput,
    setResetConfirmPasswordInput,
    recoveryErrors,
    setRecoveryErrors,
    isSubmittingForgot: forgotPasswordMutation.isPending,
    isSubmittingReset: resetPasswordMutation.isPending,
    onForgotPasswordSubmit,
    onResetPasswordSubmit,
  };
}

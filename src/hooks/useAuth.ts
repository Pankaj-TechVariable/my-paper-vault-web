import { useMutation } from '@tanstack/react-query';
import {
  signUp,
  signIn,
  resendVerificationCode,
  verifyUserCode,
  changePassword,
  signOutAll,
  forgotPassword,
  resetPassword,
  type SignupResponse,
  type SigninResponse,
  type SignoutResponse,
  type SignupVerifyResponse,
  type ResendSignupCodeResponse,
  type ChangePasswordResponse,
  type SignoutAllResponse,
  type ForgotPasswordResponse,
  type ResetPasswordResponse,
  signOut,
} from '@/api/endpoints/auth';
import { useAuthStore } from '@/store/authStore';
import { AppError } from '@/errors/AppError';
import { handleApiError } from '@/errors/errorHandler';
import { toast } from '@/utils/toast';

export const useSignIn = () => {
  const setSession = useAuthStore(state => state.setSession);

  return useMutation<
    SigninResponse,
    AppError,
    { email: string; password: string }
  >({
    mutationFn: signIn,
    onSuccess: data => {
      if (!data.success) {
        return toast.error('Something went wrong', 'Please try again.');
      }
      const { user, ...tokens } = data.data;
      setSession({ tokens, user });
    },
    onError: handleApiError,
  });
};

export const useSignOut = () => {
  const clearSession = useAuthStore(state => state.clearSession);

  return useMutation<SignoutResponse, AppError, { refresh_token: string }>({
    mutationFn: signOut,
    onSuccess: data => {
      if (!data.success) {
        return toast.error('Something went wrong', 'Please try again.');
      }
      clearSession();
    },
    onError: handleApiError,
  });
};

export const useSignUp = () => {
  const { setTempMail, setTempPassword } = useAuthStore();

  return useMutation<
    SignupResponse,
    AppError,
    { email: string; password: string; name: string }
  >({
    mutationFn: signUp,
    onSuccess: (data, { email, password }) => {
      if (!data.success) {
        return toast.error('Something went wrong', 'Please try again.');
      }
      toast.success(
        data?.message ||
          'Account created successfully, please verify your email.',
      );
      setTempMail(email);
      setTempPassword(password);
    },
    onError: handleApiError,
  });
};

export const useResendCode = () => {
  return useMutation<ResendSignupCodeResponse, AppError, { email: string }>({
    mutationFn: resendVerificationCode,
    onSuccess: data => {
      if (!data.success) {
        return toast.error('Something went wrong', 'Please try again.');
      }
      toast.success(
        data?.message ||
          'Verification code sent to your email, please verify your code.',
      );
    },
    onError: handleApiError,
  });
};

export const useForgotPassword = () => {
  return useMutation<ForgotPasswordResponse, AppError, { email: string }>({
    mutationFn: forgotPassword,
    onError: handleApiError,
  });
};

export const useResetPassword = () => {
  return useMutation<
    ResetPasswordResponse,
    AppError,
    { email: string; code: string; new_password: string }
  >({
    mutationFn: resetPassword,
    onSuccess: data => {
      if (!data.success) {
        return toast.error('Something went wrong', 'Please try again.');
      }
      toast.success(data?.message || 'Password reset successfully.');
    },
    onError: handleApiError,
  });
};

export const useSignOutAll = () => {
  const clearSession = useAuthStore(state => state.clearSession);

  return useMutation<SignoutAllResponse, AppError, void>({
    mutationFn: signOutAll,
    onSuccess: data => {
      if (!data.success) {
        return toast.error('Something went wrong', 'Please try again.');
      }
      clearSession();
    },
    onError: handleApiError,
  });
};

export const useChangePassword = () => {
  const clearSession = useAuthStore(state => state.clearSession);

  return useMutation<
    ChangePasswordResponse,
    AppError,
    { old_password: string; new_password: string }
  >({
    mutationFn: changePassword,
    onSuccess: async data => {
      if (!data.success) {
        return toast.error('Something went wrong', 'Please try again.');
      }
      toast.success(data?.message || 'Password changed successfully.');
      await signOutAll().catch(() => null);
      clearSession();
    },
    onError: handleApiError,
  });
};

export const useVerifyUserCode = () => {
  const setSession = useAuthStore(state => state.setSession);

  return useMutation<
    SignupVerifyResponse,
    AppError,
    { email: string; code: string; password?: string }
  >({
    mutationFn: verifyUserCode,
    onSuccess: data => {
      if (!data.success) {
        return toast.error('Something went wrong', 'Please try again.');
      }
      if (data.data) {
        const { user, ...tokens } = data.data;
        setSession({ tokens, user });
      }
      toast.success(data?.message || 'User verified successfully.');
    },
    onError: handleApiError,
  });
};

import { create } from "zustand";

interface AuthTokens {
  access_token: string;
  id_token: string;
  expires_in: number;
  token_type: string;
  // refresh_token is stored as httpOnly cookie by the server — never held in JS
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  gender: string | null;
  phone_number: string | null;
  age: number | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthSession {
  tokens: AuthTokens;
  user: AuthUser;
}

interface AuthState {
  session: AuthSession | null;
  isLoading: boolean;
  tempPassword: string | null;
  tempMail: string | null;
  setSession: (session: AuthSession) => void;
  setTempPassword: (tempPassword: string) => void;
  setTempMail: (tempMail: string) => void;
  loadSession: () => void;
  clearSession: () => void;
  clearTemp: () => void;
}

const STORAGE_KEY = "auth_session";

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoading: true,
  tempPassword: null,
  tempMail: null,

  setSession: (session) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    set({ session });
  },

  setTempPassword: (tempPassword) => {
    sessionStorage.setItem("temp_password", tempPassword);
    set({ tempPassword });
  },

  setTempMail: (tempMail) => {
    sessionStorage.setItem("temp_mail", tempMail);
    set({ tempMail });
  },

  loadSession: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: AuthSession = JSON.parse(raw);
        if (parsed?.tokens?.access_token) {
          set({ session: parsed });
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    const tempMail = sessionStorage.getItem("temp_mail");
    const tempPassword = sessionStorage.getItem("temp_password");
    set({ isLoading: false, tempMail, tempPassword });
  },

  clearSession: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ session: null });
  },

  clearTemp: () => {
    sessionStorage.removeItem("temp_mail");
    sessionStorage.removeItem("temp_password");
    set({ tempMail: null, tempPassword: null });
  },
}));

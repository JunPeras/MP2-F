import { create } from "zustand";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  deleteUser,
} from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import { apiFetch, apiPost } from "../lib/api";

export interface CustomUser extends User {
  firstName?: string;
  lastName?: string;
  username?: string;
  title?: string;
  bio?: string;
  phone?: string;
  location?: string;
}

interface AuthState {
  user: CustomUser | null;
  profileComplete: boolean;
  loading: boolean;
  initialized: boolean;
  init: () => () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    username: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  setProfileComplete: (value: boolean) => void;
}

function mapFirebaseError(error: any): Error {
  const code = error?.code || "";
  switch (code) {
    case "auth/invalid-email":
      return new Error("Correo electrónico inválido");
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return new Error("Correo o contraseña incorrectos");
    case "auth/email-already-in-use":
      return new Error("El correo ya está registrado");
    case "auth/weak-password":
      return new Error("La contraseña es demasiado débil");
    case "auth/too-many-requests":
      return new Error("Demasiados intentos. Intenta más tarde.");
    default:
      return new Error(error?.message || "Error de autenticación");
  }
}

async function fetchProfileState(): Promise<boolean> {
  try {
    const res = await apiFetch("/api/users/me");
    if (res.ok) {
      const data = await res.json();
      return data.profileComplete === true;
    }
  } catch (e) {
    console.error("fetchProfileState error:", e);
  }
  return false;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profileComplete: false,
  loading: false,
  initialized: false,

  setProfileComplete: (value: boolean) => set({ profileComplete: value }),

  init: () => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        set({ user, loading: true });
        const profileComplete = await fetchProfileState();
        set({ profileComplete, loading: false, initialized: true });
      } else {
        set({ user: null, profileComplete: false, loading: false, initialized: true });
      }
    });
    return unsubscribe;
  },

  signInWithGoogle: async () => {
    set({ loading: true });
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const profileComplete = await fetchProfileState();
      set({ user: result.user, profileComplete, loading: false });
    } catch (error: any) {
      set({ loading: false });
      throw mapFirebaseError(error);
    }
  },

  signInWithEmail: async (email, password) => {
    set({ loading: true });
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const profileComplete = await fetchProfileState();
      set({ user: result.user, profileComplete, loading: false });
    } catch (error: any) {
      set({ loading: false });
      throw mapFirebaseError(error);
    }
  },

  registerWithEmail: async (email, password, firstName, lastName, username) => {
    set({ loading: true });
    let firebaseUser: User | null = null;
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      firebaseUser = result.user;

      const res = await apiPost("/api/users/register", { firstName, lastName, username });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // Limpiar usuario huérfano
        if (firebaseUser) {
          try {
            await deleteUser(firebaseUser);
          } catch (delErr) {
            console.error("No se pudo borrar usuario huérfano:", delErr);
          }
        }
        await signOut(auth);

        if (res.status === 409) {
          throw new Error(data.message || "El username no está disponible");
        }
        if (res.status === 400) {
          throw new Error(data.message || "Datos inválidos");
        }
        throw new Error(data.message || "Error al registrar usuario");
      }

      set({ user: firebaseUser, profileComplete: true, loading: false });
    } catch (error: any) {
      if (firebaseUser) {
        try {
          await deleteUser(firebaseUser);
        } catch {}
        await signOut(auth);
      }
      set({ user: null, profileComplete: false, loading: false });
      throw mapFirebaseError(error);
    }
  },

  logout: async () => {
    set({ loading: true });
    await signOut(auth);
    set({ user: null, profileComplete: false, loading: false });
  },
}));

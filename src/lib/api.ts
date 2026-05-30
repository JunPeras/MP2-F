/**
 * Wrapper para fetch que obtiene el token fresco de Firebase
 * antes de cada petición y adjunta automáticamente el header.
 */
import { auth } from "../config/firebase";
import { getIdToken } from "firebase/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export const apiFetch = async (path: string, options?: RequestInit): Promise<Response> => {
  const user = auth.currentUser;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };

  if (user) {
    try {
      const token = await getIdToken(user, true);
      headers["Authorization"] = `Bearer ${token}`;
    } catch {
      // Si falla obtener token, seguimos sin auth header
    }
  }

  const url = `${API_BASE_URL}${path}`;
  return fetch(url, { ...options, headers });
};

export const apiPost = (path: string, body: unknown): Promise<Response> =>
  apiFetch(path, { method: "POST", body: JSON.stringify(body) });

export const apiGet = (path: string): Promise<Response> =>
  apiFetch(path, { method: "GET" });

import { useState, useEffect, useRef } from "react";
import { apiGet } from "../lib/api";

interface UseUsernameAvailabilityResult {
  checking: boolean;
  available: boolean | null;
  error: string;
}

export function useUsernameAvailability(
  username: string,
  delayMs = 500
): UseUsernameAvailabilityResult {
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const lastRequestRef = useRef(0);

  useEffect(() => {
    setChecking(false);
    setAvailable(null);
    setError("");

    const trimmed = username.trim();
    if (!trimmed) {
      return;
    }

    // Solo minúsculas, números y guiones bajos, mínimo 3 caracteres
    const valid = /^[a-z0-9_]{3,}$/.test(trimmed);
    if (!valid) {
      setError("El username solo puede contener minúsculas, números y guiones bajos");
      return;
    }

    const timer = setTimeout(async () => {
      setChecking(true);
      const requestId = ++lastRequestRef.current;

      try {
        const res = await apiGet(
          `/api/users/check-username?username=${encodeURIComponent(trimmed)}`
        );
        if (requestId !== lastRequestRef.current) return;

        if (!res.ok) {
          setAvailable(null);
          setError("No se pudo verificar la disponibilidad");
          return;
        }

        const data = await res.json();
        if (data.available === true) {
          setAvailable(true);
          setError("");
        } else {
          setAvailable(false);
          setError("El username no está disponible");
        }
      } catch {
        if (requestId === lastRequestRef.current) {
          setAvailable(null);
          setError("No se pudo verificar la disponibilidad");
        }
      } finally {
        if (requestId === lastRequestRef.current) {
          setChecking(false);
        }
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [username, delayMs]);

  return { checking, available, error };
}
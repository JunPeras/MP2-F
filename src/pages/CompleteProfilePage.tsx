import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { completeProfileSchema } from "../schemas/user.schema";
import { apiPost } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";
import { useUsernameAvailability } from "../hooks/useUsernameAvailability";

export default function CompleteProfilePage() {
  const [username, setUsername] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const navigate = useNavigate();
  const { user, loading, setProfileComplete, logout } = useAuthStore();

  const { checking, available, error: usernameError } = useUsernameAvailability(username);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError("");
    setGeneralError("");

    const parseResult = completeProfileSchema.safeParse({ username });
    if (!parseResult.success) {
      setFieldError(parseResult.error.issues[0].message);
      return;
    }

    if (available === false || usernameError) {
      setFieldError(usernameError || "El username no está disponible");
      return;
    }

    try {
      const res = await apiPost("/api/users/complete-profile", { username });

      if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        setFieldError(data.message || "El username no está disponible");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setGeneralError(data.message || "Error al completar el perfil");
        return;
      }

      setProfileComplete(true);
      navigate("/dashboard");
    } catch (err: any) {
      setGeneralError(err.message || "Error de red. Intenta de nuevo.");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Completar perfil</h1>

      <div style={{ marginBottom: "1rem", padding: "1rem", border: "1px solid #ccc" }}>
        <p>
          <strong>Nombre:</strong> {user?.displayName || "No disponible"}
        </p>
        <p>
          <strong>Correo:</strong> {user?.email || "No disponible"}
        </p>
      </div>

      <p>Para finalizar tu registro con Google, elige un nombre de usuario único.</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setFieldError("");
            }}
            placeholder="solo_minusculas_123"
            disabled={loading}
          />
          {checking && <p style={{ color: "gray" }}>Verificando disponibilidad...</p>}
          {available === true && !usernameError && !fieldError && (
            <p style={{ color: "green" }}>Username disponible</p>
          )}
          {(fieldError || usernameError) && (
            <p style={{ color: "red" }}>{fieldError || usernameError}</p>
          )}
        </div>

        <button type="submit" disabled={loading || checking}>
          {loading ? "Guardando..." : "Finalizar Registro y Confirmar Perfil"}
        </button>
      </form>

      <div style={{ marginTop: "1rem" }}>
        <button
          type="button"
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
          disabled={loading}
        >
          Cerrar sesión y volver al inicio de sesión
        </button>
      </div>

      {generalError && <p style={{ color: "red" }}>{generalError}</p>}
    </div>
  );
}

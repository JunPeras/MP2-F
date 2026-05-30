import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { completeProfileSchema } from "../schemas/user.schema";
import { apiPost } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";
import { useUsernameAvailability } from "../hooks/useUsernameAvailability";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .sr-root {
    min-height: 100vh;
    background: #0a0a0a;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 16px;
    font-family: 'Outfit', sans-serif;
    color: #e5e5e5;
  }
  .sr-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 32px; }
  .sr-logo-icon {
    width: 44px; height: 44px;
    background: #111; border: 1.5px solid #2a5c2a; border-radius: 10px;
    display: flex; align-items: center; justify-content: center; color: #4caf50;
  }
  .sr-logo-text { font-size: 22px; font-weight: 600; color: #f0f0f0; }

  .sr-card {
    background: #111111;
    border: 1px solid #1e1e1e;
    border-radius: 16px;
    padding: 40px 44px;
    width: 100%;
    max-width: 400px;
  }
  .sr-card-title { font-size: 26px; font-weight: 700; color: #fff; text-align: center; margin-bottom: 6px; }
  .sr-card-subtitle { font-size: 14px; color: #666; text-align: center; margin-bottom: 28px; }

  .sr-field { margin-bottom: 20px; }
  .sr-label { display: block; font-size: 14px; color: #ccc; margin-bottom: 7px; font-weight: 500; }
  .sr-input-wrap { position: relative; display: flex; align-items: center; }
  .sr-input-icon { position: absolute; left: 13px; color: #555; display: flex; align-items: center; pointer-events: none; }
  .sr-input {
    width: 100%;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 8px;
    padding: 11px 12px 11px 38px;
    font-size: 14px;
    font-family: 'Outfit', sans-serif;
    color: #e5e5e5;
    outline: none;
    transition: border-color 0.2s;
  }
  .sr-input::placeholder { color: #444; }
  .sr-input:focus { border-color: #3a7d3a; }
  .sr-input.sr-input-error { border-color: #6b2020; }

  .sr-field-msg { font-size: 12px; margin-top: 5px; display: flex; align-items: center; gap: 4px; }
  .sr-field-msg.error { color: #e05454; }
  .sr-field-msg.success { color: #4caf50; }
  .sr-field-msg.checking { color: #888; }

  .sr-general-error {
    background: #1f0f0f; border: 1px solid #5c1a1a;
    border-radius: 8px; padding: 10px 14px;
    font-size: 13px; color: #e05454; margin-bottom: 16px;
  }

  .sr-btn-primary {
    width: 100%; background: #4caf50; border: none; border-radius: 8px;
    padding: 12px; font-size: 15px; font-family: 'Outfit', sans-serif;
    font-weight: 600; color: #fff; cursor: pointer; transition: background 0.2s; margin-bottom: 16px;
  }
  .sr-btn-primary:hover:not(:disabled) { background: #43a047; }
  .sr-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  .sr-btn-ghost {
    width: 100%; background: transparent; border: 1px solid #2a2a2a; border-radius: 8px;
    padding: 11px; font-size: 14px; font-family: 'Outfit', sans-serif;
    color: #888; cursor: pointer; transition: background 0.2s, border-color 0.2s;
  }
  .sr-btn-ghost:hover:not(:disabled) { background: #1a1a1a; border-color: #383838; color: #aaa; }
  .sr-btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const BookOpenIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);
const AtIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>
  </svg>
);

export default function CompleteProfilePage() {
  const [username, setUsername] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const navigate = useNavigate();
  const { loading, setProfileComplete, logout } = useAuthStore();

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
    <>
      <style>{styles}</style>
      <div className="sr-root">
        <div className="sr-logo">
          <div className="sr-logo-icon"><BookOpenIcon /></div>
          <span className="sr-logo-text">StudyRoom</span>
        </div>

        <div className="sr-card">
          <h1 className="sr-card-title">Finaliza tu perfil</h1>
          <p className="sr-card-subtitle">Regístrate para empezar a colaborar</p>

          {generalError && <div className="sr-general-error">{generalError}</div>}

          <form onSubmit={handleSubmit}>
            <div className="sr-field">
              <label className="sr-label" htmlFor="username">Nombre de usuario</label>
              <div className="sr-input-wrap">
                <span className="sr-input-icon"><AtIcon /></span>
                <input
                  id="username"
                  className={`sr-input${fieldError || usernameError ? " sr-input-error" : ""}`}
                  type="text"
                  placeholder="usuario"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setFieldError(""); }}
                  disabled={loading}
                />
              </div>
              {checking && <span className="sr-field-msg checking">Verificando disponibilidad...</span>}
              {available === true && !usernameError && !fieldError && (
                <span className="sr-field-msg success">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  Username disponible
                </span>
              )}
              {(fieldError || usernameError) && (
                <span className="sr-field-msg error">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                  {fieldError || usernameError}
                </span>
              )}
            </div>

            <button className="sr-btn-primary" type="submit" disabled={loading || checking}>
              {loading ? "Guardando..." : "Avanzar"}
            </button>
          </form>

          <button
            className="sr-btn-ghost"
            type="button"
            onClick={async () => { await logout(); navigate("/login"); }}
            disabled={loading}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
}
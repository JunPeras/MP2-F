import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuthStore } from "../store/useAuthStore";
import { useUsernameAvailability } from "../hooks/useUsernameAvailability";

const registerFormSchema = z.object({
  firstName: z.string().min(1, "El nombre es obligatorio"),
  lastName: z.string().min(1, "El apellido es obligatorio"),
  username: z
    .string()
    .min(3, "El username debe tener al menos 3 caracteres")
    .max(20, "El username debe tener máximo 20 caracteres")
    .regex(/^[a-z0-9_]+$/, "Solo minúsculas, números y guiones bajos"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string().min(1, "Debes confirmar la contraseña"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

// ─── Icons ────────────────────────────────────────────────────────────────────
const BookOpenIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const AtIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>
  </svg>
);
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>
  </svg>
);
const CheckCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const XCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
  </svg>
);
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

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

  .sr-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 28px;
  }
  .sr-logo-icon {
    width: 44px; height: 44px;
    background: #111;
    border: 1.5px solid #2a5c2a;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: #4caf50;
  }
  .sr-logo-text { font-size: 22px; font-weight: 600; color: #f0f0f0; }

  .sr-card {
    background: #111111;
    border: 1px solid #1e1e1e;
    border-radius: 16px;
    padding: 36px 40px;
    width: 100%;
    max-width: 440px;
  }

  .sr-card-title { font-size: 26px; font-weight: 700; color: #fff; text-align: center; margin-bottom: 6px; }
  .sr-card-subtitle { font-size: 14px; color: #666; text-align: center; margin-bottom: 24px; }

  .sr-row { display: flex; gap: 14px; }
  .sr-row .sr-field { flex: 1; }

  .sr-field { margin-bottom: 16px; }
  .sr-label { display: block; font-size: 14px; color: #ccc; margin-bottom: 7px; font-weight: 500; }

  .sr-input-wrap { position: relative; display: flex; align-items: center; }
  .sr-input-icon { position: absolute; left: 13px; color: #555; display: flex; align-items: center; pointer-events: none; }

  .sr-input {
    width: 100%;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 8px;
    padding: 10px 12px 10px 38px;
    font-size: 14px;
    font-family: 'Outfit', sans-serif;
    color: #e5e5e5;
    outline: none;
    transition: border-color 0.2s;
  }
  .sr-input::placeholder { color: #444; }
  .sr-input:focus { border-color: #3a7d3a; }
  .sr-input.has-right-icon { padding-right: 38px; }
  .sr-input.sr-input-error { border-color: #6b2020; }

  .sr-eye-btn {
    position: absolute; right: 12px;
    background: none; border: none; cursor: pointer;
    color: #555; display: flex; align-items: center; padding: 2px;
    transition: color 0.2s;
  }
  .sr-eye-btn:hover { color: #888; }

  .sr-field-msg {
    font-size: 12px;
    margin-top: 5px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .sr-field-msg.error { color: #e05454; }
  .sr-field-msg.success { color: #4caf50; }
  .sr-field-msg.checking { color: #888; }

  .sr-general-error {
    background: #1f0f0f;
    border: 1px solid #5c1a1a;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    color: #e05454;
    margin-bottom: 16px;
  }

  .sr-btn-primary {
    width: 100%;
    background: #4caf50;
    border: none;
    border-radius: 8px;
    padding: 12px;
    font-size: 15px;
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    color: #fff;
    cursor: pointer;
    transition: background 0.2s;
    margin-bottom: 20px;
  }
  .sr-btn-primary:hover:not(:disabled) { background: #43a047; }
  .sr-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  .sr-divider {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 16px; color: #444; font-size: 12px; letter-spacing: 0.05em;
  }
  .sr-divider::before, .sr-divider::after { content: ''; flex: 1; height: 1px; background: #222; }

  .sr-btn-google {
    width: 100%;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 8px;
    padding: 11px;
    font-size: 15px;
    font-family: 'Outfit', sans-serif;
    font-weight: 500;
    color: #e5e5e5;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: background 0.2s, border-color 0.2s;
    margin-bottom: 22px;
  }
  .sr-btn-google:hover:not(:disabled) { background: #222; border-color: #383838; }
  .sr-btn-google:disabled { opacity: 0.6; cursor: not-allowed; }

  .sr-footer-text { text-align: center; font-size: 14px; color: #555; }
  .sr-footer-text a { color: #4caf50; text-decoration: none; }
  .sr-footer-text a:hover { text-decoration: underline; }
`;

export default function RegistroPage() {
  const { registerWithEmail, signInWithGoogle, loading } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "", lastName: "", username: "", email: "", password: "", confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");

  const { checking, available, error: usernameError } = useUsernameAvailability(form.username);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    setGeneralError("");
  };

  const handleGoogleRegister = async () => {
    setGeneralError("");
    try {
      await signInWithGoogle();
      navigate("/dashboard");
    } catch (err: any) {
      setGeneralError(err.message || "Error al registrarse con Google");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({});

    const parseResult = registerFormSchema.safeParse(form);
    if (!parseResult.success) {
      const errors: Record<string, string> = {};
      parseResult.error.issues.forEach((issue) => { errors[issue.path[0] as string] = issue.message; });
      setFieldErrors(errors);
      return;
    }

    if (available === false || usernameError) {
      setFieldErrors((prev) => ({ ...prev, username: usernameError || "El username no está disponible" }));
      return;
    }

    try {
      await registerWithEmail(form.email, form.password, form.firstName, form.lastName, form.username);
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err.message || "";
      const lowerMsg = msg.toLowerCase();
      if (lowerMsg.includes("username") || lowerMsg.includes("disponible")) {
        setFieldErrors((prev) => ({ ...prev, username: msg }));
      } else if (lowerMsg.includes("correo") || lowerMsg.includes("email")) {
        setFieldErrors((prev) => ({ ...prev, email: msg }));
      } else if (lowerMsg.includes("contraseña") || lowerMsg.includes("password")) {
        setFieldErrors((prev) => ({ ...prev, password: msg }));
      } else {
        setGeneralError(msg || "Error al registrar la cuenta");
      }
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="sr-root">
        <div className="sr-logo">
          <div className="sr-logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <span className="sr-logo-text">StudyRoom</span>
        </div>

        <div className="sr-card">
          <h1 className="sr-card-title">Crear Cuenta</h1>
          <p className="sr-card-subtitle">Regístrate para empezar a colaborar</p>

          {generalError && <div className="sr-general-error">{generalError}</div>}

          <form onSubmit={handleSubmit}>
            <div className="sr-row">
              <Field id="firstName" label="Nombre" icon={<UserIcon />} placeholder="Tu nombre" field="firstName" form={form} fieldErrors={fieldErrors} handleChange={handleChange} loading={loading} />
              <Field id="lastName" label="Apellido" icon={<UserIcon />} placeholder="Tu apellido" field="lastName" form={form} fieldErrors={fieldErrors} handleChange={handleChange} loading={loading} />
            </div>

            {/* Username */}
            <div className="sr-field">
              <label className="sr-label" htmlFor="username">Nombre de usuario</label>
              <div className="sr-input-wrap">
                <span className="sr-input-icon"><AtIcon /></span>
                <input
                  id="username"
                  className={`sr-input${fieldErrors.username || usernameError ? " sr-input-error" : ""}`}
                  type="text"
                  placeholder="usuario_123"
                  value={form.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  disabled={loading}
                />
              </div>
              {checking && <span className="sr-field-msg checking">Verificando disponibilidad...</span>}
              {available === true && !usernameError && !fieldErrors.username && (
                <span className="sr-field-msg success"><CheckCircleIcon />Username disponible</span>
              )}
              {(fieldErrors.username || usernameError) && (
                <span className="sr-field-msg error"><XCircleIcon />{fieldErrors.username || usernameError}</span>
              )}
            </div>

            <Field id="email" label="Correo Institucional" icon={<MailIcon />} type="email" placeholder="tu@email.com" field="email" form={form} fieldErrors={fieldErrors} handleChange={handleChange} loading={loading} />

            <Field id="password" label="Contraseña" icon={<LockIcon />} placeholder="••••••" field="password" showToggle showVal={showPassword} onToggle={() => setShowPassword((v) => !v)} form={form} fieldErrors={fieldErrors} handleChange={handleChange} loading={loading} />

            <Field id="confirmPassword" label="Confirmar contraseña" icon={<LockIcon />} placeholder="••••••" field="confirmPassword" showToggle showVal={showConfirm} onToggle={() => setShowConfirm((v) => !v)} form={form} fieldErrors={fieldErrors} handleChange={handleChange} loading={loading} />

            <button className="sr-btn-primary" type="submit" disabled={loading || checking}>
              {loading ? "Registrando..." : "Crear cuenta"}
            </button>
          </form>

          <div className="sr-divider">O CONTINÚA CON</div>
          <button className="sr-btn-google" onClick={handleGoogleRegister} disabled={loading}>
            <GoogleIcon />
            {loading ? "Cargando..." : "Google"}
          </button>

          <p className="sr-footer-text">
            ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </>
  );
}

// ─── Componente Field fuera de RegistroPage para mantener el foco ────────────────
const Field = ({
  id, label, icon, type = "text", placeholder, field, showToggle = false,
  showVal, onToggle, form, fieldErrors, handleChange, loading
}: any) => (
  <div className="sr-field">
    <label className="sr-label" htmlFor={id}>{label}</label>
    <div className="sr-input-wrap">
      <span className="sr-input-icon">{icon}</span>
      <input
        id={id}
        className={`sr-input${showToggle ? " has-right-icon" : ""}${fieldErrors[field] ? " sr-input-error" : ""}`}
        type={showToggle ? (showVal ? "text" : "password") : type}
        placeholder={placeholder}
        value={form[field as keyof typeof form]}
        onChange={(e) => handleChange(field, e.target.value)}
        disabled={loading}
      />
      {showToggle && (
        <button type="button" className="sr-eye-btn" onClick={onToggle} tabIndex={-1}>
          {showVal ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      )}
    </div>
    {fieldErrors[field] && (
      <span className="sr-field-msg error"><XCircleIcon />{fieldErrors[field]}</span>
    )}
  </div>
);
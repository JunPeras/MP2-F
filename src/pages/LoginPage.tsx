import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Se añade useNavigate aquí
import { useAuthStore } from "../store/useAuthStore";
import LoadingSpinner from "../components/LoadingSpinner";

// ─── Icons ────────────────────────────────────────────────────────────────────
const BookOpenIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
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
    font-family: 'Outfit', sans-serif;
    color: #e5e5e5;
  }

  .sr-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 32px;
  }
  .sr-logo-icon {
    width: 44px; height: 44px;
    background: #111;
    border: 1.5px solid #2a5c2a;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: #4caf50;
  }
  .sr-logo-text {
    font-size: 22px;
    font-weight: 600;
    color: #f0f0f0;
    letter-spacing: -0.3px;
  }

  .sr-card {
    background: #111111;
    border: 1px solid #1e1e1e;
    border-radius: 16px;
    padding: 36px 40px;
    width: 100%;
    max-width: 420px;
  }

  .sr-card-title {
    font-size: 26px;
    font-weight: 700;
    color: #fff;
    text-align: center;
    margin-bottom: 6px;
  }
  .sr-card-subtitle {
    font-size: 14px;
    color: #666;
    text-align: center;
    margin-bottom: 28px;
  }

  .sr-field {
    margin-bottom: 18px;
  }
  .sr-label {
    display: block;
    font-size: 14px;
    color: #ccc;
    margin-bottom: 7px;
    font-weight: 500;
  }
  .sr-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .sr-input-icon {
    position: absolute;
    left: 13px;
    color: #555;
    display: flex;
    align-items: center;
    pointer-events: none;
  }
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
  .sr-input.sr-error { border-color: #8b2222; }

  .sr-eye-btn {
    position: absolute;
    right: 12px;
    background: none;
    border: none;
    cursor: pointer;
    color: #555;
    display: flex;
    align-items: center;
    padding: 2px;
    transition: color 0.2s;
  }
  .sr-eye-btn:hover { color: #888; }

  .sr-error-text {
    font-size: 12px;
    color: #e05454;
    margin-top: 5px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .sr-forgot {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
  }
  .sr-forgot a {
    font-size: 13px;
    color: #4caf50;
    text-decoration: none;
  }
  .sr-forgot a:hover { text-decoration: underline; }

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
    transition: background 0.2s, transform 0.1s;
    margin-bottom: 20px;
  }
  .sr-btn-primary:hover:not(:disabled) { background: #43a047; }
  .sr-btn-primary:active:not(:disabled) { transform: scale(0.99); }
  .sr-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  .sr-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    color: #444;
    font-size: 12px;
    letter-spacing: 0.05em;
  }
  .sr-divider::before, .sr-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #222;
  }

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

  .sr-footer-text {
    text-align: center;
    font-size: 14px;
    color: #555;
  }
  .sr-footer-text a { color: #4caf50; text-decoration: none; }
  .sr-footer-text a:hover { text-decoration: underline; }

  .sr-general-error {
    background: #1f0f0f;
    border: 1px solid #5c1a1a;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    color: #e05454;
    margin-bottom: 16px;
  }
`;

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle, loading } = useAuthStore();
  const navigate = useNavigate(); // Inicialización del hook de navegación
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  const validateField = (field: "email" | "password", value: string) => {
    if (field === "email") {
      if (!value.trim()) return "El correo es obligatorio";
      if (!value.trim().toLowerCase().endsWith(".edu.co")) return "Debes utilizar un correo institucional válido terminado en .edu.co";
    }
    if (field === "password") {
      if (!value) return "La contraseña es obligatoria";
    }
    return "";
  };

  const handleBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, field === "email" ? email : password);
    setFieldErrors((prev) => ({ ...prev, [field]: error || undefined }));
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setError("");
    if (touched.email) {
      const err = validateField("email", value);
      setFieldErrors((prev) => ({ ...prev, email: err || undefined }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setError("");
    if (touched.password) {
      const err = validateField("password", value);
      setFieldErrors((prev) => ({ ...prev, password: err || undefined }));
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const emailError = validateField("email", email);
    const passwordError = validateField("password", password);
    setFieldErrors({ email: emailError || undefined, password: passwordError || undefined });
    setTouched({ email: true, password: true });
    if (emailError || passwordError) return;
    try {
      await signInWithEmail(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await signInWithGoogle();
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión con Google");
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
          <h1 className="sr-card-title">Iniciar Sesión</h1>
          <p className="sr-card-subtitle">Ingresa tus credenciales para acceder a tu cuenta</p>

          {error && <div className="sr-general-error">{error}</div>}

          <form onSubmit={handleEmailLogin}>
            <div className="sr-field">
              <label className="sr-label" htmlFor="email">Correo electrónico <span style={{ color: "#888", fontSize: 12, fontWeight: 400 }}>(institucional .edu.co)</span></label>
              <div className="sr-input-wrap">
                <span className="sr-input-icon"><MailIcon /></span>
                <input
                  id="email"
                  className={`sr-input${fieldErrors.email ? " sr-error" : ""}`}
                  type="email"
                  placeholder="usuario@universidad.edu.co"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={() => handleBlur("email")}
                  disabled={loading}
                />
              </div>
              {fieldErrors.email && (
                <span className="sr-error-text">{fieldErrors.email}</span>
              )}
            </div>

            <div className="sr-field">
              <label className="sr-label" htmlFor="password">Contraseña</label>
              <div className="sr-input-wrap">
                <span className="sr-input-icon"><LockIcon /></span>
                <input
                  id="password"
                  className={`sr-input has-right-icon${fieldErrors.password ? " sr-error" : ""}`}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onBlur={() => handleBlur("password")}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="sr-eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="sr-forgot">
              <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
            </div>

            <button className="sr-btn-primary" type="submit" disabled={loading}>
              {loading ? "Autenticando..." : "Ingresar"}
            </button>
          </form>

          <div className="sr-divider">O CONTINÚA CON</div>

          <button className="sr-btn-google" onClick={handleGoogleLogin} disabled={loading}>
            {loading ? <LoadingSpinner variant="inline" /> : <><GoogleIcon /> Google</>}
          </button>

          {/* Ajuste estructural de clases CSS para el footer de navegación */}
          <p className="sr-footer-text">
            ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
          </p>
        </div>
      </div>
    </>
  );
}
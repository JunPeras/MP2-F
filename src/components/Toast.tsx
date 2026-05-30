/**
 * StudyRoom — Notification & Toast components
 *
 * Usage:
 *   import { Toast, ToastContainer, useToast } from "../components/Toast";
 *
 * Quick example:
 *   const { toasts, show } = useToast();
 *   show("success", "¡Registro exitoso!", "Hemos enviado un correo de verificación a tu correo@correo.com. Revisa tu bandeja de entrada");
 *   show("error", "Error de conexión", "No pudimos conectar con nuestros servidores. Verifica tu conexión e intenta nuevamente", { action: { label: "Intentar de nuevo", onClick: () => {} } });
 *   show("warning", "Cuenta no verificada", "Antes de iniciar sesión, verifica tu correo electrónico.", { action: { label: "Reenviar correo de verificación", onClick: () => {} } });
 *   show("info", "¿Olvidaste tu contraseña?", "Te enviaremos un enlace para restablecerla", { action: { label: "Reenviar enlace de recuperación", onClick: () => {} } });
 */

import { useState, useCallback, useEffect } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  action?: ToastAction;
  duration?: number; // ms, default 5000, 0 = no auto-dismiss
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap');

  .sr-toast-container {
    position: fixed;
    top: 24px;
    right: 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    z-index: 9999;
    pointer-events: none;
    max-width: 420px;
    width: calc(100vw - 48px);
    font-family: 'Outfit', sans-serif;
  }

  .sr-toast {
    background: #111;
    border-radius: 12px;
    padding: 16px 18px;
    display: flex;
    gap: 14px;
    align-items: flex-start;
    pointer-events: all;
    animation: sr-toast-in 0.25s ease;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  }

  .sr-toast.success { border: 1px solid #1e4d1e; }
  .sr-toast.error   { border: 1px solid #5c1a1a; }
  .sr-toast.warning { border: 1px solid #5c4200; }
  .sr-toast.info    { border: 1px solid #1a3a5c; }

  @keyframes sr-toast-in {
    from { opacity: 0; transform: translateX(20px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .sr-toast-icon {
    width: 36px; height: 36px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    font-size: 18px;
  }
  .sr-toast.success .sr-toast-icon { background: #1e4d1e; color: #4caf50; }
  .sr-toast.error   .sr-toast-icon { background: #3d1010; color: #e05454; }
  .sr-toast.warning .sr-toast-icon { background: #3d2900; color: #f59e0b; }
  .sr-toast.info    .sr-toast-icon { background: #0f2844; color: #60a5fa; }

  .sr-toast-content { flex: 1; min-width: 0; }

  .sr-toast-title {
    font-size: 14px; font-weight: 600; margin-bottom: 3px;
  }
  .sr-toast.success .sr-toast-title { color: #4caf50; }
  .sr-toast.error   .sr-toast-title { color: #e05454; }
  .sr-toast.warning .sr-toast-title { color: #f59e0b; }
  .sr-toast.info    .sr-toast-title { color: #60a5fa; }

  .sr-toast-msg {
    font-size: 13px; color: #aaa; line-height: 1.5; margin-bottom: 8px;
  }
  .sr-toast-msg a, .sr-toast-msg span.highlight {
    color: inherit; text-decoration: underline; cursor: pointer;
  }

  .sr-toast-action {
    background: none; border: none; cursor: pointer;
    font-size: 13px; font-weight: 500; font-family: 'Outfit', sans-serif;
    padding: 0; text-decoration: underline;
    transition: opacity 0.2s;
  }
  .sr-toast.success .sr-toast-action { color: #4caf50; }
  .sr-toast.error   .sr-toast-action { color: #e05454; }
  .sr-toast.warning .sr-toast-action { color: #f59e0b; }
  .sr-toast.info    .sr-toast-action { color: #60a5fa; }
  .sr-toast-action:hover { opacity: 0.75; }

  .sr-toast-close {
    background: none; border: none; cursor: pointer;
    color: #555; padding: 2px; display: flex; align-items: center;
    transition: color 0.2s; flex-shrink: 0;
  }
  .sr-toast-close:hover { color: #999; }

  /* ── Inline alert variants (for inside forms) ── */
  .sr-alert {
    border-radius: 10px;
    padding: 14px 16px;
    display: flex;
    gap: 12px;
    align-items: flex-start;
    font-family: 'Outfit', sans-serif;
    margin-bottom: 16px;
  }
  .sr-alert.success { background: #0c200c; border: 1px solid #1e4d1e; }
  .sr-alert.error   { background: #1f0f0f; border: 1px solid #5c1a1a; }
  .sr-alert.warning { background: #1f1400; border: 1px solid #5c4200; }
  .sr-alert.info    { background: #0a1929; border: 1px solid #1a3a5c; }

  .sr-alert-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .sr-alert.success .sr-alert-icon { background: #1e4d1e; color: #4caf50; }
  .sr-alert.error   .sr-alert-icon { background: #3d1010; color: #e05454; }
  .sr-alert.warning .sr-alert-icon { background: #3d2900; color: #f59e0b; }
  .sr-alert.info    .sr-alert-icon { background: #0f2844; color: #60a5fa; }

  .sr-alert-title { font-size: 14px; font-weight: 600; margin-bottom: 3px; }
  .sr-alert.success .sr-alert-title { color: #4caf50; }
  .sr-alert.error   .sr-alert-title { color: #e05454; }
  .sr-alert.warning .sr-alert-title { color: #f59e0b; }
  .sr-alert.info    .sr-alert-title { color: #60a5fa; }

  .sr-alert-msg { font-size: 13px; color: #aaa; line-height: 1.5; margin-bottom: 6px; }
  .sr-alert-action {
    background: none; border: none; cursor: pointer;
    font-size: 13px; font-weight: 500; font-family: 'Outfit', sans-serif;
    padding: 0; text-decoration: underline;
  }
  .sr-alert.success .sr-alert-action { color: #4caf50; }
  .sr-alert.error   .sr-alert-action { color: #e05454; }
  .sr-alert.warning .sr-alert-action { color: #f59e0b; }
  .sr-alert.info    .sr-alert-action { color: #60a5fa; }
`;

// ─── Icons ────────────────────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/>
  </svg>
);
const WarnIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/>
  </svg>
);
const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/>
  </svg>
);

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckIcon />,
  error: <XIcon />,
  warning: <WarnIcon />,
  info: <InfoIcon />,
};

// ─── Toast component ──────────────────────────────────────────────────────────
interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const dur = toast.duration ?? 5000;
    if (dur === 0) return;
    const t = setTimeout(() => onDismiss(toast.id), dur);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  return (
    <div className={`sr-toast ${toast.type}`}>
      <div className="sr-toast-icon">{ICONS[toast.type]}</div>
      <div className="sr-toast-content">
        <div className="sr-toast-title">{toast.title}</div>
        {toast.message && <div className="sr-toast-msg">{toast.message}</div>}
        {toast.action && (
          <button className="sr-toast-action" onClick={toast.action.onClick}>
            {toast.action.label}
          </button>
        )}
      </div>
      <button className="sr-toast-close" onClick={() => onDismiss(toast.id)}>
        <CloseIcon />
      </button>
    </div>
  );
}

// ─── Container ────────────────────────────────────────────────────────────────
interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <>
      <style>{styles}</style>
      <div className="sr-toast-container">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </div>
    </>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (
      type: ToastType,
      title: string,
      message?: string,
      opts?: { action?: ToastAction; duration?: number }
    ) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [
        ...prev,
        { id, type, title, message, action: opts?.action, duration: opts?.duration },
      ]);
      return id;
    },
    []
  );

  return { toasts, show, dismiss };
}

// ─── Inline Alert ─────────────────────────────────────────────────────────────
interface AlertProps {
  type: ToastType;
  title: string;
  message?: string;
  action?: ToastAction;
  className?: string;
}

export function Alert({ type, title, message, action, className }: AlertProps) {
  return (
    <>
      <style>{styles}</style>
      <div className={`sr-alert ${type}${className ? ` ${className}` : ""}`}>
        <div className="sr-alert-icon">{ICONS[type]}</div>
        <div>
          <div className="sr-alert-title">{title}</div>
          {message && <div className="sr-alert-msg">{message}</div>}
          {action && (
            <button className="sr-alert-action" onClick={action.onClick}>
              {action.label}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Demo page (remove in production) ────────────────────────────────────────
export function NotificationsDemo() {
  const { toasts, show, dismiss } = useToast();

  return (
    <>
      <style>{styles}</style>
      <style>{`
        body { background: #0a0a0a; font-family: 'Outfit', sans-serif; }
        .demo { padding: 32px; color: #e5e5e5; }
        .demo h2 { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 20px; }
        .demo h3 { font-size: 15px; font-weight: 600; color: #888; margin: 24px 0 12px; text-transform: uppercase; letter-spacing: .05em; }
        .demo-btns { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 8px; }
        .demo-btn {
          background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px;
          padding: 8px 16px; font-size: 13px; font-family: 'Outfit', sans-serif;
          color: #ccc; cursor: pointer; transition: background 0.2s;
        }
        .demo-btn:hover { background: #222; }
      `}</style>
      <div className="demo">
        <h2>Notificaciones</h2>

        <h3>Toasts</h3>
        <div className="demo-btns">
          <button className="demo-btn" onClick={() =>
            show("success", "¡Registro exitoso!", "Hemos enviado un correo de verificación a tu correo@correo.com. Revisa tu bandeja de entrada")
          }>✓ Éxito</button>

          <button className="demo-btn" onClick={() =>
            show("error", "Error de conexión", "No pudimos conectar con nuestros servidores. Verifica tu conexión e intenta nuevamente", {
              action: { label: "Intentar de nuevo", onClick: () => {} },
            })
          }>✕ Error</button>

          <button className="demo-btn" onClick={() =>
            show("warning", "Cuenta no verificada", "Antes de iniciar sesión, verifica tu correo electrónico. Revisa tu bandeja de entrada o correo no deseado", {
              action: { label: "Reenviar correo de verificación", onClick: () => {} },
            })
          }>⚠ Advertencia</button>

          <button className="demo-btn" onClick={() =>
            show("info", "¿Olvidaste tu contraseña?", "Te enviaremos un enlace para restablecerla", {
              action: { label: "Reenviar enlace de recuperación", onClick: () => {} },
            })
          }>ℹ Información</button>
        </div>

        <h3>Alertas inline</h3>
        <Alert type="success" title="¡Registro exitoso!" message="Hemos enviado un correo de verificación a tu correo@correo.com. Revisa tu bandeja de entrada" />
        <Alert type="error" title="Error de conexión" message="No pudimos conectar con nuestros servidores. Verifica tu conexión e intenta nuevamente"
          action={{ label: "Intentar de nuevo", onClick: () => {} }} />
        <Alert type="warning" title="Cuenta no verificada" message="Antes de iniciar sesión, verifica tu correo electrónico. Revisa tu bandeja de entrada o correo no deseado"
          action={{ label: "Reenviar correo de verificación", onClick: () => {} }} />
        <Alert type="info" title="¿Olvidaste tu contraseña?" message="Te enviaremos un enlace para restablecerla"
          action={{ label: "Reenviar enlace de recuperación", onClick: () => {} }} />
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
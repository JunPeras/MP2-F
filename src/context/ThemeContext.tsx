import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Theme = "dark" | "light";
const LS_KEY = "sr-theme";

const LIGHT_CSS = `
  /* ── Global ── */
  [data-theme="light"] *:focus-visible { outline-color: #2e7d32; }
  [data-theme="light"] body { background: #f0f4f8 !important; }

  /* ── Page roots ── */
  [data-theme="light"] .sr-root,
  [data-theme="light"] .sr-dash,
  [data-theme="light"] .sl-root,
  [data-theme="light"] .sr-profile,
  [data-theme="light"] .sr-room {
    background: #f0f4f8;
    color: #1a202c;
  }

  /* ── AppNavbar ── */
  [data-theme="light"] .sr-nav {
    background: #ffffff;
    border-bottom-color: #e2e8f0;
  }
  [data-theme="light"] .sr-nav-logo-text { color: #0f172a; }
  [data-theme="light"] .sr-nav-logo-icon {
    background: #f0fff4;
    border-color: #66bb6a;
    color: #2e7d32;
  }
  [data-theme="light"] .sr-back-btn { color: #2e7d32; }
  [data-theme="light"] .sr-back-btn:hover { color: #1b5e20; }
  [data-theme="light"] .sr-nav-avatar { background: #a5d6a7; color: #1b5e20; }
  [data-theme="light"] .sr-nav-dropdown {
    background: #ffffff;
    border-color: #e2e8f0;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  }
  [data-theme="light"] .sr-nav-dropdown button { color: #4a5568; }
  [data-theme="light"] .sr-nav-dropdown button:hover { background: #f5f7fa; }
  [data-theme="light"] .sr-nav-dropdown button.danger { color: #c62828; }

  /* ── Cards ── */
  [data-theme="light"] .sr-card,
  [data-theme="light"] .sr-info-card,
  [data-theme="light"] .sr-hero-card,
  [data-theme="light"] .sr-room-card,
  [data-theme="light"] .sr-prefs-card {
    background: #ffffff;
    border-color: #e2e8f0;
  }
  [data-theme="light"] .sr-room-card:hover { border-color: #66bb6a; }

  /* ── Modals ── */
  [data-theme="light"] .sr-modal,
  [data-theme="light"] .sr-modal-backdrop + .sr-modal {
    background: #ffffff;
    border-color: #e2e8f0;
  }

  /* ── Text headings ── */
  [data-theme="light"] .sr-card-title,
  [data-theme="light"] .sr-dash-heading,
  [data-theme="light"] .sr-room-name,
  [data-theme="light"] .sr-modal-title,
  [data-theme="light"] .sr-hero-name,
  [data-theme="light"] .sr-room-title,
  [data-theme="light"] .sl-room-name,
  [data-theme="light"] .sr-logo-text { color: #0f172a; }

  /* ── Text secondary ── */
  [data-theme="light"] .sr-card-subtitle,
  [data-theme="light"] .sr-dash-subheading,
  [data-theme="light"] .sr-room-desc,
  [data-theme="light"] .sr-room-code,
  [data-theme="light"] .sr-room-creator,
  [data-theme="light"] .sr-room-members,
  [data-theme="light"] .sr-hero-title,
  [data-theme="light"] .sr-stat-label,
  [data-theme="light"] .sr-contact-label,
  [data-theme="light"] .sr-info-text,
  [data-theme="light"] .sr-empty-placeholder,
  [data-theme="light"] .sr-prefs-label,
  [data-theme="light"] .sr-footer-text,
  [data-theme="light"] .sl-room-code,
  [data-theme="light"] .sl-sidebar-title,
  [data-theme="light"] .sl-chat-system,
  [data-theme="light"] .sl-tile-more-label,
  [data-theme="light"] .sr-room-subtitle { color: #718096; }

  [data-theme="light"] .sr-label,
  [data-theme="light"] .sr-modal-label,
  [data-theme="light"] .sr-contact-value,
  [data-theme="light"] .sr-modal-desc,
  [data-theme="light"] .sl-participant-name { color: #4a5568; }

  [data-theme="light"] .sr-section-title,
  [data-theme="light"] .sr-info-card-title,
  [data-theme="light"] .sr-prefs-section-title,
  [data-theme="light"] .sl-chat-header { color: #2d3748; }

  /* ── Inputs ── */
  [data-theme="light"] .sr-input,
  [data-theme="light"] .sr-textarea,
  [data-theme="light"] .sr-search-input,
  [data-theme="light"] .sr-modal-input,
  [data-theme="light"] .sl-chat-input {
    background: #f5f7fa;
    border-color: #d1d9e0;
    color: #1a202c;
  }
  [data-theme="light"] .sr-input::placeholder,
  [data-theme="light"] .sr-search-input::placeholder,
  [data-theme="light"] .sr-modal-input::placeholder,
  [data-theme="light"] .sl-chat-input::placeholder { color: #a0aec0; }
  [data-theme="light"] .sr-input:focus,
  [data-theme="light"] .sr-textarea:focus,
  [data-theme="light"] .sr-search-input:focus,
  [data-theme="light"] .sr-modal-input:focus,
  [data-theme="light"] .sl-chat-input:focus { border-color: #2e7d32; }
  [data-theme="light"] .sr-input.sr-error,
  [data-theme="light"] .sr-input.sr-input-error { border-color: #ef9a9a; }

  /* ── Logo icon ── */
  [data-theme="light"] .sr-logo-icon,
  [data-theme="light"] .sl-nav-logo-icon,
  [data-theme="light"] .sr-nav-logo-icon,
  [data-theme="light"] .sr-room-nav-icon {
    background: #f0fff4;
    border-color: #66bb6a;
    color: #2e7d32;
  }

  /* ── Green accent ── */
  [data-theme="light"] .sr-hero-username,
  [data-theme="light"] .sr-stat-value,
  [data-theme="light"] .sr-forgot a,
  [data-theme="light"] .sr-footer-text a { color: #2e7d32; }
  [data-theme="light"] .sr-input-icon,
  [data-theme="light"] .sr-search-icon { color: #6b7280; }

  /* ── Buttons — primary ── */
  [data-theme="light"] .sr-btn-primary,
  [data-theme="light"] .sr-btn-enter,
  [data-theme="light"] .sl-chat-send-btn,
  [data-theme="light"] .sr-save-btn { background: #2e7d32; }
  [data-theme="light"] .sr-btn-primary:hover,
  [data-theme="light"] .sr-btn-enter:hover,
  [data-theme="light"] .sl-chat-send-btn:hover,
  [data-theme="light"] .sr-save-btn:hover { background: #1b5e20; }

  /* ── Buttons — outline / cancel ── */
  [data-theme="light"] .sr-btn-outline,
  [data-theme="light"] .sr-edit-btn,
  [data-theme="light"] .sr-cancel-edit-btn,
  [data-theme="light"] .sr-modal-cancel {
    background: #f5f7fa;
    border-color: #d1d9e0;
    color: #4a5568;
  }
  [data-theme="light"] .sr-btn-outline:hover,
  [data-theme="light"] .sr-edit-btn:hover,
  [data-theme="light"] .sr-cancel-edit-btn:hover,
  [data-theme="light"] .sr-modal-cancel:hover { background: #eeeeee; border-color: #b8c2cc; }

  [data-theme="light"] .sr-btn-google {
    background: #f5f7fa;
    border-color: #d1d9e0;
    color: #1a202c;
  }
  [data-theme="light"] .sr-btn-google:hover { background: #eeeeee; border-color: #b8c2cc; }

  [data-theme="light"] .sr-btn-ghost {
    border-color: #d1d9e0;
    color: #6b7280;
  }
  [data-theme="light"] .sr-btn-ghost:hover { background: #f5f7fa; color: #4a5568; border-color: #b8c2cc; }

  [data-theme="light"] .sr-delete-account-btn { border-color: #ef9a9a; color: #c62828; }
  [data-theme="light"] .sr-delete-account-btn:hover { background: #ffebee; border-color: #f44336; }
  [data-theme="light"] .sr-confirm-delete-btn { background: #c62828; }
  [data-theme="light"] .sr-confirm-delete-btn:hover { background: #b71c1c; }

  /* ── Dropdown ── */
  [data-theme="light"] .sr-dropdown {
    background: #ffffff;
    border-color: #e2e8f0;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  }
  [data-theme="light"] .sr-dropdown-item { color: #4a5568; }
  [data-theme="light"] .sr-dropdown-item:hover { background: #f5f7fa; color: #1a202c; }
  [data-theme="light"] .sr-dropdown-item.danger:hover { background: #ffebee; }
  [data-theme="light"] .sr-dots-btn { color: #6b7280; }
  [data-theme="light"] .sr-dots-btn:hover { background: #e8f5e9; }

  /* ── Divider ── */
  [data-theme="light"] .sr-divider { color: #b8c2cc; }
  [data-theme="light"] .sr-divider::before,
  [data-theme="light"] .sr-divider::after { background: #e2e8f0; }

  /* ── Error ── */
  [data-theme="light"] .sr-general-error {
    background: #ffebee;
    border-color: #ef9a9a;
    color: #c62828;
  }
  [data-theme="light"] .sr-eye-btn { color: #6b7280; }

  /* ── Toast ── */
  [data-theme="light"] .sr-toast.success {
    background: #e8f5e9;
    border-color: #a5d6a7;
    color: #2e7d32;
  }
  [data-theme="light"] .sr-toast.error {
    background: #ffebee;
    border-color: #ef9a9a;
    color: #c62828;
  }

  /* ── Font size buttons ── */
  [data-theme="light"] .sr-font-size-btn { background: #f5f7fa; border-color: #d1d9e0; color: #4a5568; }
  [data-theme="light"] .sr-font-size-btn:hover { background: #eeeeee; border-color: #b8c2cc; }
  [data-theme="light"] .sr-font-size-btn.active { border-color: #2e7d32; color: #2e7d32; background: #f1f8e9; }

  /* ── Avatar ── */
  [data-theme="light"] .sr-avatar-lg,
  [data-theme="light"] .sl-participant-avatar,
  [data-theme="light"] .sl-video-avatar { background: #e8f5e9; color: #2e7d32; }

  /* ── SalaPage nav/sidebar ── */
  [data-theme="light"] .sl-nav,
  [data-theme="light"] .sl-sidebar-left,
  [data-theme="light"] .sl-sidebar-right,
  [data-theme="light"] .sl-controls {
    background: #ffffff;
    border-color: #e2e8f0;
  }
  [data-theme="light"] .sl-nav { border-bottom-color: #e2e8f0; }
  [data-theme="light"] .sl-controls { border-top-color: #e2e8f0; }
  [data-theme="light"] .sl-sidebar-left { border-right-color: #e2e8f0; }
  [data-theme="light"] .sl-sidebar-right { border-left-color: #e2e8f0; }
  [data-theme="light"] .sl-chat-header { border-bottom-color: #e2e8f0; }
  [data-theme="light"] .sl-chat-input-row { border-top-color: #e2e8f0; }
  [data-theme="light"] .sl-video-grid { background: #e4e8ee; }
  [data-theme="light"] .sl-video-tile { background: #d8e4ee; }
  [data-theme="light"] .sl-tile-more { background: #ffffff; border-color: #e2e8f0; }
  [data-theme="light"] .sl-tile-more:hover { background: #e8f5e9; border-color: #66bb6a; }

  [data-theme="light"] .sl-back-btn { color: #2e7d32; }
  [data-theme="light"] .sl-back-btn:hover { color: #1b5e20; }
  [data-theme="light"] .sl-room-name { color: #0f172a; }

  [data-theme="light"] .sl-nav-icon-btn { border-color: #e2e8f0; color: #6b7280; }
  [data-theme="light"] .sl-nav-icon-btn:hover,
  [data-theme="light"] .sl-nav-icon-btn.active { border-color: #66bb6a; color: #2e7d32; }

  [data-theme="light"] .sl-ctrl-btn { background: #f5f7fa; border-color: #d1d9e0; color: #4a5568; }
  [data-theme="light"] .sl-ctrl-btn:hover { background: #eeeeee; border-color: #b8c2cc; }
  [data-theme="light"] .sl-ctrl-btn.active { background: #e8f5e9; border-color: #66bb6a; color: #2e7d32; }

  [data-theme="light"] .sl-chat-bubble { background: #f0f4f8; color: #2d3748; }
  [data-theme="light"] .sl-chat-bubble--me { background: #c8e6c9; color: #1b5e20; }
  [data-theme="light"] .sl-participant-item:hover { background: #f5f5f5; }
  [data-theme="light"] .sl-chat-messages::-webkit-scrollbar-thumb { background: #d1d9e0; }

  [data-theme="light"] .sl-collapse-btn { background: #f5f7fa; border-color: #d1d9e0; color: #6b7280; }
  [data-theme="light"] .sl-collapse-btn:hover { border-color: #66bb6a; color: #2e7d32; }
  [data-theme="light"] .sl-copy-link-btn { background: #f5f7fa; border-color: #d1d9e0; color: #6b7280; }
  [data-theme="light"] .sl-copy-link-btn:hover { border-color: #66bb6a; color: #2e7d32; }
  [data-theme="light"] .sl-drawer-close { color: #6b7280; }
  [data-theme="light"] .sl-drawer-close:hover { color: #0f172a; }

  /* ── StudyRoomPage ── */
  [data-theme="light"] .sr-room-nav {
    background: #ffffff;
    border-bottom-color: #e2e8f0;
  }
  [data-theme="light"] .sr-participants {
    background: #ffffff;
    border-right-color: #e2e8f0;
  }
  [data-theme="light"] .sr-room-title { color: #0f172a; }
  [data-theme="light"] .sr-room-subtitle,
  [data-theme="light"] .sr-participants-title { color: #718096; }
  [data-theme="light"] .sr-icon-btn { background: #f5f7fa; border-color: #e2e8f0; color: #6b7280; }
  [data-theme="light"] .sr-icon-btn:hover { background: #eeeeee; color: #4a5568; }
  [data-theme="light"] .sr-icon-btn.active { background: #e8f5e9; border-color: #66bb6a; color: #2e7d32; }
`;

const ThemeCtx = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
}>({ theme: "dark", setTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(LS_KEY) as Theme | null) ?? "dark"
  );

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem(LS_KEY, t);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);

    const styleId = "sr-light-theme";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;

    if (theme === "light") {
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = LIGHT_CSS;
    } else {
      styleEl?.remove();
    }
  }, [theme]);

  return (
    <ThemeCtx.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import AppNavbar from "../components/AppNavbar";
import { apiPut, apiDelete } from "../lib/api";
import { useFontSize } from "../context/FontSizeContext";
import type { FontSize } from "../context/FontSizeContext";
import { useTheme } from "../context/ThemeContext";
import { useFocusTrap } from "../hooks/useFocusTrap";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  *:focus-visible { outline: 2px solid #4caf50; outline-offset: 2px; }
  body { background: #0a0a0a; }

  .sr-profile {
    min-height: 100vh;
    background: #0a0a0a;
    font-family: 'Outfit', sans-serif;
    color: #e5e5e5;
  }

  .sr-profile-body { padding: 32px; max-width: 900px; margin: 0 auto; }

  /* ── Hero card ── */
  .sr-hero-card {
    background: #111; border: 1px solid #1e1e1e; border-radius: 14px;
    padding: 28px 32px; margin-bottom: 20px;
  }
  .sr-hero-top { display: flex; align-items: flex-start; gap: 20px; margin-bottom: 22px; }
  .sr-avatar-lg {
    width: 72px; height: 72px; background: #1e4d1e; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; font-weight: 700; color: #81c784; flex-shrink: 0;
  }
  .sr-hero-info { flex: 1; }
  .sr-hero-name { font-size: 22px; font-weight: 700; color: #fff; margin-bottom: 4px; }
  .sr-hero-title { font-size: 14px; color: #999; }
  .sr-hero-username { color: #4caf50; font-weight: 500; margin-left: 4px; }
  
  .sr-edit-btn {
    background: transparent; border: 1px solid #2a2a2a; border-radius: 8px;
    padding: 7px 16px; font-size: 13px; font-family: 'Outfit', sans-serif;
    color: #ccc; cursor: pointer; transition: background 0.2s, border-color 0.2s;
    white-space: nowrap;
  }
  .sr-edit-btn:hover { background: #1a1a1a; border-color: #3a3a3a; }

  .sr-stats { display: flex; gap: 0; border-top: 1px solid #1a1a1a; padding-top: 18px; }
  .sr-stat { flex: 1; text-align: center; }
  .sr-stat + .sr-stat { border-left: 1px solid #1a1a1a; }
  .sr-stat-value { font-size: 22px; font-weight: 700; color: #4caf50; margin-bottom: 3px; }
  .sr-stat-label { font-size: 12px; color: #999; }

  /* ── Info cards ── */
  .sr-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  .sr-info-card {
    background: #111; border: 1px solid #1e1e1e; border-radius: 14px;
    padding: 22px 24px;
  }
  .sr-info-card-title { font-size: 15px; font-weight: 600; color: #ddd; margin-bottom: 14px; }
  .sr-info-text { font-size: 14px; color: #777; line-height: 1.6; }

  /* Estados vacíos estéticos */
  .sr-empty-placeholder { font-style: italic; color: #999; font-size: 13px; }

  .sr-contact-item { margin-bottom: 14px; }
  .sr-contact-item:last-child { margin-bottom: 0; }
  .sr-contact-label { font-size: 12px; color: #999; margin-bottom: 3px; font-weight: 500; }
  .sr-contact-value { font-size: 14px; color: #ccc; }

  /* ── Edit form ── */
  .sr-field { margin-bottom: 16px; }
  .sr-label { display: block; font-size: 13px; color: #aaa; margin-bottom: 6px; font-weight: 500; }
  .sr-input {
    width: 100%; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px;
    padding: 9px 12px; font-size: 14px; font-family: 'Outfit', sans-serif;
    color: #e5e5e5; outline: none; transition: border-color 0.2s;
  }
  .sr-input:focus { border-color: #3a7d3a; }
  .sr-input:disabled { opacity: 0.4; cursor: not-allowed; border-color: #1a1a1a; }

  // .sr-input::placeholder { color: #444; }
  // .sr-input:focus { border-color: #3a7d3a; }

  .sr-textarea {
    width: 100%; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px;
    padding: 9px 12px; font-size: 14px; font-family: 'Outfit', sans-serif;
    color: #e5e5e5; outline: none; transition: border-color 0.2s;
    resize: vertical; min-height: 80px;
  }
  .sr-textarea:focus { border-color: #3a7d3a; }
  .sr-error-text { color: #f44336; font-size: 11px; margin-top: 4px; display: block; }

  /* ── Botones ── */
  .sr-save-btn {
    background: #4caf50; border: none; border-radius: 8px;
    padding: 9px 20px; font-size: 14px; font-family: 'Outfit', sans-serif;
    font-weight: 600; color: #fff; cursor: pointer; transition: background 0.2s;
  }
  .sr-save-btn:hover { background: #43a047; }
  .sr-cancel-edit-btn {
    background: transparent; border: 1px solid #2a2a2a; border-radius: 8px;
    padding: 9px 20px; font-size: 14px; font-family: 'Outfit', sans-serif;
    color: #888; cursor: pointer; transition: background 0.2s; margin-left: 10px;
  }
  .sr-cancel-edit-btn:hover { background: #1a1a1a; }

  .sr-delete-account-btn {
    background: transparent; border: 1px solid #3a1a1a; border-radius: 8px;
    padding: 9px 20px; font-size: 14px; font-family: 'Outfit', sans-serif;
    color: #ef5350; cursor: pointer; transition: all 0.2s; margin-top: 24px;
    font-weight: 500; display: block; width: fit-content;
  }
  .sr-delete-account-btn:hover { background: #2c1414; border-color: #f44336; }

  .sr-modal-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.85); display: flex; align-items: center;
    justify-content: center; z-index: 1000; padding: 20px;
  }
  .sr-modal {
    background: #111; border: 1px solid #2a1a1a; border-radius: 14px;
    padding: 28px; max-width: 450px; width: 100%; text-align: center;
  }
  .sr-modal-title { font-size: 18px; font-weight: 700; color: #f44336; margin-bottom: 12px; }
  .sr-modal-desc { font-size: 14px; color: #aaa; margin-bottom: 24px; line-height: 1.5; }
  .sr-modal-actions { display: flex; justify-content: center; gap: 12px; }
  .sr-confirm-delete-btn {
    background: #f44336; border: none; border-radius: 8px; padding: 9px 20px;
    color: #fff; font-weight: 600; font-family: 'Outfit', sans-serif; cursor: pointer;
  }
  .sr-confirm-delete-btn:hover { background: #d32f2f; }

  /* ── Preferencias ── */
  .sr-prefs-card {
    background: #111; border: 1px solid #1e1e1e; border-radius: 14px;
    padding: 22px 24px; margin-top: 16px;
  }
  .sr-prefs-section-title {
    font-size: 15px; font-weight: 600; color: #ddd; margin-bottom: 14px;
  }
  .sr-prefs-row {
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
  }
  .sr-prefs-label {
    font-size: 13px; color: #999; font-weight: 500;
  }
  .sr-font-size-group { display: flex; gap: 8px; }
  .sr-font-size-btn {
    background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px;
    padding: 7px 16px; font-size: 13px; font-family: 'Outfit', sans-serif;
    color: #aaa; cursor: pointer; transition: background 0.2s, border-color 0.2s, color 0.2s;
  }
  .sr-font-size-btn:hover { background: #222; border-color: #3a3a3a; }
  .sr-font-size-btn.active {
    border-color: #4caf50; color: #4caf50; background: #0f1f0f;
  }

  /* ── Feedback ── */
  .sr-toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    padding: 14px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 300;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    animation: srSlideUp 0.3s ease;
  }
  .sr-toast.success {
    background: #112a14;
    border: 1px solid #2a5c2a;
    color: #4caf50;
  }
  .sr-toast.error {
    background: #2a1414;
    border: 1px solid #5c2a2a;
    color: #e05454;
  }

  @keyframes srSlideUp {
    from { transform: translateY(100px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

interface ProfileData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  title: string;
  bio: string;
  phone: string;
  location: string;
  isGoogleUser: boolean;
}

const FONT_SIZE_OPTIONS: { value: FontSize; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "grande", label: "Grande" },
  { value: "muy-grande", label: "Muy grande" },
];

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const { fontSize, setFontSize } = useFontSize();
  const { theme, setTheme } = useTheme();

  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const deleteModalRef = useRef<HTMLDivElement>(null);
  const discardModalRef = useRef<HTMLDivElement>(null);

  useFocusTrap(deleteModalRef, showDeleteModal);
  useFocusTrap(discardModalRef, showDiscardModal);

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [profile, setProfile] = useState<ProfileData>({
    firstName: user?.firstName || user?.displayName?.split(" ")[0] || "",
    lastName: user?.lastName || user?.displayName?.split(" ").slice(1).join(" ") || "",
    username: user?.username || "",
    email: user?.email || "",
    title: user?.title || "",
    bio: user?.bio || "",
    phone: user?.phone || "",
    location: user?.location || "",
    isGoogleUser: user?.providerData?.[0]?.providerId === "google.com",
  });
  const [saving, setSaving] = useState(false);

  const [draft, setDraft] = useState<ProfileData>(profile);
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; username?: string }>({});

  const showToast = (
    type: "success" | "error",
    message: string
  ) => {
    setToast({ type, message });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const fullDisplayName = `${profile.firstName} ${profile.lastName}`.trim();
  const initials = ((profile.firstName[0] || "") + (profile.lastName[0] || "")).toUpperCase();

  const hasUnsavedChanges =
    JSON.stringify(profile) !== JSON.stringify(draft);

  // Mock stats
  const stats = [
    { value: 12, label: "Salas creadas" },
    { value: 28, label: "Salas unidas" },
    { value: 156, label: "Horas de estudio" },
    { value: 45, label: "Compañeros" },
  ];

  const handleSaveChanges = async () => {
    const currentErrors: { firstName?: string; lastName?: string; username?: string } = {};

    if (!draft.firstName.trim()) currentErrors.firstName = "El nombre es obligatorio.";
    if (!draft.lastName.trim()) currentErrors.lastName = "El apellido es obligatorio.";
    if (draft.username.trim().length < 3) currentErrors.username = "El username debe tener al menos 3 caracteres.";
    if (!/^[a-z0-9_]+$/.test(draft.username.trim())) currentErrors.username = "El username solo puede contener minúsculas, números y guiones bajos";

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      showToast("error", "Por favor corrige los campos marcados.");
      return;
    }

    if (JSON.stringify(profile) === JSON.stringify(draft)) {
      showToast("error", "No se detectaron cambios para guardar.");
      return;
    }

    setSaving(true);
    try {
      const res = await apiPut("/api/users/profile", {
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        username: draft.username.trim(),
      });

      if (res.status === 409) {
        setErrors({ username: "Este nombre de usuario ya está siendo utilizado." });
        showToast("error", "El username ya está en uso.");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast("error", (data as any).message || "No se pudo guardar el perfil. Intenta más tarde.");
        return;
      }

      setProfile(draft);
      setErrors({});
      setEditing(false);
      updateUser({ firstName: draft.firstName, lastName: draft.lastName, username: draft.username });
      showToast("success", "Tus cambios se guardaron correctamente.");
    } catch {
      showToast("error", "Error de conexión. No se pudo guardar el perfil.");
    } finally {
      setSaving(false);
    }
  };

    return (
      <>
        <style>{styles}</style>
        <div className="sr-profile">
          <AppNavbar showBack />

          <main className="sr-profile-body">
            {/* ── Hero Card) ── */}
            <div className="sr-hero-card">
              <div className="sr-hero-top">
                <div className="sr-avatar-lg">
                  {user?.photoURL
                    ? <img src={user.photoURL} alt={user.displayName || "Avatar"} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                    : initials
                  }
                </div>
                <div className="sr-hero-info">

                  {editing ? (
                    <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                      <div style={{ flex: 1 }}>
                        <label className="sr-label" htmlFor="profile-first-name">Nombre</label>
                        <input
                          id="profile-first-name"
                          className="sr-input"
                          value={draft.firstName}
                          onChange={(e) => setDraft((p) => ({ ...p, firstName: e.target.value }))}
                        />
                        {errors.firstName && <span className="sr-error-text">{errors.firstName}</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <label className="sr-label" htmlFor="profile-last-name">Apellido</label>
                        <input
                          id="profile-last-name"
                          className="sr-input"
                          value={draft.lastName}
                          onChange={(e) => setDraft((p) => ({ ...p, lastName: e.target.value }))}
                        />
                        {errors.lastName && <span className="sr-error-text">{errors.lastName}</span>}
                      </div>
                    </div>
                  ) : (
                    <div className="sr-hero-name">{fullDisplayName || "Estudiante StudyRoom"}</div>
                  )}

                  {editing ? (
                    <div style={{ display: "flex", gap: "12px" }}>
                      <div style={{ flex: 1 }}>
                        <label className="sr-label" htmlFor="profile-username">Nombre de Usuario (Username)</label>
                        <input
                          id="profile-username"
                          className="sr-input"
                          value={draft.username}
                          onChange={(e) => setDraft((p) => ({ ...p, username: e.target.value }))}
                        />
                        {errors.username && <span className="sr-error-text"> {errors.username}</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <label className="sr-label" htmlFor="profile-title">Título Institucional</label>
                        <input
                          id="profile-title"
                          className="sr-input"
                          placeholder="Ej: Estudiante de Ingeniería"
                          value={draft.title}
                          onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="sr-hero-title">
                      {profile.title || <span className="sr-empty-placeholder">Sin título institucional definido</span>}
                      <span className="sr-hero-username">@{profile.username}</span>
                    </div>
                  )}
                </div>

                {!editing && (
                  <button className="sr-edit-btn" onClick={() => { setDraft(profile); setErrors({}); setEditing(true); }}>
                    Editar Perfil
                  </button>
                )}
              </div>

              {/* Estadísticas */}
              <div className="sr-stats">
                {stats.map((s) => (
                  <div key={s.label} className="sr-stat">
                    <div className="sr-stat-value">{s.value}</div>
                    <div className="sr-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sr-info-grid">

              {/* Tarjeta: Acerca de mí */}
              <div className="sr-info-card">
                <div className="sr-info-card-title">Acerca de mí</div>
                {editing ? (
                  <textarea
                    className="sr-textarea"
                    placeholder="Cuéntale a la comunidad sobre ti, tus intereses o materias favoritas..."
                    value={draft.bio}
                    onChange={(e) => setDraft((p) => ({ ...p, bio: e.target.value }))}
                  />
                ) : (
                  <p className="sr-info-text">
                    {profile.bio || <span className="sr-empty-placeholder">¡Haz clic en Editar Perfil para escribir tu biografía por primera vez!</span>}
                  </p>
                )}
              </div>

              {/* Tarjeta: Información de contacto */}
              <div className="sr-info-card">
                <div>
                  <div className="sr-info-card-title">Información de contacto</div>

                  {/* Campo: Correo */}
                  <div className="sr-contact-item">
                    {editing ? (
                      <>
                        <label className="sr-contact-label" htmlFor="profile-email" style={{ display: "block" }}>Correo</label>
                        <input
                          id="profile-email"
                          className="sr-input"
                          value={draft.email}
                          disabled={profile.isGoogleUser}
                          onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))}
                        />
                      </>
                    ) : (
                      <>
                        <div className="sr-contact-label">Correo</div>
                        <div className="sr-contact-value">{profile.email}</div>
                      </>
                    )}
                  </div>

                  {/* Campo: Teléfono */}
                  <div className="sr-contact-item">
                    {editing ? (
                      <>
                        <label className="sr-contact-label" htmlFor="profile-phone" style={{ display: "block" }}>Teléfono</label>
                        <input
                          id="profile-phone"
                          className="sr-input"
                          placeholder="+57 300 000 0000"
                          value={draft.phone}
                          onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))}
                        />
                      </>
                    ) : (
                      <>
                        <div className="sr-contact-label">Teléfono</div>
                        <div className="sr-contact-value">
                          {profile.phone || <span className="sr-empty-placeholder">No registrado</span>}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Campo: Ubicación */}
                  <div className="sr-contact-item">
                    {editing ? (
                      <>
                        <label className="sr-contact-label" htmlFor="profile-location" style={{ display: "block" }}>Ubicación</label>
                        <input
                          id="profile-location"
                          className="sr-input"
                          placeholder="Ciudad, Campus o Dirección"
                          value={draft.location}
                          onChange={(e) => setDraft((p) => ({ ...p, location: e.target.value }))}
                        />
                      </>
                    ) : (
                      <>
                        <div className="sr-contact-label">Ubicación</div>
                        <div className="sr-contact-value">
                          {profile.location || <span className="sr-empty-placeholder">No especificada</span>}
                        </div>
                      </>
                    )}
                  </div>

                </div>
              </div>
            </div>

            {/* ── Preferencias de visualización ── */}
            <div className="sr-prefs-card">
              <div className="sr-prefs-section-title">Preferencias de visualización</div>
              <div className="sr-prefs-row">
                <span className="sr-prefs-label">Tamaño de fuente</span>
                <div className="sr-font-size-group" role="group" aria-label="Tamaño de fuente">
                  {FONT_SIZE_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      className={`sr-font-size-btn${fontSize === value ? " active" : ""}`}
                      onClick={() => setFontSize(value)}
                      aria-pressed={fontSize === value}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sr-prefs-row" style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #1e1e1e" }}>
                <span className="sr-prefs-label">Tema de color</span>
                <div className="sr-font-size-group" role="group" aria-label="Tema de color">
                  {(["dark", "light"] as const).map((t) => (
                    <button
                      key={t}
                      className={`sr-font-size-btn${theme === t ? " active" : ""}`}
                      onClick={() => setTheme(t)}
                      aria-pressed={theme === t}
                    >
                      {t === "dark" ? "Oscuro" : "Claro"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {editing ? (
              <div style={{ marginTop: 20 }}>
                <button className="sr-save-btn" onClick={handleSaveChanges} disabled={saving} style={{ opacity: saving ? 0.6 : 1 }}>
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
                <button className="sr-cancel-edit-btn" onClick={() => {
                  if (hasUnsavedChanges) {
                    setShowDiscardModal(true);
                  } else {
                    setEditing(false);
                    setErrors({});
                  }
                }}>
                  Cancelar
                </button>
              </div>
            ) : (
              <button className="sr-delete-account-btn" onClick={() => setShowDeleteModal(true)}>
                Eliminar Cuenta
              </button>
            )}
          </main>
        </div>

        {showDeleteModal && (
          <div
            className="sr-modal-overlay"
            ref={deleteModalRef}
            onKeyDown={(e) => { if (e.key === "Escape") setShowDeleteModal(false); }}
          >
            <div className="sr-modal">
              <h3 className="sr-modal-title">¿Estás completamente seguro?</h3>
              <p className="sr-modal-desc">
                Esta acción es irreversible. Se borrarán de forma permanente tus datos de perfil y tus salas creadas.
              </p>
              <div className="sr-modal-actions">
                <button className="sr-confirm-delete-btn" onClick={async () => {
                  try {
                    await apiDelete("/api/users/me");
                  } catch { /* si falla la red, igual limpiamos la sesión local */ }
                  setShowDeleteModal(false);
                  await logout();
                  navigate("/login");
                }}>
                  Sí, eliminar cuenta
                </button>
                <button className="sr-cancel-edit-btn" onClick={() => setShowDeleteModal(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {showDiscardModal && (
          <div
            className="sr-modal-overlay"
            ref={discardModalRef}
            onKeyDown={(e) => { if (e.key === "Escape") setShowDiscardModal(false); }}
          >
            <div className="sr-modal">
              <h3 className="sr-modal-title">
                ¿Descartar cambios?
              </h3>

              <p className="sr-modal-desc">
                Si abandonas esta página, perderás los cambios realizados.
              </p>

              <div className="sr-modal-actions">
                <button
                  className="sr-confirm-delete-btn"
                  onClick={() => {
                    setDraft(profile);
                    setEditing(false);
                    setErrors({});
                    setShowDiscardModal(false);
                  }}
                >
                  Salir sin guardar
                </button>

                <button
                  className="sr-cancel-edit-btn"
                  onClick={() => setShowDiscardModal(false)}
                >
                  Continuar editando
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div className={`sr-toast ${toast.type}`}>
            <span>{toast.message}</span>
          </div>
        )}
      </>
    );
}
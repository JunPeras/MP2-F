import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0a0a; }

  .sr-profile {
    min-height: 100vh;
    background: #0a0a0a;
    font-family: 'Outfit', sans-serif;
    color: #e5e5e5;
  }

  .sr-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 28px; height: 56px;
    background: #0f0f0f; border-bottom: 1px solid #1a1a1a;
  }
  .sr-nav-left { display: flex; align-items: center; gap: 14px; }
  .sr-back-btn {
    background: none; border: none; cursor: pointer;
    color: #4caf50; display: flex; align-items: center; padding: 4px;
    transition: color 0.2s;
  }
  .sr-back-btn:hover { color: #81c784; }
  .sr-nav-logo { display: flex; align-items: center; gap: 8px; }
  .sr-nav-logo-icon {
    width: 32px; height: 32px;
    background: #111; border: 1.5px solid #2a5c2a; border-radius: 7px;
    display: flex; align-items: center; justify-content: center; color: #4caf50;
  }
  .sr-nav-logo-text { font-size: 17px; font-weight: 600; color: #f0f0f0; }
  .sr-nav-avatar {
    width: 36px; height: 36px; background: #2a6b2a; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: #d4edda;
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
  .sr-hero-title { font-size: 14px; color: #666; }
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
  .sr-stat-label { font-size: 12px; color: #666; }

  /* ── Info cards ── */
  .sr-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  .sr-info-card {
    background: #111; border: 1px solid #1e1e1e; border-radius: 14px;
    padding: 22px 24px;
  }
  .sr-info-card-title { font-size: 15px; font-weight: 600; color: #ddd; margin-bottom: 14px; }
  .sr-info-text { font-size: 14px; color: #777; line-height: 1.6; }

  /* Estados vacíos estéticos */
  .sr-empty-placeholder { font-style: italic; color: #555; font-size: 13px; }

  .sr-contact-item { margin-bottom: 14px; }
  .sr-contact-item:last-child { margin-bottom: 0; }
  .sr-contact-label { font-size: 12px; color: #666; margin-bottom: 3px; font-weight: 500; }
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

const BookOpenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
  </svg>
);

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

export default function ProfilePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [profile, setProfile] = useState<ProfileData>({
    firstName: user?.displayName?.split(" ")[0] || "Andrea",
    lastName: user?.displayName?.split(" ")[1] || "Solarte",
    username: user?.username || "yeye",
    email: user?.email || "yeye@univalle.edu.co",
    title: "",
    bio: "",
    phone: "",
    location: "",
    isGoogleUser: true
  });

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

  const handleSaveChanges = () => {
    const currentErrors: { firstName?: string; lastName?: string; username?: string } = {};

    if (!draft.firstName.trim()) currentErrors.firstName = "El nombre es obligatorio.";
    if (!draft.lastName.trim()) currentErrors.lastName = "El apellido es obligatorio.";

    if (draft.username.trim().length < 3) {
      currentErrors.username = "El username debe tener al menos 3 caracteres.";
    }

    if (draft.username.toLowerCase() === "ocupado") {
      currentErrors.username = "Este nombre de usuario ya está siendo utilizado.";
    }

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);

      showToast(
        "error",
        "Por favor corrige los campos marcados."
      );

      return true;
    }

    if (JSON.stringify(profile) === JSON.stringify(draft)) {
      showToast(
        "error",
        "No se detectaron cambios para guardar."
      );

      return true;
    }

    setProfile(draft);
    setErrors({});
    setEditing(false);

    showToast(
      "success",
      "Tus cambios se guardaron correctamente."
    );
  };

    return (
      <>
        <style>{styles}</style>
        <div className="sr-profile">
          <nav className="sr-nav">
            <div className="sr-nav-left">
              <button className="sr-back-btn" onClick={() => navigate("/dashboard")}><ArrowLeftIcon /></button>
              <div className="sr-nav-logo">
                <div className="sr-nav-logo-icon"><BookOpenIcon /></div>
                <span className="sr-nav-logo-text">StudyRoom</span>
              </div>
            </div>
            <div className="sr-nav-avatar">{initials}</div>
          </nav>

          <div className="sr-profile-body">
            {/* ── Hero Card) ── */}
            <div className="sr-hero-card">
              <div className="sr-hero-top">
                <div className="sr-avatar-lg">{initials}</div>
                <div className="sr-hero-info">

                  {editing ? (
                    <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                      <div style={{ flex: 1 }}>
                        <label className="sr-label">Nombre</label>
                        <input
                          className="sr-input"
                          value={draft.firstName}
                          onChange={(e) => setDraft((p) => ({ ...p, firstName: e.target.value }))}
                        />
                        {errors.firstName && <span className="sr-error-text">{errors.firstName}</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <label className="sr-label">Apellido</label>
                        <input
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
                        <label className="sr-label">Nombre de Usuario (Username)</label>
                        <input
                          className="sr-input"
                          value={draft.username}
                          onChange={(e) => setDraft((p) => ({ ...p, username: e.target.value }))}
                        />
                        {errors.username && <span className="sr-error-text"> {errors.username}</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <label className="sr-label">Título Institucional</label>
                        <input
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
                    <div className="sr-contact-label">Correo</div>
                    {editing ? (
                      <input
                        className="sr-input"
                        value={draft.email}
                        disabled={profile.isGoogleUser} // Candado si viene de Google OAuth
                        onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))}
                      />
                    ) : (
                      <div className="sr-contact-value">{profile.email}</div>
                    )}
                  </div>

                  {/* Campo: Teléfono */}
                  <div className="sr-contact-item">
                    <div className="sr-contact-label">Teléfono</div>
                    {editing ? (
                      <input
                        className="sr-input"
                        placeholder="+57 300 000 0000"
                        value={draft.phone}
                        onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))}
                      />
                    ) : (
                      <div className="sr-contact-value">
                        {profile.phone || <span className="sr-empty-placeholder">No registrado</span>}
                      </div>
                    )}
                  </div>

                  {/* Campo: Ubicación */}
                  <div className="sr-contact-item">
                    <div className="sr-contact-label">Ubicación</div>
                    {editing ? (
                      <input
                        className="sr-input"
                        placeholder="Ciudad, Campus o Dirección"
                        value={draft.location}
                        onChange={(e) => setDraft((p) => ({ ...p, location: e.target.value }))}
                      />
                    ) : (
                      <div className="sr-contact-value">
                        {profile.location || <span className="sr-empty-placeholder">No especificada</span>}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>

            {editing ? (
              <div style={{ marginTop: 20 }}>
                <button className="sr-save-btn" onClick={handleSaveChanges}>
                  Guardar cambios
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
          </div>
        </div>

        {showDeleteModal && (
          <div className="sr-modal-overlay">
            <div className="sr-modal">
              <h3 className="sr-modal-title">¿Estás completamente seguro?</h3>
              <p className="sr-modal-desc">
                Esta acción es irreversible. Se borrarán de forma permanente tus datos de perfil y tus salas creadas.
              </p>
              <div className="sr-modal-actions">
                <button className="sr-confirm-delete-btn" onClick={() => { setShowDeleteModal(false); navigate("/login"); }}>
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
          <div className="sr-modal-overlay">
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
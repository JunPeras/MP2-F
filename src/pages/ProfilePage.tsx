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

  .sr-contact-item { margin-bottom: 14px; }
  .sr-contact-item:last-child { margin-bottom: 0; }
  .sr-contact-label { font-size: 12px; color: #555; margin-bottom: 3px; }
  .sr-contact-value { font-size: 14px; color: #ccc; }

  /* ── Edit form ── */
  .sr-field { margin-bottom: 16px; }
  .sr-label { display: block; font-size: 13px; color: #aaa; margin-bottom: 6px; font-weight: 500; }
  .sr-input {
    width: 100%; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px;
    padding: 9px 12px; font-size: 14px; font-family: 'Outfit', sans-serif;
    color: #e5e5e5; outline: none; transition: border-color 0.2s;
  }
  .sr-input::placeholder { color: #444; }
  .sr-input:focus { border-color: #3a7d3a; }
  .sr-textarea {
    width: 100%; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px;
    padding: 9px 12px; font-size: 14px; font-family: 'Outfit', sans-serif;
    color: #e5e5e5; outline: none; transition: border-color 0.2s;
    resize: vertical; min-height: 80px;
  }
  .sr-textarea:focus { border-color: #3a7d3a; }

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
`;

const BookOpenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);
const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
  </svg>
);

interface ProfileData {
  bio: string;
  title: string;
  phone: string;
  location: string;
}

export default function ProfilePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    bio: "Estudiante de último semestre apasionado por la tecnología y el aprendizaje colaborativo. Me gusta ayudar a otros a entender conceptos complejos de programación.",
    title: "Ingeniero en sistemas en Universidad del Valle",
    phone: "+57 322 264 4932",
    location: "Cali, Colombia - Carrera 3 # 54 44",
  });
  const [draft, setDraft] = useState<ProfileData>(profile);

  const displayName = user?.displayName || "Usuario";
  const email = user?.email || "";
  const initials = displayName.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();

  // Mock stats
  const stats = [
    { value: 12, label: "Salas creadas" },
    { value: 28, label: "Salas unidas" },
    { value: 156, label: "Horas de estudio" },
    { value: 45, label: "Compañeros" },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="sr-profile">
        <nav className="sr-nav">
          <div className="sr-nav-left">
            <button className="sr-back-btn" onClick={() => navigate(-1)}><ArrowLeftIcon /></button>
            <div className="sr-nav-logo">
              <div className="sr-nav-logo-icon"><BookOpenIcon /></div>
              <span className="sr-nav-logo-text">StudyRoom</span>
            </div>
          </div>
          <div className="sr-nav-avatar">{initials}</div>
        </nav>

        <div className="sr-profile-body">
          {/* Hero */}
          <div className="sr-hero-card">
            <div className="sr-hero-top">
              <div className="sr-avatar-lg">{initials}</div>
              <div className="sr-hero-info">
                <div className="sr-hero-name">{displayName}</div>
                {editing ? (
                  <input
                    className="sr-input"
                    style={{ marginTop: 4, maxWidth: 320 }}
                    value={draft.title}
                    onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
                  />
                ) : (
                  <div className="sr-hero-title">{profile.title}</div>
                )}
              </div>
              {!editing && (
                <button className="sr-edit-btn" onClick={() => { setDraft(profile); setEditing(true); }}>
                  Editar
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="sr-stats">
              {stats.map((s) => (
                <div key={s.label} className="sr-stat">
                  <div className="sr-stat-value">{s.value}</div>
                  <div className="sr-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Info grid */}
          <div className="sr-info-grid">
            <div className="sr-info-card">
              <div className="sr-info-card-title">Acerca de mí</div>
              {editing ? (
                <textarea
                  className="sr-textarea"
                  value={draft.bio}
                  onChange={(e) => setDraft((p) => ({ ...p, bio: e.target.value }))}
                />
              ) : (
                <p className="sr-info-text">{profile.bio}</p>
              )}
            </div>

            <div className="sr-info-card">
              <div className="sr-info-card-title">Información de contacto</div>

              <div className="sr-contact-item">
                <div className="sr-contact-label">Correo</div>
                <div className="sr-contact-value">{email}</div>
              </div>

              <div className="sr-contact-item">
                <div className="sr-contact-label">Teléfono</div>
                {editing ? (
                  <input
                    className="sr-input"
                    value={draft.phone}
                    onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value }))}
                  />
                ) : (
                  <div className="sr-contact-value">{profile.phone}</div>
                )}
              </div>

              <div className="sr-contact-item">
                <div className="sr-contact-label">Ubicación</div>
                {editing ? (
                  <input
                    className="sr-input"
                    value={draft.location}
                    onChange={(e) => setDraft((p) => ({ ...p, location: e.target.value }))}
                  />
                ) : (
                  <div className="sr-contact-value">{profile.location}</div>
                )}
              </div>
            </div>
          </div>

          {/* Save / cancel */}
          {editing && (
            <div style={{ marginTop: 18 }}>
              <button
                className="sr-save-btn"
                onClick={() => { setProfile(draft); setEditing(false); }}
              >
                Guardar cambios
              </button>
              <button className="sr-cancel-edit-btn" onClick={() => setEditing(false)}>
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
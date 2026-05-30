import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

// ─── Shared styles ────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body { background: #0a0a0a; }

  .sr-dash {
    min-height: 100vh;
    background: #0a0a0a;
    font-family: 'Outfit', sans-serif;
    color: #e5e5e5;
  }

  /* ── Navbar ── */
  .sr-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
    height: 56px;
    background: #0f0f0f;
    border-bottom: 1px solid #1a1a1a;
  }
  .sr-nav-logo { display: flex; align-items: center; gap: 8px; }
  .sr-nav-logo-icon {
    width: 32px; height: 32px;
    background: #111; border: 1.5px solid #2a5c2a; border-radius: 7px;
    display: flex; align-items: center; justify-content: center; color: #4caf50;
  }
  .sr-nav-logo-text { font-size: 17px; font-weight: 600; color: #f0f0f0; }

  .sr-nav-avatar {
    width: 36px; height: 36px;
    background: #2a6b2a;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: #d4edda;
    cursor: pointer;
    position: relative;
  }
  .sr-nav-dropdown {
    position: absolute;
    top: 44px; right: 0;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 10px;
    overflow: hidden;
    min-width: 160px;
    z-index: 100;
  }
  .sr-nav-dropdown button {
    display: block; width: 100%;
    padding: 10px 16px;
    background: none; border: none;
    text-align: left; font-size: 14px;
    font-family: 'Outfit', sans-serif;
    color: #ccc; cursor: pointer;
    transition: background 0.15s;
  }
  .sr-nav-dropdown button:hover { background: #222; }
  .sr-nav-dropdown button.danger { color: #e05454; }

  /* ── Body ── */
  .sr-dash-body { padding: 40px 32px; max-width: 1100px; margin: 0 auto; }

  .sr-dash-heading { font-size: 28px; font-weight: 700; color: #fff; margin-bottom: 6px; }
  .sr-dash-subheading { font-size: 14px; color: #666; margin-bottom: 28px; }

  /* ── Toolbar ── */
  .sr-toolbar {
    display: flex; align-items: center; gap: 12px; margin-bottom: 32px;
  }
  .sr-search-wrap {
    flex: 1; position: relative; display: flex; align-items: center;
  }
  .sr-search-icon { position: absolute; left: 13px; color: #555; display: flex; align-items: center; pointer-events: none; }
  .sr-search-input {
    width: 100%;
    background: #111; border: 1px solid #1e1e1e; border-radius: 8px;
    padding: 10px 12px 10px 38px;
    font-size: 14px; font-family: 'Outfit', sans-serif; color: #e5e5e5; outline: none;
    transition: border-color 0.2s;
  }
  .sr-search-input::placeholder { color: #444; }
  .sr-search-input:focus { border-color: #2a5c2a; }

  .sr-btn-outline {
    background: transparent; border: 1px solid #2a2a2a; border-radius: 8px;
    padding: 9px 16px; font-size: 14px; font-family: 'Outfit', sans-serif;
    color: #aaa; cursor: pointer; display: flex; align-items: center; gap: 7px;
    white-space: nowrap; transition: background 0.2s, border-color 0.2s;
  }
  .sr-btn-outline:hover { background: #1a1a1a; border-color: #3a3a3a; }

  .sr-btn-primary {
    background: #4caf50; border: none; border-radius: 8px;
    padding: 9px 16px; font-size: 14px; font-family: 'Outfit', sans-serif;
    font-weight: 600; color: #fff; cursor: pointer; display: flex; align-items: center; gap: 7px;
    white-space: nowrap; transition: background 0.2s;
  }
  .sr-btn-primary:hover { background: #43a047; }

  /* ── Section title ── */
  .sr-section-title { font-size: 16px; font-weight: 600; color: #ddd; margin-bottom: 16px; }

  /* ── Rooms grid ── */
  .sr-rooms-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  .sr-room-card {
    background: #111; border: 1px solid #1e1e1e; border-radius: 12px;
    padding: 20px 22px;
    transition: border-color 0.2s;
  }
  .sr-room-card:hover { border-color: #2a5c2a; }

  .sr-room-name { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 5px; }
  .sr-room-desc { font-size: 13px; color: #666; margin-bottom: 14px; line-height: 1.4; }

  .sr-room-meta {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 12px;
  }
  .sr-room-members { font-size: 13px; color: #888; }
  .sr-room-code { font-size: 13px; color: #555; }

  .sr-room-footer {
    display: flex; align-items: center; justify-content: space-between;
  }
  .sr-room-creator { font-size: 12px; color: #555; }

  .sr-btn-enter {
    background: #4caf50; border: none; border-radius: 6px;
    padding: 6px 18px; font-size: 13px; font-family: 'Outfit', sans-serif;
    font-weight: 600; color: #fff; cursor: pointer;
    transition: background 0.2s;
  }
  .sr-btn-enter:hover { background: #43a047; }

  /* ── Modals ── */
  .sr-modal-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.75);
    display: flex; align-items: center; justify-content: center;
    z-index: 200;
  }
  .sr-modal {
    background: #111; border: 1px solid #222;
    border-radius: 14px; padding: 32px 36px;
    width: 100%; max-width: 380px;
  }
  .sr-modal-title { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 8px; }
  .sr-modal-sub { font-size: 14px; color: #666; margin-bottom: 22px; }

  .sr-modal-field { margin-bottom: 18px; }
  .sr-modal-label { display: block; font-size: 13px; color: #ccc; font-weight: 500; margin-bottom: 6px; }
  .sr-modal-input {
    width: 100%; background: #1a1a1a; border: 1px solid #2a2a2a;
    border-radius: 8px; padding: 10px 12px;
    font-size: 14px; font-family: 'Outfit', sans-serif; color: #e5e5e5; outline: none;
    transition: border-color 0.2s;
  }
  .sr-modal-input::placeholder { color: #444; }
  .sr-modal-input:focus { border-color: #3a7d3a; }

  .sr-modal-actions { display: flex; gap: 10px; }
  .sr-modal-actions .sr-btn-primary { flex: 1; justify-content: center; padding: 11px; font-size: 14px; }
  .sr-modal-cancel {
    flex: 1; background: transparent; border: 1px solid #2a2a2a; border-radius: 8px;
    padding: 11px; font-size: 14px; font-family: 'Outfit', sans-serif;
    color: #888; cursor: pointer; transition: background 0.2s;
  }
  .sr-modal-cancel:hover { background: #1a1a1a; }
`;

const BookOpenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const UserPlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/>
  </svg>
);

// Mock rooms data
const MOCK_ROOMS = [
  { id: "1", name: "Matematicas Avanzadas", description: "Grupo de estudio para cálculo integral y diferencial", members: 8, maxMembers: 12, code: "MAT-2024", creator: "María García" },
];

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [newRoom, setNewRoom] = useState({ name: "", description: "" });

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "?";

  const firstName = user?.displayName?.split(" ")[0] || "Usuario";

  const filteredRooms = MOCK_ROOMS.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{styles}</style>
      <div className="sr-dash">
        {/* Navbar */}
        <nav className="sr-nav">
          <div className="sr-nav-logo">
            <div className="sr-nav-logo-icon"><BookOpenIcon /></div>
            <span className="sr-nav-logo-text">StudyRoom</span>
          </div>
          <div style={{ position: "relative" }}>
            <div className="sr-nav-avatar" onClick={() => setDropdownOpen((v) => !v)}>
              {initials}
            </div>
            {dropdownOpen && (
              <div className="sr-nav-dropdown">
                <button onClick={() => { setDropdownOpen(false); navigate("/perfil"); }}>Mi perfil</button>
                <button className="danger" onClick={async () => { await logout(); }}>Cerrar sesión</button>
              </div>
            )}
          </div>
        </nav>

        {/* Body */}
        <div className="sr-dash-body">
          <h1 className="sr-dash-heading">Bienvenido, {firstName}</h1>
          <p className="sr-dash-subheading">Encuentra una sala o crea una nueva para empezar a estudiar</p>

          <div className="sr-toolbar">
            <div className="sr-search-wrap">
              <span className="sr-search-icon"><SearchIcon /></span>
              <input
                className="sr-search-input"
                type="text"
                placeholder="Buscar salas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="sr-btn-outline" onClick={() => setShowJoin(true)}>
              <UserPlusIcon /> Unirse con código
            </button>
            <button className="sr-btn-primary" onClick={() => setShowCreate(true)}>
              <PlusIcon /> Crear sala
            </button>
          </div>

          <div className="sr-section-title">Salas de estudio</div>

          <div className="sr-rooms-grid">
            {filteredRooms.map((room) => (
              <div key={room.id} className="sr-room-card">
                <div className="sr-room-name">{room.name}</div>
                <div className="sr-room-desc">{room.description}</div>
                <div className="sr-room-meta">
                  <span className="sr-room-members">{room.members}/{room.maxMembers}</span>
                  <span className="sr-room-code"># {room.code}</span>
                </div>
                <div className="sr-room-footer">
                  <span className="sr-room-creator">Creada por {room.creator}</span>
                  <button className="sr-btn-enter" onClick={() => navigate(`/sala/${room.id}`)}>
                    Entrar
                  </button>
                </div>
              </div>
            ))}
            {filteredRooms.length === 0 && (
              <p style={{ color: "#555", fontSize: 14 }}>No se encontraron salas.</p>
            )}
          </div>
        </div>
      </div>

      {/* Join Modal */}
      {showJoin && (
        <div className="sr-modal-backdrop" onClick={() => setShowJoin(false)}>
          <div className="sr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sr-modal-title">Unirse con código</div>
            <div className="sr-modal-sub">Ingresa el código de la sala para unirte</div>
            <div className="sr-modal-field">
              <label className="sr-modal-label">Código de sala</label>
              <input
                className="sr-modal-input"
                placeholder="Ej: MAT-2024"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
              />
            </div>
            <div className="sr-modal-actions">
              <button className="sr-modal-cancel" onClick={() => setShowJoin(false)}>Cancelar</button>
              <button className="sr-btn-primary" onClick={() => setShowJoin(false)}>Unirse</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="sr-modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="sr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sr-modal-title">Crear sala</div>
            <div className="sr-modal-sub">Configura tu nueva sala de estudio</div>
            <div className="sr-modal-field">
              <label className="sr-modal-label">Nombre de la sala</label>
              <input
                className="sr-modal-input"
                placeholder="Ej: Cálculo diferencial"
                value={newRoom.name}
                onChange={(e) => setNewRoom((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="sr-modal-field">
              <label className="sr-modal-label">Descripción</label>
              <input
                className="sr-modal-input"
                placeholder="Describe el tema de la sala"
                value={newRoom.description}
                onChange={(e) => setNewRoom((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
            <div className="sr-modal-actions">
              <button className="sr-modal-cancel" onClick={() => setShowCreate(false)}>Cancelar</button>
              <button className="sr-btn-primary" onClick={() => setShowCreate(false)}>Crear</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

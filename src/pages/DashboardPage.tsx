import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import CreateRoomForm from "../components/CreateRoomForm";
import AppNavbar from "../components/AppNavbar";
import { apiGet, apiPost } from "../lib/api";

interface Room {
  id: string;
  name: string;
  description?: string;
  membersCount: number;
  adminUsername: string;
  code?: string;
}

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
    position: relative;
  }
  .sr-room-card:hover { border-color: #2a5c2a; }

  .sr-room-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 5px; }
  .sr-room-name { font-size: 16px; font-weight: 600; color: #fff; }

  .sr-dots-btn {
    background: none; border: none; cursor: pointer; padding: 2px 4px;
    color: #4caf50; display: flex; align-items: center; border-radius: 4px;
    transition: background 0.15s; flex-shrink: 0; margin-left: 8px; margin-top: -1px;
  }
  .sr-dots-btn:hover { background: #1a2e1a; }

  .sr-dropdown {
    position: absolute; top: 44px; right: 16px; z-index: 50;
    background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5); min-width: 140px; overflow: hidden;
  }
  .sr-dropdown-item {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 14px; font-size: 13px; font-family: 'Outfit', sans-serif;
    background: none; border: none; width: 100%; text-align: left;
    cursor: pointer; transition: background 0.15s;
  }
  .sr-dropdown-item { color: #ccc; }
  .sr-dropdown-item:hover { background: #252525; color: #fff; }
  .sr-dropdown-item.danger { color: #ef5350; }
  .sr-dropdown-item.danger:hover { background: #2c1414; }
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

  .sr-modal-actions { display: flex; gap: 10px; margin-top: 24px; }
  .sr-modal-actions .sr-btn-primary { flex: 1; justify-content: center; padding: 11px; font-size: 14px; }
  .sr-modal-cancel {
    flex: 1; background: transparent; border: 1px solid #2a2a2a; border-radius: 8px;
    padding: 11px; font-size: 14px; font-family: 'Outfit', sans-serif;
    color: #888; cursor: pointer; transition: background 0.2s;
  }
  .sr-modal-cancel:hover { background: #1a1a1a; }

  .sr-modal-desc { font-size: 14px; color: #aaa; line-height: 1.5; margin-bottom: 24px; }
  .sr-confirm-delete-btn {
    flex: 1; background: #c62828; border: none; border-radius: 8px;
    padding: 11px; font-size: 14px; font-family: 'Outfit', sans-serif;
    font-weight: 600; color: #fff; cursor: pointer; transition: background 0.2s;
  }
  .sr-confirm-delete-btn:hover { background: #b71c1c; }

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

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [showJoin, setShowJoin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [joinCode, setJoinCode] = useState("");
  // Mock rooms (comentados — reemplazados por GET /api/rooms)
  // { id: "1", name: "Matemáticas Avanzadas", description: "Cálculo diferencial e integral, series y sucesiones.", members: 4, maxMembers: 10, code: "SR-1042", creator: "Maria Garcia" },
  // { id: "2", name: "Programación Web", description: "React, TypeScript y diseño de APIs REST.", members: 2, maxMembers: 8, code: "SR-2218", creator: "Juan Esteban" },
  // { id: "3", name: "Física Cuántica", description: "Mecánica cuántica y relatividad especial.", members: 6, maxMembers: 6, code: "SR-3374", creator: "Valentina Garcia" },
  // { id: "4", name: "Historia del Arte", description: "Arte contemporáneo y movimientos del siglo XX.", members: 1, maxMembers: 12, code: "SR-4891", creator: "Juan Pablo" },
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  const firstName = user?.displayName?.split(" ")[0] || "Usuario";

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
  const [roomToEdit, setRoomToEdit] = useState<{ id: string; name: string; description: string } | null>(null);
  const [editError, setEditError] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await apiGet("/api/rooms");
      if (res.ok) {
        const data = await res.json();
        setRooms(Array.isArray(data) ? data : []);
      } else {
        setNotification({ type: "error", message: "No se pudieron cargar las salas." });
        setTimeout(() => setNotification(null), 3500);
      }
    } catch {
      setNotification({ type: "error", message: "Error de conexión al cargar salas." });
      setTimeout(() => setNotification(null), 3500);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const closeJoinModal = () => { setShowJoin(false); setJoinCode(""); setJoinError(null); };

  const handleJoin = () => {
    if (!joinCode.trim()) { setJoinError("Ingresa un código de sala"); return; }
    const room = rooms.find((r) => r.code.toLowerCase() === joinCode.trim().toLowerCase());
    if (room) { closeJoinModal(); navigate(`/sala/${room.id}`); }
    else setJoinError("Sala no encontrada. Verifica el código e intenta de nuevo.");
  };

  const handleRoomCreatedSuccess = async (roomData: { name: string; description: string }) => {
    try {
      const res = await apiPost("/api/rooms", { name: roomData.name });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setNotification({
          type: "error",
          message: (data as any).message || "No pudimos crear la sala. Por favor, intenta más tarde."
        });
        setTimeout(() => setNotification(null), 3500);
        return;
      }
      setShowCreate(false);
      await fetchRooms();
      setNotification({ type: "success", message: "¡Sala creada exitosamente!" });
      setTimeout(() => setNotification(null), 3000);
    } catch {
      setNotification({
        type: "error",
        message: "Error de conexión. No pudimos crear la sala."
      });
      setTimeout(() => setNotification(null), 3500);
    }
  };

  const filteredRooms = rooms.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{styles}</style>
      <div className="sr-dash">
        <AppNavbar showDropdown />

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

          {/* Salas de estudio */}
          <div className="sr-section-title">Salas de estudio</div>

          {loadingRooms ? (
            <div style={{ color: "#555", fontSize: 14, padding: "32px 0" }}>Cargando salas...</div>
          ) : rooms.length === 0 ? (
            <div style={{
              background: "#111",
              border: "1px solid #1e1e1e",
              borderRadius: "12px",
              padding: "48px 32px",
              textAlign: "center",
              maxWidth: "580px",
              margin: "32px auto 0"
            }}>
              <p style={{ color: "#aaa", fontSize: "15px", lineHeight: "1.6", margin: 0 }}>
                Crea tu primera sala de estudio para comenzar a colaborar con otros estudiantes. Aquí podrás visualizar y administrar todas tus salas.
              </p>
              <button 
                className="sr-btn-primary" 
                style={{ marginTop: "24px", display: "inline-flex", gap: "7px" }}
                onClick={() => setShowCreate(true)}
              >
                <PlusIcon /> Crear mi primera sala
              </button>
            </div>
          ) : (
            <div className="sr-rooms-grid">
              {filteredRooms.map((room) => (
                <div key={room.id} className="sr-room-card">
                  {openMenuId === room.id && (
                    <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setOpenMenuId(null)} />
                  )}
                  <div className="sr-room-header">
                    <div className="sr-room-name">{room.name}</div>
                    <button
                      className="sr-dots-btn"
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === room.id ? null : room.id); }}
                      title="Opciones"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
                      </svg>
                    </button>
                    {openMenuId === room.id && (
                      <div className="sr-dropdown" onClick={(e) => e.stopPropagation()}>
                        <button className="sr-dropdown-item" onClick={() => { setRoomToEdit({ id: room.id, name: room.name, description: room.description || "" }); setOpenMenuId(null); }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          Editar
                        </button>
                        <button className="sr-dropdown-item danger" onClick={() => { setRoomToDelete(room.id); setOpenMenuId(null); }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="sr-room-desc">{room.description || ""}</div>
                  <div className="sr-room-meta">
                    <span className="sr-room-members">
                      {room.membersCount} {room.membersCount === 1 ? "participante" : "participantes"}
                    </span>
                    {room.code && <span className="sr-room-code"># {room.code}</span>}
                  </div>
                  <div className="sr-room-footer">
                    <span className="sr-room-creator">@{room.adminUsername}</span>
                    <button className="sr-btn-enter" onClick={() => navigate(`/sala/${room.id}`)}>
                      Entrar
                    </button>
                  </div>
                </div>
              ))}
              {filteredRooms.length === 0 && (
                <p style={{ color: "#555", fontSize: 14 }}>No se encontraron salas que coincidan con la búsqueda.</p>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Join Modal */}
      {showJoin && (
        <div className="sr-modal-backdrop">
          <form className="sr-modal" onSubmit={(e) => { e.preventDefault(); handleJoin(); }}>
            <div className="sr-modal-title">Unirse con código</div>
            <div className="sr-modal-sub">Ingresa el código de la sala para unirte</div>
            <div className="sr-modal-field">
              <label className="sr-modal-label" style={{ color: joinError ? "#e05454" : "#ccc" }}>
                Código de sala
              </label>
              <input
                className="sr-modal-input"
                placeholder="Ej: SR-1042"
                value={joinCode}
                onChange={(e) => { setJoinCode(e.target.value); if (joinError) setJoinError(null); }}
                style={{ borderColor: joinError ? "#e05454" : "#2a2a2a" }}
                autoFocus
              />
              {joinError && (
                <div style={{ color: "#e05454", fontSize: "12px", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                  {joinError}
                </div>
              )}
            </div>
            <div className="sr-modal-actions">
              <button type="button" className="sr-modal-cancel" onClick={closeJoinModal}>Cancelar</button>
              <button type="submit" className="sr-btn-primary">Unirse</button>
            </div>
          </form>
        </div>
      )}

      {showCreate && (
        <div className="sr-modal-backdrop" onClick={() => setShowCreate(false)}>
          <CreateRoomForm 
            onSuccess={handleRoomCreatedSuccess} 
            onCancel={() => setShowCreate(false)} 
          />
        </div>
      )}

      {notification && (
        <div className={`sr-toast ${notification.type}`}>
          {notification.type === "success" ? "✅" : "❌"} {notification.message}
        </div>
      )}

      {roomToEdit && (
        <div className="sr-modal-backdrop" onClick={() => { setRoomToEdit(null); setEditError(false); }}>
          <form
            className="sr-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              if (!roomToEdit.name.trim()) { setEditError(true); return; }
              setRooms(rooms.map((r) => r.id === roomToEdit.id ? { ...r, name: roomToEdit.name, description: roomToEdit.description } : r));
              setRoomToEdit(null);
              setEditError(false);
            }}
          >
            <div className="sr-modal-title">Editar sala</div>
            <div className="sr-modal-sub">Modifica los datos de tu sala de estudio</div>
            <div className="sr-modal-field">
              <label className="sr-modal-label" style={{ color: editError ? "#e05454" : "#ccc" }}>
                Nombre de la sala
              </label>
              <input
                className="sr-modal-input"
                placeholder="Ej: Cálculo diferencial"
                value={roomToEdit.name}
                onChange={(e) => { setRoomToEdit({ ...roomToEdit, name: e.target.value }); if (e.target.value.trim()) setEditError(false); }}
                style={{ borderColor: editError ? "#e05454" : "#2a2a2a" }}
              />
              {editError && (
                <div style={{ color: "#e05454", fontSize: "12px", marginTop: "6px" }}>
                  El nombre de la sala es obligatorio
                </div>
              )}
            </div>
            <div className="sr-modal-field">
              <label className="sr-modal-label">Descripción (Opcional)</label>
              <textarea
                className="sr-modal-input"
                placeholder="Describe el tema de la sala"
                value={roomToEdit.description}
                onChange={(e) => setRoomToEdit({ ...roomToEdit, description: e.target.value })}
                style={{ height: "80px", resize: "none" }}
              />
            </div>
            <div className="sr-modal-actions">
              <button type="button" className="sr-modal-cancel" onClick={() => { setRoomToEdit(null); setEditError(false); }}>
                Cancelar
              </button>
              <button type="submit" className="sr-btn-primary">
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      )}

      {roomToDelete && (
        <div className="sr-modal-backdrop" onClick={() => setRoomToDelete(null)}>
          <div className="sr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sr-modal-title" style={{ fontSize: "18px", color: "#f44336", marginBottom: "12px" }}>
              ¿Estás seguro de eliminar esta sala?
            </div>
            <p className="sr-modal-desc">
              Se eliminará la sala y toda la información asociada dejará de estar disponible para sus participantes. Esta acción no se puede deshacer.
            </p>
            <div className="sr-modal-actions" style={{ justifyContent: "center" }}>
              <button
                className="sr-confirm-delete-btn"
                onClick={() => { setRooms(rooms.filter((r) => r.id !== roomToDelete)); setRoomToDelete(null); }}
              >
                Sí, eliminar sala
              </button>
              <button className="sr-modal-cancel" onClick={() => setRoomToDelete(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
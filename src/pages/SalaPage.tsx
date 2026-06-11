import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0a0a; }

  .sl-root {
    min-height: 100vh; height: 100vh;
    background: #0a0a0a;
    font-family: 'Outfit', sans-serif;
    color: #e5e5e5;
    display: flex; flex-direction: column;
    overflow: hidden;
  }

  /* ── Navbar ── */
  .sl-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 20px; height: 56px; flex-shrink: 0;
    background: #0f0f0f; border-bottom: 1px solid #1a1a1a;
  }
  .sl-nav-left { display: flex; align-items: center; gap: 14px; }
  .sl-back-btn {
    background: none; border: none; cursor: pointer;
    color: #4caf50; display: flex; align-items: center; padding: 4px;
    transition: color 0.2s;
  }
  .sl-back-btn:hover { color: #81c784; }
  .sl-nav-logo { display: flex; align-items: center; gap: 8px; }
  .sl-nav-logo-icon {
    width: 32px; height: 32px;
    background: #111; border: 1.5px solid #2a5c2a; border-radius: 7px;
    display: flex; align-items: center; justify-content: center; color: #4caf50;
  }
  .sl-room-info { display: flex; flex-direction: column; gap: 1px; }
  .sl-room-name { font-size: 16px; font-weight: 700; color: #fff; line-height: 1; }
  .sl-room-code { font-size: 12px; color: #555; }
  .sl-nav-actions { display: flex; align-items: center; gap: 8px; }
  .sl-nav-icon-btn {
    background: none; border: 1px solid #1e1e1e; border-radius: 8px;
    width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #888; transition: border-color 0.2s, color 0.2s;
  }
  .sl-nav-icon-btn:hover { border-color: #2a5c2a; color: #4caf50; }
  .sl-nav-icon-btn.active { border-color: #2a5c2a; color: #4caf50; }

  /* ── Body ── */
  .sl-body {
    display: flex; flex: 1; overflow: hidden;
  }

  /* ── Left sidebar: participantes ── */
  .sl-sidebar-left {
    width: 240px; flex-shrink: 0;
    background: #0f0f0f; border-right: 1px solid #1a1a1a;
    display: flex; flex-direction: column;
    overflow-y: auto;
  }
  .sl-sidebar-title {
    padding: 16px 16px 12px;
    font-size: 14px; font-weight: 600; color: #aaa;
    border-bottom: 1px solid #1a1a1a;
  }
  .sl-participant-list { padding: 8px 0; }
  .sl-participant-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 16px;
    transition: background 0.15s;
  }
  .sl-participant-item:hover { background: #141414; }
  .sl-participant-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: #1e4d1e;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: #81c784; flex-shrink: 0;
  }
  .sl-participant-name { font-size: 14px; color: #ccc; }

  /* ── Center: video grid ── */
  .sl-center {
    flex: 1; display: flex; flex-direction: column;
    overflow: hidden; position: relative;
  }
  .sl-video-grid {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px;
    background: #050505;
    overflow: hidden;
  }
  .sl-video-tile {
    background: #0d1a0d;
    position: relative;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
  }
  .sl-video-avatar {
    width: 72px; height: 72px; border-radius: 50%;
    background: #1e4d1e;
    display: flex; align-items: center; justify-content: center;
    font-size: 26px; font-weight: 700; color: #81c784;
    border: 2px solid #2a6b2a;
  }
  .sl-video-name {
    position: absolute; bottom: 14px; left: 14px;
    font-size: 13px; font-weight: 500; color: #ccc;
    background: rgba(0,0,0,0.55); padding: 3px 8px; border-radius: 5px;
  }

  /* ── Controls bar ── */
  .sl-controls {
    height: 68px; flex-shrink: 0;
    background: #0f0f0f; border-top: 1px solid #1a1a1a;
    display: flex; align-items: center; justify-content: center;
    gap: 12px;
  }
  .sl-ctrl-btn {
    width: 46px; height: 46px; border-radius: 50%;
    background: #1a1a1a; border: 1px solid #2a2a2a;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #ccc;
    transition: background 0.2s, border-color 0.2s, color 0.2s;
  }
  .sl-ctrl-btn:hover { background: #222; border-color: #3a3a3a; }
  .sl-ctrl-btn.active { background: #1e4d1e; border-color: #2a6b2a; color: #81c784; }
  .sl-ctrl-btn.danger { background: #c62828; border-color: #b71c1c; color: #fff; }
  .sl-ctrl-btn.danger:hover { background: #b71c1c; }

  /* ── Right sidebar: chat ── */
  .sl-sidebar-right {
    width: 300px; flex-shrink: 0;
    background: #0f0f0f; border-left: 1px solid #1a1a1a;
    display: flex; flex-direction: column;
  }
  .sl-chat-header {
    padding: 16px 16px 12px;
    font-size: 15px; font-weight: 600; color: #ddd;
    border-bottom: 1px solid #1a1a1a;
    flex-shrink: 0;
  }
  .sl-chat-messages {
    flex: 1; overflow-y: auto; padding: 14px 14px 0;
    display: flex; flex-direction: column; gap: 14px;
  }
  .sl-chat-messages::-webkit-scrollbar { width: 4px; }
  .sl-chat-messages::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
  .sl-chat-msg { display: flex; flex-direction: column; gap: 3px; }
  .sl-chat-msg-author { font-size: 13px; font-weight: 600; color: #4caf50; }
  .sl-chat-msg-text { font-size: 13px; color: #bbb; line-height: 1.45; }
  .sl-chat-system {
    font-size: 12px; color: #555; text-align: center; font-style: italic;
  }
  .sl-chat-input-row {
    padding: 12px;
    display: flex; gap: 8px; align-items: center;
    border-top: 1px solid #1a1a1a; flex-shrink: 0;
  }
  .sl-chat-input {
    flex: 1; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px;
    padding: 8px 12px; font-size: 13px; font-family: 'Outfit', sans-serif;
    color: #e5e5e5; outline: none; transition: border-color 0.2s;
  }
  .sl-chat-input::placeholder { color: #444; }
  .sl-chat-input:focus { border-color: #3a7d3a; }
  .sl-chat-send-btn {
    width: 36px; height: 36px; border-radius: 8px; flex-shrink: 0;
    background: #4caf50; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: #fff; transition: background 0.2s;
  }
  .sl-chat-send-btn:hover { background: #43a047; }
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
const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const ChatIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const MicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const MicOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23"/>
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
    <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);
const VideoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);
const VideoOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);
const HandIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/>
    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/>
    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/>
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
  </svg>
);
const PhoneOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.43 9.88a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.34 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.32 8.91"/>
    <line x1="23" y1="1" x2="1" y2="23"/>
  </svg>
);
const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const AVATAR_COLORS = ["#1e4d1e", "#1a3d5c", "#4d1e1e", "#3d1e4d"];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

interface ChatMessage {
  id: number;
  type: "msg" | "system";
  author?: string;
  text: string;
}

const MOCK_PARTICIPANTS = [
  { id: "1", name: "Juan Esteban" },
  { id: "2", name: "Maria Garcia" },
  { id: "3", name: "Valentina Garcia" },
  { id: "4", name: "Juan Pablo" },
];

const MOCK_MESSAGES: ChatMessage[] = [
  { id: 1, type: "msg", author: "Maria Garcia", text: "¡Hola a todos! Empecemos con el tema de integrales" },
  { id: 2, type: "system", text: "Juan Esteban se ha unido a la sala" },
  { id: 3, type: "msg", author: "Juan Esteban", text: "Buenos dias compañeros" },
  { id: 4, type: "msg", author: "Valentina Garcia", text: "Hola Juan, ¿cómo vas?" },
  { id: 5, type: "msg", author: "Juan Pablo", text: "Excelente pregunta" },
];

export default function SalaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [inputMsg, setInputMsg] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const roomName = "Matemáticas Avanzadas";
  const roomCode = id ? `SR-${id.slice(-4).toUpperCase()}` : "SR-0000";

  const currentUserName =
    user?.displayName || `${(user as any)?.firstName || ""} ${(user as any)?.lastName || ""}`.trim() || "Tú";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const text = inputMsg.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: "msg", author: currentUserName, text },
    ]);
    setInputMsg("");
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <>
      <style>{styles}</style>
      <div className="sl-root">
        {/* Navbar */}
        <nav className="sl-nav">
          <div className="sl-nav-left">
            <button className="sl-back-btn" onClick={() => navigate("/dashboard")}>
              <ArrowLeftIcon />
            </button>
            <div className="sl-nav-logo">
              <div className="sl-nav-logo-icon"><BookOpenIcon /></div>
            </div>
            <div className="sl-room-info">
              <span className="sl-room-name">{roomName}</span>
              <span className="sl-room-code">{roomCode}</span>
            </div>
          </div>
          <div className="sl-nav-actions">
            <button className="sl-nav-icon-btn" title="Participantes"><UsersIcon /></button>
            <button className="sl-nav-icon-btn active" title="Chat"><ChatIcon /></button>
            <button className="sl-nav-icon-btn" title="Configuración"><SettingsIcon /></button>
          </div>
        </nav>

        <div className="sl-body">
          {/* Sidebar izquierdo: participantes */}
          <aside className="sl-sidebar-left">
            <div className="sl-sidebar-title">Participantes ({MOCK_PARTICIPANTS.length})</div>
            <div className="sl-participant-list">
              {MOCK_PARTICIPANTS.map((p, i) => (
                <div key={p.id} className="sl-participant-item">
                  <div
                    className="sl-participant-avatar"
                    style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                  >
                    {getInitials(p.name)}
                  </div>
                  <span className="sl-participant-name">{p.name}</span>
                </div>
              ))}
            </div>
          </aside>

          {/* Centro: video grid + controles */}
          <div className="sl-center">
            <div className="sl-video-grid">
              {MOCK_PARTICIPANTS.map((p, i) => (
                <div key={p.id} className="sl-video-tile">
                  <div
                    className="sl-video-avatar"
                    style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                  >
                    {getInitials(p.name)}
                  </div>
                  <span className="sl-video-name">{p.name}</span>
                </div>
              ))}
            </div>

            <div className="sl-controls">
              <button
                className={`sl-ctrl-btn${micOn ? " active" : ""}`}
                title={micOn ? "Silenciar" : "Activar micrófono"}
                onClick={() => setMicOn((v) => !v)}
              >
                {micOn ? <MicIcon /> : <MicOffIcon />}
              </button>
              <button
                className={`sl-ctrl-btn${camOn ? " active" : ""}`}
                title={camOn ? "Apagar cámara" : "Activar cámara"}
                onClick={() => setCamOn((v) => !v)}
              >
                {camOn ? <VideoIcon /> : <VideoOffIcon />}
              </button>
              <button className="sl-ctrl-btn" title="Compartir pantalla">
                <ShareIcon />
              </button>
              <button
                className={`sl-ctrl-btn${handRaised ? " active" : ""}`}
                title={handRaised ? "Bajar la mano" : "Levantar la mano"}
                onClick={() => setHandRaised((v) => !v)}
              >
                <HandIcon />
              </button>
              <button
                className="sl-ctrl-btn danger"
                title="Salir de la sala"
                onClick={() => navigate("/dashboard")}
              >
                <PhoneOffIcon />
              </button>
            </div>
          </div>

          {/* Sidebar derecho: chat */}
          <aside className="sl-sidebar-right">
            <div className="sl-chat-header">Chat de la sala</div>
            <div className="sl-chat-messages">
              {messages.map((msg) =>
                msg.type === "system" ? (
                  <div key={msg.id} className="sl-chat-system">{msg.text}</div>
                ) : (
                  <div key={msg.id} className="sl-chat-msg">
                    <span className="sl-chat-msg-author">{msg.author}</span>
                    <span className="sl-chat-msg-text">{msg.text}</span>
                  </div>
                )
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="sl-chat-input-row">
              <input
                className="sl-chat-input"
                placeholder="Escribe un mensaje..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={handleInputKeyDown}
              />
              <button className="sl-chat-send-btn" onClick={sendMessage} title="Enviar">
                <SendIcon />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

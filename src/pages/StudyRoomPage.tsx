import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0a0a; overflow: hidden; }

  .sr-room {
    height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: 'Outfit', sans-serif;
    background: #0a0a0a;
    color: #e5e5e5;
  }

  /* ── Navbar ── */
  .sr-room-nav {
    display: flex; align-items: center; gap: 14px;
    padding: 0 20px; height: 52px;
    background: #0f0f0f; border-bottom: 1px solid #1a1a1a;
    flex-shrink: 0;
  }
  .sr-back-btn {
    background: none; border: none; cursor: pointer;
    color: #4caf50; display: flex; align-items: center; transition: color 0.2s;
  }
  .sr-back-btn:hover { color: #81c784; }
  .sr-room-nav-logo { display: flex; align-items: center; gap: 7px; }
  .sr-room-nav-icon {
    width: 28px; height: 28px; background: #111; border: 1.5px solid #2a5c2a;
    border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #4caf50;
  }
  .sr-room-title-wrap { flex: 1; }
  .sr-room-title { font-size: 15px; font-weight: 600; color: #fff; }
  .sr-room-subtitle { font-size: 12px; color: #555; }

  .sr-room-nav-actions { display: flex; gap: 8px; margin-left: auto; }
  .sr-icon-btn {
    width: 36px; height: 36px;
    background: #1a1a1a; border: 1px solid #222; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #888; transition: background 0.2s, color 0.2s;
  }
  .sr-icon-btn:hover { background: #222; color: #ccc; }
  .sr-icon-btn.active { background: #1e3d1e; border-color: #2a5c2a; color: #4caf50; }

  /* ── Layout ── */
  .sr-room-body { display: flex; flex: 1; overflow: hidden; }

  /* ── Sidebar participants ── */
  .sr-participants {
    width: 230px; flex-shrink: 0;
    background: #0f0f0f; border-right: 1px solid #1a1a1a;
    overflow-y: auto; padding: 16px 0;
  }
  .sr-participants-title {
    font-size: 13px; font-weight: 600; color: #888;
    padding: 0 16px 12px;
  }
  .sr-participant-item {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 16px;
    transition: background 0.15s;
  }
  .sr-participant-item:hover { background: #151515; }
  .sr-participant-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: #1e4d1e;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; color: #81c784; flex-shrink: 0;
  }
  .sr-participant-name { font-size: 14px; color: #ccc; }

  /* ── Video grid ── */
  .sr-video-area { flex: 1; overflow-y: auto; padding: 16px; }
  .sr-video-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    height: 100%;
  }
  .sr-video-tile {
    background: #111; border: 1px solid #1e1e1e; border-radius: 12px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    min-height: 200px; position: relative; overflow: hidden;
  }
  .sr-video-avatar {
    width: 56px; height: 56px; border-radius: 50%;
    background: #1e4d1e;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; font-weight: 700; color: #81c784;
    margin-bottom: 8px;
  }
  .sr-video-name {
    position: absolute; bottom: 12px; left: 12px;
    font-size: 13px; color: #ccc;
  }

  /* ── Controls ── */
  .sr-controls {
    height: 60px; flex-shrink: 0;
    background: #0f0f0f; border-top: 1px solid #1a1a1a;
    display: flex; align-items: center; justify-content: center; gap: 12px;
  }
  .sr-ctrl-btn {
    width: 44px; height: 44px; border-radius: 50%;
    background: #1a1a1a; border: 1px solid #222;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #ccc; transition: background 0.2s, color 0.2s;
  }
  .sr-ctrl-btn:hover { background: #222; color: #fff; }
  .sr-ctrl-btn.muted { background: #2a1515; border-color: #4a1a1a; color: #e05454; }
  .sr-ctrl-btn.end-call {
    background: #5c1a1a; border-color: #7a2020;
    color: #e05454; width: 48px; height: 48px;
  }
  .sr-ctrl-btn.end-call:hover { background: #7a2020; }

  /* ── Chat ── */
  .sr-chat {
    width: 280px; flex-shrink: 0;
    background: #0f0f0f; border-left: 1px solid #1a1a1a;
    display: flex; flex-direction: column; overflow: hidden;
  }
  .sr-chat-header {
    padding: 14px 16px; font-size: 14px; font-weight: 600; color: #ddd;
    border-bottom: 1px solid #1a1a1a; flex-shrink: 0;
  }
  .sr-chat-messages { flex: 1; overflow-y: auto; padding: 12px 14px; }
  .sr-chat-msg { margin-bottom: 14px; }
  .sr-chat-sender { font-size: 12px; font-weight: 600; color: #4caf50; margin-bottom: 3px; }
  .sr-chat-sender.system { color: #555; font-style: italic; font-weight: 400; }
  .sr-chat-text { font-size: 13px; color: #aaa; line-height: 1.5; }

  .sr-chat-input-area {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 12px; border-top: 1px solid #1a1a1a; flex-shrink: 0;
  }
  .sr-chat-input {
    flex: 1; background: #1a1a1a; border: 1px solid #222; border-radius: 8px;
    padding: 8px 12px; font-size: 13px; font-family: 'Outfit', sans-serif;
    color: #e5e5e5; outline: none; transition: border-color 0.2s;
  }
  .sr-chat-input::placeholder { color: #444; }
  .sr-chat-input:focus { border-color: #3a7d3a; }
  .sr-chat-send {
    width: 34px; height: 34px; background: #4caf50; border: none; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #fff; transition: background 0.2s;
    flex-shrink: 0;
  }
  .sr-chat-send:hover { background: #43a047; }
`;

const BookOpenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);
const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
  </svg>
);
const MicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>
  </svg>
);
const CamIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 8-6 4 6 4V8z"/><rect x="2" y="6" width="14" height="12" rx="2" ry="2"/>
  </svg>
);
const ShareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
  </svg>
);
const HandIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
  </svg>
);
const PhoneOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07C9.44 17.29 8.55 16.4 7.69 15.4M6.13 6.13a19.79 19.79 0 0 0-3.07 8.63 2 2 0 0 0 2 2.18H8a2 2 0 0 0 2-1.72 12.84 12.84 0 0 1 .7-2.81 2 2 0 0 0-.45-2.11L8.97 8.97"/><line x1="2" x2="22" y1="2" y2="22"/>
  </svg>
);
const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const ChatIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const SettingsIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const PARTICIPANTS = [
  { id: "1", name: "Juan Esteban", initials: "JD" },
  { id: "2", name: "Maria Garcia", initials: "MG" },
  { id: "3", name: "Valentina Garcia", initials: "VG" },
  { id: "4", name: "Juan Pablo", initials: "JP" },
];

const INITIAL_MESSAGES = [
  { id: "1", sender: "Maria Garcia", text: "¡Hola a todos! Empecemos con el tema de integrales", system: false },
  { id: "2", sender: "Sistema", text: "Juan Esteban se ha unido a la sala.", system: true },
  { id: "3", sender: "Juan Esteban", text: "Buenos dias compañeros", system: false },
  { id: "4", sender: "Valentina Garcia", text: "Hola Juan ¿cómo vas?", system: false },
  { id: "5", sender: "Juan Pablo", text: "Excelente pregunta", system: false },
];

export default function StudyRoomPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [chatMsg, setChatMsg] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const text = chatMsg.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: user?.displayName || "Tú", text, system: false },
    ]);
    setChatMsg("");
  };

  return (
    <>
      <style>{styles}</style>
      <div className="sr-room">
        {/* Navbar */}
        <nav className="sr-room-nav">
          <button className="sr-back-btn" onClick={() => navigate("/dashboard")}><ArrowLeftIcon /></button>
          <div className="sr-room-nav-logo">
            <div className="sr-room-nav-icon"><BookOpenIcon /></div>
          </div>
          <div className="sr-room-title-wrap">
            <div className="sr-room-title">Matemáticas Avanzadas</div>
            <div className="sr-room-subtitle">MAT-2024</div>
          </div>
          <div className="sr-room-nav-actions">
            <div className="sr-icon-btn active"><UsersIcon /></div>
            <div className="sr-icon-btn"><ChatIcon /></div>
            <div className="sr-icon-btn"><SettingsIcon /></div>
          </div>
        </nav>

        {/* Body */}
        <div className="sr-room-body">
          {/* Participants sidebar */}
          <div className="sr-participants">
            <div className="sr-participants-title">Participantes ({PARTICIPANTS.length})</div>
            {PARTICIPANTS.map((p) => (
              <div key={p.id} className="sr-participant-item">
                <div className="sr-participant-avatar">{p.initials}</div>
                <span className="sr-participant-name">{p.name}</span>
              </div>
            ))}
          </div>

          {/* Video grid */}
          <div className="sr-video-area">
            <div className="sr-video-grid">
              {PARTICIPANTS.map((p) => (
                <div key={p.id} className="sr-video-tile">
                  <div className="sr-video-avatar">{p.initials}</div>
                  <span className="sr-video-name">{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="sr-chat">
            <div className="sr-chat-header">Chat de la sala</div>
            <div className="sr-chat-messages">
              {messages.map((m) => (
                <div key={m.id} className="sr-chat-msg">
                  <div className={`sr-chat-sender${m.system ? " system" : ""}`}>{m.sender}</div>
                  <div className="sr-chat-text">{m.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="sr-chat-input-area">
              <input
                className="sr-chat-input"
                placeholder="Escribe un mensaje..."
                value={chatMsg}
                onChange={(e) => setChatMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button className="sr-chat-send" onClick={sendMessage}><SendIcon /></button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="sr-controls">
          <button className={`sr-ctrl-btn${muted ? " muted" : ""}`} onClick={() => setMuted((v) => !v)}>
            <MicIcon />
          </button>
          <button className={`sr-ctrl-btn${camOff ? " muted" : ""}`} onClick={() => setCamOff((v) => !v)}>
            <CamIcon />
          </button>
          <button className="sr-ctrl-btn"><ShareIcon /></button>
          <button className="sr-ctrl-btn"><HandIcon /></button>
          <button className="sr-ctrl-btn end-call" onClick={() => navigate("/dashboard")}>
            <PhoneOffIcon />
          </button>
        </div>
      </div>
    </>
  );
}
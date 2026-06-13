import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const styles = `
  .sr-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 28px; height: 56px;
    background: #0f0f0f; border-bottom: 1px solid #1a1a1a;
    font-family: 'Outfit', sans-serif;
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
    cursor: pointer; position: relative;
  }
  .sr-nav-dropdown {
    position: absolute; top: 44px; right: 0;
    background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 10px;
    overflow: hidden; min-width: 160px; z-index: 100;
  }
  .sr-nav-dropdown button {
    display: block; width: 100%; padding: 10px 16px;
    background: none; border: none; text-align: left;
    font-size: 14px; font-family: 'Outfit', sans-serif;
    color: #ccc; cursor: pointer; transition: background 0.15s;
  }
  .sr-nav-dropdown button:hover { background: #222; }
  .sr-nav-dropdown button.danger { color: #e05454; }
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

interface AppNavbarProps {
  showBack?: boolean;
  showDropdown?: boolean;
}

export default function AppNavbar({ showBack = false, showDropdown = false }: AppNavbarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <>
      <style>{styles}</style>
      <nav className="sr-nav">
        <div className="sr-nav-left">
          {showBack && (
            <button className="sr-back-btn" onClick={() => navigate("/dashboard")}>
              <ArrowLeftIcon />
            </button>
          )}
          <div className="sr-nav-logo">
            <div className="sr-nav-logo-icon"><BookOpenIcon /></div>
            <span className="sr-nav-logo-text">StudyRoom</span>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <div
            className="sr-nav-avatar"
            onClick={showDropdown ? () => setDropdownOpen((v) => !v) : undefined}
            style={!showDropdown ? { cursor: "default" } : {}}
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user?.displayName || "Avatar"} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            ):(
              <span>{initials}</span>
            )}
          </div>
          {showDropdown && dropdownOpen && (
            <div className="sr-nav-dropdown">
              <button onClick={() => { setDropdownOpen(false); navigate("/perfil"); }}>Mi perfil</button>
              <button className="danger" onClick={async () => { await logout(); }}>Cerrar sesión</button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

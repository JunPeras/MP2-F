import { useAuthStore } from "../store/useAuthStore";

export default function DashboardPage() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Dashboard</h1>
      <p>Bienvenido, {user?.displayName || user?.email}</p>
      <p>UID: {user?.uid}</p>
      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
}

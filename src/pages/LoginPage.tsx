import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle, loading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión con Google");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Iniciar Sesión</h1>

      <form onSubmit={handleEmailLogin}>
        <div>
          <label htmlFor="email">Correo Institucional:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="password">Contraseña:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Autenticando..." : "Iniciar Sesión"}
        </button>
      </form>

      <hr style={{ margin: "1rem 0" }} />

      <button onClick={handleGoogleLogin} disabled={loading}>
        {loading ? "Autenticando..." : "Continuar con Google"}
      </button>

      <p>
        <Link to="/registro">¿No tienes cuenta? Regístrate</Link>
      </p>
    </div>
  );
}

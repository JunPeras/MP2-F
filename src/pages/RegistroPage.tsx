import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuthStore } from "../store/useAuthStore";
import { useUsernameAvailability } from "../hooks/useUsernameAvailability";

const registerFormSchema = z.object({
  firstName: z.string().min(1, "El nombre es obligatorio"),
  lastName: z.string().min(1, "El apellido es obligatorio"),
  username: z
    .string()
    .min(3, "El username debe tener al menos 3 caracteres")
    .max(20, "El username debe tener máximo 20 caracteres")
    .regex(/^[a-z0-9_]+$/, "Solo minúsculas, números y guiones bajos"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string().min(1, "Debes confirmar la contraseña"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export default function RegistroPage() {
  const { registerWithEmail, loading } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");

  const { checking, available, error: usernameError } = useUsernameAvailability(form.username);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setGeneralError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setFieldErrors({});

    const parseResult = registerFormSchema.safeParse(form);
    if (!parseResult.success) {
      const errors: Record<string, string> = {};
      parseResult.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        errors[field] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    if (available === false || usernameError) {
      setFieldErrors((prev) => ({
        ...prev,
        username: usernameError || "El username no está disponible",
      }));
      return;
    }

    try {
      await registerWithEmail(
        form.email,
        form.password,
        form.firstName,
        form.lastName,
        form.username
      );
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err.message || "";
      const lowerMsg = msg.toLowerCase();
      if (lowerMsg.includes("username") || lowerMsg.includes("disponible")) {
        setFieldErrors((prev) => ({ ...prev, username: msg }));
      } else if (lowerMsg.includes("correo") || lowerMsg.includes("email")) {
        setFieldErrors((prev) => ({ ...prev, email: msg }));
      } else if (lowerMsg.includes("contraseña") || lowerMsg.includes("password") || lowerMsg.includes("débil")) {
        setFieldErrors((prev) => ({ ...prev, password: msg }));
      } else {
        setGeneralError(msg || "Error al registrar la cuenta");
      }
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Registro</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="firstName">Nombres:</label>
          <input
            id="firstName"
            type="text"
            value={form.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            disabled={loading}
          />
          {fieldErrors.firstName && <p style={{ color: "red" }}>{fieldErrors.firstName}</p>}
        </div>

        <div>
          <label htmlFor="lastName">Apellidos:</label>
          <input
            id="lastName"
            type="text"
            value={form.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            disabled={loading}
          />
          {fieldErrors.lastName && <p style={{ color: "red" }}>{fieldErrors.lastName}</p>}
        </div>

        <div>
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            value={form.username}
            onChange={(e) => handleChange("username", e.target.value)}
            disabled={loading}
          />
          {checking && <p style={{ color: "gray" }}>Verificando disponibilidad...</p>}
          {available === true && !usernameError && (
            <p style={{ color: "green" }}>Username disponible</p>
          )}
          {(fieldErrors.username || usernameError) && (
            <p style={{ color: "red" }}>{fieldErrors.username || usernameError}</p>
          )}
        </div>

        <div>
          <label htmlFor="email">Correo Institucional:</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            disabled={loading}
          />
          {fieldErrors.email && <p style={{ color: "red" }}>{fieldErrors.email}</p>}
        </div>

        <div>
          <label htmlFor="password">Contraseña:</label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            disabled={loading}
          />
          {fieldErrors.password && <p style={{ color: "red" }}>{fieldErrors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirmar contraseña:</label>
          <input
            id="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            disabled={loading}
          />
          {fieldErrors.confirmPassword && (
            <p style={{ color: "red" }}>{fieldErrors.confirmPassword}</p>
          )}
        </div>

        {generalError && <p style={{ color: "red" }}>{generalError}</p>}

        <button type="submit" disabled={loading || checking}>
          {loading ? "Registrando..." : "Registrar Cuenta"}
        </button>
      </form>

      <p>
        <Link to="/login">¿Ya tienes cuenta? Inicia sesión</Link>
      </p>
    </div>
  );
}

import { z } from "zod";

// Esto valida el flujo obligatorio cuando alguien entra por primera vez con Google
export const completeProfileSchema = z.object({
  username: z
    .string()
    .min(3, "El username debe tener al menos 3 caracteres")
    .max(20, "El username debe tener máximo 20 caracteres")
    .regex(
      /^[a-z0-9_]+$/,
      "El username solo puede contener minúsculas, números y guiones bajos"
    ),
});

export type CompleteProfileInput = z.infer<typeof completeProfileSchema>;

// Esto valida el formulario cuando el usuario edita su perfil
export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(35, "El nombre no puede exceder los 35 caracteres"),

  lastName: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(35, "El apellido no puede exceder los 35 caracteres"),

  username: z
    .string()
    .min(3, "El username debe tener al menos 3 caracteres")
    .max(20, "El username debe tener máximo 20 caracteres")
    .regex(
      /^[a-z0-9_]+$/,
      "El username solo puede contener minúsculas, números y guiones bajos"),

  title: z
    .string()
    .max(80, "El título institucional no puede exceder los 80 caracteres")
    .optional(),

  bio: z
    .string()
    .max(300, "La biografía no puede exceder los 300 caracteres")
    .optional(),

  phone: z
    .string()
    .regex(/^\+?[0-9\s\-]+$/, "Ingresa un número de teléfono válido")
    .optional(),

  location: z
    .string()
    .max(100, "La ubicación no puede exceder los 100 caracteres")
    .optional(),

  email: z
    .string()
    .email("Ingresa un correo electrónico válido")
    .refine((val) => val.endsWith(".edu.co"), {
      message: "Debes utilizar un correo institucional válido terminado en .edu.co",
    }),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;


export interface UserProfile extends ProfileUpdateInput {
  uid: string;
  avatar: string;
  authProvider: "google" | "password";
  stats: {
    roomsCreated: number;
    roomsJoined: number;
    studyHours: number;
    partners: number;
  };
}
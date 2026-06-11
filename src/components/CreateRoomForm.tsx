import { useState } from "react";

interface CreateRoomFormProps {
  onSuccess: (roomData: { name: string; description: string }) => void;
  onCancel: () => void;
}

export default function CreateRoomForm({ onSuccess, onCancel }: CreateRoomFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError(true);
      return;
    }

    setError(false);
    onSuccess({ name, description });
  };

  return (
    <form className="sr-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
      <div className="sr-modal-title">Crear sala</div>
      <div className="sr-modal-sub">Configura tu nueva sala de estudio</div>
      
      <div className="sr-modal-field">
        <label className="sr-modal-label" style={{ color: error ? "#e05454" : "#ccc" }}>
          Nombre de la sala
        </label>
        <input
          className="sr-modal-input"
          placeholder="Ej: Cálculo diferencial"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (e.target.value.trim()) setError(false);
          }}
          style={{ borderColor: error ? "#e05454" : "#2a2a2a" }}
        />
        {error && (
          <div style={{ color: "#4D9DFF", fontSize: "12px", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
            ⚠️ El nombre de la sala es obligatorio
          </div>
        )}
      </div>
      
      <div className="sr-modal-field">
        <label className="sr-modal-label">Descripción (Opcional)</label>
        <input
          className="sr-modal-input"
          placeholder="Describe el tema de la sala"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div style={{
        background: "rgba(76, 175, 80, 0.05)",
        border: "1px solid rgba(76, 175, 80, 0.2)",
        borderRadius: "8px",
        padding: "14px",
        marginBottom: "20px",
        textAlign: "left"
      }}>
        <div style={{ color: "#4caf50", fontWeight: 600, fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
          Código de sala
        </div>
        <p style={{ color: "#888", fontSize: "12px", lineHeight: "1.4" }}>
          Una vez creada la sala, se generará automáticamente un código único (ej: MAT-2024) que podrás compartir con tus compañeros.
        </p>
      </div>
      
      <div className="sr-modal-actions">
        <button type="button" className="sr-modal-cancel" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="sr-btn-primary">
          Crear sala
        </button>
      </div>
    </form>
  );
}
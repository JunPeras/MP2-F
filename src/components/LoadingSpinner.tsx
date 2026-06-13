interface LoadingSpinnerProps {
  variant?: "page" | "section" | "inline";
  text?: string;
}

export default function LoadingSpinner({ variant = "page", text }: LoadingSpinnerProps) {
  const isPage = variant === "page";
  const isSection = variant === "section";

  const containerStyle: React.CSSProperties = isPage
    ? {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#e5e5e5",
        fontFamily: "'Outfit', sans-serif",
        gap: "16px",
      }
    : isSection
    ? {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 0",
        color: "#e5e5e5",
        fontFamily: "'Outfit', sans-serif",
        gap: "12px",
      }
    : {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
      };

  const svgSize = isPage ? 48 : 18;
  const strokeWidth = isPage ? 3 : 2.5;

  return (
    <div style={containerStyle}>
      <svg
        width={svgSize}
        height={svgSize}
        viewBox="0 0 24 24"
        style={{ animation: "sr-spin 1s linear infinite" }}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="#2a2a2a"
          strokeWidth={strokeWidth}
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          fill="none"
          stroke="#4caf50"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
      {(text || isPage) && (
        <span style={{ fontSize: isPage ? 15 : 14, color: isPage ? "#888" : "inherit" }}>
          {text || "Cargando..."}
        </span>
      )}
      <style>{`
        @keyframes sr-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

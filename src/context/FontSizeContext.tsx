import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type FontSize = "normal" | "grande" | "muy-grande";

const ZOOM: Record<FontSize, number> = {
  normal: 1,
  grande: 1.2,
  "muy-grande": 1.4,
};

const LS_KEY = "sr-font-size";

const FontSizeCtx = createContext<{
  fontSize: FontSize;
  setFontSize: (s: FontSize) => void;
}>({ fontSize: "normal", setFontSize: () => {} });

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>(
    () => (localStorage.getItem(LS_KEY) as FontSize | null) ?? "normal"
  );

  const setFontSize = (s: FontSize) => {
    setFontSizeState(s);
    localStorage.setItem(LS_KEY, s);
  };

  useEffect(() => {
    (document.documentElement.style as any).zoom = String(ZOOM[fontSize]);
  }, [fontSize]);

  return (
    <FontSizeCtx.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeCtx.Provider>
  );
}

export const useFontSize = () => useContext(FontSizeCtx);

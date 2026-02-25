import React, { createContext, useContext, useState, useEffect } from "react";

interface GlossaryContextType {
  isGlossaryEnabled: boolean;
  toggleGlossary: () => void;
}

const GlossaryContext = createContext<GlossaryContextType | undefined>(undefined);

export function GlossaryProvider({ children }: { children: React.ReactNode }) {
  const [isGlossaryEnabled, setIsGlossaryEnabled] = useState(() => {
    // Check local storage for saved preference, default to true
    const saved = localStorage.getItem("statsTreeGlossaryEnabled");
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem("statsTreeGlossaryEnabled", JSON.stringify(isGlossaryEnabled));
  }, [isGlossaryEnabled]);

  const toggleGlossary = () => {
    setIsGlossaryEnabled((prev: boolean) => !prev);
  };

  return (
    <GlossaryContext.Provider value={{ isGlossaryEnabled, toggleGlossary }}>
      {children}
    </GlossaryContext.Provider>
  );
}

export function useGlossary() {
  const context = useContext(GlossaryContext);
  if (context === undefined) {
    throw new Error("useGlossary must be used within a GlossaryProvider");
  }
  return context;
}

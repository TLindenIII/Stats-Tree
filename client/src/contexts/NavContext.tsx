import { createContext, useContext, useState, useRef, ReactNode } from "react";

interface NavPosition {
  left: number;
  width: number;
}

interface NavContextType {
  getPreviousPosition: () => NavPosition | null;
  setPreviousPosition: (pos: NavPosition) => void;
}

const NavContext = createContext<NavContextType | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const positionRef = useRef<NavPosition | null>(null);
  const [, forceUpdate] = useState(0);

  const setPreviousPosition = (pos: NavPosition) => {
    positionRef.current = pos;
  };

  const getPreviousPosition = () => positionRef.current;

  return (
    <NavContext.Provider
      value={{
        getPreviousPosition,
        setPreviousPosition,
      }}
    >
      {children}
    </NavContext.Provider>
  );
}

export function useNavContext() {
  const context = useContext(NavContext);
  if (!context) {
    throw new Error("useNavContext must be used within NavProvider");
  }
  return context;
}

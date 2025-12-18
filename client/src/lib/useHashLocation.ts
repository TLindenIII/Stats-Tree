import { useSyncExternalStore, useCallback } from "react";

const currentHashLocation = () => {
  const hash = window.location.hash;
  return hash.replace(/^#/, "") || "/";
};

const subscribe = (callback: () => void) => {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
};

export const useHashLocation = (): [string, (to: string) => void] => {
  const location = useSyncExternalStore(subscribe, currentHashLocation);
  
  const navigate = useCallback((to: string) => {
    window.location.hash = to;
  }, []);
  
  return [location, navigate];
};

export const isOfflineMode = () => {
  return window.location.protocol === "file:" || 
         import.meta.env.VITE_OFFLINE_MODE === "true";
};

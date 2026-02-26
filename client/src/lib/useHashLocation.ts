import { useSyncExternalStore, useCallback } from "react";

const currentHashLocation = () => {
  const hash = window.location.hash;
  // Wouter's <Route path="..."> needs matches against the pathname only.
  // We must strip the ?query string from the returned location so wouter matches it, 
  // but keep the actual window.location.hash intact so `useSearch` can read the params.
  const pathWithQuery = hash.replace(/^#/, "") || "/";
  return pathWithQuery.split('?')[0]; // Return just the path part for routing
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

// Check at module load time - this is replaced at build time for offline builds
const OFFLINE_MODE_ENV = import.meta.env.VITE_OFFLINE_MODE === "true";

export const isOfflineMode = () => {
  // Check both env var (set at build time) and file protocol (runtime check)
  if (OFFLINE_MODE_ENV) return true;
  if (typeof window !== 'undefined' && window.location.protocol === "file:") return true;
  return false;
};

import { useSearch as useWouterSearch } from "wouter";
import { useSyncExternalStore } from "react";
import { isOfflineMode } from "./useHashLocation";

const subscribe = (callback: () => void) => {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
};

const getHashSearch = () => {
  const hash = window.location.hash;
  const parts = hash.split("?");
  return parts.length > 1 ? parts[1] : "";
};

export function useAppSearch() {
  const wouterSearch = useWouterSearch();

  // Conditionally subscribing ensures we don't leak hash listeners in normal mode,
  // but React hooks must be called unconditionally, so we just pass the dummy
  // if not in offline mode. Actually, it's safer to always listen or just let useSyncExternalStore handle it.
  const hashSearch = useSyncExternalStore(subscribe, getHashSearch);

  return isOfflineMode() ? hashSearch : wouterSearch;
}

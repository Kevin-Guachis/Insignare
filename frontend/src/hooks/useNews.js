import { useSyncExternalStore } from "react";
import { subscribeNews, getNewsSnapshot } from "../services/news";

export function useNews() {
  return useSyncExternalStore(subscribeNews, getNewsSnapshot, getNewsSnapshot);
}

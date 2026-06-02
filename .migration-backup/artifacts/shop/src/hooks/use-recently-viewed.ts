import { useEffect, useState } from "react";

const STORAGE_KEY = "acholgatha_recently_viewed";
const MAX_ITEMS = 10;

export function useRecentlyViewed(currentProductId?: number) {
  const [recentIds, setRecentIds] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!currentProductId) return;

    setRecentIds((prev) => {
      const filtered = prev.filter((id) => id !== currentProductId);
      const next = [currentProductId, ...filtered].slice(0, MAX_ITEMS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, [currentProductId]);

  const otherIds = recentIds.filter((id) => id !== currentProductId);
  return { recentIds: otherIds };
}

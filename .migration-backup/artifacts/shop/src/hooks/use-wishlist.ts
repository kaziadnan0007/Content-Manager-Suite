import { useState, useCallback } from "react";

const STORAGE_KEY = "acholgatha_wishlist";

function readIds(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeIds(ids: number[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {}
}

export function useWishlist() {
  const [wishlistIds, setWishlistIds] = useState<number[]>(readIds);

  const toggle = useCallback((id: number) => {
    setWishlistIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev];
      writeIds(next);
      return next;
    });
  }, []);

  const isWishlisted = useCallback(
    (id: number) => wishlistIds.includes(id),
    [wishlistIds]
  );

  const remove = useCallback((id: number) => {
    setWishlistIds((prev) => {
      const next = prev.filter((x) => x !== id);
      writeIds(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    writeIds([]);
    setWishlistIds([]);
  }, []);

  return { wishlistIds, toggle, isWishlisted, remove, clear };
}

import { useCallback, useState } from 'react';
import { api } from '../services/api';

export function useWishlist(gameId) {
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  const check = useCallback(async () => {
    try {
      const res = await api.get(`/wishlist/${gameId}/check`);
      setInWishlist(res.inWishlist);
      return res.inWishlist;
    } catch {
      return false;
    }
  }, [gameId]);

  const toggle = useCallback(async () => {
    setLoading(true);
    try {
      if (inWishlist) {
        await api.delete(`/wishlist/${gameId}`);
        setInWishlist(false);
      } else {
        await api.post('/wishlist', { gameId });
        setInWishlist(true);
      }
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, [gameId, inWishlist]);

  return { inWishlist, loading, check, toggle };
}
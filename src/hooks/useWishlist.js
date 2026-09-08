import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';

export function useWishlist(gameId) {
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    if (!gameId || typeof gameId !== 'number') {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get(`/wishlist/${gameId}/check`);
      setInWishlist(res.inWishlist);
    } catch {
      setInWishlist(false);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  const toggle = useCallback(async () => {
    if (!gameId || typeof gameId !== 'number') {
      console.warn('Invalid gameId for wishlist toggle');
      return false;
    }
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
    } catch (err) {
      console.error('Wishlist toggle error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [gameId, inWishlist]);

  useEffect(() => {
    check();
  }, [check]);

  return { inWishlist, loading, toggle };
}
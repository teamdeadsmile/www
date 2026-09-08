import { useCallback, useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';

export function useWishlist(gameId) {
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const numericGameId = useMemo(() => {
    if (typeof gameId === 'number') return gameId;
    if (typeof gameId === 'string') {
      const num = Number(gameId);
      return isNaN(num) ? null : num;
    }
    return null;
  }, [gameId]);

  const check = useCallback(async () => {
    if (!numericGameId || !Number.isInteger(numericGameId)) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get(`/wishlist/${numericGameId}/check`);
      setInWishlist(res.inWishlist);
    } catch {
      setInWishlist(false);
    } finally {
      setLoading(false);
    }
  }, [numericGameId]);

  const toggle = useCallback(async () => {
    if (!numericGameId || !Number.isInteger(numericGameId)) {
      console.warn('Invalid gameId for wishlist toggle:', gameId);
      return false;
    }
    setLoading(true);
    try {
      if (inWishlist) {
        await api.delete(`/wishlist/${numericGameId}`);
        setInWishlist(false);
      } else {
        await api.post('/wishlist', { gameId: numericGameId });
        setInWishlist(true);
      }
      return true;
    } catch (err) {
      console.error('Wishlist toggle error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [numericGameId, inWishlist, gameId]);

  useEffect(() => {
    check();
  }, [check]);

  return { inWishlist, loading, toggle };
}
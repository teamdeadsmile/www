import { useCallback, useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';

function isValidUUID(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export function useWishlist(gameId) {
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);

  const validGameId = useMemo(() => {
    if (!gameId || typeof gameId !== 'string') return null;
    return isValidUUID(gameId) ? gameId : null;
  }, [gameId]);

  const check = useCallback(async () => {
    if (!validGameId) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get(`/wishlist/${validGameId}/check`);
      setInWishlist(res.inWishlist);
    } catch {
      setInWishlist(false);
    } finally {
      setLoading(false);
    }
  }, [validGameId]);

  const toggle = useCallback(async () => {
    if (!validGameId) {
      console.warn('Invalid gameId for wishlist toggle:', gameId);
      return false;
    }
    setLoading(true);
    try {
      if (inWishlist) {
        await api.delete(`/wishlist/${validGameId}`);
        setInWishlist(false);
      } else {
        await api.post('/wishlist', { gameId: validGameId });
        setInWishlist(true);
      }
      return true;
    } catch (err) {
      console.error('Wishlist toggle error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [validGameId, inWishlist, gameId]);

  useEffect(() => {
    check();
  }, [check]);

  return { inWishlist, loading, toggle };
}
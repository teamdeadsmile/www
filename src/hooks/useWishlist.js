import { useCallback, useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from './useAuth';

function isValidUUID(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export function useWishlist(gameId) {
  const { status: authStatus } = useAuth();
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);

  const validGameId = useMemo(() => {
    if (!gameId || typeof gameId !== 'string') return null;
    return isValidUUID(gameId) ? gameId : null;
  }, [gameId]);

  const isAuthenticated = authStatus === 'authenticated';

  const check = useCallback(async () => {
    // Skip the check if not authenticated or no valid game ID
    if (!validGameId || !isAuthenticated) {
      setInWishlist(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/wishlist/${validGameId}/check`);
      setInWishlist(res.inWishlist);
    } catch {
      setInWishlist(false);
    } finally {
      setLoading(false);
    }
  }, [validGameId, isAuthenticated]);

  const toggle = useCallback(async () => {
    if (!validGameId) {
      console.warn('Invalid gameId for wishlist toggle:', gameId);
      return false;
    }
    if (!isAuthenticated) {
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
  }, [validGameId, inWishlist, gameId, isAuthenticated]);

  useEffect(() => {
    // Only run check once auth status is known (not 'loading')
    if (authStatus === 'loading') return;
    check();
  }, [check, authStatus]);

  return { inWishlist, loading, toggle };
}

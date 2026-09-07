import { useEffect, useState } from 'react';

// Atrasa a atualização de um valor. Usado para não disparar
// uma requisição de pesquisa a cada tecla digitada.
export function useDebounce(value, delayMs = 320) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

import { useEffect, useState } from 'react';

// Returns a debounced version of `value` after `delayMs` of inactivity.
/**
 * Simple debounced memoized value hook used for search inputs.
 * @param value The value to debounce.
 * @param delayMs Delay in milliseconds before emitting the latest value.
 */
export const useDebouncedValue = <T>(value: T, delayMs = 500): T => {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
};

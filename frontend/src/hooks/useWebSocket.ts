import { useEffect, useCallback } from 'react';
import { wsManager } from '@/services/websocket/manager';

/**
 * Hook to subscribe to WebSocket events
 * Automatically cleans up subscription on unmount
 *
 * @param type - Event type to subscribe to
 * @param handler - Callback function when event is received
 */
export function useWebSocket<T>(type: string, handler: (data: T) => void): void {
  // Memoize handler to prevent unnecessary resubscriptions
  const stableHandler = useCallback(handler, [handler]);

  useEffect(() => {
    const unsubscribe = wsManager.subscribe(type, stableHandler as (data: unknown) => void);
    return unsubscribe;
  }, [type, stableHandler]);
}

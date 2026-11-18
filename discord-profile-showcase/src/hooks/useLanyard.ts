import { useState, useEffect, useRef } from 'react';
import { LanyardData } from '../types';

export function useLanyard(userId: string, isEnabled: boolean) {
  // Read instant cached data from localStorage if available for immediate 0ms load
  const [data, setData] = useState<LanyardData | null>(() => {
    if (!isEnabled || !userId) return null;
    try {
      const cached = localStorage.getItem(`discord_lanyard_cache_${userId}`);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Ignore parse error
    }
    return null;
  });
  
  const [loading, setLoading] = useState<boolean>(!data && isEnabled && Boolean(userId));
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isEnabled || !userId) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Fast save helper
    const updatePresence = (newData: LanyardData) => {
      if (!isMounted) return;
      setData(newData);
      setError(null);
      setLoading(false);
      try {
        localStorage.setItem(`discord_lanyard_cache_${userId}`, JSON.stringify(newData));
      } catch {
        // Ignore quota error
      }
    };

    // 1. Immediate HTTP fetch for fast initial response
    const fetchImmediate = async () => {
      try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
        if (!res.ok) return;
        const json = await res.json();
        if (isMounted && json.success && json.data) {
          updatePresence(json.data);
        }
      } catch {
        // Fallback continues via WebSocket
      }
    };
    fetchImmediate();

    // 2. High-speed WebSocket connection (wss://api.lanyard.rest/socket)
    const connectSocket = () => {
      try {
        const ws = new WebSocket('wss://api.lanyard.rest/socket');
        wsRef.current = ws;

        ws.onopen = () => {
          // Connected
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            const { op, t, d } = message;

            if (op === 1) {
              // Hello packet: start heartbeat and subscribe immediately
              const heartbeatInterval = d?.heartbeat_interval || 30000;
              if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
              heartbeatTimerRef.current = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({ op: 3 }));
                }
              }, heartbeatInterval);

              // Subscribe to user
              ws.send(JSON.stringify({
                op: 2,
                d: { subscribe_to_id: userId }
              }));
            } else if (op === 0) {
              // Event dispatch
              if (t === 'INIT_STATE' || t === 'PRESENCE_UPDATE') {
                if (d) {
                  updatePresence(d);
                }
              }
            }
          } catch {
            // Ignore message parse errors
          }
        };

        ws.onerror = () => {
          // If socket fails, keep using REST polling as fallback
        };

        ws.onclose = () => {
          if (heartbeatTimerRef.current) {
            clearInterval(heartbeatTimerRef.current);
            heartbeatTimerRef.current = null;
          }
        };
      } catch {
        // Socket connection error
      }
    };

    connectSocket();

    // 3. Fallback polling every 8s in case socket drops
    const pollInterval = setInterval(fetchImmediate, 8000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {
          // Ignore
        }
        wsRef.current = null;
      }
    };
  }, [userId, isEnabled]);

  return { data, loading, error };
}


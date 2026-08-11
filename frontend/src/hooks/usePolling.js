import { useEffect, useRef } from "react";

// Calls `callback` immediately, then again every `intervalMs` for as long as
// the component stays mounted. Used to keep the restaurant order hub fresh
// without standing up a Socket.io layer (that's planned for a later phase).
export function usePolling(callback, intervalMs) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    savedCallback.current();
    const id = setInterval(() => savedCallback.current(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}

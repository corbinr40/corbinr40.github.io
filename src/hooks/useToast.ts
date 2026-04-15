import { useState, useCallback, useRef } from 'react';
import type { ToastMessage } from '../components/editor/Toast';

export default function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (text: string, type: ToastMessage['type']) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, text, type }]);
      const timer = setTimeout(() => dismissToast(id), 4000);
      timersRef.current.set(id, timer);
    },
    [dismissToast],
  );

  return { toasts, addToast, dismissToast };
}

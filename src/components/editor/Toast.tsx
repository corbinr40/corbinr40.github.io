import { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const ICON_MAP: Record<ToastMessage['type'], string> = {
  success: 'bi-check-circle-fill',
  error: 'bi-x-circle-fill',
  info: 'bi-info-circle-fill',
};

const ALERT_CLASS_MAP: Record<ToastMessage['type'], string> = {
  success: 'alert-success',
  error: 'alert-danger',
  info: 'alert-info',
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`alert ${ALERT_CLASS_MAP[toast.type]} d-flex align-items-center py-2 px-3 mb-2 shadow-sm`}
      role="alert"
      style={{ minWidth: 250, maxWidth: 400 }}
    >
      <i className={`bi ${ICON_MAP[toast.type]} me-2`} />
      <span className="flex-grow-1 small">{toast.text}</span>
      <button
        type="button"
        className="btn-close btn-close-sm ms-2"
        onClick={() => onDismiss(toast.id)}
        aria-label="Close"
        style={{ fontSize: '0.65rem' }}
      />
    </div>
  );
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        zIndex: 1050,
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

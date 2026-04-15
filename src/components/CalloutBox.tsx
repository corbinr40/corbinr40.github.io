interface CalloutBoxProps {
  type: 'info' | 'warning' | 'tip' | 'note';
  children: React.ReactNode;
}

const CALLOUT_CONFIG: Record<
  CalloutBoxProps['type'],
  { alertClass: string; icon: string; label: string }
> = {
  info: { alertClass: 'alert-info', icon: 'bi-info-circle', label: 'Info' },
  warning: { alertClass: 'alert-warning', icon: 'bi-exclamation-triangle', label: 'Warning' },
  tip: { alertClass: 'alert-success', icon: 'bi-lightbulb', label: 'Tip' },
  note: { alertClass: 'alert-secondary', icon: 'bi-journal-text', label: 'Note' },
};

export default function CalloutBox({ type, children }: CalloutBoxProps) {
  const config = CALLOUT_CONFIG[type];

  return (
    <div className={`alert ${config.alertClass}`} role="alert">
      <i className={`bi ${config.icon} me-2`} />
      <strong>{config.label}</strong>
      <div className="mt-1">{children}</div>
    </div>
  );
}

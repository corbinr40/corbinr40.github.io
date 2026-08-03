import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function ThemeToggle({ className, style }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={className ?? 'theme-toggle'}
      style={style}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <i className={`bi ${theme === 'light' ? 'bi-moon-fill' : 'bi-sun-fill'}`} />
    </button>
  );
}

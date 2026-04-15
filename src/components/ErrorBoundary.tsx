import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container px-4 py-5 text-center">
          <i className="bi bi-exclamation-triangle display-1 text-warning" />
          <h2 className="mt-3">Something went wrong</h2>
          <p className="text-body-secondary">
            An unexpected error occurred while rendering this page.
          </p>
          <p className="text-body-secondary small">
            {this.state.error?.message}
          </p>
          <button
            className="btn btn-outline-secondary mt-2"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/';
            }}
          >
            Go Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

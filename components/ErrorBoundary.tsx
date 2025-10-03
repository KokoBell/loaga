import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100vh', width: '100vw', backgroundColor: '#0D1117', color: '#C9D1D9',
          fontFamily: 'sans-serif', textAlign: 'center', padding: '2rem'
        }}>
          <h1 style={{ fontSize: '2rem', color: '#f85149' }}>Something went wrong.</h1>
          <p style={{ marginTop: '1rem', maxWidth: '600px' }}>
            An unexpected error occurred in the application. Please try refreshing the page.
            If the problem persists, check the console for more details.
          </p>
          <button onClick={() => window.location.reload()} style={{
            marginTop: '2rem', padding: '0.75rem 1.5rem', backgroundColor: '#58A6FF',
            color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem'
          }}>
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

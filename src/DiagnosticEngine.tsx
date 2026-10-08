import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class DiagnosticEngine extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('DiagnosticEngine caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif', background: '#0f172a', color: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '12px', maxWidth: '600px', width: '100%', border: '1px solid #334155' }}>
            <h2 style={{ color: '#f87171', marginBottom: '1rem', fontSize: '1.25rem' }}>Application Diagnostic Notice</h2>
            <p style={{ marginBottom: '1rem', color: '#94a3b8' }}>An unexpected rendering exception was caught by the DiagnosticEngine.</p>
            <pre style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', overflowX: 'auto', color: '#fca5a5', fontSize: '0.875rem' }}>
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{ marginTop: '1.5rem', background: '#2563eb', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

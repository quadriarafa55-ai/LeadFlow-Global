import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class DiagnosticEngine extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error("DIAGNOSTIC ENGINE CAUGHT A FATAL ERROR:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', backgroundColor: '#450a0a', color: '#fca5a5', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', borderBottom: '2px solid #ef4444', paddingBottom: '10px', marginBottom: '20px' }}>
            🚨 FATAL APP CRASH DETECTED
          </h1>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
            {this.state.error && this.state.error.toString()}
          </p>
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#000', borderRadius: '8px', overflowX: 'auto' }}>
            <p style={{ color: '#fbbf24', marginBottom: '10px' }}>Component Stack Trace:</p>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '30px', padding: '12px 24px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Force Reboot Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
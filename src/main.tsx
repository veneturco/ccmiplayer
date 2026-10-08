import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in StudioPlayer:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0d1117',
          color: '#e6edf3',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'monospace'
        }}>
          <div style={{
            maxWidth: '680px',
            width: '100%',
            backgroundColor: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ color: '#ff7b72', margin: '0 0 12px 0', fontSize: '18px' }}>
              ⚠️ Error de Ejecución en StudioPlayer
            </h2>
            <p style={{ color: '#8b949e', fontSize: '13px', margin: '0 0 16px 0' }}>
              Se produjo un error al renderizar la aplicación:
            </p>
            <pre style={{
              backgroundColor: '#0b0e14',
              padding: '12px',
              borderRadius: '8px',
              color: '#f0883e',
              fontSize: '12px',
              overflowX: 'auto',
              border: '1px solid #21262d'
            }}>
              {this.state.error?.message || 'Error desconocido'}
              {'\n\n'}
              {this.state.error?.stack}
            </pre>
            <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                style={{
                  backgroundColor: '#00e5ff',
                  color: '#0a0d13',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Limpiar Cache y Recargar
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  backgroundColor: '#21262d',
                  color: '#c9d1d9',
                  border: '1px solid #30363d',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);


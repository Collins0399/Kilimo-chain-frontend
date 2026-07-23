import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div className="glass-panel" style={styles.card}>
            <ShieldAlert size={48} style={{ color: 'var(--accent-red)', marginBottom: '1rem' }} />
            <h2 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-family-heading)' }}>Something went wrong</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
              {this.state.error?.message || "An unexpected application error occurred."}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
            >
              <RefreshCw size={16} />
              <span>Reload Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    padding: '2rem',
    width: '100%'
  },
  card: {
    maxWidth: '450px',
    width: '100%',
    textAlign: 'center',
    padding: '2.5rem'
  }
};

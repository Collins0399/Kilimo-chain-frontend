import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={styles.container}>
      <div style={styles.glowGreen}></div>
      <div style={styles.glowGold}></div>
      
      <div className="glass-panel" style={styles.card}>
        <div style={styles.logoBadge}>🌾</div>
        <h1 style={styles.errorCode}>404</h1>
        <h2 style={styles.title}>Page Not Found</h2>
        <p style={styles.description}>
          The page you are looking for does not exist, has been removed, or is temporarily unavailable.
        </p>
        
        <div style={styles.actions}>
          <Link to="/" className="btn btn-primary" style={styles.btn}>
            <Home size={18} />
            <span>Go to Landing Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    width: '100vw',
    overflow: 'hidden',
    position: 'relative',
    padding: '2rem',
  },
  glowGreen: {
    position: 'absolute',
    top: '10%',
    left: '15%',
    width: '350px',
    height: '350px',
    background: 'radial-gradient(circle, rgba(21,128,61,0.08) 0%, rgba(255,255,255,0) 70%)',
    zIndex: 1,
    pointerEvents: 'none',
  },
  glowGold: {
    position: 'absolute',
    bottom: '15%',
    right: '15%',
    width: '350px',
    height: '350px',
    background: 'radial-gradient(circle, rgba(217,119,6,0.06) 0%, rgba(255,255,255,0) 70%)',
    zIndex: 1,
    pointerEvents: 'none',
  },
  card: {
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center',
    padding: '3.5rem 2rem',
    zIndex: 2,
  },
  logoBadge: {
    fontSize: '3rem',
    marginBottom: '1rem',
    display: 'inline-block',
  },
  errorCode: {
    fontSize: '6rem',
    fontWeight: '900',
    color: 'var(--accent-green)',
    lineHeight: '1',
    margin: '0.5rem 0',
    fontFamily: 'var(--font-family-heading)',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    marginBottom: '1rem',
    color: 'var(--text-primary)',
  },
  description: {
    color: 'var(--text-secondary)',
    fontSize: '1rem',
    lineHeight: '1.6',
    marginBottom: '2rem',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  }
};

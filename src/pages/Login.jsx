import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Key, Mail, ShieldAlert, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.auth.login(email, password);
      if (data.role === 'COOPERATIVE_ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/buyer/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = async (role) => {
    setError('');
    let demoEmail = '';
    let demoPassword = '';

    if (role === 'ADMIN') {
      demoEmail = 'admin@kilimo.com';
      demoPassword = 'adminpassword';
    } else {
      demoEmail = 'buyer@kilimo.com';
      demoPassword = 'password123';
    }

    setEmail(demoEmail);
    setPassword(demoPassword);
    
    // We can execute immediately to make the demo smoother
    setLoading(true);
    try {
      const data = await api.auth.login(demoEmail, demoPassword);
      if (data.role === 'COOPERATIVE_ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/buyer/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(`Failed to log in with pre-filled credentials: ${err.message}. (Note: If this is the buyer account, please register it first!)`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Background glowing blobs */}
      <div style={styles.glowGreen}></div>
      <div style={styles.glowGold}></div>

      <div style={styles.card} className="glass-panel">
        <div style={styles.header}>
          <div style={styles.logoBadge}>🌾</div>
          <h1 style={styles.title}>Welcome back</h1>
          <p style={styles.subtitle}>Log in to your Kilimo-Chain account</p>
        </div>

        {error && (
          <div style={styles.errorBox} className="badge-danger">
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail style={styles.inputIcon} size={18} />
              <input
                id="email"
                type="email"
                required
                className="form-control"
                style={styles.inputWithIcon}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={styles.inputWrapper}>
              <Key style={styles.inputIcon} size={18} />
              <input
                id="password"
                type="password"
                required
                className="form-control"
                style={styles.inputWithIcon}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={styles.submitBtn}
          >
            {loading ? 'Logging in...' : 'Log In'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>Demo Quick Access</span>
        </div>

        <div style={styles.demoButtons}>
          <button
            type="button"
            onClick={() => handleDemoFill('ADMIN')}
            className="btn btn-secondary"
            style={styles.demoBtn}
          >
            👑 Coop Admin Demo
          </button>
          <button
            type="button"
            onClick={() => handleDemoFill('BUYER')}
            className="btn btn-secondary"
            style={styles.demoBtn}
          >
            🛒 Buyer Demo
          </button>
        </div>

        <div style={styles.footerText}>
          Don't have a buyer account?{' '}
          <Link to="/register" style={styles.registerLink}>
            Register here
          </Link>
        </div>

        <div style={styles.footerText}>
          Want to simulate SMS/USSD?{' '}
          <Link to="/simulator" style={styles.registerLink}>
            Open Simulator Console
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: 'var(--bg-primary)',
    position: 'relative',
    overflow: 'hidden',
    padding: '2rem',
  },
  glowGreen: {
    position: 'absolute',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--accent-green) 0%, transparent 70%)',
    top: '15%',
    left: '15%',
    opacity: 0.15,
    filter: 'blur(40px)',
    pointerEvents: 'none',
  },
  glowGold: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--accent-gold) 0%, transparent 70%)',
    bottom: '15%',
    right: '15%',
    opacity: 0.1,
    filter: 'blur(50px)',
    pointerEvents: 'none',
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    padding: '3rem 2.5rem',
    borderRadius: 'var(--radius-lg)',
    textAlign: 'center',
    zIndex: 1,
  },
  header: {
    marginBottom: '2rem',
  },
  logoBadge: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    fontFamily: 'var(--font-family-heading)',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.85rem',
    marginBottom: '1.5rem',
    textAlign: 'left',
    lineHeight: '1.4',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '1rem',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  inputWithIcon: {
    paddingLeft: '2.75rem',
  },
  submitBtn: {
    width: '100%',
    marginTop: '1rem',
    padding: '0.85rem',
    fontSize: '1rem',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '2rem 0 1.5rem 0',
  },
  dividerText: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    padding: '0 0.5rem',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
    marginBottom: '2rem',
  },
  demoBtn: {
    padding: '0.65rem',
    fontSize: '0.8rem',
    border: '1px solid var(--border-color)',
  },
  footerText: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    marginTop: '0.75rem',
  },
  registerLink: {
    color: 'var(--accent-green)',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'var(--transition-fast)',
  },
};
export { styles };

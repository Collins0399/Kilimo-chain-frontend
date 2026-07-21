import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Mail, Phone, Key, ShieldAlert, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import LandingNavbar from '../components/LandingNavbar';

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('2547');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Custom validation
    if (!/^254\d{9}$/.test(phoneNumber)) {
      setError('Phone number must be in the format 2547XXXXXXXX (e.g. 254712345678)');
      setLoading(false);
      return;
    }

    try {
      await api.auth.register(fullName, phoneNumber, email, password);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc', width: '100vw', overflowX: 'hidden' }}>
      <LandingNavbar />
      
      <div style={styles.container}>
        <div style={styles.glowGreen}></div>
        <div style={styles.glowGold}></div>

        <div style={styles.card} className="glass-panel">
          <div style={styles.backToLogin}>
          <Link to="/login" style={styles.backLink}>
            <ArrowLeft size={16} />
            <span>Back to Login</span>
          </Link>
        </div>

        <div style={styles.header}>
          <div style={styles.logoBadge}>🛒</div>
          <h1 style={styles.title}>Create Buyer Account</h1>
          <p style={styles.subtitle}>Register to browse and purchase fresh produce directly from farmers</p>
        </div>

        {error && (
          <div style={styles.errorBox} className="badge-danger">
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={styles.successBox} className="badge-success">
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleRegister} style={styles.form}>
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">Full Name</label>
            <div style={styles.inputWrapper}>
              <User style={styles.inputIcon} size={18} />
              <input
                id="fullName"
                type="text"
                required
                className="form-control"
                style={styles.inputWithIcon}
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phoneNumber">Phone Number (M-Pesa format)</label>
            <div style={styles.inputWrapper}>
              <Phone style={styles.inputIcon} size={18} />
              <input
                id="phoneNumber"
                type="tel"
                required
                className="form-control"
                style={styles.inputWithIcon}
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <span style={styles.inputHelp}>Must start with 254 </span>
          </div>

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
                placeholder="Email Address"
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
                minLength={6}
                className="form-control"
                style={styles.inputWithIcon}
                placeholder="Password"
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
            {loading ? 'Registering...' : 'Create Account'}
            <UserPlus size={18} />
          </button>
        </form>

        <div style={styles.footerText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.registerLink}>
            Log in
          </Link>
        </div>
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
    minHeight: 'calc(100vh - 70px)',
    width: '100%',
    backgroundColor: '#f8fafc',
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
    top: '10%',
    right: '15%',
    opacity: 0.12,
    filter: 'blur(40px)',
    pointerEvents: 'none',
  },
  glowGold: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--accent-gold) 0%, transparent 70%)',
    bottom: '10%',
    left: '15%',
    opacity: 0.08,
    filter: 'blur(50px)',
    pointerEvents: 'none',
  },
  card: {
    width: '100%',
    maxWidth: '480px',
    padding: '2.5rem 2.5rem',
    borderRadius: 'var(--radius-lg)',
    textAlign: 'center',
    zIndex: 1,
  },
  backToLogin: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: '1rem',
  },
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontSize: '0.85rem',
    transition: 'var(--transition-fast)',
  },
  header: {
    marginBottom: '1.75rem',
  },
  logoBadge: {
    fontSize: '3rem',
    marginBottom: '0.5rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
    fontFamily: 'var(--font-family-heading)',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    lineHeight: '1.4',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.85rem',
    marginBottom: '1.25rem',
    textAlign: 'left',
  },
  successBox: {
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.85rem',
    marginBottom: '1.25rem',
    textAlign: 'center',
    fontWeight: '600',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
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
  inputHelp: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    marginTop: '0.25rem',
    textAlign: 'left',
  },
  submitBtn: {
    width: '100%',
    marginTop: '1rem',
    padding: '0.85rem',
    fontSize: '1rem',
  },
  footerText: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    marginTop: '1.25rem',
  },
  registerLink: {
    color: 'var(--accent-green)',
    textDecoration: 'none',
    fontWeight: '600',
  },
};

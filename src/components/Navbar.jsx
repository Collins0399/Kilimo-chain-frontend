import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogOut, User, Bell, Smartphone } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (currentUser && currentUser.role === 'COOPERATIVE_ADMIN') {
      const fetchNotifications = async () => {
        try {
          const list = await api.admin.getNotifications();
          setUnreadCount(list.filter(n => !n.read_status).length);
        } catch (e) {
          console.error('Failed to fetch unread notification count', e);
        }
      };

      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) return null;

  return (
    <nav style={styles.navbar} className="glass-panel">
      <div style={styles.navBrand}>
        <span style={styles.brandEmoji}>🌾</span>
        <div style={styles.brandText}>
          <div style={styles.title}>Kilimo-Chain</div>
          <div style={styles.subtitle}>Supply Chain Portal</div>
        </div>
      </div>

      <div style={styles.navMenu}>


        {currentUser.role === 'COOPERATIVE_ADMIN' && (
          <Link to="/admin/notifications" style={styles.iconBtn}>
            <div style={styles.bellWrapper}>
              <Bell size={20} />
              {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
            </div>
          </Link>
        )}

        <div style={styles.userContainer}>
          <div className="profile-avatar" style={styles.avatar}>
            {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={styles.userDetails}>
            <span style={styles.userName}>{currentUser.fullName}</span>
            <span className={`badge ${currentUser.role === 'COOPERATIVE_ADMIN' ? 'badge-success' : 'badge-info'}`} style={styles.roleBadge}>
              {currentUser.role === 'COOPERATIVE_ADMIN' ? 'Coop Admin' : 'Buyer'}
            </span>
          </div>
        </div>

        <button onClick={handleLogout} style={styles.logoutBtn} className="btn btn-secondary">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 2rem',
    margin: '1.5rem 1.5rem 0 1.5rem',
    borderRadius: 'var(--radius-md)',
    zIndex: 10,
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  brandEmoji: {
    fontSize: '2rem',
  },
  brandText: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '800',
    fontFamily: 'var(--font-family-heading)',
    lineHeight: '1.2',
  },
  subtitle: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  navMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  simLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: '600',
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid transparent',
    transition: 'var(--transition-fast)',
  },
  iconBtn: {
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    transition: 'var(--transition-fast)',
    textDecoration: 'none',
  },
  bellWrapper: {
    position: 'relative',
    padding: '4px',
  },
  badge: {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    background: 'var(--accent-red)',
    color: 'white',
    fontSize: '0.65rem',
    fontWeight: '700',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid var(--bg-secondary)',
  },
  userContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    borderLeft: '1px solid var(--border-color)',
    paddingLeft: '1.5rem',
  },
  avatar: {
    width: '36px',
    height: '36px',
    fontSize: '0.9rem',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    maxWidth: '120px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  roleBadge: {
    fontSize: '0.65rem',
    padding: '0.05rem 0.4rem',
    marginTop: '0.1rem',
  },
  logoutBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.85rem',
    border: '1px solid var(--border-color)',
  },
};

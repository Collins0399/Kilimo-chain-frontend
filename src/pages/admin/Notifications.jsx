import React, { useEffect, useState } from 'react';
import { Bell, Check, Trash2, Mail, MailOpen, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.admin.getNotifications();
      // Sort: unread first, then newest first
      const sorted = (data || []).sort((a, b) => {
        if (a.read_status === b.read_status) {
          return new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt);
        }
        return a.read_status ? 1 : -1;
      });
      setNotifications(sorted);
    } catch (e) {
      console.error(e);
      setError('Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.admin.markNotificationRead(id);
      fetchNotifications();
    } catch (e) {
      console.error(e);
      setError('Failed to mark notification as read.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.admin.deleteNotification(id);
      fetchNotifications();
    } catch (e) {
      console.error(e);
      setError('Failed to delete notification.');
    }
  };

  const getNotificationIcon = (type) => {
    // LOW_STOCK, MARKET_PRICE_UPDATE, BUYER_REQUEST, PAYMENT_CONFIRMATION
    let color = 'var(--accent-blue)';
    let icon = <Bell size={18} />;

    if (type && type.includes('LOW_STOCK')) {
      color = 'var(--accent-red)';
      icon = <AlertTriangle size={18} />;
    } else if (type && type.includes('PRICE')) {
      color = 'var(--accent-green)';
      icon = <Mail size={18} />;
    } else if (type && type.includes('PAYMENT')) {
      color = 'var(--accent-gold)';
      icon = <Check size={18} />;
    }

    return { color, icon };
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>System Alerts & Notifications 🔔</h1>
        <p style={styles.subtitle}>Review automated alerts triggered by SMS farmer commands and payment actions.</p>
      </div>

      {error && (
        <div className="badge-danger" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <div className="glass-panel" style={{ padding: '2rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <h3>Querying alert logs...</h3>
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
            <Bell size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <p>No notifications logged yet.</p>
          </div>
        ) : (
          <div style={styles.list}>
            {notifications.map((n) => {
              const { color, icon } = getNotificationIcon(n.type);

              return (
                <div key={n.id} className={`notification-item ${!n.read_status ? 'unread' : ''}`} style={styles.item}>
                  <div className="notification-icon-box" style={{ background: color + '22', color: color }}>
                    {icon}
                  </div>
                  
                  <div style={styles.content}>
                    <div style={styles.metaRow}>
                      <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{n.type}</span>
                      <span style={styles.time}>{n.created_at ? new Date(n.created_at).toLocaleString() : 'Recent'}</span>
                    </div>
                    <p style={{ marginTop: '0.4rem', color: n.read_status ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: n.read_status ? '400' : '600' }}>
                      {n.message}
                    </p>
                  </div>

                  <div style={styles.actions}>
                    {!n.read_status && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="btn btn-secondary"
                        style={styles.actionBtn}
                        title="Mark as Read"
                      >
                        <MailOpen size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="btn btn-danger"
                      style={styles.actionBtn}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '1rem',
    marginTop: '0.25rem',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    padding: '1.25rem 1.5rem',
  },
  content: {
    flex: 1,
    textAlign: 'left',
  },
  metaRow: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  time: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
  actionBtn: {
    padding: '0.4rem',
    width: '32px',
    height: '32px',
  },
};
export { styles };

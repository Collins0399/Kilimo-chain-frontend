import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Sprout, ShoppingBag, Coins, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.admin.getDashboardStats();
      setStats(data);
    } catch (e) {
      console.error(e);
      setError('Failed to fetch dashboard overview metrics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <h3>Loading Cooperative metrics...</h3>
      </div>
    );
  }

  if (!stats) return <p>No data available.</p>;

  // Formatting helper
  const formatCurrency = (val) => {
    return 'KES ' + (val || 0).toLocaleString();
  };

  return (
    <div style={styles.dashboard}>
      <div style={styles.welcome}>
        <h1 style={styles.title}>Cooperative Dashboard 🌾</h1>
        <p style={styles.subtitle}>Overview of smallholder farmer activities, active produce stock, and completed payments.</p>
      </div>

      {error && (
        <div className="badge-danger" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)' }}>
          {error}
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="dashboard-grid">
        <div className="glass-card green-accent stat-card">
          <div>
            <span style={styles.cardLabel}>Registered Farmers</span>
            <div className="stat-val">{stats.totalFarmers || 0}</div>
            <div className="stat-trend" style={{ color: 'var(--accent-green)' }}>
              <span>Active producers</span>
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'var(--accent-green-glow)', color: 'var(--accent-green)' }}>
            <Users size={24} />
          </div>
        </div>

        <div className="glass-card gold-accent stat-card">
          <div>
            <span style={styles.cardLabel}>Active Harvest Listings</span>
            <div className="stat-val">{stats.totalActiveListings || 0}</div>
            <div className="stat-trend" style={{ color: 'var(--accent-gold)' }}>
              <span>{stats.totalInventoryKg?.toLocaleString() || 0} KG available</span>
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'var(--accent-gold-glow)', color: 'var(--accent-gold)' }}>
            <Sprout size={24} />
          </div>
        </div>

        <div className="glass-card blue-accent stat-card">
          <div>
            <span style={styles.cardLabel}>Pending Buyer Requests</span>
            <div className="stat-val">{stats.pendingBuyerRequests || 0}</div>
            <div style={styles.cardSub}>Awaiting admin approval</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'var(--accent-blue-glow)', color: 'var(--accent-blue)' }}>
            <ShoppingBag size={24} />
          </div>
        </div>

        <div className="glass-card green-accent stat-card">
          <div>
            <span style={styles.cardLabel}>Today's Revenue</span>
            <div className="stat-val">{formatCurrency(stats.todayRevenue)}</div>
            <div className="stat-trend" style={{ color: 'var(--accent-green)' }}>
              <span>{stats.successfulPayments || 0} Paid Trades</span>
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'var(--accent-green-glow)', color: 'var(--accent-green)' }}>
            <Coins size={24} />
          </div>
        </div>
      </div>

      <div className="main-grid">
        {/* Left Column: Recent Activities Timeline */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} style={{ color: 'var(--accent-green)' }} />
            <span>Recent Platform Activities</span>
          </h3>

          {!stats.recentActivities || stats.recentActivities.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No activities logged recently.</p>
          ) : (
            <div className="timeline">
              {stats.recentActivities.map((act, index) => {
                let actClass = 'request';
                if (act.type && act.type.toLowerCase().includes('payment')) actClass = 'payment';
                if (act.type && act.type.toLowerCase().includes('error')) actClass = 'warning';

                return (
                  <div key={index} className={`timeline-item ${actClass}`}>
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <div className="timeline-time">
                        {act.timestamp ? new Date(act.timestamp).toLocaleString() : 'Just now'}
                      </div>
                      <p style={styles.timelineDesc}>{act.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Quick Links & Actions */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Quick Actions</h3>
          
          <div style={styles.actionsList}>
            <Link to="/admin/farmers" className="btn btn-secondary" style={styles.actionBtn}>
              Onboard New Farmer
            </Link>
            <Link to="/admin/prices" className="btn btn-primary" style={styles.actionBtn}>
              Update Market Prices
            </Link>
            <Link to="/admin/requests" className="btn btn-outline" style={styles.actionBtn}>
              Review Buyer Requests ({stats.pendingBuyerRequests || 0})
            </Link>
            <Link to="/admin/payments" className="btn btn-outline" style={styles.actionBtn}>
              Audit M-Pesa Payments
            </Link>
          </div>

          <div style={styles.platformMeta}>
            <h4 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Platform Status</h4>
            <div style={styles.statusRow}>
              <span>Backend API</span>
              <span className="badge badge-success">Online (Port 9001)</span>
            </div>
            <div style={styles.statusRow}>
              <span>USSD Offline Portal</span>
              <span className="badge badge-success">Active</span>
            </div>
            <div style={styles.statusRow}>
              <span>M-Pesa Sandbox Callback</span>
              <span className="badge badge-warning">Simulated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  dashboard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  welcome: {
    marginBottom: '0.5rem',
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
  cardLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  cardSub: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '0.5rem',
  },
  timelineDesc: {
    fontSize: '0.95rem',
    lineHeight: '1.4',
    marginTop: '0.25rem',
    color: 'var(--text-primary)',
  },
  actionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '2rem',
  },
  actionBtn: {
    width: '100%',
    justifyContent: 'flex-start',
    padding: '0.85rem 1.25rem',
  },
  platformMeta: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1.5rem',
  },
  statusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.875rem',
    marginBottom: '0.75rem',
  },
};
export { styles };

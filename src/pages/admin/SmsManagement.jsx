import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, CheckCircle2, AlertTriangle, Search, Filter, RefreshCw, Clock, Phone } from 'lucide-react';
import { api } from '../../services/api';
import { formatDate } from '../../services/utils';
import StatusBadge from '../../components/StatusBadge';

export default function SmsManagement() {
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    totalSent: 0,
    sentToday: 0,
    failed: 0,
    successful: 0,
  });
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  const [filterEvent, setFilterEvent] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [filterEvent]);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.admin.getSmsLogs({
        phone: searchPhone,
        event: filterEvent,
      });
      setLogs(Array.isArray(data) ? data : []);
      setCurrentPage(1);
    } catch (e) {
      console.error(e);
      setError('Failed to load SMS logs.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const data = await api.admin.getSmsStats();
      if (data) {
        setStats(data);
      }
    } catch (e) {
      console.error('Failed to load SMS stats', e);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    fetchLogs();
  };

  const handleBroadcastSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!broadcastMsg.trim()) return;

    setSendingBroadcast(true);
    setBroadcastResult(null);
    try {
      const res = await api.admin.sendBroadcastSms(broadcastMsg.trim());
      setBroadcastResult({
        success: true,
        message: res.message || 'Broadcast message queued successfully.',
      });
      setBroadcastMsg('');
      fetchLogs();
      fetchStats();
    } catch (err) {
      console.error(err);
      setBroadcastResult({
        success: false,
        message: err.message || 'Failed to dispatch broadcast alert.',
      });
    } finally {
      setSendingBroadcast(false);
    }
  };

  // Trigger event display labels
  const getEventLabel = (event) => {
    if (!event) return 'System Alert';
    switch (event) {
      case 'PRICE_UPDATE': return '🌽 Price Update';
      case 'PURCHASE_REQUEST': return '🛒 New Request';
      case 'REQUEST_APPROVED': return '✅ Request Approved';
      case 'REQUEST_REJECTED': return '❌ Request Rejected';
      case 'MPESA_PAYMENT': return '💸 Payment Success';
      case 'HARVEST_COLLECTED': return '📦 Harvest Collected';
      case 'FARMER_VERIFICATION': return '🛡️ Farmer Verified';
      case 'FARMER_REGISTRATION': return '👋 Welcome Onboard';
      case 'LOW_STOCK': return '⚠️ Low Stock Alert';
      case 'SOLD_OUT': return '💯 Harvest Sold Out';
      case 'BROADCAST': return '📢 Admin Broadcast';
      case 'HARVEST_RECORDED': return '🌾 Harvest Recorded';
      default: return event;
    }
  };

  const totalPages = Math.ceil(logs.length / 8) || 1;
  const paginatedLogs = logs.slice((currentPage - 1) * 8, currentPage * 8);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-family-heading)', marginBottom: '0.25rem' }}>SMS Notifications Module ✉️</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Log auditing, broadcast alerts dispatch, and offline farmer communications tracker.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => { fetchLogs(); fetchStats(); }} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div className="glass-card green-accent" style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>TOTAL DISPATCHED</span>
            <MessageSquare size={18} style={{ color: 'var(--accent-green)' }} />
          </div>
          {statsLoading ? (
            <div className="skeleton-text" style={{ width: '60px', height: '28px', margin: '0.5rem 0' }}></div>
          ) : (
            <span style={styles.statNum}>{stats.totalSent}</span>
          )}
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Accumulated farmer alerts</span>
        </div>

        <div className="glass-card gold-accent" style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>DISPATCHED TODAY</span>
            <Clock size={18} style={{ color: 'var(--accent-gold)' }} />
          </div>
          {statsLoading ? (
            <div className="skeleton-text" style={{ width: '60px', height: '28px', margin: '0.5rem 0' }}></div>
          ) : (
            <span style={styles.statNum}>{stats.sentToday}</span>
          )}
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sent since midnight</span>
        </div>

        <div className="glass-card green-accent" style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>DELIVERED SUCCESS</span>
            <CheckCircle2 size={18} style={{ color: 'var(--accent-green)' }} />
          </div>
          {statsLoading ? (
            <div className="skeleton-text" style={{ width: '60px', height: '28px', margin: '0.5rem 0' }}></div>
          ) : (
            <span style={styles.statNum}>{stats.successful}</span>
          )}
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Confirmed network delivery</span>
        </div>

        <div className="glass-card red-accent" style={styles.statCard}>
          <div style={styles.statHeader}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>FAILED DISPATCH</span>
            <AlertTriangle size={18} style={{ color: 'var(--accent-red)' }} />
          </div>
          {statsLoading ? (
            <div className="skeleton-text" style={{ width: '60px', height: '28px', margin: '0.5rem 0' }}></div>
          ) : (
            <span style={styles.statNum} className="text-red">{stats.failed}</span>
          )}
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gateway network drops</span>
        </div>
      </div>

      <div className="sms-content-layout">
        {/* Left Side: logs auditing */}
        <div style={styles.logAuditor}>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Notifications Log Auditing
            </h3>

            {/* Filter and Search Bar */}
            <form onSubmit={handleSearchSubmit} style={styles.filterBar}>
              <div style={styles.searchWrapper}>
                <Search size={16} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search by phone..."
                  className="form-control"
                  style={styles.searchInput}
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                />
              </div>

              <div style={styles.selectWrapper}>
                <Filter size={14} style={{ color: 'var(--text-muted)' }} />
                <select
                  className="form-control"
                  style={styles.selectInput}
                  value={filterEvent}
                  onChange={(e) => setFilterEvent(e.target.value)}
                >
                  <option value="">All Trigger Events</option>
                  <option value="FARMER_REGISTRATION">Farmer Registration</option>
                  <option value="FARMER_VERIFICATION">Farmer Verification</option>
                  <option value="HARVEST_RECORDED">Harvest Recorded</option>
                  <option value="PRICE_UPDATE">Market Price Updates</option>
                  <option value="PURCHASE_REQUEST">New Buyer Requests</option>
                  <option value="MPESA_PAYMENT">M-Pesa Payments</option>
                  <option value="LOW_STOCK">Low Stock Alerts</option>
                  <option value="SOLD_OUT">Harvest Sold Out</option>
                  <option value="HARVEST_COLLECTED">Harvest Collection</option>
                  <option value="BROADCAST">Admin Broadcasts</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ height: '38px', padding: '0 1rem' }}>
                Search
              </button>
            </form>

            {/* Logs Table */}
            {loading ? (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '150px' }}>Sent Date</th>
                      <th style={{ width: '120px' }}>Recipient</th>
                      <th style={{ width: '150px' }}>Trigger Event</th>
                      <th>Message Body</th>
                      <th style={{ width: '100px' }}>Status</th>
                      <th style={{ width: '110px' }}>Delivery</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td><div className="skeleton-text" style={{ width: '120px', height: '18px' }}></div></td>
                        <td><div className="skeleton-text" style={{ width: '100px', height: '18px' }}></div></td>
                        <td><div className="skeleton-text" style={{ width: '110px', height: '18px' }}></div></td>
                        <td><div className="skeleton-text" style={{ width: '250px', height: '18px' }}></div></td>
                        <td><div className="skeleton-text" style={{ width: '60px', height: '18px' }}></div></td>
                        <td><div className="skeleton-text" style={{ width: '70px', height: '18px' }}></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : error ? (
              <div className="badge-danger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: 'var(--radius-sm)', margin: '1rem 0' }}>
                <span>{error}</span>
                <button 
                  onClick={fetchLogs} 
                  className="btn btn-secondary" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <RefreshCw size={12} />
                  <span>Retry</span>
                </button>
              </div>
            ) : logs.length === 0 ? (
              <div style={styles.noData}>No SMS logs match current criteria.</div>
            ) : (
              <div>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th style={{ width: '150px' }}>Sent Date</th>
                        <th style={{ width: '120px' }}>Recipient</th>
                        <th style={{ width: '150px' }}>Trigger Event</th>
                        <th>Message Body</th>
                        <th style={{ width: '100px' }}>Status</th>
                        <th style={{ width: '110px' }}>Delivery</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedLogs.map((log) => (
                        <tr key={log.id}>
                          <td style={styles.dateCell}>{formatDate(log.sentAt)}</td>
                          <td style={styles.phoneCell}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Phone size={12} style={{ color: 'var(--text-muted)' }} />
                              <span>{log.recipientPhone}</span>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                              {getEventLabel(log.triggerEvent)}
                            </span>
                          </td>
                          <td style={styles.messageCell}>{log.message}</td>
                          <td>
                            <StatusBadge status={log.status} />
                          </td>
                          <td>
                            <StatusBadge status={log.deliveryStatus || 'DELIVERED'} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                    >
                      Previous
                    </button>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: broadcast dispatch */}
        <div style={styles.broadcastPanel}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Send size={18} style={{ color: 'var(--accent-green)' }} />
              <span>Cooperative SMS Broadcast</span>
            </h3>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.4' }}>
              Compose and send mass notifications. This dispatches standard SMS updates to all registered and verified cooperative farmers in real time.
            </p>

            {broadcastResult && (
              <div 
                className={broadcastResult.success ? 'badge-success' : 'badge-danger'}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}
              >
                {broadcastResult.message}
              </div>
            )}

            <form onSubmit={handleBroadcastSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="broadcastMsg">Alert / Announcement Message</label>
                <textarea
                  id="broadcastMsg"
                  required
                  rows={5}
                  className="form-control"
                  style={styles.textarea}
                  placeholder="e.g. Dear farmers, the fertilizer subsidy distribution starts tomorrow at the Nyeri Depot. Please bring your national IDs."
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  maxLength={400}
                />
                <div style={styles.charCount}>
                  <span>Max characters: 400</span>
                  <span>{broadcastMsg.length}/400</span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={sendingBroadcast || !broadcastMsg.trim()} 
                className="btn btn-primary"
                style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
              >
                {sendingBroadcast ? <RefreshCw className="spin" size={16} /> : <Send size={16} />}
                <span>{sendingBroadcast ? 'Sending Broadcast...' : 'Dispatch Alert to Farmers'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.25rem',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1.25rem',
    textAlign: 'left',
  },
  statHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
    fontWeight: '600',
  },
  statNum: {
    fontFamily: 'var(--font-family-heading)',
    fontSize: '2rem',
    fontWeight: '800',
    lineHeight: '1',
    marginBottom: '0.5rem',
  },
  contentLayout: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '1.5rem',
    alignItems: 'start',
  },
  logAuditor: {
    minWidth: 0,
  },
  broadcastPanel: {
    textAlign: 'left',
  },
  filterBar: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.25rem',
    alignItems: 'center',
  },
  searchWrapper: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchInput: {
    paddingLeft: '2.25rem',
    height: '38px',
  },
  selectWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '210px',
  },
  selectInput: {
    paddingLeft: '2rem',
    height: '38px',
  },
  noData: {
    padding: '3rem',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: 'var(--radius-sm)',
    border: '1px dashed var(--border-color)',
  },
  dateCell: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  phoneCell: {
    fontSize: '0.85rem',
    fontFamily: 'monospace',
    whiteSpace: 'nowrap',
  },
  messageCell: {
    fontSize: '0.8rem',
    lineHeight: '1.4',
    textAlign: 'left',
    whiteSpace: 'pre-wrap',
    minWidth: '220px',
  },
  textarea: {
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    lineHeight: '1.5',
    padding: '0.75rem',
  },
  charCount: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '0.35rem',
  },
};
export { styles };

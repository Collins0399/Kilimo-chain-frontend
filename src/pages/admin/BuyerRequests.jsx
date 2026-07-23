import React, { useEffect, useState } from 'react';
import { Check, X, ShieldAlert, ShoppingBag, Eye, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { formatDate } from '../../services/utils';
import StatusBadge from '../../components/StatusBadge';

export default function BuyerRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [actioningId, setActioningId] = useState(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.admin.getBuyerRequests(undefined);
      setRequests(data || []);
      setCurrentPage(1);
    } catch (e) {
      console.error(e);
      setError('Failed to fetch buyer requests.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRequests = () => {
    if (!statusFilter) return requests;
    return requests.filter(r => {
      const status = r.status || '';
      if (statusFilter === 'PENDING') {
        return status === 'PENDING';
      }
      if (statusFilter === 'APPROVED') {
        return status === 'APPROVED' || status === 'ACCEPTED' || status === 'PAYMENT_PENDING';
      }
      if (statusFilter === 'PAID') {
        return status === 'PAID' || status === 'COMPLETED';
      }
      if (statusFilter === 'REJECTED') {
        return status === 'REJECTED' || status === 'CANCELLED';
      }
      return true;
    });
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this request? It will send a payment STK push trigger link to the buyer.')) return;
    setActioningId(id);
    setError('');
    try {
      await api.admin.approveRequest(id);
      fetchRequests();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to approve request.');
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this request?')) return;
    setActioningId(id);
    setError('');
    try {
      await api.admin.rejectRequest(id);
      fetchRequests();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to reject request.');
    } finally {
      setActioningId(null);
    }
  };

  const filtered = getFilteredRequests();
  const pageSize = 8;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Buyer Purchase Requests 🛒</h1>
        <p style={styles.subtitle}>Review bulk purchase requests submitted by commercial agricultural buyers.</p>
      </div>

      {error && (
        <div className="badge-danger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
          <button 
            onClick={fetchRequests} 
            className="btn btn-secondary" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <RefreshCw size={14} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Filter bar */}
      <div className="glass-panel" style={styles.filterBar}>
        <div style={styles.filterField}>
          <label style={styles.fieldLabel}>Request Status</label>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="PAID">Paid</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        {loading ? (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Buyer Details</th>
                  <th>Farmer Details</th>
                  <th>Crop Requested</th>
                  <th>Quantity</th>
                  <th>Est. Amount</th>
                  <th>Date Requested</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Approval Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td><div className="skeleton-text" style={{ width: '50px', height: '18px' }}></div></td>
                    <td>
                      <div className="skeleton-text" style={{ width: '120px', height: '16px' }}></div>
                      <div className="skeleton-text" style={{ width: '90px', height: '12px', marginTop: '0.25rem' }}></div>
                    </td>
                    <td>
                      <div className="skeleton-text" style={{ width: '120px', height: '16px' }}></div>
                      <div className="skeleton-text" style={{ width: '90px', height: '12px', marginTop: '0.25rem' }}></div>
                    </td>
                    <td><div className="skeleton-text" style={{ width: '90px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '80px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '100px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '100px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '70px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '80px', height: '18px', margin: '0 auto' }}></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
            <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <p style={{ fontWeight: '600' }}>No purchase requests found matching filters.</p>
          </div>
        ) : (
          <div>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Buyer Details</th>
                    <th>Farmer Details</th>
                    <th>Crop Requested</th>
                    <th>Quantity</th>
                    <th>Est. Amount</th>
                    <th>Date Requested</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Approval Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((r) => {
                    const canAct = r.status === 'PENDING';

                    return (
                      <tr key={r.id}>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>#{r.id}</td>
                        <td>
                          <div style={{ fontWeight: '600' }}>{r.buyerName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📞 {r.buyerPhone}</div>
                          {r.deliveryLocation && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 Delivery: {r.deliveryLocation}</div>}
                        </td>
                        <td>
                          <div style={{ fontWeight: '600' }}>{r.farmerName || 'SMS Farmer'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📞 {r.farmerPhone || 'N/A'}</div>
                        </td>
                        <td style={{ fontWeight: '700' }}>{r.cropName}</td>
                        <td style={{ fontWeight: '600' }}>{r.quantityRequested} {r.unit || 'KG'}</td>
                        <td style={{ fontWeight: '700', color: 'var(--accent-gold)' }}>
                          KES {r.totalAmount ? r.totalAmount.toLocaleString() : 0}
                        </td>
                        <td>{formatDate(r.requestDate)}</td>
                        <td>
                          <StatusBadge status={r.status} />
                        </td>
                        <td style={styles.actionCell}>
                          {canAct ? (
                            <>
                              <button
                                onClick={() => handleApprove(r.id)}
                                disabled={actioningId === r.id}
                                className="btn btn-primary"
                                style={{ ...styles.tableBtn, opacity: actioningId === r.id ? 0.5 : 1 }}
                                title="Approve Purchase Request"
                                aria-label="Approve Purchase Request"
                              >
                                {actioningId === r.id ? <RefreshCw className="spin" size={14} /> : <Check size={14} />}
                              </button>
                              <button
                                onClick={() => handleReject(r.id)}
                                disabled={actioningId === r.id}
                                className="btn btn-danger"
                                style={{ ...styles.tableBtn, opacity: actioningId === r.id ? 0.5 : 1 }}
                                title="Reject Purchase Request"
                                aria-label="Reject Purchase Request"
                              >
                                {actioningId === r.id ? <RefreshCw className="spin" size={14} /> : <X size={14} />}
                              </button>
                            </>
                          ) : (
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No Action Required</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >
                  Previous
                </button>
                <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >
                  Next
                </button>
              </div>
            )}
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
  filterBar: {
    display: 'flex',
    padding: '1.25rem',
    marginBottom: '2rem',
  },
  filterField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    width: '240px',
  },
  fieldLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  actionCell: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '44px',
  },
  tableBtn: {
    padding: '0.4rem',
    width: '32px',
    height: '32px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
export { styles };

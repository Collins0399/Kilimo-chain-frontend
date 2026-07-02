import React, { useEffect, useState } from 'react';
import { Check, X, ShieldAlert, ShoppingBag, Eye } from 'lucide-react';
import { api } from '../../services/api';

export default function BuyerRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await api.admin.getBuyerRequests(statusFilter || undefined);
      setRequests(data || []);
    } catch (e) {
      console.error(e);
      setError('Failed to fetch buyer requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this request? It will send a payment STK push trigger link to the buyer.')) return;
    try {
      await api.admin.approveRequest(id);
      fetchRequests();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to approve request.');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this request?')) return;
    try {
      await api.admin.rejectRequest(id);
      fetchRequests();
    } catch (e) {
      console.error(e);
      setError(e.message || 'Failed to reject request.');
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Buyer Purchase Requests 🛒</h1>
        <p style={styles.subtitle}>Review bulk purchase requests submitted by commercial agricultural buyers.</p>
      </div>

      {error && (
        <div className="badge-danger" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
          {error}
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
            <option value="PENDING">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="ACCEPTED">Accepted by Farmer</option>
            <option value="REJECTED">Rejected</option>
            <option value="PAYMENT_PENDING">Payment Pending</option>
            <option value="PAID">Paid</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <h3>Querying buyer requests...</h3>
          </div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            <p>No purchase requests found matching filters.</p>
          </div>
        ) : (
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
                {requests.map((r) => {
                  let statusBadge = 'badge-warning';
                  if (r.status === 'PAID' || r.status === 'COMPLETED') statusBadge = 'badge-success';
                  if (r.status === 'REJECTED' || r.status === 'CANCELLED') statusBadge = 'badge-danger';
                  if (r.status === 'APPROVED' || r.status === 'PAYMENT_PENDING' || r.status === 'ACCEPTED') statusBadge = 'badge-info';

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
                      <td>{new Date(r.requestDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${statusBadge}`}>{r.status}</span>
                      </td>
                      <td style={styles.actionCell}>
                        {canAct ? (
                          <>
                            <button
                              onClick={() => handleApprove(r.id)}
                              className="btn btn-primary"
                              style={styles.tableBtn}
                              title="Approve Purchase Request"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => handleReject(r.id)}
                              className="btn btn-danger"
                              style={styles.tableBtn}
                              title="Reject Purchase Request"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Decision Recorded</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
    gap: '1rem',
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
  },
};
export { styles };

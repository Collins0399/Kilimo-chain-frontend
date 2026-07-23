import React, { useEffect, useState } from 'react';
import { CreditCard, DollarSign, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { formatDate } from '../../services/utils';
import StatusBadge from '../../components/StatusBadge';

export default function PaymentAudit() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [status]);

  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.admin.getPayments(status || undefined);
      setPayments(data || []);
      setCurrentPage(1);
    } catch (e) {
      console.error(e);
      setError('Failed to fetch payment transaction logs.');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(payments.length / 8) || 1;
  const paginated = payments.slice((currentPage - 1) * 8, currentPage * 8);

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Payment Audit Logs 💳</h1>
        <p style={styles.subtitle}>Audit transaction records, track M-Pesa merchant IDs, callbacks, and success logs.</p>
      </div>

      {error && (
        <div className="badge-danger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
          <button 
            onClick={fetchPayments} 
            className="btn btn-secondary" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <RefreshCw size={14} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Filter Options */}
      <div className="glass-panel" style={styles.filterBar}>
        <div style={styles.filterField}>
          <label style={styles.fieldLabel}>Payment Status</label>
          <select
            className="form-control"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Transactions</option>
            <option value="PENDING">Pending Callback</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="TIMEOUT">Timeout</option>
          </select>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        {loading ? (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Order Ref</th>
                  <th>M-Pesa Receipt</th>
                  <th>Amount</th>
                  <th>Payer Phone</th>
                  <th>Checkout Request ID</th>
                  <th>Merchant Request ID</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Time Paid</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td><div className="skeleton-text" style={{ width: '40px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '70px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '80px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '80px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '90px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '120px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '120px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '130px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '70px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '120px', height: '18px' }}></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : payments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
            <CreditCard size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <p style={{ fontWeight: '600' }}>No payments recorded matching filters.</p>
          </div>
        ) : (
          <div>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Payment ID</th>
                    <th>Order Ref</th>
                    <th>M-Pesa Receipt</th>
                    <th>Amount</th>
                    <th>Payer Phone</th>
                    <th>Checkout Request ID</th>
                    <th>Merchant Request ID</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Time Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>#{p.id}</td>
                      <td>
                        <span style={{ fontWeight: '600' }}>
                          {p.buyerRequestId ? `Request #${p.buyerRequestId}` : 'N/A'}
                        </span>
                      </td>
                      <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                        {p.mpesaReceiptNumber || 'N/A'}
                      </td>
                      <td style={{ fontWeight: '700', color: 'var(--accent-gold)' }}>
                        KES {p.amount?.toLocaleString()}
                      </td>
                      <td>{p.phoneNumber || 'N/A'}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.checkoutRequestId || 'N/A'}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.merchantRequestId || 'N/A'}</td>
                      <td>{p.transactionDesc || 'M-Pesa transaction'}</td>
                      <td>
                        <StatusBadge status={p.status} />
                      </td>
                      <td>
                        {formatDate(p.paidAt || p.createdAt)}
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
};
export { styles };

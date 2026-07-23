import React, { useEffect, useState } from 'react';
import { CreditCard, ShieldCheck, HelpCircle, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { formatDate } from '../../services/utils';
import StatusBadge from '../../components/StatusBadge';

export default function PaymentHistory() {
  const currentUser = api.auth.getCurrentUser();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      if (currentUser) {
        // Fetch only this buyer's payments from the secure buyer-scoped endpoint
        const data = await api.buyer.getPayments(currentUser.userId);
        setPayments(data || []);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to fetch payment transaction logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Payment History 💳</h1>
        <p style={styles.subtitle}>Track your Safaricom M-Pesa mobile money receipts and transaction statuses.</p>
      </div>

      {error && (
        <div style={styles.errorBox} className="badge-danger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
          <span>{error}</span>
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

      <div className="glass-panel" style={{ padding: '2rem' }}>
        {loading ? (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>M-Pesa Receipt</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Checkout Request ID</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td><div className="skeleton-text" style={{ width: '80px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '100px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '150px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '70px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '120px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '140px', height: '18px' }}></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : payments.length === 0 ? (
          <div style={styles.empty}>
            <CreditCard size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>No payment records found.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Make a purchase request and authorize M-Pesa STK to see payments here.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>M-Pesa Receipt</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Checkout Request ID</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                      {p.mpesaReceiptNumber || 'N/A'}
                    </td>
                    <td style={{ fontWeight: '700', color: 'var(--accent-gold)' }}>
                      KES {p.amount?.toLocaleString()}
                    </td>
                    <td>{p.transactionDesc || 'M-Pesa payment'}</td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {p.checkoutRequestId || 'N/A'}
                    </td>
                    <td>
                      {formatDate(p.paidAt || p.createdAt)}
                    </td>
                  </tr>
                ))}
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
  errorBox: {
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '1.5rem',
  },
  empty: {
    textAlign: 'center',
    padding: '3rem 1rem',
  },
};
export { styles };

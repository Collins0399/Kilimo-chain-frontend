import React, { useEffect, useState } from 'react';
import { CreditCard, ShieldCheck, HelpCircle, FileSpreadsheet } from 'lucide-react';
import { api } from '../../services/api';

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
    try {
      if (currentUser) {
        // Fetch all requests for this buyer first, to get their IDs
        const buyerRequests = await api.buyer.getRequests(currentUser.userId);
        const buyerRequestIds = new Set(buyerRequests.map(r => r.id));

        // Fetch all payments and filter
        const allPayments = await api.admin.getPayments();
        const filtered = allPayments.filter(p => buyerRequestIds.has(p.buyerRequestId));
        
        setPayments(filtered || []);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to fetch payment transaction logs.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <h3>Loading payment history...</h3>
      </div>
    );
  }

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Payment History 💳</h1>
        <p style={styles.subtitle}>Track your Safaricom M-Pesa mobile money receipts and transaction statuses.</p>
      </div>

      {error && (
        <div style={styles.errorBox} className="badge-danger">
          <span>{error}</span>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '2rem' }}>
        {payments.length === 0 ? (
          <div style={styles.empty}>
            <CreditCard size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <p>No payment records found.</p>
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
                {payments.map((p) => {
                  let badgeClass = 'badge-warning';
                  if (p.status === 'SUCCESS') badgeClass = 'badge-success';
                  if (p.status === 'FAILED') badgeClass = 'badge-danger';

                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                        {p.mpesaReceiptNumber || 'N/A'}
                      </td>
                      <td style={{ fontWeight: '700', color: 'var(--accent-gold)' }}>
                        KES {p.amount?.toLocaleString()}
                      </td>
                      <td>{p.transactionDesc || 'M-Pesa payment'}</td>
                      <td>
                        <span className={`badge ${badgeClass}`}>{p.status}</span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {p.checkoutRequestId || 'N/A'}
                      </td>
                      <td>
                        {p.paidAt ? new Date(p.paidAt).toLocaleString() : new Date(p.createdAt).toLocaleString()}
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

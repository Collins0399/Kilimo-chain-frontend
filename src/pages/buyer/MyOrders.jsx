import React, { useEffect, useState } from 'react';
import { ShoppingBag, FileText, Phone, Award, ShieldAlert, Sparkles, Check, X, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { formatDate } from '../../services/utils';
import StatusBadge from '../../components/StatusBadge';

export default function MyOrders() {
  const currentUser = api.auth.getCurrentUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Payment states
  const [activePaymentRequest, setActivePaymentRequest] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState(null);
  const [phoneToPay, setPhoneToPay] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      if (currentUser) {
        const data = await api.buyer.getRequests(currentUser.userId);
        setOrders(data || []);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to fetch your orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPaymentPrompt = (order) => {
    setActivePaymentRequest(order);
    setPhoneToPay(currentUser.phoneNumber || '254700000000');
    setPaymentResponse(null);
    setPaymentSuccess(false);
    setSuccessMsg('');
    setError('');
  };

  const handleClosePaymentModal = () => {
    setActivePaymentRequest(null);
    setPaymentSuccess(false);
  };

  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      // 1. Call backend initiate STK Push
      const res = await api.payments.initiate(activePaymentRequest.id, phoneToPay);
      setPaymentResponse(res);
      setPaymentSuccess(true);
      setSuccessMsg(`An M-Pesa STK Push has been sent to your phone number ${phoneToPay}. Please enter your M-Pesa PIN on your phone to authorize the payment of KES ${activePaymentRequest.totalAmount?.toLocaleString()}.`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to initiate M-Pesa STK Push');
    } finally {
      setPaymentLoading(false);
    }
  };

  const renderSkeletons = () => (
    <div style={styles.cardContainer}>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="glass-card green-accent" style={styles.orderCard}>
          <div style={styles.cardHeader}>
            <div>
              <div className="skeleton-text" style={{ width: '100px', height: '22px' }}></div>
              <div className="skeleton-text" style={{ width: '80px', height: '14px', marginTop: '0.25rem' }}></div>
            </div>
            <div className="skeleton-text" style={{ width: '70px', height: '20px', borderRadius: 'var(--radius-full)' }}></div>
          </div>
          <div style={styles.cardBody}>
            <div style={styles.metaGrid}>
              {[...Array(3)].map((_, j) => (
                <div key={j}>
                  <div className="skeleton-text" style={{ width: '40px', height: '10px' }}></div>
                  <div className="skeleton-text" style={{ width: '60px', height: '16px', marginTop: '0.15rem' }}></div>
                </div>
              ))}
            </div>
            <div className="skeleton-text" style={{ width: '90%', height: '14px' }}></div>
            <div className="skeleton-text" style={{ width: '75%', height: '14px' }}></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>My Purchase Requests 📦</h1>
        <p style={styles.subtitle}>Track and manage the progress of your requests and make M-Pesa payments.</p>
      </div>

      {error && !activePaymentRequest && (
        <div className="badge-danger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
          <button 
            onClick={fetchOrders} 
            className="btn btn-secondary" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <RefreshCw size={14} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {loading ? (
        renderSkeletons()
      ) : orders.length === 0 ? (
        <div style={styles.empty}>
          <ShoppingBag size={64} style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }} />
          <h2>No Requests Placed</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>You have not requested any agricultural harvests yet.</p>
        </div>
      ) : (
        <div style={styles.cardContainer}>
          {orders.map((order) => {
            const canPay = order.status === 'APPROVED' || order.status === 'PAYMENT_PENDING' || order.status === 'ACCEPTED' || order.status === 'PENDING';

            return (
              <div key={order.id} className="glass-card green-accent" style={styles.orderCard}>
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem' }}>{order.cropName}</h3>
                    <span style={styles.orderId}>Request ID: #{order.id}</span>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div style={styles.cardBody}>
                  <div style={styles.metaGrid}>
                    <div>
                      <span style={styles.metaLabel}>Quantity</span>
                      <div style={styles.metaVal}>{order.quantityRequested} {order.unit || 'KG'}</div>
                    </div>
                    <div>
                      <span style={styles.metaLabel}>Unit Price</span>
                      <div style={styles.metaVal}>KES {order.unitPrice}/KG</div>
                    </div>
                    <div>
                      <span style={styles.metaLabel}>Total Price</span>
                      <div style={{ ...styles.metaVal, color: 'var(--accent-gold)', fontWeight: '700' }}>
                        KES {order.totalAmount ? order.totalAmount.toLocaleString() : 0}
                      </div>
                    </div>
                  </div>

                  <div style={styles.detailsList}>
                    <div>📍 Delivery: <strong>{order.deliveryLocation}</strong></div>
                    {order.farmerName && <div>👨‍🌾 Farmer: <strong>{order.farmerName} ({order.farmerPhone})</strong></div>}
                    <div>🗓️ Requested: {formatDate(order.requestDate)}</div>
                    {order.additionalNotes && <div style={{ fontStyle: 'italic', marginTop: '0.25rem', color: 'var(--text-muted)' }}>📝 "{order.additionalNotes}"</div>}
                  </div>
                </div>

                {canPay && (
                  <div style={styles.cardFooter}>
                    <button
                      onClick={() => handleOpenPaymentPrompt(order)}
                      className="btn btn-gold"
                      style={styles.payBtn}
                    >
                      💳 Pay via M-Pesa STK Push
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Initiation Modal */}
      {activePaymentRequest && (
        <div className="modal-overlay">
          {!paymentSuccess ? (
            /* Phase 1: Initiate Payment Prompt */
            <div className="modal-content glass-panel" style={{ maxWidth: '450px' }}>
              <div className="modal-header">
                <h3>Initiate M-Pesa Payment</h3>
                <button onClick={handleClosePaymentModal} className="modal-close">✕</button>
              </div>

              {error && (
                <div className="badge-danger" style={styles.modalError}>
                  <ShieldAlert size={16} />
                  <span>{error}</span>
                </div>
              )}

              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                You are about to initiate an M-Pesa STK Push payment of <strong>KES {activePaymentRequest.totalAmount?.toLocaleString()}</strong> for purchase request #{activePaymentRequest.id} ({activePaymentRequest.cropName}).
              </p>

              <form onSubmit={handleInitiatePayment}>
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">M-Pesa Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    className="form-control"
                    placeholder="e.g. 254700112233"
                    value={phoneToPay}
                    onChange={(e) => setPhoneToPay(e.target.value)}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Must be 2547XXXXXXXX (12 digits)
                  </span>
                </div>

                <div style={styles.modalActions}>
                  <button type="button" onClick={handleClosePaymentModal} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={paymentLoading} className="btn btn-gold">
                    {paymentLoading ? 'Sending Push...' : 'Send M-Pesa STK Push'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Phase 2: M-Pesa STK Push Confirmation Display */
            <div className="modal-content glass-panel" style={{ maxWidth: '450px', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(0, 255, 0, 0.1)', color: 'var(--accent-green)', marginBottom: '1.5rem' }}>
                <Check size={36} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-family-heading)', marginBottom: '0.5rem' }}>STK Push Dispatched</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
                {successMsg}
              </p>
              <div style={styles.modalActions}>
                <button type="button" onClick={() => { handleClosePaymentModal(); fetchOrders(); }} className="btn btn-primary" style={{ width: '100%' }}>
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      )}
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
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.85rem',
    marginBottom: '1.5rem',
  },
  empty: {
    textAlign: 'center',
    padding: '5rem 2rem',
    background: 'var(--bg-secondary)',
    border: '1px dashed var(--border-color)',
    borderRadius: 'var(--radius-md)',
  },
  cardContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '1.5rem',
  },
  orderCard: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '280px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1rem',
    marginBottom: '1rem',
  },
  orderId: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    display: 'block',
    marginTop: '0.15rem',
  },
  cardBody: {
    flex: 1,
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '1rem',
    background: 'rgba(255,255,255,0.02)',
    padding: '0.75rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
  },
  metaLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
  metaVal: {
    fontSize: '0.95rem',
    fontWeight: '600',
    marginTop: '0.15rem',
  },
  detailsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  cardFooter: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1rem',
    marginTop: '1rem',
  },
  payBtn: {
    width: '100%',
  },
  modalError: {
    display: 'flex',
    gap: '0.5rem',
    padding: '0.75rem',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '1rem',
    fontSize: '0.85rem',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1.25rem',
    marginTop: '1.5rem',
  },
  simulatorWrapper: {
    zIndex: 1001,
  },
  simScreenBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mpesaLogo: {
    fontSize: '1.75rem',
    fontWeight: '900',
    color: '#00ff00',
    fontFamily: 'Impact, sans-serif',
    marginBottom: '2rem',
    letterSpacing: '0.05em',
  },
  stkDialog: {
    background: '#1c1d27',
    border: '1px solid #333',
    borderRadius: 'var(--radius-md)',
    padding: '1.5rem',
    width: '100%',
    color: '#fff',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
  },
  stkHeader: {
    fontSize: '0.85rem',
    color: '#00ff00',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '1rem',
    borderBottom: '1px solid #333',
    paddingBottom: '0.5rem',
  },
  stkPrompt: {
    fontSize: '0.9rem',
    lineHeight: '1.4',
    marginBottom: '1.25rem',
    textAlign: 'center',
  },
  stkInputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1.25rem',
  },
  stkLabel: {
    fontSize: '0.8rem',
    color: '#aaa',
  },
  stkInput: {
    textAlign: 'center',
    fontSize: '1.25rem',
    letterSpacing: '0.5em',
    background: '#090a0f',
    borderColor: '#444',
  },
  stkButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  stkBtn: {
    border: 'none',
    padding: '0.75rem',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  stkSuccess: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    color: '#fff',
  },
  stkSuccessIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: '#005f00',
    color: '#00ff00',
    border: '3px solid #00ff00',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  stkFailed: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    color: '#fff',
  },
  stkFailedIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: '#5f0000',
    color: '#ff0000',
    border: '3px solid #ff0000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
};
export { styles };

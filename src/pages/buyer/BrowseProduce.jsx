import React, { useEffect, useState } from 'react';
import { Search, MapPin, Tag, Box, AlertCircle, Check, X, Phone, ShieldAlert, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

export default function BrowseProduce() {
  const currentUser = api.auth.getCurrentUser();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [countyFilter, setCountyFilter] = useState('');

  // Request Purchase modal & Checkout states
  const [selectedListing, setSelectedListing] = useState(null);
  const [qtyRequested, setQtyRequested] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Multi-stage Payment States
  const [paymentStage, setPaymentStage] = useState('request'); // 'request', 'stk', 'simulator'
  const [createdRequest, setCreatedRequest] = useState(null);
  const [phoneToPay, setPhoneToPay] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const data = await api.buyer.getListings();
      setListings(data || []);
    } catch (e) {
      console.error(e);
      setError('Failed to fetch available produce.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRequestModal = (listing) => {
    setSelectedListing(listing);
    setQtyRequested('');
    setDeliveryLocation(listing.location || '');
    setNotes('');
    setSuccessMsg('');
    setError('');
    setPaymentStage('request');
    setCreatedRequest(null);
    setPhoneToPay(currentUser?.phoneNumber || '254700000000');
    setPaymentResponse(null);
  };

  const handleCloseModal = () => {
    setSelectedListing(null);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!qtyRequested || Number(qtyRequested) <= 0) {
      setError('Please enter a valid quantity greater than 0');
      return;
    }
    if (Number(qtyRequested) > selectedListing.quantity) {
      setError(`Cannot request more than the available stock of ${selectedListing.quantity} ${selectedListing.unit}`);
      return;
    }

    setRequesting(true);
    setError('');

    try {
      const response = await api.buyer.createRequest(
        selectedListing.id,
        currentUser.userId,
        qtyRequested,
        deliveryLocation,
        notes
      );
      setCreatedRequest(response);
      setSuccessMsg('Purchase request submitted and approved!');
      
      // Auto-transition to M-Pesa STK Push Stage after 1.5 seconds!
      setTimeout(() => {
        setSuccessMsg('');
        setPaymentStage('stk');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to submit purchase request.');
    } finally {
      setRequesting(false);
    }
  };

  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      // 1. Call backend initiate STK Push
      const res = await api.payments.initiate(createdRequest.id, phoneToPay);
      setPaymentResponse(res);
      setPaymentStage('payment_success');
      setSuccessMsg(`An M-Pesa STK Push has been sent to your phone number ${phoneToPay}. Please enter your M-Pesa PIN on your phone to authorize the payment of KES ${createdRequest.totalAmount?.toLocaleString()}.`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to initiate M-Pesa STK Push.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const filteredListings = listings.filter(item => {
    const matchesSearch = item.cropName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.farmerName && item.farmerName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCounty = countyFilter === '' || item.location.toLowerCase().includes(countyFilter.toLowerCase());
    return matchesSearch && matchesCounty;
  });

  // Extract unique locations for the county filter dropdown
  const uniqueCounties = [...new Set(listings.map(item => item.location))].filter(Boolean);

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Browse Available Produce 🌽</h1>
        <p style={styles.subtitle}>Direct connection to smallholder farm harvests. Filter and purchase crops instantly.</p>
      </div>

      <div className="glass-panel" style={styles.filterBar}>
        <div style={styles.searchWrapper}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            className="form-control"
            style={styles.searchInput}
            placeholder="Search by crop name or farmer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={styles.filterWrapper}>
          <MapPin size={18} style={styles.filterIcon} />
          <select
            className="form-control"
            style={styles.selectInput}
            value={countyFilter}
            onChange={(e) => setCountyFilter(e.target.value)}
          >
            <option value="">All Counties</option>
            {uniqueCounties.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {error && !selectedListing && (
        <div className="badge-danger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button 
            onClick={fetchListings} 
            className="btn btn-secondary" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <RefreshCw size={14} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {loading ? (
        <div style={styles.grid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card green-accent" style={styles.card}>
              <div style={styles.cardHeader}>
                <div className="skeleton-text" style={{ width: '120px', height: '22px' }}></div>
                <div className="skeleton-text" style={{ width: '60px', height: '20px' }}></div>
              </div>
              <div style={{ ...styles.cardDetails, display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', marginBottom: '1rem' }}>
                {[...Array(3)].map((_, j) => (
                  <div key={j} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div className="skeleton-text" style={{ width: '16px', height: '16px', marginBottom: '0' }}></div>
                    <div className="skeleton-text" style={{ width: '120px', height: '16px', marginBottom: '0' }}></div>
                  </div>
                ))}
              </div>
              <div style={{ ...styles.cardPricing, borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem', marginBottom: '0' }}>
                <div className="skeleton-text" style={{ width: '60px', height: '12px' }}></div>
                <div className="skeleton-text" style={{ width: '140px', height: '24px', marginTop: '0.25rem' }}></div>
              </div>
              <div className="skeleton-text" style={{ width: '100%', height: '38px', marginTop: '1rem', borderRadius: 'var(--radius-sm)' }}></div>
            </div>
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <div style={styles.empty}>
          <AlertCircle size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>No results found.</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No harvests match your search or filter parameters.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredListings.map((item) => (
            <div key={item.id} className="glass-card green-accent" style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cropTitle}>{item.cropName}</h3>
                <span className="badge badge-success">{item.status}</span>
              </div>

              <div style={styles.cardDetails}>
                <div style={styles.detailRow}>
                  <MapPin size={16} style={styles.detailIcon} />
                  <span>County: <strong>{item.location}</strong></span>
                </div>
                <div style={styles.detailRow}>
                  <Box size={16} style={styles.detailIcon} />
                  <span>Available: <strong>{item.quantity} {item.unit}</strong></span>
                </div>
                <div style={styles.detailRow}>
                  <Tag size={16} style={styles.detailIcon} />
                  <span>Farmer: <strong>{item.farmerName || 'Registered Farmer'}</strong></span>
                </div>
              </div>

              <div style={styles.cardPricing}>
                <div style={styles.priceLabel}>Unit Price</div>
                <div style={styles.priceVal}>KES {item.unitPrice?.toLocaleString() || 0} <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>/ {item.unit}</span></div>
              </div>

              <button
                onClick={() => handleOpenRequestModal(item)}
                className="btn btn-primary"
                style={styles.actionBtn}
              >
                Request Purchase
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Request Purchase Modal */}
      {selectedListing && (
        <div className="modal-overlay">
          {paymentStage === 'request' && (
            <div className="modal-content glass-panel">
              <div className="modal-header">
                <h2 style={{ fontFamily: 'var(--font-family-heading)' }}>Request Purchase</h2>
                <button onClick={handleCloseModal} className="modal-close" style={{ fontSize: '1.25rem' }}>✕</button>
              </div>

              {error && (
                <div className="badge-danger" style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="badge-success" style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={18} />
                  <span>{successMsg}</span>
                </div>
              )}

              <div style={styles.modalMetaCard}>
                <h3 style={{ color: 'var(--accent-green)', marginBottom: '0.5rem' }}>{selectedListing.cropName}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Farmer: {selectedListing.farmerName}</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Available Stock: <strong>{selectedListing.quantity} {selectedListing.unit}</strong></p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Unit Price: <strong>KES {selectedListing.unitPrice}/KG</strong></p>
              </div>

              <form onSubmit={handleSubmitRequest}>
                <div className="form-group">
                  <label className="form-label" htmlFor="qty">Quantity Requested ({selectedListing.unit})</label>
                  <input
                    id="qty"
                    type="number"
                    required
                    min="0.1"
                    step="any"
                    className="form-control"
                    placeholder="e.g. 200"
                    value={qtyRequested}
                    onChange={(e) => setQtyRequested(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="loc">Delivery Location / Address</label>
                  <input
                    id="loc"
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Nairobi Depot"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="notes">Additional Delivery Instructions / Notes</label>
                  <textarea
                    id="notes"
                    className="form-control"
                    style={{ minHeight: '80px', resize: 'vertical' }}
                    placeholder="e.g. Bring bags of 50kg, packaging details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {qtyRequested && selectedListing.unitPrice && (
                  <div style={styles.priceEstimate}>
                    <span>Total Amount Estimate:</span>
                    <strong style={{ color: 'var(--accent-gold)' }}>
                      KES {(Number(qtyRequested) * selectedListing.unitPrice).toLocaleString()}
                    </strong>
                  </div>
                )}

                <div style={styles.modalActions}>
                  <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={requesting || successMsg} className="btn btn-primary">
                    {requesting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {paymentStage === 'stk' && (
            <div className="modal-content glass-panel" style={{ maxWidth: '450px' }}>
              <div className="modal-header">
                <h3 style={{ fontFamily: 'var(--font-family-heading)' }}>Initiate M-Pesa Payment</h3>
                <button onClick={handleCloseModal} className="modal-close">✕</button>
              </div>

              {error && (
                <div className="badge-danger" style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <ShieldAlert size={16} />
                  <span>{error}</span>
                </div>
              )}

              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
                Your request has been approved! You are about to initiate an M-Pesa STK Push payment of <strong>KES {createdRequest.totalAmount?.toLocaleString()}</strong> for purchase request #{createdRequest.id} ({createdRequest.cropName}).
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
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                    Must be 2547XXXXXXXX (12 digits)
                  </span>
                </div>

                <div style={styles.modalActions}>
                  <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={paymentLoading} className="btn btn-gold">
                    {paymentLoading ? 'Sending Push...' : 'Send M-Pesa STK Push'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {paymentStage === 'payment_success' && (
            <div className="modal-content glass-panel" style={{ maxWidth: '450px', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(0, 255, 0, 0.1)', color: 'var(--accent-green)', marginBottom: '1.5rem' }}>
                <Check size={36} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-family-heading)', marginBottom: '0.5rem' }}>STK Push Dispatched</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
                {successMsg}
              </p>
              <div style={styles.modalActions}>
                <button type="button" onClick={handleCloseModal} className="btn btn-primary" style={{ width: '100%' }}>
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
  filterBar: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem',
    marginBottom: '2.5rem',
    flexWrap: 'wrap',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flex: '2',
    minWidth: '250px',
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    color: 'var(--text-muted)',
  },
  searchInput: {
    paddingLeft: '2.75rem',
  },
  filterWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flex: '1',
    minWidth: '180px',
  },
  filterIcon: {
    position: 'absolute',
    left: '1rem',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  selectInput: {
    paddingLeft: '2.75rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '320px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  cropTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
  },
  cardDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
    marginBottom: '1.5rem',
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  detailIcon: {
    color: 'var(--text-muted)',
  },
  cardPricing: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1rem',
    marginBottom: '1rem',
  },
  priceLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
  priceVal: {
    fontSize: '1.35rem',
    fontWeight: '800',
    color: 'var(--accent-gold)',
    marginTop: '0.15rem',
  },
  actionBtn: {
    width: '100%',
  },
  empty: {
    textAlign: 'center',
    padding: '4rem',
  },
  modalMetaCard: {
    background: 'rgba(0, 0, 0, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    padding: '1rem',
    marginBottom: '1.5rem',
  },
  priceEstimate: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: 'var(--accent-gold-glow)',
    border: '1px solid rgba(212, 163, 89, 0.2)',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '1.5rem',
    fontSize: '0.95rem',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1.25rem',
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

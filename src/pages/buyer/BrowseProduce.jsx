import React, { useEffect, useState } from 'react';
import { Search, MapPin, Tag, Box, AlertCircle, Check } from 'lucide-react';
import { api } from '../../services/api';

export default function BrowseProduce() {
  const currentUser = api.auth.getCurrentUser();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [countyFilter, setCountyFilter] = useState('');

  // Request Purchase modal state
  const [selectedListing, setSelectedListing] = useState(null);
  const [qtyRequested, setQtyRequested] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

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
      await api.buyer.createRequest(
        selectedListing.id,
        currentUser.userId,
        qtyRequested,
        deliveryLocation,
        notes
      );
      setSuccessMsg('Purchase request submitted successfully!');
      setTimeout(() => {
        handleCloseModal();
        fetchListings(); // reload listings to see updated stock or listings
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to submit purchase request.');
    } finally {
      setRequesting(false);
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

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
          <h3>Loading listings from farmers...</h3>
        </div>
      ) : filteredListings.length === 0 ? (
        <div style={styles.empty}>
          <AlertCircle size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <p>No listings match your search criteria.</p>
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
    background: 'rgba(255, 255, 255, 0.03)',
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
};
export { styles };

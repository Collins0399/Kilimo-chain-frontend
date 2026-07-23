import React, { useEffect, useState } from 'react';
import { Search, MapPin, Tag, Box, Info, Eye, Trash2, ShieldAlert, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { formatDate } from '../../services/utils';
import StatusBadge from '../../components/StatusBadge';

export default function HarvestInventory() {
  const [harvests, setHarvests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals status
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedHarvest, setSelectedHarvest] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Filters
  const [farmer, setFarmer] = useState('');
  const [crop, setCrop] = useState('');
  const [county, setCounty] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchHarvests();
  }, [farmer, crop, county, status]);

  const fetchHarvests = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.admin.getHarvests({ farmer, crop, county, status });
      setHarvests(data || []);
    } catch (e) {
      console.error(e);
      setError('Failed to fetch harvest listings.');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (harvest) => {
    setSelectedHarvest(harvest);
    setError('');
    setShowViewModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this harvest listing?")) {
      setError('');
      setDeletingId(id);
      try {
        await api.admin.deleteHarvest(id);
        fetchHarvests();
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to delete harvest listing.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Harvest Inventory 🌾</h1>
        <p style={styles.subtitle}>Audit active agricultural stock listed by farmers via the SMS gateway.</p>
      </div>

      {error && !showViewModal && (
        <div className="badge-danger" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
          <button 
            onClick={fetchHarvests} 
            className="btn btn-secondary" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <RefreshCw size={14} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="glass-panel" style={styles.filterBar}>
        <div style={styles.filterField}>
          <label style={styles.fieldLabel}>Farmer Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search farmer..."
            value={farmer}
            onChange={(e) => setFarmer(e.target.value)}
          />
        </div>
        <div style={styles.filterField}>
          <label style={styles.fieldLabel}>Crop</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search crop..."
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
          />
        </div>
        <div style={styles.filterField}>
          <label style={styles.fieldLabel}>County</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search location..."
            value={county}
            onChange={(e) => setCounty(e.target.value)}
          />
        </div>
        <div style={styles.filterField}>
          <label style={styles.fieldLabel}>Status</label>
          <select
            className="form-control"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="SOLD">Sold</option>
          </select>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        {loading ? (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Crop</th>
                  <th>Quantity</th>
                  <th>Farmer</th>
                  <th>Farmer Phone</th>
                  <th>Location (County)</th>
                  <th>Unit Price</th>
                  <th>Listing Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td><div className="skeleton-text" style={{ width: '40px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '100px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '80px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '120px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '100px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '120px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '80px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '100px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '80px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '80px', height: '18px', margin: '0 auto' }}></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : harvests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
            <p style={{ fontWeight: '600' }}>No harvest listings found matching the filters.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No inventory records matches your search parameters.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Crop</th>
                  <th>Quantity</th>
                  <th>Farmer</th>
                  <th>Farmer Phone</th>
                  <th>Location (County)</th>
                  <th>Unit Price</th>
                  <th>Listing Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {harvests.map((h) => (
                  <tr key={h.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>#{h.id}</td>
                    <td style={{ fontWeight: '700' }}>{h.cropName}</td>
                    <td style={{ fontWeight: '600' }}>{h.quantity} {h.unit || 'KG'}</td>
                    <td>{h.farmerName || 'Registered Farmer'}</td>
                    <td>{h.farmerPhone || 'N/A'}</td>
                    <td>📍 {h.location}</td>
                    <td style={{ fontWeight: '600', color: 'var(--accent-gold)' }}>
                      KES {h.unitPrice?.toLocaleString() || 0}
                    </td>
                    <td>{formatDate(h.dateAdded)}</td>
                    <td>
                      <StatusBadge status={h.status} />
                    </td>
                    <td style={styles.actionCell}>
                      <button
                        onClick={() => handleView(h)}
                        className="btn btn-secondary"
                        style={styles.tableBtn}
                        title="View Details"
                        aria-label="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(h.id)}
                        disabled={deletingId === h.id}
                        className="btn btn-danger"
                        style={{ ...styles.tableBtn, opacity: deletingId === h.id ? 0.5 : 1 }}
                        title="Delete Listing"
                        aria-label="Delete Listing"
                      >
                        {deletingId === h.id ? <RefreshCw className="spin" size={14} /> : <Trash2 size={14} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Harvest Modal */}
      {showViewModal && selectedHarvest && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3>Harvest Details</h3>
              <button onClick={() => setShowViewModal(false)} className="modal-close">✕</button>
            </div>

            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem' }}>🌾</div>
              <h2 style={{ color: 'var(--accent-green)', marginTop: '0.5rem' }}>{selectedHarvest.cropName}</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Listing ID: #{selectedHarvest.id}</span>
            </div>

            <div style={styles.detailList}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Farmer Name</span>
                <strong style={styles.detailValue}>{selectedHarvest.farmerName || 'Registered Farmer'}</strong>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Farmer Phone</span>
                <strong style={styles.detailValue}>{selectedHarvest.farmerPhone || 'N/A'}</strong>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>County (Location)</span>
                <strong style={styles.detailValue}>📍 {selectedHarvest.location}</strong>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Current Stock</span>
                <strong style={styles.detailValue}>{selectedHarvest.quantity} {selectedHarvest.unit || 'KG'}</strong>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Unit Price</span>
                <strong style={styles.detailValue} style={{ color: 'var(--accent-gold)' }}>KES {selectedHarvest.unitPrice?.toLocaleString()}/KG</strong>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Created Date</span>
                <strong style={styles.detailValue}>{formatDate(selectedHarvest.dateAdded)}</strong>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Status</span>
                <StatusBadge status={selectedHarvest.status} />
              </div>
            </div>

            <div style={styles.modalActions}>
              <button onClick={() => setShowViewModal(false)} className="btn btn-primary" style={{ width: '100%' }}>
                Close Details
              </button>
            </div>
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
    padding: '1.25rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  filterField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    flex: '1',
    minWidth: '150px',
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
  },
  tableBtn: {
    padding: '0.4rem',
    width: '32px',
    height: '32px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.65rem 0',
    borderBottom: '1px solid var(--border-color)',
    alignItems: 'center',
  },
  detailLabel: {
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  detailValue: {
    color: 'var(--text-primary)',
    fontWeight: '600',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1.25rem',
    marginTop: '1.5rem',
  },
};
export { styles };

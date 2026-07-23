import React, { useEffect, useState } from 'react';
import { Search, MapPin, Tag, Box, Info, Eye, Trash2, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';

export default function HarvestInventory() {
  const [harvests, setHarvests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals status
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedHarvest, setSelectedHarvest] = useState(null);

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
      try {
        await api.admin.deleteHarvest(id);
        fetchHarvests();
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to delete harvest listing.');
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
        <div className="badge-danger" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={16} />
          <span>{error}</span>
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
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <h3>Querying harvest inventory...</h3>
          </div>
        ) : harvests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            <p>No harvest listings found matching the filters.</p>
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
                {harvests.map((h) => {
                  let badgeClass = 'badge-success';
                  if (h.status === 'SOLD') badgeClass = 'badge-danger';

                  return (
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
                      <td>{h.dateAdded ? new Date(h.dateAdded).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <span className={`badge ${badgeClass}`}>{h.status}</span>
                      </td>
                      <td style={styles.actionCell}>
                        <button
                          onClick={() => handleView(h)}
                          className="btn btn-secondary"
                          style={styles.tableBtn}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(h.id)}
                          className="btn btn-danger"
                          style={styles.tableBtn}
                          title="Delete Listing"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Harvest Details Modal */}
      {showViewModal && selectedHarvest && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Harvest Details</h2>
              <button onClick={() => setShowViewModal(false)} className="modal-close">✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Listing ID:</span>
                <span style={styles.detailValue}>#{selectedHarvest.id}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Crop Name:</span>
                <span style={{ ...styles.detailValue, fontWeight: '700' }}>{selectedHarvest.cropName}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Quantity Available:</span>
                <span style={styles.detailValue}>{selectedHarvest.quantity} {selectedHarvest.unit || 'KG'}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Unit Price:</span>
                <span style={{ ...styles.detailValue, color: 'var(--accent-gold)', fontWeight: '600' }}>KES {selectedHarvest.unitPrice?.toLocaleString() || 0}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Total Estimated Value:</span>
                <span style={{ ...styles.detailValue, fontWeight: '600' }}>KES {((selectedHarvest.quantity || 0) * (selectedHarvest.unitPrice || 0))?.toLocaleString()}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Farmer / Producer:</span>
                <span style={styles.detailValue}>{selectedHarvest.farmerName || 'N/A'}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Farmer Contact:</span>
                <span style={styles.detailValue}>{selectedHarvest.farmerPhone || 'N/A'}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>County (Location):</span>
                <span style={styles.detailValue}>📍 {selectedHarvest.location}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Listing Date:</span>
                <span style={styles.detailValue}>{selectedHarvest.dateAdded ? new Date(selectedHarvest.dateAdded).toLocaleString() : 'N/A'}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Listing Status:</span>
                <span style={styles.detailValue}>
                  <span className={`badge ${selectedHarvest.status === 'SOLD' ? 'badge-danger' : 'badge-success'}`}>
                    {selectedHarvest.status}
                  </span>
                </span>
              </div>
            </div>

            <div style={styles.modalActions}>
              <button onClick={() => setShowViewModal(false)} className="btn btn-secondary">
                Close
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.65rem 0',
    borderBottom: '1px solid var(--border-color)',
  },
  detailLabel: {
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  detailValue: {
    color: 'var(--text-primary)',
    fontWeight: '500',
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

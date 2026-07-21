import React, { useEffect, useState } from 'react';
import { Search, MapPin, Tag, Box, Info } from 'lucide-react';
import { api } from '../../services/api';

export default function HarvestInventory() {
  const [harvests, setHarvests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Harvest Inventory 🌾</h1>
        <p style={styles.subtitle}>Audit active agricultural stock listed by farmers via the SMS gateway.</p>
      </div>

      {error && (
        <div className="badge-danger" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
          {error}
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
};
export { styles };

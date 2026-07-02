import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, ShieldAlert, Sparkles, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

export default function MarketPrices() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals status
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form states
  const [currentId, setCurrentId] = useState(null);
  const [cropName, setCropName] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [location, setLocation] = useState('');
  const [trend, setTrend] = useState('STABLE'); // STABLE, UPWARD, DOWNWARD

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const data = await api.marketPrices.getAll();
      setPrices(data || []);
    } catch (e) {
      console.error(e);
      setError('Failed to fetch official market prices.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setCropName('');
    setPricePerKg('');
    setLocation('');
    setTrend('STABLE');
    setError('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (price) => {
    setCurrentId(price.id);
    setCropName(price.crop_name || '');
    setPricePerKg(price.price_per_kg || '');
    setLocation(price.location || '');
    setTrend(price.trend || 'STABLE');
    setError('');
    setShowEditModal(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (!cropName || !pricePerKg || !location) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      const payload = {
        crop_name: cropName,
        price_per_kg: Number(pricePerKg),
        location,
        trend
      };
      await api.marketPrices.create(payload);
      setShowAddModal(false);
      fetchPrices();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create market price listing.');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!cropName || !pricePerKg || !location) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      const payload = {
        crop_name: cropName,
        price_per_kg: Number(pricePerKg),
        location,
        trend
      };
      await api.marketPrices.update(currentId, payload);
      setShowEditModal(false);
      fetchPrices();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update market price listing.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this market price listing? Farmers will no longer see it via SMS.')) {
      return;
    }
    try {
      await api.marketPrices.delete(id);
      fetchPrices();
    } catch (err) {
      console.error(err);
      setError('Failed to delete market price.');
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Market Price Management 📈</h1>
          <p style={styles.subtitle}>Set and update crop prices. Updates are instantly queries via SMS and USSD by farmers.</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <Plus size={16} />
          <span>Publish Price</span>
        </button>
      </div>

      {error && !showAddModal && !showEditModal && (
        <div className="badge-danger" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <div className="glass-panel" style={{ padding: '2rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <h3>Querying price indices...</h3>
          </div>
        ) : prices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>No crop prices published. Click "Publish Price" to add one.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Crop</th>
                  <th>Official Price</th>
                  <th>Location (County)</th>
                  <th>Price Trend</th>
                  <th>Last Updated</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((p) => {
                  let trendColor = 'var(--text-primary)';
                  let trendIcon = <RefreshCw size={16} />;
                  if (p.trend === 'UPWARD') {
                    trendColor = 'var(--accent-green)';
                    trendIcon = <TrendingUp size={16} />;
                  } else if (p.trend === 'DOWNWARD') {
                    trendColor = 'var(--accent-red)';
                    trendIcon = <TrendingDown size={16} />;
                  }

                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: '700', fontSize: '1.1rem' }}>{p.crop_name}</td>
                      <td style={{ fontWeight: '700', color: 'var(--accent-gold)' }}>KES {p.price_per_kg}/KG</td>
                      <td>📍 {p.location}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: trendColor, fontWeight: '600' }}>
                          {trendIcon}
                          <span>{p.trend}</span>
                        </div>
                      </td>
                      <td>{p.updated_at ? new Date(p.updated_at).toLocaleString() : 'Recent'}</td>
                      <td style={styles.actionCell}>
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="btn btn-secondary"
                          style={styles.tableBtn}
                          title="Edit Price"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="btn btn-danger"
                          style={styles.tableBtn}
                          title="Delete Price"
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

      {/* Add Price Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2>Publish Crop Price</h2>
              <button onClick={() => setShowAddModal(false)} className="modal-close">✕</button>
            </div>

            {error && (
              <div className="badge-danger" style={styles.modalError}>
                <ShieldAlert size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveAdd}>
              <div className="form-group">
                <label className="form-label" htmlFor="aCrop">Crop Name</label>
                <input
                  id="aCrop"
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Maize, Beans..."
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="aPrice">Price per KG (KES)</label>
                <input
                  id="aPrice"
                  type="number"
                  required
                  min="1"
                  className="form-control"
                  placeholder="e.g. 55"
                  value={pricePerKg}
                  onChange={(e) => setPricePerKg(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="aLoc">County (Target Market)</label>
                <input
                  id="aLoc"
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Nyeri"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="aTrend">Market Trend</label>
                <select
                  id="aTrend"
                  className="form-control"
                  value={trend}
                  onChange={(e) => setTrend(e.target.value)}
                >
                  <option value="STABLE">Stable ➡️</option>
                  <option value="UPWARD">Upward 📈</option>
                  <option value="DOWNWARD">Downward 📉</option>
                </select>
              </div>

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Price Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2>Modify Crop Price</h2>
              <button onClick={() => setShowEditModal(false)} className="modal-close">✕</button>
            </div>

            {error && (
              <div className="badge-danger" style={styles.modalError}>
                <ShieldAlert size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label className="form-label" htmlFor="eCrop">Crop Name</label>
                <input
                  id="eCrop"
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Maize, Beans..."
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ePrice">Price per KG (KES)</label>
                <input
                  id="ePrice"
                  type="number"
                  required
                  min="1"
                  className="form-control"
                  placeholder="e.g. 55"
                  value={pricePerKg}
                  onChange={(e) => setPricePerKg(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="eLoc">County (Target Market)</label>
                <input
                  id="eLoc"
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Nyeri"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="eTrend">Market Trend</label>
                <select
                  id="eTrend"
                  className="form-control"
                  value={trend}
                  onChange={(e) => setTrend(e.target.value)}
                >
                  <option value="STABLE">Stable ➡️</option>
                  <option value="UPWARD">Upward 📈</option>
                  <option value="DOWNWARD">Downward 📉</option>
                </select>
              </div>

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Price
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  actionCell: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'center',
  },
  tableBtn: {
    padding: '0.4rem',
    width: '32px',
    height: '32px',
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
};
export { styles };

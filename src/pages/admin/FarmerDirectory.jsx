import React, { useEffect, useState } from 'react';
import { Search, ShieldCheck, ShieldX, UserCheck, UserX, UserPlus, AlertCircle, Check, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export default function FarmerDirectory() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [county, setCounty] = useState('');
  const [crop, setCrop] = useState('');

  // Register Modal states
  const [showModal, setShowModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('2547');
  const [email, setEmail] = useState('');
  const [farmerCounty, setFarmerCounty] = useState('');
  const [ward, setWard] = useState('');
  const [village, setVillage] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [primaryCrop, setPrimaryCrop] = useState('');
  const [password, setPassword] = useState('');

  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchFarmers();
  }, [name, phone, county, crop]); // Auto-reload when search filters change

  const fetchFarmers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.admin.getFarmers({ name, phone, county, crop });
      setFarmers(data || []);
    } catch (e) {
      console.error(e);
      setError('Failed to fetch farmer list.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, currentStatus) => {
    setProcessingId(id);
    try {
      await api.admin.verifyFarmer(id, !currentStatus);
      await fetchFarmers();
    } catch (e) {
      console.error(e);
      setError('Failed to change verification status.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    setProcessingId(id);
    try {
      await api.admin.toggleFarmerActive(id, !currentStatus);
      await fetchFarmers();
    } catch (e) {
      console.error(e);
      setError('Failed to toggle farmer active status.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
    setFullName('');
    setPhoneNumber('2547');
    setEmail('');
    setFarmerCounty('');
    setWard('');
    setVillage('');
    setNationalId('');
    setPrimaryCrop('');
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    setPassword(`KILIMO-${randomHex}`);
    setModalError('');
    setModalSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmitOnboarding = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');
    setModalSuccess('');

    // Phone validation
    if (!/^254\d{9}$/.test(phoneNumber)) {
      setModalError('Phone number must be in format 2547XXXXXXXX');
      setSubmitting(false);
      return;
    }

    // National ID validation
    if (!/^\d{8,12}$/.test(nationalId)) {
      setModalError('National ID must be between 8 and 12 digits');
      setSubmitting(false);
      return;
    }

    try {
      const dto = {
        fullName,
        phoneNumber,
        email: email || null,
        county: farmerCounty,
        ward,
        village,
        nationalId,
        primaryCrop,
        password
      };

      await api.admin.registerFarmer(dto);
      setModalSuccess('Farmer added successfully!');
      setTimeout(() => {
        handleCloseModal();
        fetchFarmers();
      }, 2000);
    } catch (err) {
      console.error(err);
      setModalError(err.message || 'Failed to add farmer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Farmer Directory 👨‍🌾</h1>
          <p style={styles.subtitle}>Add new smallholders, manage verification credentials, and toggle status.</p>
        </div>
        <button onClick={handleOpenModal} className="btn btn-primary">
          <UserPlus size={16} />
          <span>Add Farmer</span>
        </button>
      </div>

      {error && (
        <div className="badge-danger" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
          <span>{error}</span>
          <button 
            onClick={fetchFarmers} 
            className="btn btn-secondary" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <RefreshCw size={14} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Filter and search bar */}
      <div className="glass-panel" style={styles.searchBar}>
        <div style={styles.searchField}>
          <label style={styles.fieldLabel}>Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div style={styles.searchField}>
          <label style={styles.fieldLabel}>Phone</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. 2547..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div style={styles.searchField}>
          <label style={styles.fieldLabel}>County</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Nyeri..."
            value={county}
            onChange={(e) => setCounty(e.target.value)}
          />
        </div>
        <div style={styles.searchField}>
          <label style={styles.fieldLabel}>Crop</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Maize..."
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        {loading ? (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Farmer ID</th>
                  <th>Name</th>
                  <th>Phone Number</th>
                  <th>Location (County)</th>
                  <th>Primary Crop</th>
                  <th>National ID</th>
                  <th>Verified</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td><div className="skeleton-text" style={{ width: '60px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '120px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '100px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '140px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '80px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '90px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '80px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '80px', height: '18px' }}></div></td>
                    <td><div className="skeleton-text" style={{ width: '80px', height: '18px', margin: '0 auto' }}></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : farmers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>No farmers found.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Try refining your search terms or add a new farmer above.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Farmer ID</th>
                  <th>Name</th>
                  <th>Phone Number</th>
                  <th>Location (County)</th>
                  <th>Primary Crop</th>
                  <th>National ID</th>
                  <th>Verified</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {farmers.map((f) => (
                  <tr key={f.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{f.farmerId || f.id}</td>
                    <td style={{ fontWeight: '600' }}>{f.name}</td>
                    <td>{f.phoneNumber}</td>
                    <td>📍 {f.location} {f.ward ? `(${f.ward})` : ''}</td>
                    <td>
                      <span className="badge badge-info">{f.primaryCrop}</span>
                    </td>
                    <td>{f.nationalId}</td>
                    <td>
                      <StatusBadge status={f.verified ? 'VERIFIED' : 'UNVERIFIED'} />
                    </td>
                    <td>
                      <StatusBadge status={f.active ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td style={styles.actionCell}>
                      <button
                        onClick={() => handleVerify(f.id, f.verified)}
                        disabled={processingId === f.id}
                        className={`btn ${f.verified ? 'btn-outline' : 'btn-primary'}`}
                        style={{ ...styles.tableBtn, opacity: processingId === f.id ? 0.5 : 1 }}
                        title={f.verified ? "Revoke Verification" : "Verify Farmer"}
                        aria-label={f.verified ? "Revoke Verification" : "Verify Farmer"}
                      >
                        {processingId === f.id ? <RefreshCw className="spin" size={16} /> : (f.verified ? <ShieldX size={16} /> : <ShieldCheck size={16} />)}
                      </button>
                      <button
                        onClick={() => handleToggleActive(f.id, f.active)}
                        disabled={processingId === f.id}
                        className="btn btn-secondary"
                        style={{ ...styles.tableBtn, opacity: processingId === f.id ? 0.5 : 1 }}
                        title={f.active ? "Deactivate Account" : "Activate Account"}
                        aria-label={f.active ? "Deactivate Account" : "Activate Account"}
                      >
                        {processingId === f.id ? <RefreshCw className="spin" size={16} /> : (f.active ? <UserX size={16} /> : <UserCheck size={16} />)}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Farmer Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Add New Farmer</h2>
              <button onClick={handleCloseModal} className="modal-close">✕</button>
            </div>

            {modalError && (
              <div className="badge-danger" style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                <AlertCircle size={18} />
                <span>{modalError}</span>
              </div>
            )}

            {modalSuccess && (
              <div className="badge-success" style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={18} />
                <span>{modalSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmitOnboarding}>
              <div className="modal-grid-2col">
                <div className="form-group">
                  <label className="form-label" htmlFor="fName">Full Name</label>
                  <input
                    id="fName"
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. John Kiptoo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="fPhone">Phone Number</label>
                  <input
                    id="fPhone"
                    type="tel"
                    required
                    className="form-control"
                    placeholder="254712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Must be 2547XXXXXXXX (12 digits)
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="fEmail">Email (Optional)</label>
                  <input
                    id="fEmail"
                    type="email"
                    className="form-control"
                    placeholder="farmer@kilimo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="fNationalId">National ID Number</label>
                  <input
                    id="fNationalId"
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. 33445566"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="fCounty">County (Location)</label>
                  <input
                    id="fCounty"
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Nyeri"
                    value={farmerCounty}
                    onChange={(e) => setFarmerCounty(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="fWard">Ward</label>
                  <input
                    id="fWard"
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Nyeri Central"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="fVillage">Village</label>
                  <input
                    id="fVillage"
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Gichira"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="fCrop">Primary Crop</label>
                  <input
                    id="fCrop"
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Maize"
                    value={primaryCrop}
                    onChange={(e) => setPrimaryCrop(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="fPass">Generated Password (One-Time Token)</label>
                  <input
                    id="fPass"
                    type="text"
                    readOnly
                    className="form-control"
                    style={{ background: 'var(--bg-secondary)', fontWeight: 'bold', color: 'var(--accent-green)' }}
                    value={password}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Give this password to the farmer. It is server-generated securely.
                  </span>
                </div>
              </div>

              <div style={styles.modalActions}>
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting || modalSuccess} className="btn btn-primary">
                  {submitting ? 'Adding...' : 'Add Farmer'}
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
  searchBar: {
    display: 'flex',
    gap: '1rem',
    padding: '1.25rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  searchField: {
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
  modalGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
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

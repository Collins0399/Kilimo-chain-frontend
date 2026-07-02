import React, { useEffect, useState } from 'react';
import { Search, ShieldCheck, ShieldX, UserCheck, UserX, UserPlus, AlertCircle, Check } from 'lucide-react';
import { api } from '../../services/api';

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
  const [password, setPassword] = useState('password123'); // Default password for simplicity

  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFarmers();
  }, [name, phone, county, crop]); // Auto-reload when search filters change

  const fetchFarmers = async () => {
    setLoading(true);
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
    try {
      await api.admin.verifyFarmer(id, !currentStatus);
      fetchFarmers();
    } catch (e) {
      console.error(e);
      setError('Failed to change verification status.');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await api.admin.toggleFarmerActive(id, !currentStatus);
      fetchFarmers();
    } catch (e) {
      console.error(e);
      setError('Failed to toggle farmer active status.');
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
    setPassword('password123');
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
      setModalSuccess('Farmer onboarded successfully!');
      setTimeout(() => {
        handleCloseModal();
        fetchFarmers();
      }, 2000);
    } catch (err) {
      console.error(err);
      setModalError(err.message || 'Failed to onboard farmer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Farmer Directory 👨‍🌾</h1>
          <p style={styles.subtitle}>Onboard new smallholders, manage verification credentials, and toggle status.</p>
        </div>
        <button onClick={handleOpenModal} className="btn btn-primary">
          <UserPlus size={16} />
          <span>Onboard Farmer</span>
        </button>
      </div>

      {error && (
        <div className="badge-danger" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
          {error}
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
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <h3>Querying farmer records...</h3>
          </div>
        ) : farmers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>No farmers match search criteria.</p>
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
                      <span className={`badge ${f.verified ? 'badge-success' : 'badge-danger'}`}>
                        {f.verified ? 'VERIFIED' : 'NOT VERIFIED'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${f.active ? 'badge-success' : 'badge-danger'}`}>
                        {f.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td style={styles.actionCell}>
                      <button
                        onClick={() => handleVerify(f.id, f.verified)}
                        className={`btn ${f.verified ? 'btn-outline' : 'btn-primary'}`}
                        style={styles.tableBtn}
                        title={f.verified ? "Revoke Verification" : "Verify Farmer"}
                      >
                        {f.verified ? <ShieldX size={16} /> : <ShieldCheck size={16} />}
                      </button>
                      <button
                        onClick={() => handleToggleActive(f.id, f.active)}
                        className="btn btn-secondary"
                        style={styles.tableBtn}
                        title={f.active ? "Deactivate Account" : "Activate Account"}
                      >
                        {f.active ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Onboard Farmer Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Onboard New Farmer</h2>
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
              <div style={styles.modalGrid}>
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
                  <label className="form-label" htmlFor="fPass">Account Password</label>
                  <input
                    id="fPass"
                    type="text"
                    required
                    className="form-control"
                    placeholder="password123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div style={styles.modalActions}>
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting || modalSuccess} className="btn btn-primary">
                  {submitting ? 'Onboarding...' : 'Onboard Farmer'}
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

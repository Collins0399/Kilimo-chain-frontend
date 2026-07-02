import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, CreditCard, ChevronRight, TrendingUp, Compass } from 'lucide-react';
import { api } from '../../services/api';

export default function BuyerDashboard() {
  const currentUser = api.auth.getCurrentUser();
  const [orders, setOrders] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (currentUser) {
          const [orderList, listingList] = await Promise.all([
            api.buyer.getRequests(currentUser.userId),
            api.buyer.getListings()
          ]);
          setOrders(orderList || []);
          setListings(listingList || []);
        }
      } catch (e) {
        console.error('Failed to load dashboard data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalSpent = orders
    .filter(o => o.status === 'PAID' || o.status === 'COMPLETED')
    .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

  const pendingRequestsCount = orders.filter(o => o.status === 'PENDING' || o.status === 'APPROVED' || o.status === 'PAYMENT_PENDING').length;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <h2>Loading dashboard metrics...</h2>
      </div>
    );
  }

  return (
    <div style={styles.dashboard}>
      <div style={styles.welcome}>
        <h1 style={styles.welcomeTitle}>Hello, {currentUser?.fullName || 'Buyer'}! 🌾</h1>
        <p style={styles.welcomeText}>Welcome to your Kilimo-Chain buyer dashboard. Here is a summary of your agricultural purchases.</p>
      </div>

      <div className="dashboard-grid">
        <div className="glass-card green-accent stat-card">
          <div>
            <span style={styles.metricLabel}>Total Spent</span>
            <div className="stat-val">KES {totalSpent.toLocaleString()}</div>
            <div className="stat-trend" style={{ color: 'var(--accent-green)' }}>
              <TrendingUp size={14} />
              <span>Paid transactions</span>
            </div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'var(--accent-green-glow)', color: 'var(--accent-green)' }}>
            <CreditCard size={24} />
          </div>
        </div>

        <div className="glass-card gold-accent stat-card">
          <div>
            <span style={styles.metricLabel}>Active Requests</span>
            <div className="stat-val">{pendingRequestsCount}</div>
            <div style={styles.metricSub}>Pending coop or farmer action</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'var(--accent-gold-glow)', color: 'var(--accent-gold)' }}>
            <ShoppingBag size={24} />
          </div>
        </div>

        <div className="glass-card blue-accent stat-card">
          <div>
            <span style={styles.metricLabel}>Total Orders Placed</span>
            <div className="stat-val">{orders.length}</div>
            <div style={styles.metricSub}>All-time orders history</div>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'var(--accent-blue-glow)', color: 'var(--accent-blue)' }}>
            <Compass size={24} />
          </div>
        </div>
      </div>

      <div className="main-grid">
        {/* Left column: Recent Orders */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={styles.sectionHeader}>
            <h3>Your Recent Purchase Requests</h3>
            <Link to="/buyer/orders" style={styles.seeAll}>
              <span>View All</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div style={styles.emptyState}>
              <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <p>You haven't requested any produce yet.</p>
              <Link to="/buyer/browse" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Browse Active Listings
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Crop</th>
                    <th>Qty Requested</th>
                    <th>Total Price</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => {
                    let badgeClass = 'badge-warning';
                    if (order.status === 'PAID' || order.status === 'COMPLETED') badgeClass = 'badge-success';
                    if (order.status === 'REJECTED' || order.status === 'CANCELLED') badgeClass = 'badge-danger';
                    if (order.status === 'APPROVED' || order.status === 'PAYMENT_PENDING') badgeClass = 'badge-info';

                    return (
                      <tr key={order.id}>
                        <td style={{ fontWeight: '600' }}>{order.cropName}</td>
                        <td>{order.quantityRequested} {order.unit || 'KG'}</td>
                        <td style={{ fontWeight: '600', color: 'var(--accent-gold)' }}>
                          KES {order.totalAmount ? order.totalAmount.toLocaleString() : 0}
                        </td>
                        <td>
                          <span className={`badge ${badgeClass}`}>{order.status}</span>
                        </td>
                        <td>{new Date(order.requestDate).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right column: Browse Highlights */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={styles.sectionHeader}>
            <h3>Market Listings</h3>
            <Link to="/buyer/browse" style={styles.seeAll}>
              <span>Browse</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {listings.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No active listings on the market.</p>
            ) : (
              listings.slice(0, 4).map((listing) => (
                <div key={listing.id} className="glass-card" style={styles.miniListing}>
                  <div>
                    <h4 style={{ color: 'var(--text-primary)' }}>{listing.cropName}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      📍 {listing.location} | Qty: {listing.quantity} {listing.unit}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '700', color: 'var(--accent-green)', fontSize: '0.95rem' }}>
                      KES {listing.unitPrice}/KG
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  dashboard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  welcome: {
    marginBottom: '0.5rem',
  },
  welcomeTitle: {
    fontSize: '2.25rem',
    fontWeight: '800',
    marginBottom: '0.5rem',
  },
  welcomeText: {
    color: 'var(--text-secondary)',
    fontSize: '1.05rem',
    maxWidth: '750px',
    lineHeight: '1.5',
  },
  metricLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  metricSub: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '0.5rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  seeAll: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    color: 'var(--accent-green)',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1rem',
    textAlign: 'center',
  },
  miniListing: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    boxShadow: 'none',
  },
};
export { styles };

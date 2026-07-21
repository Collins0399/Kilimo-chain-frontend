import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sprout, Smartphone, ShoppingBag, ShieldCheck, Database, 
  MessageSquare, TrendingUp, Users, ArrowRight, BookOpen, Check 
} from 'lucide-react';
import { api } from '../services/api';
import LandingNavbar from '../components/LandingNavbar';

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('farmers');
  const [prices, setPrices] = useState([]);
  const [loadingPrices, setLoadingPrices] = useState(false);

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = () => {
    setLoadingPrices(true);
    // Display dummy prices for demonstration
    setPrices([
      { id: 1, crop_name: 'Maize', price_per_kg: '55', location: 'Nyeri', trend: 'UP' },
      { id: 2, crop_name: 'Beans', price_per_kg: '110', location: 'Meru', trend: 'STABLE' },
      { id: 3, crop_name: 'Rice', price_per_kg: '150', location: 'Mwea', trend: 'UP' },
      { id: 4, crop_name: 'Wheat', price_per_kg: '85', location: 'Narok', trend: 'DOWN' },
    ]);
    setLoadingPrices(false);
  };

  const getStakeholderData = () => {
    switch (activeTab) {
      case 'farmers':
        return {
          title: 'Empowering Farmers',
          tagline: 'No internet? No smartphone? No problem.',
          desc: 'Farmers can list produce, track requests, update prices, and receive automatic warnings directly via USSD/SMS offline gateways.',
          points: [
            'Instant registration using any basic feature phone',
            'Easy crop harvesting registration by dialing *710*33334#',
            'Automated SMS notifications for incoming buyer requests',
            'Real-time verification from local cooperative managers'
          ],
          color: '#15803d'
        };
      case 'buyers':
        return {
          title: 'Intelligent Buyer Portal',
          tagline: 'Sourcing premium agricultural produce made simple.',
          desc: 'Buyers browse verified listings, submit purchase requests online, complete transactions via M-Pesa, and audit orders.',
          points: [
            'Direct sourcing from cooperative-verified farmers',
            'Transparent crop metrics, locations, and pricing tiering',
            'Simulated or real M-Pesa checkout callback flows',
            'Secure transport logs and collection tracking code systems'
          ],
          color: '#0369a1'
        };
      case 'cooperatives':
        return {
          title: 'Cooperative Governance Console',
          tagline: 'Aggregating data, building community trust.',
          desc: 'Cooperative managers approve buyer requests, verify farmer profiles, manage standard market prices, and broadcast warnings.',
          points: [
            'Unified metrics for total farmers, active listings, and cash flows',
            'SMS logs audit trails and custom announcements broadcast module',
            'Market pricing management to prevent local crop exploitation',
            'Verification flowcharts ensuring only Grade-A farmers list'
          ],
          color: '#b45309'
        };
      default:
        return {};
    }
  };

  const currentTab = getStakeholderData();

  return (
    <div style={styles.lpWrapper}>
      {/* Navigation Header */}
      <LandingNavbar />

      {/* Hero Section */}
      <header style={styles.heroSection}>
        <div style={styles.heroGrid}>
          <div style={styles.heroLeft}>
            <div style={styles.badgePromo}>
              <span style={styles.badgeText}>🚀 Premium Agricultural Exchange</span>
            </div>
            <h1 style={styles.heroHeading}>
              Connecting Farmers <br />
              to Markets Through <br />
              <span style={{ color: '#15803d' }}>Digital Innovation</span>
            </h1>
            <p style={styles.heroSubheading}>
              Kilimo-Chain is a smart agricultural supply chain platform that empowers farmers, buyers, and cooperatives by digitizing harvest management, marketplace transactions, mobile payments, and real-time market information.
            </p>

            <div style={styles.heroActions}>
              <Link to="/register" style={styles.btnHeroPrimary}>
                <span>Get Started</span>
                <ArrowRight size={18} />
              </Link>
              <a href="#about" style={styles.btnHeroSecondary}>
                <BookOpen size={18} />
                <span>Explore Platform</span>
              </a>
            </div>

            {/* Interactive Floating Metric Cards */}
            <div style={styles.metricsRow}>
              <div style={styles.metricCard}>
                <Smartphone size={20} style={{ color: '#15803d' }} />
                <div>
                  <h4 style={styles.metricCardTitle}>Offline First</h4>
                  <p style={styles.metricCardText}>USSD Code *710*33334#</p>
                </div>
              </div>
              <div style={styles.metricCard}>
                <ShieldCheck size={20} style={{ color: '#b45309' }} />
                <div>
                  <h4 style={styles.metricCardTitle}>Verified Grade A</h4>
                  <p style={styles.metricCardText}>Cooperative Certified</p>
                </div>
              </div>
              <div style={styles.metricCard}>
                <ShoppingBag size={20} style={{ color: '#0369a1' }} />
                <div>
                  <h4 style={styles.metricCardTitle}>Secure Payments</h4>
                  <p style={styles.metricCardText}>Safaricom M-Pesa Hook</p>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.heroRight}>
            <div style={styles.heroImageWrapper}>
              <img 
                src="/assets/hero_farm_landscape.jpg" 
                alt="Modern East African Farm Landscape" 
                style={styles.heroImg}
              />
              {/* Floating badges mimicking user UI screenshots */}
              <div style={styles.floatBadge1}>
                <Check size={14} style={{ color: '#16a34a', marginRight: '4px' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Grade A Certified</span>
              </div>
              <div style={styles.floatBadge2}>
                <div style={styles.pulseDot} />
                <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>6 Active Buyers Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* About Section */}
      <section id="about" style={styles.aboutSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionSubtitle}>WHAT IS KILIMO-CHAIN?</span>
          <h2 style={styles.sectionTitle}>Bridging the Gap Through Smart Tech</h2>
          <p style={styles.sectionDesc}>
            Kilimo-Chain is an agricultural marketplace designed to bridge the gap between farmers and buyers through technology. We enable farmers to thrive offline while unlocking premium produce access for regional buyers.
          </p>
        </div>

        {/* Feature Grid */}
        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <div style={{ ...styles.featureIconBox, backgroundColor: '#f0fdf4' }}>
              <Smartphone style={{ color: '#16a34a' }} />
            </div>
            <h3 style={styles.featureTitle}>USSD Harvest Listing</h3>
            <p style={styles.featureText}>
              Farmers register and list their harvests (Maize, Beans) offline using a basic mobile device. No internet required.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={{ ...styles.featureIconBox, backgroundColor: '#eff6ff' }}>
              <ShoppingBag style={{ color: '#2563eb' }} />
            </div>
            <h3 style={styles.featureTitle}>Online Marketplace</h3>
            <p style={styles.featureText}>
              Buyers browse verified produce listings, view weights, county locations, and checkout securely from the web.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={{ ...styles.featureIconBox, backgroundColor: '#fffbeb' }}>
              <Users style={{ color: '#d97706' }} />
            </div>
            <h3 style={styles.featureTitle}>Cooperative Moderation</h3>
            <p style={styles.featureText}>
              Cooperative administrators verify local farmers, update standard crop pricing metrics, and audit transactions.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={{ ...styles.featureIconBox, backgroundColor: '#f0fdf4' }}>
              <Database style={{ color: '#16a34a' }} />
            </div>
            <h3 style={styles.featureTitle}>Safaricom M-Pesa</h3>
            <p style={styles.featureText}>
              Integrated push STK payment flows update order status to PAID instantly upon entering M-Pesa PIN, triggering logs.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={{ ...styles.featureIconBox, backgroundColor: '#eff6ff' }}>
              <MessageSquare style={{ color: '#2563eb' }} />
            </div>
            <h3 style={styles.featureTitle}>Automated SMS Alerts</h3>
            <p style={styles.featureText}>
              Real-time SMS notifies stakeholders about request approvals, payments receipt codes, low stock alerts, or broadcasts.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={{ ...styles.featureIconBox, backgroundColor: '#fffbeb' }}>
              <TrendingUp style={{ color: '#d97706' }} />
            </div>
            <h3 style={styles.featureTitle}>Price Index Indexing</h3>
            <p style={styles.featureText}>
              Protects smallholder farmers from exploitation with transparent pricing indices linked to county markets.
            </p>
          </div>
        </div>
      </section>

      {/* Stakeholders Section */}
      <section id="stakeholders" style={styles.stakeholdersSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionSubtitle}>WHO IT'S FOR</span>
          <h2 style={styles.sectionTitle}>One Platform. Three Stakeholders.</h2>
          <p style={styles.sectionDesc}>
            Whether you grow it, buy it, or organize it — Kilimo-Chain gives you the tools to thrive.
          </p>
        </div>

        {/* Tab Controls */}
        <div style={styles.tabContainer}>
          <button 
            style={{
              ...styles.tabButton,
              backgroundColor: activeTab === 'farmers' ? '#15803d' : 'transparent',
              color: activeTab === 'farmers' ? '#fff' : '#475569',
              boxShadow: activeTab === 'farmers' ? '0 4px 12px rgba(21,128,61,0.15)' : 'none'
            }}
            onClick={() => setActiveTab('farmers')}
          >
            Farmers
          </button>
          <button 
            style={{
              ...styles.tabButton,
              backgroundColor: activeTab === 'buyers' ? '#0369a1' : 'transparent',
              color: activeTab === 'buyers' ? '#fff' : '#475569',
              boxShadow: activeTab === 'buyers' ? '0 4px 12px rgba(3,105,161,0.15)' : 'none'
            }}
            onClick={() => setActiveTab('buyers')}
          >
            Buyers
          </button>
          <button 
            style={{
              ...styles.tabButton,
              backgroundColor: activeTab === 'cooperatives' ? '#b45309' : 'transparent',
              color: activeTab === 'cooperatives' ? '#fff' : '#475569',
              boxShadow: activeTab === 'cooperatives' ? '0 4px 12px rgba(180,83,9,0.15)' : 'none'
            }}
            onClick={() => setActiveTab('cooperatives')}
          >
            Cooperatives
          </button>
        </div>

        {/* Tab Body */}
        <div style={styles.tabContentGrid}>
          <div style={styles.tabTextPanel}>
            <span style={{ ...styles.tabBadge, color: currentTab.color, backgroundColor: currentTab.color + '15' }}>
              {currentTab.tagline}
            </span>
            <h3 style={styles.tabTitle}>{currentTab.title}</h3>
            <p style={styles.tabDesc}>{currentTab.desc}</p>
            <div style={styles.tabPointsList}>
              {currentTab.points.map((pt, idx) => (
                <div key={idx} style={styles.tabPointItem}>
                  <div style={{ ...styles.pointBullet, backgroundColor: currentTab.color }}>
                    <Check size={10} style={{ color: '#fff' }} />
                  </div>
                  <span style={styles.pointText}>{pt}</span>
                </div>
              ))}
            </div>
            <Link to="/register" style={{ ...styles.btnTabAction, backgroundColor: currentTab.color }}>
              <span>Get Started</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div style={styles.tabImagePanel}>
            <img 
              src="/assets/farmer_ussd_mobile.jpg" 
              alt="Farmer listing harvests on mobile phone" 
              style={styles.tabImg}
            />
          </div>
        </div>
      </section>

      {/* Live Prices Ticker Section */}
      <section id="prices" style={styles.pricesSection}>
        <div style={styles.pricesContainer}>
          <div style={styles.pricesHeader}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.25rem' }}>
                Real-Time Cooperative Market Prices
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>
                Cooperative verified commodity index prices across regions. Updated hourly.
              </p>
            </div>
            <Link to="/login" className="btn btn-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>
              <span>Explore Marketplace</span>
            </Link>
          </div>

          {loadingPrices ? (
            <div style={{ color: '#fff', padding: '2rem', textAlign: 'center' }}>Loading pricing index...</div>
          ) : (
            <div style={styles.pricesGrid}>
              {prices.map((p) => (
                <div key={p.id} style={styles.priceCard}>
                  <div style={styles.priceCardHeader}>
                    <span style={styles.priceCrop}>{p.crop_name}</span>
                    <span style={{ 
                      ...styles.trendBadge, 
                      color: p.trend === 'UP' ? '#4ade80' : p.trend === 'DOWN' ? '#f87171' : '#fbbf24',
                      backgroundColor: p.trend === 'UP' ? 'rgba(74,222,128,0.1)' : p.trend === 'DOWN' ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.1)'
                    }}>
                      {p.trend || 'STABLE'}
                    </span>
                  </div>
                  <div style={styles.priceBody}>
                    <span style={styles.priceValue}>KES {p.price_per_kg}/KG</span>
                    <span style={styles.priceLoc}>{p.location} Cooperative</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaCard}>
          <h2 style={styles.ctaHeading}>Ready to Revolutionize Your Trade?</h2>
          <p style={styles.ctaSub}>
            Whether you want to source Grade-A agricultural produce or list harvests offline, Kilimo-Chain is the answer. Join today!
          </p>
          <div style={styles.ctaActions}>
            <div style={styles.btnCtaFarmer}>
              <Smartphone size={16} />
              <span>USSD Code: *710*33334#</span>
            </div>
            <Link to="/register" style={styles.btnCtaBuyer}>
              <span>Register as Buyer</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContainer}>
          <div style={styles.footerLeft}>
            <div style={styles.logoGroup}>
              <div style={{ ...styles.logoIcon, backgroundColor: '#15803d' }}>
                <Sprout size={18} style={{ color: '#fff' }} />
              </div>
              <span style={{ ...styles.logoText, color: '#fff' }}>Kilimo<span style={{ color: '#4ade80' }}>Chain</span></span>
            </div>
            <p style={styles.footerAboutText}>
              Connecting Kenya's agricultural value chain — from smallholder farmers to national buyers — on one intelligent platform.
            </p>
            <div style={styles.footerContactInfo}>
              <p>📍 Nairobi, Kenya</p>
              <p>✉️ kilimo-chain@gmail.com</p>
            </div>
          </div>

          <div style={styles.footerRight}>
            <div style={styles.footerCol}>
              <h4 style={styles.footerColTitle}>Platform</h4>
              <a href="#stakeholders" style={styles.footerLink}>For Farmers (*710*33334#)</a>
              <Link to="/register" style={styles.footerLink}>For Buyers</Link>
              <Link to="/login" style={styles.footerLink}>For Cooperatives</Link>
            </div>
            <div style={styles.footerCol}>
              <h4 style={styles.footerColTitle}>Resources</h4>
              <a href="#about" style={styles.footerLink}>What is Kilimo-Chain?</a>
              <a href="#stakeholders" style={styles.footerLink}>Workflows</a>
              <a href="#prices" style={styles.footerLink}>Market Pricing Index</a>
            </div>
          </div>
        </div>

        <div style={styles.footerBottom}>
          <p>© {new Date().getFullYear()} Kilimo-Chain Supply Chain Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  lpWrapper: {
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    fontFamily: "'Inter', sans-serif",
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
  },
  nav: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    height: '70px',
    display: 'flex',
    alignItems: 'center',
  },
  navContainer: {
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  logoIcon: {
    backgroundColor: '#15803d',
    borderRadius: '8px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
    color: '#0f172a',
  },
  navLinks: {
    display: 'flex',
    gap: '1.5rem',
  },
  navLink: {
    color: '#475569',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '0.9rem',
    transition: 'color 0.2s',
  },
  authGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  btnLogin: {
    color: '#475569',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  btnRegister: {
    backgroundColor: '#15803d',
    color: '#fff',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.85rem',
    transition: 'background-color 0.2s',
  },
  heroSection: {
    padding: '5rem 1.5rem',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  heroGrid: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 0.9fr',
    gap: '3rem',
    alignItems: 'center',
  },
  heroLeft: {
    textAlign: 'left',
  },
  badgePromo: {
    display: 'inline-flex',
    backgroundColor: '#f0fdf4',
    padding: '0.35rem 0.75rem',
    borderRadius: '100px',
    marginBottom: '1rem',
  },
  badgeText: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#15803d',
  },
  heroHeading: {
    fontSize: '3rem',
    fontWeight: '800',
    lineHeight: '1.15',
    color: '#0f172a',
    marginBottom: '1.25rem',
    fontFamily: "'Outfit', sans-serif",
  },
  heroSubheading: {
    fontSize: '1.05rem',
    lineHeight: '1.6',
    color: '#475569',
    marginBottom: '2rem',
  },
  heroActions: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '3rem',
  },
  btnHeroPrimary: {
    backgroundColor: '#15803d',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '0.95rem',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'transform 0.2s',
  },
  btnHeroSecondary: {
    backgroundColor: '#fff',
    border: '1px solid #cbd5e1',
    color: '#475569',
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '0.95rem',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  metricCard: {
    backgroundColor: '#fff',
    border: '1px solid rgba(0,0,0,0.04)',
    borderRadius: '12px',
    padding: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
  },
  metricCardTitle: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  metricCardText: {
    fontSize: '0.7rem',
    color: '#64748b',
    margin: 0,
  },
  heroRight: {
    position: 'relative',
  },
  heroImageWrapper: {
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
    position: 'relative',
  },
  heroImg: {
    width: '100%',
    height: 'auto',
    display: 'block',
    transform: 'scale(1.02)',
  },
  floatBadge1: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    backgroundColor: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(0,0,0,0.04)',
    borderRadius: '100px',
    padding: '0.35rem 0.75rem',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 8px 16px rgba(0,0,0,0.06)',
  },
  floatBadge2: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    backgroundColor: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(0,0,0,0.04)',
    borderRadius: '100px',
    padding: '0.35rem 0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    boxShadow: '0 8px 16px rgba(0,0,0,0.06)',
  },
  pulseDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#16a34a',
    animation: 'pulse 1.5s infinite',
  },
  aboutSection: {
    backgroundColor: '#fff',
    padding: '6rem 1.5rem',
    borderTop: '1px solid rgba(0,0,0,0.02)',
    borderBottom: '1px solid rgba(0,0,0,0.02)',
  },
  sectionHeader: {
    maxWidth: '700px',
    margin: '0 auto 4rem auto',
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: '0.75rem',
    fontWeight: '800',
    letterSpacing: '0.1em',
    color: '#15803d',
    display: 'block',
    marginBottom: '0.5rem',
  },
  sectionTitle: {
    fontSize: '2.25rem',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '1rem',
    fontFamily: "'Outfit', sans-serif",
  },
  sectionDesc: {
    fontSize: '1rem',
    lineHeight: '1.6',
    color: '#475569',
  },
  featuresGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '1.5rem',
  },
  featureCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    padding: '2rem',
    textAlign: 'left',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: '1px solid rgba(0,0,0,0.03)',
  },
  featureIconBox: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.25rem',
  },
  featureTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '0.5rem',
  },
  featureText: {
    fontSize: '0.9rem',
    lineHeight: '1.5',
    color: '#475569',
  },
  stakeholdersSection: {
    padding: '6rem 1.5rem',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  tabContainer: {
    display: 'inline-flex',
    backgroundColor: '#f1f5f9',
    padding: '0.25rem',
    borderRadius: '12px',
    marginBottom: '3rem',
  },
  tabButton: {
    border: 'none',
    padding: '0.6rem 1.75rem',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabContentGrid: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 0.9fr',
    gap: '3.5rem',
    alignItems: 'center',
    textAlign: 'left',
  },
  tabTextPanel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  tabBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.35rem 0.75rem',
    borderRadius: '100px',
    marginBottom: '1rem',
  },
  tabTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '0.75rem',
  },
  tabDesc: {
    fontSize: '1rem',
    lineHeight: '1.6',
    color: '#475569',
    marginBottom: '1.5rem',
  },
  tabPointsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '2rem',
  },
  tabPointItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  pointBullet: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointText: {
    fontSize: '0.9rem',
    color: '#334155',
    fontWeight: '500',
  },
  btnTabAction: {
    color: '#fff',
    textDecoration: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  tabImagePanel: {
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 16px 36px rgba(0,0,0,0.06)',
  },
  tabImg: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
  pricesSection: {
    backgroundColor: '#0f172a', // dark panel contrast
    padding: '5rem 1.5rem',
  },
  pricesContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  pricesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '3rem',
    textAlign: 'left',
  },
  pricesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.25rem',
    textAlign: 'left',
  },
  priceCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '1.5rem',
    backdropFilter: 'blur(8px)',
  },
  priceCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  priceCrop: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#fff',
  },
  trendBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
  },
  priceBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  priceValue: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#10b981',
  },
  priceLoc: {
    fontSize: '0.8rem',
    color: '#94a3b8',
  },
  ctaSection: {
    padding: '6rem 1.5rem',
    backgroundColor: '#fff',
  },
  ctaCard: {
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: '#14532d', /* deep green background */
    borderRadius: '24px',
    padding: '3.5rem 2rem',
    color: '#fff',
    boxShadow: '0 20px 40px rgba(20,83,45,0.15)',
  },
  ctaHeading: {
    fontSize: '2.25rem',
    fontWeight: '800',
    marginBottom: '1rem',
    fontFamily: "'Outfit', sans-serif",
  },
  ctaSub: {
    fontSize: '1.05rem',
    lineHeight: '1.6',
    color: '#d1fae5',
    maxWidth: '600px',
    margin: '0 auto 2.5rem auto',
  },
  ctaActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1.25rem',
  },
  btnCtaFarmer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '0.9rem',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  btnCtaBuyer: {
    backgroundColor: '#10b981',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    fontWeight: '600',
    fontSize: '0.9rem',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  footer: {
    backgroundColor: '#0b0f17',
    color: '#94a3b8',
    padding: '4rem 1.5rem 2rem 1.5rem',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  footerContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '4rem',
    marginBottom: '3rem',
    textAlign: 'left',
  },
  footerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  footerAboutText: {
    fontSize: '0.9rem',
    lineHeight: '1.6',
    maxWidth: '440px',
  },
  footerContactInfo: {
    fontSize: '0.85rem',
    color: '#64748b',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  footerRight: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
  },
  footerCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  footerColTitle: {
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
  },
  footerLink: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '0.85rem',
    transition: 'color 0.2s',
  },
  footerBottom: {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    paddingTop: '1.5rem',
    display: 'flex',
    justifyContent: 'center',
    fontSize: '0.8rem',
    color: '#475569',
  },
};

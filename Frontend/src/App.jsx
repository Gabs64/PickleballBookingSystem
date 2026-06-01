import React, { useState, useEffect } from 'react';
import { BookingProvider } from './context/BookingContext';
import CustomerPortal from './customer/CustomerPortal';
import CashierPortal from './cashier/CashierPortal';
import AdminPortal from './admin/AdminPortal';
import { Users, Shield, ArrowRight, Activity, Check } from 'lucide-react';

function AppContent() {
  const [route, setRoute] = useState('landing'); // 'customer', 'cashier', 'admin', or 'landing'
  const [hoveredCard, setHoveredCard] = useState(null); // 'customer', 'cashier', 'admin' or null

  useEffect(() => {
    const handleRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      if (path.includes('cashier') || hash.includes('cashier')) {
        setRoute('cashier');
      } else if (path.includes('admin') || hash.includes('admin')) {
        setRoute('admin');
      } else if (path.includes('customer') || hash.includes('customer')) {
        setRoute('customer');
      } else {
        setRoute('landing');
      }
    };

    // Run on initial mount
    handleRoute();

    // Listen to hash changes and pathname popstates
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('popstate', handleRoute);

    return () => {
      window.removeEventListener('hashchange', handleRoute);
      window.removeEventListener('popstate', handleRoute);
    };
  }, []);

  const navigateTo = (dest) => {
    window.location.hash = `#/${dest}`;
  };

  if (route === 'customer') {
    return <CustomerPortal />;
  }

  if (route === 'cashier') {
    return <CashierPortal />;
  }

  if (route === 'admin') {
    return <AdminPortal />;
  }

  return (
    <div style={styles.landingContainer}>
      <div style={styles.glowBg1}></div>
      <div style={styles.glowBg2}></div>

      {/* Main Branding Section */}
      <div style={styles.header}>
        <div style={styles.logoBadge}>
          <span>PORTAL HUB</span>
        </div>
        <h1 style={styles.mainTitle}>{"<brand name>"}</h1>
        <p style={styles.subtitle}>Pickleball Court Reservation & Reception Management System</p>
      </div>

      {/* Portal Cards Selection Grid */}
      <div style={styles.grid}>
        {/* Customer Portal Card */}
        <div 
          style={{
            ...styles.card,
            ...(hoveredCard === 'customer' ? styles.cardHoverCustomer : {})
          }}
          className="glass-card"
          onMouseEnter={() => setHoveredCard('customer')}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => navigateTo('customer')}
        >
          <div style={styles.cardHeader}>
            <div style={styles.iconWrapperCustomer}>
              <Users size={28} color="#ccff00" />
            </div>
            <h2 style={styles.cardTitle}>Customer Portal</h2>
          </div>
          <p style={styles.cardDesc}>
            Access our user-friendly court reservation hub to book sessions, rent premium gear, and manage your tickets.
          </p>
          <ul style={styles.featureList}>
            <li style={styles.featureItem}><Check size={14} color="#ccff00" style={{ marginRight: '6px' }} /> ₱450.00 Flat Hourly Rate</li>
            <li style={styles.featureItem}><Check size={14} color="#ccff00" style={{ marginRight: '6px' }} /> Quick-Book Dropbox Selector</li>
            <li style={styles.featureItem}><Check size={14} color="#ccff00" style={{ marginRight: '6px' }} /> GCash Sandbox Checkout</li>
            <li style={styles.featureItem}><Check size={14} color="#ccff00" style={{ marginRight: '6px' }} /> Searchable Pass & Cancel engine</li>
          </ul>
          <button 
            style={{
              ...styles.btnCustomer,
              ...(hoveredCard === 'customer' ? { transform: 'scale(1.02)' } : {})
            }} 
            className="btn"
            onClick={(e) => { e.stopPropagation(); navigateTo('customer'); }}
          >
            <span>Enter Customer Booking</span>
            <ArrowRight size={16} style={{ marginLeft: '6px' }} />
          </button>
        </div>

        {/* Cashier Terminal Card */}
        <div 
          style={{
            ...styles.card,
            ...(hoveredCard === 'cashier' ? styles.cardHoverCashier : {})
          }}
          className="glass-card"
          onMouseEnter={() => setHoveredCard('cashier')}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => navigateTo('cashier')}
        >
          <div style={styles.cardHeader}>
            <div style={styles.iconWrapperCashier}>
              <Shield size={28} color="#00f0ff" />
            </div>
            <h2 style={styles.cardTitle}>Cashier Console</h2>
          </div>
          <p style={styles.cardDesc}>
            Receptionist dashboard to record walk-in customers, view court occupancy timelines, and audit sales reports.
          </p>
          <ul style={styles.featureList}>
            <li style={styles.featureItem}><Check size={14} color="#00f0ff" style={{ marginRight: '6px' }} /> Interactive Timeline Board</li>
            <li style={styles.featureItem}><Check size={14} color="#00f0ff" style={{ marginRight: '6px' }} /> Register Search & check-in list</li>
            <li style={styles.featureItem}><Check size={14} color="#00f0ff" style={{ marginRight: '6px' }} /> Register Walk-in bookings instantly</li>
            <li style={styles.featureItem}><Check size={14} color="#00f0ff" style={{ marginRight: '6px' }} /> Hourly Sales Analytics reports</li>
          </ul>
          <button 
            style={{
              ...styles.btnCashier,
              ...(hoveredCard === 'cashier' ? { transform: 'scale(1.02)' } : {})
            }} 
            className="btn"
            onClick={(e) => { e.stopPropagation(); navigateTo('cashier'); }}
          >
            <span>Enter Cashier Terminal</span>
            <ArrowRight size={16} style={{ marginLeft: '6px' }} />
          </button>
        </div>

        {/* Admin Portal Card */}
        <div 
          style={{
            ...styles.card,
            ...(hoveredCard === 'admin' ? styles.cardHoverAdmin : {})
          }}
          className="glass-card"
          onMouseEnter={() => setHoveredCard('admin')}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={() => navigateTo('admin')}
        >
          <div style={styles.cardHeader}>
            <div style={styles.iconWrapperAdmin}>
              <Shield size={28} color="#c084fc" />
            </div>
            <h2 style={styles.cardTitle}>Admin Console</h2>
          </div>
          <p style={styles.cardDesc}>
            Manage system operators, create cashier and customer accounts, audit registered accounts, and review database records.
          </p>
          <ul style={styles.featureList}>
            <li style={styles.featureItem}><Check size={14} color="#c084fc" style={{ marginRight: '6px' }} /> Control accounts in database</li>
            <li style={styles.featureItem}><Check size={14} color="#c084fc" style={{ marginRight: '6px' }} /> Register new cashier profiles</li>
            <li style={styles.featureItem}><Check size={14} color="#c084fc" style={{ marginRight: '6px' }} /> Manage customer logins centrally</li>
            <li style={styles.featureItem}><Check size={14} color="#c084fc" style={{ marginRight: '6px' }} /> Real-time active shifts overview</li>
          </ul>
          <button 
            style={{
              ...styles.btnAdmin,
              ...(hoveredCard === 'admin' ? { transform: 'scale(1.02)' } : {})
            }} 
            className="btn"
            onClick={(e) => { e.stopPropagation(); navigateTo('admin'); }}
          >
            <span>Enter Admin Dashboard</span>
            <ArrowRight size={16} style={{ marginLeft: '6px' }} />
          </button>
        </div>
      </div>

      {/* Selector footer info */}
      <footer style={styles.footer}>
        <p>© 2026 {"<brand name>"}. All rights reserved.</p>
        <p style={{ fontSize: '0.65rem', color: '#475569', marginTop: '0.25rem' }}>
          This system is fully sandboxed in memory for demonstration purposes.
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BookingProvider>
      <AppContent />
    </BookingProvider>
  );
}

const styles = {
  landingContainer: {
    minHeight: '100vh',
    background: '#07080c',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2.5rem 1.5rem',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', sans-serif",
  },
  glowBg1: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    background: 'rgba(204, 255, 0, 0.03)',
    filter: 'blur(120px)',
    top: '-10%',
    left: '15%',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  glowBg2: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    background: 'rgba(0, 240, 255, 0.02)',
    filter: 'blur(120px)',
    bottom: '10%',
    right: '15%',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
    zIndex: 2,
  },
  logoBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '30px',
    padding: '0.35rem 0.85rem',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#cbd5e1',
    letterSpacing: '0.08em',
    marginBottom: '1rem',
  },
  mainTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '3rem',
    fontWeight: 900,
    letterSpacing: '-0.03em',
    color: '#fff',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#94a3b8',
    maxWidth: '500px',
    margin: '0 auto',
    lineHeight: 1.5,
  },
  grid: {
    display: 'flex',
    gap: '1.5rem',
    width: '100%',
    maxWidth: '1050px',
    zIndex: 2,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    flex: 1,
    minWidth: '280px',
    background: 'rgba(15, 18, 30, 0.55)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '2rem',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  cardHoverCustomer: {
    borderColor: 'rgba(204, 255, 0, 0.3)',
    boxShadow: '0 12px 30px rgba(204, 255, 0, 0.08)',
    transform: 'translateY(-6px)',
  },
  cardHoverCashier: {
    borderColor: 'rgba(0, 240, 255, 0.3)',
    boxShadow: '0 12px 30px rgba(0, 240, 255, 0.08)',
    transform: 'translateY(-6px)',
  },
  cardHoverAdmin: {
    borderColor: 'rgba(192, 132, 252, 0.3)',
    boxShadow: '0 12px 30px rgba(192, 132, 252, 0.08)',
    transform: 'translateY(-6px)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.25rem',
  },
  iconWrapperCustomer: {
    width: '52px',
    height: '52px',
    background: 'rgba(204, 255, 0, 0.08)',
    border: '1px solid rgba(204, 255, 0, 0.15)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperCashier: {
    width: '52px',
    height: '52px',
    background: 'rgba(0, 240, 255, 0.08)',
    border: '1px solid rgba(0, 240, 255, 0.15)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperAdmin: {
    width: '52px',
    height: '52px',
    background: 'rgba(192, 132, 252, 0.08)',
    border: '1px solid rgba(192, 132, 252, 0.15)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1.4rem',
    fontWeight: 750,
    color: '#fff',
  },
  cardDesc: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    lineHeight: 1.5,
    marginBottom: '1.5rem',
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 2rem 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.8rem',
    color: '#cbd5e1',
  },
  btnCustomer: {
    width: '100%',
    marginTop: 'auto',
    padding: '0.8rem 1.25rem',
    background: 'var(--accent-neon)',
    color: 'var(--text-inverse)',
    fontWeight: 750,
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s',
  },
  btnCashier: {
    width: '100%',
    marginTop: 'auto',
    padding: '0.8rem 1.25rem',
    background: '#00f0ff',
    color: '#000',
    fontWeight: 750,
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s',
  },
  btnAdmin: {
    width: '100%',
    marginTop: 'auto',
    padding: '0.8rem 1.25rem',
    background: '#c084fc',
    color: '#000',
    fontWeight: 750,
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s',
  },
  footer: {
    marginTop: '4rem',
    textAlign: 'center',
    zIndex: 2,
    fontSize: '0.7rem',
    color: '#475569',
  }
};

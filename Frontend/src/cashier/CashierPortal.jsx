import React, { useState } from 'react';
import CourtOverview from './CourtOverview';
import BookingTimeline from './BookingTimeline';
import BookingList from './BookingList';
import AnalyticsPanel from './AnalyticsPanel';
import WalkInModal from './WalkInModal';
import { LayoutDashboard, TableProperties, BarChart3, PlusCircle, Bell, UserSquare2, Sparkles, ClipboardList } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export default function CashierPortal() {
  const { bookings, getRelativeDateString } = useBooking();
  
  // Navigation Tabs: 'live', 'register', 'reports'
  const [activeSubTab, setActiveSubTab] = useState('live');
  
  // Walkin Drawer prefill states
  const [isWalkinOpen, setIsWalkinOpen] = useState(false);
  const [prefilledCourt, setPrefilledCourt] = useState('');
  const [prefilledSlot, setPrefilledSlot] = useState('');

  const todayStr = getRelativeDateString(0);
  
  // Calculate active checked-in and pending payment counts for alerts
  const todayActiveCount = bookings.filter(b => b.date === todayStr && b.status === 'Checked-In').length;
  const todayPendingPay = bookings.filter(b => b.date === todayStr && b.status === 'Pending').length;

  const handleOpenQuickBook = (courtId = '', slot = '') => {
    setPrefilledCourt(courtId);
    setPrefilledSlot(slot);
    setIsWalkinOpen(true);
  };

  return (
    <div style={styles.cashierLayout} className="animate-fade-in">
      
      {/* SIDEBAR NAVIGATION PANEL */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarBranding}>
          <div>
            <h3 style={styles.brandTitle}>{"<brand name> Terminal"}</h3>
            <span style={styles.brandRole}>CASHIER CONSOLE</span>
          </div>
        </div>

        <button 
          onClick={() => handleOpenQuickBook()} 
          className="btn btn-primary" 
          style={styles.newBookBtn}
        >
          <PlusCircle size={16} />
          New Walk-In Book
        </button>

        <nav style={styles.navMenu}>
          <button 
            onClick={() => setActiveSubTab('live')}
            style={{
              ...styles.navBtn,
              backgroundColor: activeSubTab === 'live' ? 'rgba(204, 255, 0, 0.08)' : 'transparent',
              color: activeSubTab === 'live' ? 'var(--accent-neon)' : '#94a3b8',
              borderLeft: activeSubTab === 'live' ? '3px solid var(--accent-neon)' : '3px solid transparent'
            }}
          >
            <LayoutDashboard size={18} />
            Live Dashboard
            {todayActiveCount > 0 && <span style={styles.navCountBadge}>{todayActiveCount}</span>}
          </button>

          <button 
            onClick={() => setActiveSubTab('register')}
            style={{
              ...styles.navBtn,
              backgroundColor: activeSubTab === 'register' ? 'rgba(204, 255, 0, 0.08)' : 'transparent',
              color: activeSubTab === 'register' ? 'var(--accent-neon)' : '#94a3b8',
              borderLeft: activeSubTab === 'register' ? '3px solid var(--accent-neon)' : '3px solid transparent'
            }}
          >
            <TableProperties size={18} />
            Booking Register
            {todayPendingPay > 0 && <span style={{ ...styles.navCountBadge, background: '#fbbf24', color: '#000' }}>{todayPendingPay}</span>}
          </button>

          <button 
            onClick={() => setActiveSubTab('reports')}
            style={{
              ...styles.navBtn,
              backgroundColor: activeSubTab === 'reports' ? 'rgba(204, 255, 0, 0.08)' : 'transparent',
              color: activeSubTab === 'reports' ? 'var(--accent-neon)' : '#94a3b8',
              borderLeft: activeSubTab === 'reports' ? '3px solid var(--accent-neon)' : '3px solid transparent'
            }}
          >
            <BarChart3 size={18} />
            Business Reports
          </button>
        </nav>

        <div style={styles.sidebarFooter}>
          <span style={styles.serverStatus}>⚡ Sandbox Local Server</span>
          <span style={styles.serverIp}>PORT: 3000 (ReactJS + Vite)</span>
        </div>
      </aside>

      {/* MAIN CONTENT DISPLAY AREA */}
      <main style={styles.mainArea}>
        
        {/* Terminal Header */}
        <header style={styles.terminalHeader}>
          <div style={styles.headerLeft}>
            <span style={styles.terminalGreeting}>Reception counter: <strong>Active Session</strong></span>
            <span style={styles.terminalTime}>TODAY: <strong style={{ color: '#fff' }}>{todayStr}</strong></span>
          </div>

          <div style={styles.headerRight}>
            <div style={styles.alertBell} title="System Alerts">
              <Bell size={18} />
              {(todayActiveCount > 0 || todayPendingPay > 0) && <span style={styles.bellDot}></span>}
            </div>
            <div style={styles.profileBadge}>
              <UserSquare2 size={20} color="var(--accent-neon)" />
              <span style={styles.cashierName}>Alliah (Cashier)</span>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Router */}
        <div style={styles.viewContent}>
          {activeSubTab === 'live' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <CourtOverview onQuickBook={handleOpenQuickBook} />
              <BookingTimeline onQuickBook={handleOpenQuickBook} />
            </div>
          )}

          {activeSubTab === 'register' && (
            <BookingList />
          )}

          {activeSubTab === 'reports' && (
            <AnalyticsPanel />
          )}
        </div>
      </main>

      {/* QUICK REGISTRATION DRAWER SLIDE */}
      <WalkInModal
        isOpen={isWalkinOpen}
        onClose={() => setIsWalkinOpen(false)}
        prefilledCourtId={prefilledCourt}
        prefilledSlot={prefilledSlot}
      />

    </div>
  );
}

const styles = {
  cashierLayout: {
    display: 'flex',
    minHeight: '100vh',
    background: '#090a0f',
  },
  sidebar: {
    width: '240px',
    background: 'rgba(14, 17, 26, 0.85)',
    backdropFilter: 'blur(16px)',
    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem 1rem',
    flexShrink: 0,
    zIndex: 10,
  },
  sidebarBranding: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    marginBottom: '2rem',
  },
  avatar: {
    fontSize: '1.25rem',
  },
  brandTitle: {
    fontSize: '0.85rem',
    fontWeight: 800,
    fontFamily: "'Outfit', sans-serif",
    letterSpacing: '-0.02em',
    color: '#fff',
  },
  brandRole: {
    display: 'block',
    fontSize: '0.6rem',
    fontWeight: 700,
    color: 'var(--accent-neon)',
    letterSpacing: '0.05em',
    marginTop: '1px',
  },
  newBookBtn: {
    width: '100%',
    padding: '0.65rem',
    fontSize: '0.8rem',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 12px rgba(204, 255, 0, 0.15)',
  },
  navMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    background: 'transparent',
    border: 'none',
    padding: '0.75rem 0.85rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 600,
    fontFamily: "'Outfit', sans-serif",
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
    position: 'relative',
  },
  navCountBadge: {
    marginLeft: 'auto',
    fontSize: '0.65rem',
    fontWeight: 750,
    background: 'var(--accent-neon)',
    color: 'var(--text-inverse)',
    padding: '0.1rem 0.4rem',
    borderRadius: '30px',
  },
  sidebarFooter: {
    marginTop: 'auto',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    paddingTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  serverStatus: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#10b981',
  },
  serverIp: {
    fontSize: '0.65rem',
    color: '#64748b',
  },
  mainArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowX: 'hidden',
    padding: '1.5rem 2rem 3rem 2rem',
  },
  terminalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '1rem',
    marginBottom: '1.5rem',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
  },
  terminalGreeting: {
    fontSize: '0.85rem',
    color: '#cbd5e1',
  },
  terminalTime: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
  },
  alertBell: {
    position: 'relative',
    color: '#94a3b8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'red',
  },
  profileBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    padding: '0.35rem 0.85rem',
    borderRadius: '30px',
  },
  cashierName: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#fff',
  },
  viewContent: {
    flex: 1,
  }
};

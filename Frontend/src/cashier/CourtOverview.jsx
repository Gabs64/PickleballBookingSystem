import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { Play, Sparkles, AlertCircle, Calendar, PlusCircle, CheckCircle } from 'lucide-react';

export default function CourtOverview({ onQuickBook }) {
  const { courts, bookings, getRelativeDateString } = useBooking();
  const [currentHourSlot, setCurrentHourSlot] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');

  // Dynamically calculate current slot based on local time
  useEffect(() => {
    const calculateCurrentSlot = () => {
      const now = new Date();
      const hour = now.getHours();
      
      const today = getRelativeDateString(0);
      setCurrentDateStr(today);

      // Clamp operating hours between 6 AM and 10 PM
      if (hour < 6) {
        setCurrentHourSlot('06:00 - 07:00');
      } else if (hour >= 22) {
        setCurrentHourSlot('21:00 - 22:00');
      } else {
        const startStr = hour.toString().padStart(2, '0') + ':00';
        const endStr = (hour + 1).toString().padStart(2, '0') + ':00';
        setCurrentHourSlot(`${startStr} - ${endStr}`);
      }
    };

    calculateCurrentSlot();
    const interval = setInterval(calculateCurrentSlot, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  const getCourtBookingAtCurrentHour = (courtId) => {
    return bookings.find(
      (b) => b.courtId === courtId && b.date === currentDateStr && b.slots.includes(currentHourSlot) && b.status !== 'Cancelled'
    );
  };

  return (
    <div className="animate-fade-in" style={styles.container}>
      
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.title}>Live Court Status</h2>
          <p style={styles.subtitle}>
            Real-time occupancy tracker for today (<strong style={{ color: '#fff' }}>{currentDateStr}</strong>) at current hour slot <strong style={{ color: 'var(--accent-neon)' }}>{currentHourSlot}</strong>
          </p>
        </div>
        
        <div style={styles.statusLegend}>
          <span style={styles.legendNode}><span style={{ ...styles.colorDot, background: '#10b981' }}></span> Available</span>
          <span style={styles.legendNode}><span style={{ ...styles.colorDot, background: '#00f0ff' }}></span> Playing</span>
          <span style={styles.legendNode}><span style={{ ...styles.colorDot, background: '#fbbf24' }}></span> Reserved</span>
        </div>
      </div>

      <div className="grid-4" style={{ marginTop: '1.5rem' }}>
        {courts.map((court) => {
          const activeBooking = getCourtBookingAtCurrentHour(court.id);
          
          let cardStatus = 'Available';
          let statusColor = '#10b981';
          let statusGlow = 'rgba(16, 185, 129, 0.15)';
          
          if (activeBooking) {
            if (activeBooking.status === 'Checked-In') {
              cardStatus = 'Playing';
              statusColor = '#00f0ff';
              statusGlow = 'rgba(0, 240, 255, 0.15)';
            } else {
              cardStatus = 'Reserved';
              statusColor = '#fbbf24';
              statusGlow = 'rgba(251, 191, 36, 0.15)';
            }
          }

          return (
            <div 
              key={court.id} 
              className="glass-card" 
              style={{
                ...styles.courtCard,
                borderColor: activeBooking ? statusColor : 'var(--border-subtle)',
                boxShadow: activeBooking ? `0 0 20px ${statusGlow}, var(--shadow-md)` : 'var(--shadow-md)'
              }}
            >
              <div style={styles.cardTop}>
                <span 
                  style={{
                    ...styles.statusIndicator,
                    color: statusColor,
                    background: `${statusColor}1A`,
                    border: `1px solid ${statusColor}40`
                  }}
                >
                  <span style={{ ...styles.cardDot, background: statusColor }}></span>
                  {cardStatus.toUpperCase()}
                </span>
                <span style={styles.courtNameLabel}>{court.name.split(' ').slice(-1)}</span>
              </div>

              <h3 style={styles.courtTitle}>{court.name}</h3>
              <span style={styles.courtSubtitle}>{court.type}</span>

              <div style={styles.occupantDetails}>
                {activeBooking ? (
                  <div style={styles.occupantBox}>
                    <span style={styles.detailLabel}>CURRENT PLAYER</span>
                    <span style={styles.detailValue}>{activeBooking.customerName}</span>
                    <span style={styles.detailSubvalue}>{activeBooking.customerPhone}</span>
                    
                    <div style={styles.metaRow}>
                      <div>
                        <span style={styles.detailLabel}>SLOTS</span>
                        <span style={styles.slotBlock}>{activeBooking.slots.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={styles.emptyBox}>
                    <CheckCircle size={22} color="#10b981" style={{ opacity: 0.7 }} />
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, marginTop: '0.35rem' }}>Court is Vacant</span>
                    <p style={{ fontSize: '0.65rem', color: '#475569', marginTop: '0.15rem' }}>Ready for walk-in players</p>
                  </div>
                )}
              </div>

              <div style={styles.cardActions}>
                {activeBooking ? (
                  <div style={styles.checkedInRow}>
                    <span style={styles.paymentStatusLabel}>
                      Payment: <strong style={{ color: activeBooking.paymentStatus === 'Paid' ? '#10b981' : '#fbbf24' }}>{activeBooking.paymentStatus}</strong>
                    </span>
                  </div>
                ) : (
                  <button 
                    onClick={() => onQuickBook(court.id, currentHourSlot)}
                    className="btn btn-accent btn-sm"
                    style={{ width: '100%' }}
                  >
                    <PlusCircle size={14} /> Quick Book Walk-In
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

const styles = {
  container: {
    padding: '1.25rem 0',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: 750,
  },
  subtitle: {
    fontSize: '0.75rem',
    color: '#cbd5e1',
    marginTop: '0.15rem',
  },
  statusLegend: {
    display: 'flex',
    gap: '1rem',
  },
  legendNode: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.75rem',
    color: '#cbd5e1',
  },
  colorDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  courtCard: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1.25rem',
    background: 'rgba(22, 27, 42, 0.45)',
    height: '100%',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  statusIndicator: {
    fontSize: '0.65rem',
    fontWeight: 700,
    padding: '0.15rem 0.5rem',
    borderRadius: '30px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    letterSpacing: '0.02em',
  },
  cardDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  courtNameLabel: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: '#475569',
    background: 'rgba(255,255,255,0.03)',
    padding: '0.15rem 0.45rem',
    borderRadius: '4px',
  },
  courtTitle: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#fff',
  },
  courtSubtitle: {
    fontSize: '0.7rem',
    color: '#64748b',
    fontWeight: 500,
    marginBottom: '1rem',
  },
  occupantDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    background: 'rgba(9, 10, 15, 0.35)',
    padding: '0.85rem',
    borderRadius: '8px',
    minHeight: '125px',
    border: '1px solid rgba(255, 255, 255, 0.03)',
  },
  occupantBox: {
    display: 'flex',
    flexDirection: 'column',
  },
  detailLabel: {
    fontSize: '0.55rem',
    fontWeight: 700,
    color: '#64748b',
    letterSpacing: '0.04em',
    marginBottom: '0.15rem',
  },
  detailValue: {
    fontSize: '0.85rem',
    fontWeight: 750,
    color: '#f8fafc',
  },
  detailSubvalue: {
    fontSize: '0.7rem',
    color: '#94a3b8',
    marginBottom: '0.5rem',
  },
  metaRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  slotBlock: {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: 'var(--accent-neon)',
  },
  emptyBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '0.5rem 0',
  },
  cardActions: {
    marginTop: '1.25rem',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    paddingTop: '0.85rem',
  },
  checkedInRow: {
    display: 'flex',
    justifyContent: 'center',
  },
  paymentStatusLabel: {
    fontSize: '0.7rem',
    color: '#64748b',
  }
};

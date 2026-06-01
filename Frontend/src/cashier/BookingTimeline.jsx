import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { CalendarDays, Clock, Play, DollarSign, Check, X, ShieldAlert, Award } from 'lucide-react';
import Modal from '../components/Modal';
import Badge from '../components/Badge';

export default function BookingTimeline({ onQuickBook }) {
  const { courts, operatingHours, bookings, updateBookingStatus, getRelativeDateString } = useBooking();
  const [selectedDate, setSelectedDate] = useState(getRelativeDateString(0));
  const [inspectedBooking, setInspectedBooking] = useState(null);

  // Find booking for a given court, date, and hour
  const getBookingForCell = (courtId, hour) => {
    return bookings.find(
      (b) => b.courtId === courtId && b.date === selectedDate && b.slots.includes(hour) && b.status !== 'Cancelled'
    );
  };

  const handleCellClick = (courtId, hour, activeBooking) => {
    if (activeBooking) {
      setInspectedBooking(activeBooking);
    } else {
      // Cell is free, fire walk-in reservation with prefilled details!
      onQuickBook(courtId, hour);
    }
  };

  const handleStatusUpdate = (status) => {
    if (inspectedBooking) {
      updateBookingStatus(inspectedBooking.id, status);
      
      // Update local inspected booking state
      setInspectedBooking({
        ...inspectedBooking,
        status,
        paymentStatus: (status === 'Paid' || status === 'Checked-In' || status === 'Completed') ? 'Paid' : inspectedBooking.paymentStatus
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#fbbf24'; // Amber
      case 'Paid': return '#10b981';    // Emerald
      case 'Checked-In': return '#00f0ff'; // Cyan
      case 'Completed': return '#c084fc';  // Purple
      default: return '#cbd5e1';
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.topBar}>
        <div>
          <h3 style={styles.timelineTitle}>Interactive Scheduler Grid</h3>
          <p style={styles.timelineSubtitle}>Daily scheduler map. Click any active block to manage reservation status. Click free slots to book instantly.</p>
        </div>

        <div style={styles.dateSelector}>
          <CalendarDays size={16} color="var(--accent-neon)" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={styles.dateInput}
          />
        </div>
      </div>

      {/* HORIZONTAL SCROLLABLE TIMELINE TABLE */}
      <div className="glass-card" style={styles.timelineCard}>
        <div style={styles.scrollWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.thCourt}>COURT / TIMES</th>
                {operatingHours.map((hour) => {
                  const hourNum = parseInt(hour.split(':')[0], 10);
                  const period = hourNum >= 12 ? 'PM' : 'AM';
                  const displayHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
                  return (
                    <th key={hour} style={styles.thHour}>
                      {displayHour} {period}
                      <span style={styles.hourRangeSub}>{hour.split(' - ')[0]}</span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {courts.map((court) => (
                <tr key={court.id} style={styles.tr}>
                  <td style={styles.tdCourt} className="font-headings">
                    <span style={{ color: court.color, fontWeight: 700 }}>●</span> {court.name.replace('Court ', 'C')}
                    <span style={styles.courtTypeSub}>{court.type.split(' ')[0]}</span>
                  </td>
                  
                  {operatingHours.map((hour) => {
                    const activeBooking = getBookingForCell(court.id, hour);
                    
                    return (
                      <td 
                        key={hour} 
                        style={styles.tdHourCell}
                        onClick={() => handleCellClick(court.id, hour, activeBooking)}
                      >
                        {activeBooking ? (
                          // RENDER ACTIVE BOOKING BLOCK
                          <div 
                            style={{
                              ...styles.bookingBlock,
                              background: `linear-gradient(135deg, ${getStatusColor(activeBooking.status)}1f 0%, ${getStatusColor(activeBooking.status)}0f 100%)`,
                              border: `1px dashed ${getStatusColor(activeBooking.status)}99`,
                              color: getStatusColor(activeBooking.status)
                            }}
                          >
                            <span style={styles.bookingBlockName}>{activeBooking.customerName}</span>
                            <span style={styles.bookingBlockCode}>{activeBooking.id}</span>
                          </div>
                        ) : (
                          // RENDER FREE HOVERABLE SLOT
                          <div style={styles.freeSlot} className="timeline-free-slot">
                            <span style={styles.plusSign}>+</span>
                            <span style={styles.freeText}>Book</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK STATUS MANAGER MODAL */}
      <Modal
        isOpen={!!inspectedBooking}
        onClose={() => setInspectedBooking(null)}
        title="Manage Court Reservation"
        maxWidth="450px"
      >
        {inspectedBooking && (
          <div style={styles.inspectedWrapper}>
            
            <div style={styles.inspectedHeader}>
              <div>
                <span style={styles.inspectedId}>{inspectedBooking.id}</span>
                <h4 style={styles.inspectedName}>{inspectedBooking.customerName}</h4>
                <p style={styles.inspectedEmail}>{inspectedBooking.customerEmail} | {inspectedBooking.customerPhone}</p>
              </div>
              <Badge status={inspectedBooking.status} />
            </div>

            <div style={styles.inspectedGrid} className="glass-card">
              <div style={styles.gridLine}>
                <span style={styles.gridLabel}>Date & Arena</span>
                <span style={styles.gridValue}>
                  {inspectedBooking.date} | <strong>{courts.find(c => c.id === inspectedBooking.courtId)?.name}</strong>
                </span>
              </div>
              <div style={styles.gridLine}>
                <span style={styles.gridLabel}>Time Slots</span>
                <span style={styles.gridValue}>{inspectedBooking.slots.join(', ')}</span>
              </div>
              <div style={styles.gridLine}>
                <span style={styles.gridLabel}>Equipment Rented</span>
                <span style={styles.gridValue}>
                  {[
                    inspectedBooking.addons.paddles > 0 ? `${inspectedBooking.addons.paddles} Paddles` : '',
                    inspectedBooking.addons.shoes > 0 ? `${inspectedBooking.addons.shoes} Pairs Shoes` : '',
                    inspectedBooking.addons.balls ? '1 Can Balls' : ''
                  ].filter(Boolean).join(', ') || 'No rentals'}
                </span>
              </div>
              <div style={styles.gridLine}>
                <span style={styles.gridLabel}>Total Bill</span>
                <span style={{ ...styles.gridValue, color: 'var(--accent-neon)', fontWeight: 800 }}>
                  ₱{inspectedBooking.rates.total.toFixed(2)}
                </span>
              </div>
              {inspectedBooking.notes && (
                <div style={{ ...styles.gridLine, borderBottom: 'none' }}>
                  <span style={styles.gridLabel}>Remarks</span>
                  <span style={{ ...styles.gridValue, fontSize: '0.75rem', fontStyle: 'italic' }}>
                    {inspectedBooking.notes}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Actions Panel */}
            <h5 style={styles.actionsPanelHeader}>Cashier Action Triggers</h5>
            <div style={styles.actionsGrid}>
              
              {inspectedBooking.status === 'Pending' && (
                <button 
                  onClick={() => handleStatusUpdate('Paid')}
                  className="btn btn-primary" 
                  style={{ ...styles.actionBtn, background: '#10b981', color: '#fff', boxShadow: 'none' }}
                >
                  <DollarSign size={14} /> Accept Payment
                </button>
              )}

              {inspectedBooking.status === 'Paid' && (
                <button 
                  onClick={() => handleStatusUpdate('Checked-In')}
                  className="btn btn-primary" 
                  style={{ ...styles.actionBtn, background: '#00f0ff', color: '#090a0f', boxShadow: 'none' }}
                >
                  <Play size={14} /> Check In Players
                </button>
              )}

              {inspectedBooking.status === 'Checked-In' && (
                <button 
                  onClick={() => handleStatusUpdate('Completed')}
                  className="btn btn-primary" 
                  style={{ ...styles.actionBtn, background: '#c084fc', color: '#fff', boxShadow: 'none' }}
                >
                  <Check size={14} /> Mark Completed
                </button>
              )}

              {/* Cancellation button deleted in compliance with strict No-Refund & No-Cancellation policy */}

            </div>
          </div>
        )}
      </Modal>

      {/* CSS Injection for timeline free hover effect */}
      <style dangerouslySetInnerHTML={{__html: `
        .timeline-free-slot {
          opacity: 0.15;
          transition: all 0.25s;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          border-radius: 4px;
        }
        .timeline-free-slot:hover {
          opacity: 1;
          background: rgba(204, 255, 0, 0.08);
          border: 1px dashed rgba(204, 255, 0, 0.4);
          color: #ccff00;
        }
      `}} />
    </div>
  );
}

const styles = {
  container: {
    padding: '1.25rem 0 2rem 0',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  timelineTitle: {
    fontSize: '1.15rem',
    fontWeight: 700,
  },
  timelineSubtitle: {
    fontSize: '0.75rem',
    color: '#cbd5e1',
    marginTop: '0.15rem',
  },
  dateSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(22, 27, 42, 0.6)',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  dateInput: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '0.85rem',
    outline: 'none',
  },
  timelineCard: {
    padding: '1rem',
    background: 'rgba(22, 27, 42, 0.35)',
  },
  scrollWrapper: {
    overflowX: 'auto',
    width: '100%',
  },
  table: {
    width: '100%',
    minWidth: '1200px',
    borderCollapse: 'separate',
    borderSpacing: '4px 6px',
  },
  thCourt: {
    fontSize: '0.75rem',
    color: '#cbd5e1',
    textAlign: 'left',
    padding: '0.5rem',
    fontWeight: 700,
    background: 'rgba(9,10,15,0.4)',
    borderRadius: '4px',
    width: '120px',
    letterSpacing: '0.04em',
  },
  thHour: {
    fontSize: '0.7rem',
    color: '#cbd5e1',
    fontWeight: 700,
    padding: '0.5rem 0.25rem',
    background: 'rgba(9,10,15,0.3)',
    borderRadius: '4px',
    textAlign: 'center',
  },
  hourRangeSub: {
    display: 'block',
    fontSize: '0.55rem',
    color: '#64748b',
    fontWeight: 500,
    marginTop: '2px',
  },
  tr: {
    height: '52px',
  },
  tdCourt: {
    background: 'rgba(9,10,15,0.4)',
    borderRadius: '6px',
    paddingLeft: '0.75rem',
    fontSize: '0.8rem',
    fontWeight: 700,
    verticalAlign: 'middle',
    color: '#fff',
  },
  courtTypeSub: {
    display: 'block',
    fontSize: '0.6rem',
    color: '#64748b',
    fontWeight: 500,
    textTransform: 'uppercase',
  },
  tdHourCell: {
    background: 'rgba(9, 10, 15, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.02)',
    borderRadius: '6px',
    cursor: 'pointer',
    padding: '2px',
    position: 'relative',
    transition: 'all 0.2s',
  },
  bookingBlock: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingLeft: '0.5rem',
    borderRadius: '5px',
    transition: 'transform 0.15s',
  },
  bookingBlockName: {
    fontSize: '0.75rem',
    fontWeight: 750,
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '85px',
  },
  bookingBlockCode: {
    fontSize: '0.55rem',
    opacity: 0.75,
    fontFamily: 'monospace',
  },
  freeSlot: {
    color: '#475569',
  },
  plusSign: {
    fontSize: '0.9rem',
    fontWeight: 700,
  },
  freeText: {
    fontSize: '0.55rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginTop: '-2px',
  },
  inspectedWrapper: {
    padding: '0.25rem 0',
  },
  inspectedHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    paddingBottom: '1rem',
    marginBottom: '1.25rem',
  },
  inspectedId: {
    fontSize: '0.7rem',
    fontFamily: 'monospace',
    color: '#64748b',
    fontWeight: 700,
  },
  inspectedName: {
    fontSize: '1.15rem',
    fontWeight: 750,
    color: '#fff',
    marginTop: '0.15rem',
  },
  inspectedEmail: {
    fontSize: '0.75rem',
    color: '#cbd5e1',
    marginTop: '0.1rem',
  },
  inspectedGrid: {
    padding: '1.25rem',
    background: 'rgba(9, 10, 15, 0.45)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  gridLine: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
    paddingBottom: '0.5rem',
  },
  gridLabel: {
    color: '#64748b',
    fontWeight: 500,
  },
  gridValue: {
    color: '#fff',
    fontWeight: 600,
    textAlign: 'right',
  },
  actionsPanelHeader: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'var(--accent-neon)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginTop: '1.5rem',
    marginBottom: '0.75rem',
  },
  actionsGrid: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  actionBtn: {
    flex: 1,
    minWidth: '150px',
    padding: '0.65rem',
    fontSize: '0.8rem',
  }
};

import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import Badge from '../components/Badge';
import { Search, Calendar, Filter, Eye, DollarSign, Play, Check, X, ShieldAlert } from 'lucide-react';
import Modal from '../components/Modal';

export default function BookingList() {
  const { bookings, courts, updateBookingStatus } = useBooking();
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourtFilter, setSelectedCourtFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState('all'); // 'all', 'today', 'tomorrow'
  
  // Detail inspector modal
  const [inspectedBooking, setInspectedBooking] = useState(null);

  // Status handlers
  const handleAction = (id, action) => {
    updateBookingStatus(id, action);
    if (inspectedBooking && inspectedBooking.id === id) {
      // Keep inspector in sync
      setInspectedBooking({
        ...inspectedBooking,
        status: action,
        paymentStatus: (action === 'Paid' || action === 'Checked-In' || action === 'Completed') ? 'Paid' : inspectedBooking.paymentStatus
      });
    }
  };

  const getCourtName = (courtId) => {
    const court = courts.find(c => c.id === courtId);
    return court ? court.name : 'Unknown';
  };

  const getRelativeDateString = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  // Filter logic
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourt = selectedCourtFilter === 'all' || b.courtId === selectedCourtFilter;
    const matchesStatus = selectedStatusFilter === 'all' || b.status === selectedStatusFilter;
    
    let matchesDate = true;
    if (selectedDateFilter === 'today') {
      matchesDate = b.date === getRelativeDateString(0);
    } else if (selectedDateFilter === 'tomorrow') {
      matchesDate = b.date === getRelativeDateString(1);
    }

    return matchesSearch && matchesCourt && matchesStatus && matchesDate;
  });

  return (
    <div className="animate-fade-in" style={styles.container}>
      
      {/* Search & Filter Header Panel */}
      <div className="glass-card" style={styles.filterPanel}>
        <div style={styles.searchRow}>
          <div style={styles.inputWrapper}>
            <Search size={16} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by customer name, email or booking code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        <div style={styles.filtersWrapper}>
          <div style={styles.filterGroup}>
            <Filter size={12} color="#64748b" />
            <span style={styles.filterLabel}>Court:</span>
            <select 
              value={selectedCourtFilter} 
              onChange={(e) => setSelectedCourtFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Courts</option>
              {courts.map(c => <option key={c.id} value={c.id}>{c.name.replace('Championship ', '').replace('Grandstand ', '')}</option>)}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <Calendar size={12} color="#64748b" />
            <span style={styles.filterLabel}>Date:</span>
            <select 
              value={selectedDateFilter} 
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Dates</option>
              <option value="today">Today Only</option>
              <option value="tomorrow">Tomorrow Only</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <ShieldAlert size={12} color="#64748b" />
            <span style={styles.filterLabel}>Status:</span>
            <select 
              value={selectedStatusFilter} 
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending Payment</option>
              <option value="Paid">Reserved</option>
              <option value="Checked-In">Checked In</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <span style={styles.resultsCount}>{filteredBookings.length} bookings matching</span>
        </div>
      </div>

      {/* Booking Table Grid */}
      <div className="glass-card" style={styles.tableCard}>
        <div style={styles.scrollWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeadRow}>
                <th style={styles.th}>CODE</th>
                <th style={styles.th}>CUSTOMER</th>
                <th style={styles.th}>COURT</th>
                <th style={styles.th}>DATE</th>
                <th style={styles.th}>TIMESLOTS</th>
                <th style={styles.th}>BILL</th>
                <th style={styles.th}>STATUS</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} style={styles.tdEmpty}>
                    No bookings match your current filter parameters. Clear queries to view all listings.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} style={styles.tr}>
                    <td style={{ ...styles.td, fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-neon)' }}>
                      {b.id}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.clientName}>{b.customerName}</span>
                      <span style={styles.clientSub}>{b.customerPhone}</span>
                    </td>
                    <td style={{ ...styles.td, fontWeight: 500 }}>
                      {getCourtName(b.courtId).replace('Championship ', '').replace('Grandstand ', '')}
                    </td>
                    <td style={styles.td}>{b.date}</td>
                    <td style={{ ...styles.td, fontSize: '0.75rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {b.slots.join(', ')}
                    </td>
                    <td style={{ ...styles.td, fontWeight: 700 }}>
                      ₱{b.rates.total.toFixed(2)}
                    </td>
                    <td style={styles.td}>
                      <Badge status={b.status} />
                    </td>
                    <td style={styles.tdActions}>
                      <div style={styles.actionRow}>
                        <button 
                          onClick={() => setInspectedBooking(b)} 
                          style={styles.iconActionBtn}
                          className="btn btn-secondary btn-sm"
                          title="View Details"
                        >
                          <Eye size={12} />
                        </button>

                        {b.status === 'Pending' && (
                          <button 
                            onClick={() => handleAction(b.id, 'Paid')} 
                            style={{ ...styles.iconActionBtn, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}
                            className="btn btn-secondary btn-sm"
                            title="Mark Paid"
                          >
                            <DollarSign size={12} />
                          </button>
                        )}

                        {b.status === 'Paid' && (
                          <button 
                            onClick={() => handleAction(b.id, 'Checked-In')} 
                            style={{ ...styles.iconActionBtn, color: '#00f0ff', background: 'rgba(0, 240, 255, 0.1)' }}
                            className="btn btn-secondary btn-sm"
                            title="Check In Players"
                          >
                            <Play size={12} />
                          </button>
                        )}

                        {b.status === 'Checked-In' && (
                          <button 
                            onClick={() => handleAction(b.id, 'Completed')} 
                            style={{ ...styles.iconActionBtn, color: '#c084fc', background: 'rgba(192, 132, 252, 0.1)' }}
                            className="btn btn-secondary btn-sm"
                            title="Mark Completed"
                          >
                            <Check size={12} />
                          </button>
                        )}

                        {/* Cancellation button untracked in compliance with strict No-Refund & No-Cancellation policy */}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL RECORD INSPECTOR MODAL */}
      <Modal
        isOpen={!!inspectedBooking}
        onClose={() => setInspectedBooking(null)}
        title="Staff Receipt Audit"
        maxWidth="500px"
      >
        {inspectedBooking && (
          <div style={styles.inspectedOuter}>
            <div style={styles.inspectedGrid} className="glass-card">
              <div style={styles.metaBox}>
                <span style={styles.metaLabel}>AUDIT ID: {inspectedBooking.id}</span>
                <span style={styles.metaDate}>Created: {new Date(inspectedBooking.createdAt).toLocaleString()}</span>
              </div>

              <div style={styles.infoLine}>
                <span>Customer Name:</span>
                <strong>{inspectedBooking.customerName}</strong>
              </div>
              <div style={styles.infoLine}>
                <span>Contact Channels:</span>
                <strong>{inspectedBooking.customerPhone} ({inspectedBooking.customerEmail})</strong>
              </div>
              <div style={styles.infoLine}>
                <span>Court Rental:</span>
                <strong>{getCourtName(inspectedBooking.courtId)}</strong>
              </div>
              <div style={styles.infoLine}>
                <span>Target Date:</span>
                <strong>{inspectedBooking.date}</strong>
              </div>
              <div style={styles.infoLine}>
                <span>Reserved Slots:</span>
                <strong>{inspectedBooking.slots.join(', ')}</strong>
              </div>
              <div style={styles.infoLine}>
                <span>Equipment Rentals:</span>
                <strong>
                  {`Paddles: ${inspectedBooking.addons.paddles} | Pairs Shoes: ${inspectedBooking.addons.shoes} | Balls Can: ${inspectedBooking.addons.balls ? 'Yes' : 'No'}`}
                </strong>
              </div>
              <div style={styles.infoLine}>
                <span>Method / Payment Status:</span>
                <strong style={{ color: inspectedBooking.paymentStatus === 'Paid' ? '#10b981' : '#fbbf24' }}>
                  {inspectedBooking.paymentMethod} ({inspectedBooking.paymentStatus})
                </strong>
              </div>
            </div>

            <div className="glass-card" style={styles.receiptBreakdown}>
              <h5 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem' }}>Financial Breakdown</h5>
              <div style={styles.receiptLine}>
                <span>Base Court Hours:</span>
                <span>₱{inspectedBooking.rates.basePrice.toFixed(2)}</span>
              </div>
              {inspectedBooking.rates.peakSurcharge > 0 && (
                <div style={styles.receiptLine}>
                  <span>Peak Hours Surcharge:</span>
                  <span>+₱{inspectedBooking.rates.peakSurcharge.toFixed(2)}</span>
                </div>
              )}
              {inspectedBooking.rates.addonsCost > 0 && (
                <div style={styles.receiptLine}>
                  <span>Gear Rentals Surcharge:</span>
                  <span>+₱{inspectedBooking.rates.addonsCost.toFixed(2)}</span>
                </div>
              )}

              <div style={styles.totalLine}>
                <span>Gross Bill:</span>
                <span style={{ color: 'var(--accent-neon)', fontSize: '1.1rem' }}>
                  ₱{inspectedBooking.rates.total.toFixed(2)}
                </span>
              </div>
            </div>

            {inspectedBooking.notes && (
              <div className="glass-card" style={styles.remarksBox}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b' }}>STAFF REMARKS / CUSTOMER NOTES:</span>
                <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.15rem' }}>"{inspectedBooking.notes}"</p>
              </div>
            )}

            {/* In-dialog audit triggers */}
            <div style={styles.dialogActionsRow}>
              {inspectedBooking.status === 'Pending' && (
                <button 
                  onClick={() => handleAction(inspectedBooking.id, 'Paid')} 
                  className="btn btn-primary"
                  style={{ background: '#10b981', color: '#fff', flex: 1, boxShadow: 'none' }}
                >
                  Mark Paid
                </button>
              )}
              {inspectedBooking.status === 'Paid' && (
                <button 
                  onClick={() => handleAction(inspectedBooking.id, 'Checked-In')} 
                  className="btn btn-primary"
                  style={{ background: '#00f0ff', color: '#090a0f', flex: 1, boxShadow: 'none' }}
                >
                  Check In Players
                </button>
              )}
              {inspectedBooking.status === 'Checked-In' && (
                <button 
                  onClick={() => handleAction(inspectedBooking.id, 'Completed')} 
                  className="btn btn-primary"
                  style={{ background: '#c084fc', color: '#fff', flex: 1, boxShadow: 'none' }}
                >
                  Mark Completed
                </button>
              )}
              {/* Cancellation button untracked in compliance with strict No-Refund & No-Cancellation policy */}
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}

const styles = {
  container: {
    padding: '1.25rem 0 2rem 0',
  },
  filterPanel: {
    padding: '1.25rem',
    background: 'rgba(22, 27, 42, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    marginBottom: '1.5rem',
  },
  searchRow: {
    marginBottom: '1rem',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: '#64748b',
  },
  searchInput: {
    width: '100%',
    background: 'rgba(9, 10, 15, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#fff',
    padding: '0.65rem 1rem 0.65rem 2.25rem',
    fontSize: '0.85rem',
    outline: 'none',
    transition: 'all 0.2s',
  },
  filtersWrapper: {
    display: 'flex',
    gap: '1.25rem',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'rgba(9,10,15,0.3)',
    padding: '0.35rem 0.65rem',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.04)',
  },
  filterLabel: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    fontWeight: 500,
  },
  filterSelect: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '0.75rem',
    outline: 'none',
    cursor: 'pointer',
    fontWeight: 600,
  },
  resultsCount: {
    marginLeft: 'auto',
    fontSize: '0.7rem',
    color: '#64748b',
    fontWeight: 500,
  },
  tableCard: {
    padding: '0.75rem',
    background: 'rgba(22, 27, 42, 0.25)',
  },
  scrollWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeadRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  th: {
    padding: '0.85rem 1rem',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#94a3b8',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    transition: 'all 0.2s',
  },
  td: {
    padding: '0.85rem 1rem',
    fontSize: '0.8rem',
    verticalAlign: 'middle',
    color: '#cbd5e1',
  },
  tdEmpty: {
    padding: '3rem',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '0.85rem',
  },
  clientName: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#fff',
  },
  clientSub: {
    display: 'block',
    fontSize: '0.7rem',
    color: '#64748b',
  },
  tdActions: {
    padding: '0.85rem 1rem',
    verticalAlign: 'middle',
  },
  actionRow: {
    display: 'flex',
    gap: '0.4rem',
    justifyContent: 'center',
  },
  iconActionBtn: {
    padding: '0.4rem',
    aspectRatio: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    border: 'none',
  },
  inspectedOuter: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  inspectedGrid: {
    padding: '1.25rem',
    background: 'rgba(9, 10, 15, 0.45)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  metaBox: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.65rem',
    color: '#64748b',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    paddingBottom: '0.5rem',
    marginBottom: '0.25rem',
    fontWeight: 600,
  },
  infoLine: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    color: '#94a3b8',
    borderBottom: '1px solid rgba(255,255,255,0.02)',
    paddingBottom: '0.35rem',
  },
  receiptBreakdown: {
    padding: '1.25rem',
    background: 'rgba(9, 10, 15, 0.3)',
  },
  receiptLine: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: '#cbd5e1',
    marginBottom: '0.35rem',
  },
  totalLine: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    paddingTop: '0.5rem',
    marginTop: '0.5rem',
    fontSize: '0.85rem',
    fontWeight: 750,
  },
  remarksBox: {
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  dialogActionsRow: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.5rem',
  }
};

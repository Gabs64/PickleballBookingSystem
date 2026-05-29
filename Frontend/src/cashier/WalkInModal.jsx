import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { X, CalendarDays, Clock, User, Phone, DollarSign, Tag, CheckSquare } from 'lucide-react';

export default function WalkInModal({ isOpen, onClose, prefilledCourtId = '', prefilledSlot = '' }) {
  const { courts, operatingHours, checkAvailability, addBooking, getRelativeDateString } = useBooking();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [courtId, setCourtId] = useState(prefilledCourtId || 'court-1');
  const [bookingDate, setBookingDate] = useState(getRelativeDateString(0));
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [bookingStatus, setBookingStatus] = useState('Checked-In'); // Walk-ins usually checked-in immediately
  const [addons, setAddons] = useState({ paddles: 0, balls: false, shoes: 0 });
  const [validationError, setValidationError] = useState('');

  // Sync prefilled fields on open
  useEffect(() => {
    if (isOpen) {
      if (prefilledCourtId) setCourtId(prefilledCourtId);
      if (prefilledSlot) {
        setSelectedSlots([prefilledSlot]);
      } else {
        setSelectedSlots([]);
      }
      setValidationError('');
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setAddons({ paddles: 0, balls: false, shoes: 0 });
      setBookingStatus('Checked-In');
      setPaymentStatus('Paid');
      setPaymentMethod('Cash');
    }
  }, [isOpen, prefilledCourtId, prefilledSlot]);

  if (!isOpen) return null;

  const handleSlotToggle = (slot) => {
    setValidationError('');
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter((s) => s !== slot));
    } else {
      setSelectedSlots([...selectedSlots, slot].sort());
    }
  };

  const handleWalkinSubmit = (e) => {
    e.preventDefault();
    if (!customerName) {
      setValidationError('Customer name is required.');
      return;
    }
    if (selectedSlots.length === 0) {
      setValidationError('Please select at least one hour slot.');
      return;
    }

    // Default email if cashier skips it
    const emailToUse = customerEmail.trim() || `${customerName.toLowerCase().replace(/\s+/g, '')}@walkin.com`;

    const bookingPayload = {
      customerName,
      customerEmail: emailToUse,
      customerPhone: customerPhone || 'Walk-In No Phone',
      courtId,
      date: bookingDate,
      slots: selectedSlots,
      addons,
      paymentMethod,
      paymentStatus,
      status: bookingStatus,
      notes: '[Walk-in Manual]'
    };

    const result = addBooking(bookingPayload);
    if (result.success) {
      onClose();
    } else {
      setValidationError(result.message);
    }
  };

  const activeCourt = courts.find(c => c.id === courtId);

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div 
        className="glass-card animate-fade-in" 
        style={styles.drawerContainer} 
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.header}>
          <div>
            <h3 style={styles.title}>New Walk-In Booking</h3>
            <p style={styles.subtitle}>Directly reserve a slot from the cashier reception desk.</p>
          </div>
          <button onClick={onClose} style={styles.closeBtn} className="btn btn-icon btn-secondary">
            <X size={16} />
          </button>
        </div>

        {validationError && (
          <div style={styles.errorBanner}>
            <span>⚠️ {validationError}</span>
          </div>
        )}

        <form onSubmit={handleWalkinSubmit} style={styles.form}>
          <div style={styles.scrollableContent}>
            
            {/* Step: Customer Info */}
            <h4 style={styles.sectionHeader}><User size={14} /> Customer Details</h4>
            <div style={styles.formRow2}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Full Name <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 0917-000-0000"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email (Optional - for ticket lookups)</label>
              <input
                type="email"
                placeholder="e.g. john@doe.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="form-control"
              />
            </div>

            {/* Step: Court & Date */}
            <h4 style={styles.sectionHeader}><CalendarDays size={14} /> Arena & Date</h4>
            <div style={styles.formRow2}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Pick Court</label>
                <select
                  value={courtId}
                  onChange={(e) => setCourtId(e.target.value)}
                  className="form-control"
                  style={styles.selectInput}
                >
                  {courts.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Select Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="form-control"
                  style={styles.dateInput}
                />
              </div>
            </div>

            {/* Step: Slots picker */}
            <h4 style={styles.sectionHeader}><Clock size={14} /> Select Time Slots</h4>
            <div style={styles.slotsWrapper}>
              {operatingHours.map(slot => {
                const isSelected = selectedSlots.includes(slot);
                const isReserved = !checkAvailability(courtId, bookingDate, [slot]).available;

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={isReserved}
                    onClick={() => handleSlotToggle(slot)}
                    style={{
                      ...styles.slotButton,
                      ...(isSelected ? styles.slotSelected : {}),
                      ...(isReserved ? styles.slotReserved : {})
                    }}
                  >
                    <span style={styles.slotText}>{slot}</span>
                    <span style={styles.slotStatus}>
                      {isReserved ? 'Booked' : isSelected ? 'Selected' : 'Free'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Step: Gear Addons */}
            <h4 style={styles.sectionHeader}><CheckSquare size={14} /> Rental Gear Add-ons</h4>
            <div style={styles.formRow3}>
              <div className="form-group">
                <label className="form-label">Paddles</label>
                <select 
                  value={addons.paddles}
                  onChange={(e) => setAddons({ ...addons, paddles: parseInt(e.target.value, 10) })}
                  className="form-control"
                  style={styles.selectInput}
                >
                  {[0,1,2,3,4,5,6].map(v => <option key={v} value={v}>{v} Paddles</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Pro Shoes</label>
                <select 
                  value={addons.shoes}
                  onChange={(e) => setAddons({ ...addons, shoes: parseInt(e.target.value, 10) })}
                  className="form-control"
                  style={styles.selectInput}
                >
                  {[0,1,2,3,4,5,6].map(v => <option key={v} value={v}>{v} Pairs</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Balls Can</label>
                <select 
                  value={addons.balls ? 'yes' : 'no'}
                  onChange={(e) => setAddons({ ...addons, balls: e.target.value === 'yes' })}
                  className="form-control"
                  style={styles.selectInput}
                >
                  <option value="no">No</option>
                  <option value="yes">Yes (Flat ₱150)</option>
                </select>
              </div>
            </div>

            {/* Step: Payment & Initial Status */}
            <h4 style={styles.sectionHeader}><DollarSign size={14} /> Payment & Status</h4>
            <div style={styles.formRow3}>
              <div className="form-group">
                <label className="form-label">Method</label>
                <select 
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="form-control"
                  style={styles.selectInput}
                >
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Card</option>
                  <option value="GCash">GCash</option>
                  <option value="Maya">Maya</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Payment Status</label>
                <select 
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="form-control"
                  style={styles.selectInput}
                >
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Game Status</label>
                <select 
                  value={bookingStatus}
                  onChange={(e) => {
                    setBookingStatus(e.target.value);
                    if (e.target.value === 'Checked-In' || e.target.value === 'Completed') {
                      setPaymentStatus('Paid');
                    }
                  }}
                  className="form-control"
                  style={styles.selectInput}
                >
                  <option value="Paid">Reserved</option>
                  <option value="Checked-In">Checked In</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>


          </div>

          <div style={styles.footerRow}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
              Register & Reserve Court
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 6, 10, 0.75)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    justifyContent: 'flex-end', // Slides in from right like drawer
    zIndex: 1000,
  },
  drawerContainer: {
    width: '100%',
    maxWidth: '460px',
    height: '100vh',
    borderRadius: '16px 0 0 16px',
    border: 'none',
    borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
    background: '#121624',
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-10px 0 40px rgba(0,0,0,0.6)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    paddingBottom: '0.75rem',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: 750,
  },
  subtitle: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '0.15rem',
  },
  closeBtn: {
    padding: '0.35rem',
    borderRadius: '6px',
  },
  errorBanner: {
    background: 'rgba(244, 63, 94, 0.08)',
    border: '1px solid rgba(244, 63, 94, 0.2)',
    padding: '0.6rem 0.85rem',
    borderRadius: '6px',
    color: '#fb7171',
    fontSize: '0.8rem',
    marginBottom: '1rem',
  },
  form: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0, // critical for nested flex scroll
  },
  scrollableContent: {
    flex: 1,
    overflowY: 'auto',
    paddingRight: '6px',
    marginBottom: '1.25rem',
  },
  sectionHeader: {
    fontSize: '0.8rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: 'var(--accent-neon)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    paddingBottom: '0.25rem',
    marginBottom: '0.75rem',
    marginTop: '1.25rem',
    letterSpacing: '0.04em',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  formRow2: {
    display: 'flex',
    gap: '0.75rem',
  },
  formRow3: {
    display: 'flex',
    gap: '0.5rem',
  },
  selectInput: {
    background: 'rgba(9, 10, 15, 0.7)',
    fontSize: '0.85rem',
    height: '38px',
    padding: '0.25rem 0.5rem',
  },
  dateInput: {
    fontSize: '0.85rem',
    height: '38px',
  },
  slotsWrapper: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  slotButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.4rem 0.2rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '6px',
    color: '#cbd5e1',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  slotSelected: {
    background: 'rgba(204, 255, 0, 0.1)',
    border: '1px solid var(--accent-neon)',
    color: '#ccff00',
  },
  slotReserved: {
    background: 'rgba(244, 63, 94, 0.05)',
    border: '1px solid rgba(244, 63, 94, 0.15)',
    color: '#64748b',
    cursor: 'not-allowed',
    opacity: 0.55,
  },
  slotText: {
    fontSize: '0.7rem',
    fontWeight: 600,
  },
  slotStatus: {
    fontSize: '0.55rem',
    opacity: 0.7,
    marginTop: '1px',
  },
  footerRow: {
    display: 'flex',
    gap: '0.75rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    paddingTop: '1rem',
    marginTop: 'auto',
  }
};

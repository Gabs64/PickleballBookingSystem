import React, { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext();

// 1. Predefined Courts Metadata
export const COURTS = [
  {
    id: 'court-1',
    name: 'Court 1',
    type: 'Indoor Pro',
    pricePerHour: 450,
    peakPricePerHour: 450,
    features: ['Professional Cushion Surface', 'Air Conditioning', 'Spectator Seating (30)', 'High-Luminance LED Lights'],
    color: '#ccff00',
    bgGradient: 'linear-gradient(135deg, rgba(204, 255, 0, 0.15) 0%, rgba(14, 17, 26, 0.4) 100%)'
  },
  {
    id: 'court-2',
    name: 'Court 2',
    type: 'Indoor Pro',
    pricePerHour: 450,
    peakPricePerHour: 450,
    features: ['Professional Cushion Surface', 'Air Conditioning', 'Coaches Bench', 'High-Luminance LED Lights'],
    color: '#00f0ff',
    bgGradient: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(14, 17, 26, 0.4) 100%)'
  },
  {
    id: 'court-3',
    name: 'Court 3',
    type: 'Outdoor Premium',
    pricePerHour: 450,
    peakPricePerHour: 450,
    features: ['Premium Acrylic Finish', 'Professional Net System', 'Heavy Windbreakers', 'Shaded Player Benches'],
    color: '#a855f7',
    bgGradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(14, 17, 26, 0.4) 100%)'
  }
];

// Operating Hours: 06:00 to 22:00 (6:00 AM - 10:00 PM)
export const OPERATING_HOURS = [
  '06:00 - 07:00', '07:00 - 08:00', '08:00 - 09:00', '09:00 - 10:00',
  '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00',
  '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00',
  '18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00', '21:00 - 22:00'
];

// Peak Hours definition: 5:00 PM onwards (starting slot '17:00 - 18:00')
export const isPeakSlot = (slotString) => {
  const startHour = parseInt(slotString.split(':')[0], 10);
  return startHour >= 17; // 5 PM or later
};

// Gear Rental Rates in PHP
export const GEAR_RATES = {
  paddle: 50.0,  // Per hour
  balls: 150.0,  // Flat rate for can of 3
  shoes: 100.0   // Flat rate per booking
};

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('customer'); // developer switcher: 'customer' or 'cashier'

  // Generate Date strings relative to today
  const getRelativeDateString = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  // 2. Pre-populate mock bookings on first run
  useEffect(() => {
    const storedBookings = localStorage.getItem('pickleball_bookings');
    if (storedBookings) {
      setBookings(JSON.parse(storedBookings));
    } else {
      const today = getRelativeDateString(0);
      const tomorrow = getRelativeDateString(1);
      const yesterday = getRelativeDateString(-1);

      const defaultMockBookings = [
        {
          id: 'BK-9482',
          customerName: 'Jane Smith',
          customerEmail: 'jane.smith@gmail.com',
          customerPhone: '0917-888-2938',
          courtId: 'court-1',
          date: today,
          slots: ['08:00 - 09:00', '09:00 - 10:00'],
          addons: { paddles: 2, balls: true, shoes: 0 },
          paymentMethod: 'GCash',
          paymentStatus: 'Paid',
          status: 'Checked-In',
          notes: 'Prefer indoor court temperature set cool.',
          rates: {
            basePrice: 900, // 2 hrs * 450
            peakSurcharge: 0,
            addonsCost: 350, // paddles: 2 * 2 * 50 = 200, balls flat: 150 = 350
            subtotal: 1250,
            tax: 0,
            total: 1250
          },
          createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
        },
        {
          id: 'BK-5821',
          customerName: 'John Doe',
          customerEmail: 'john.doe@yahoo.com',
          customerPhone: '0922-384-5922',
          courtId: 'court-2',
          date: today,
          slots: ['10:00 - 11:00'],
          addons: { paddles: 0, balls: false, shoes: 0 },
          paymentMethod: 'Credit Card',
          paymentStatus: 'Paid',
          status: 'Completed',
          notes: 'First time playing.',
          rates: {
            basePrice: 450,
            peakSurcharge: 0,
            addonsCost: 0,
            subtotal: 450,
            tax: 0,
            total: 450
          },
          createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
        },
        {
          id: 'BK-7312',
          customerName: 'Marcus Aurelius',
          customerEmail: 'philosopher@rome.com',
          customerPhone: '0905-123-4567',
          courtId: 'court-1',
          date: today,
          slots: ['18:00 - 19:00', '19:00 - 20:00'],
          addons: { paddles: 4, balls: true, shoes: 2 },
          paymentMethod: 'Credit Card',
          paymentStatus: 'Paid',
          status: 'Paid',
          notes: 'Corporate team building practice.',
          rates: {
            basePrice: 900,
            peakSurcharge: 0,
            addonsCost: 750, // paddles: 4 * 2 * 50 = 400, balls: 150, shoes: 2 * 100 = 200. Total = 750
            subtotal: 1650,
            tax: 0,
            total: 1650
          },
          createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
        },
        {
          id: 'BK-1049',
          customerName: 'Sarah Connor',
          customerEmail: 'terminator.hunter@gmail.com',
          customerPhone: '0935-777-1234',
          courtId: 'court-3',
          date: today,
          slots: ['14:00 - 15:00', '15:00 - 16:00'],
          addons: { paddles: 1, balls: false, shoes: 0 },
          paymentMethod: 'Unpaid (GCash Requested)',
          paymentStatus: 'Unpaid',
          status: 'Pending',
          notes: 'Will pay upon arrival.',
          rates: {
            basePrice: 900,
            peakSurcharge: 0,
            addonsCost: 100, // 1 paddle * 2 hrs * 50
            subtotal: 1000,
            tax: 0,
            total: 1000
          },
          createdAt: new Date().toISOString()
        },
        {
          id: 'BK-2918',
          customerName: 'Bruce Wayne',
          customerEmail: 'bruce@waynecorp.com',
          customerPhone: '0917-999-9999',
          courtId: 'court-2',
          date: tomorrow,
          slots: ['17:00 - 18:00', '18:00 - 19:00'],
          addons: { paddles: 0, balls: true, shoes: 0 },
          paymentMethod: 'Cash',
          paymentStatus: 'Paid',
          status: 'Paid',
          notes: 'Requires privacy.',
          rates: {
            basePrice: 900,
            peakSurcharge: 0,
            addonsCost: 150, // balls flat
            subtotal: 1050,
            tax: 0,
            total: 1050
          },
          createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
        },
        {
          id: 'BK-4112',
          customerName: 'Tony Stark',
          customerEmail: 'tony@starkindustries.com',
          customerPhone: '0918-300-3000',
          courtId: 'court-2',
          date: yesterday,
          slots: ['19:00 - 20:00', '20:00 - 21:00'],
          addons: { paddles: 2, balls: true, shoes: 2 },
          paymentMethod: 'Credit Card',
          paymentStatus: 'Paid',
          status: 'Completed',
          rates: {
            basePrice: 900,
            peakSurcharge: 0,
            addonsCost: 550, // paddles: 200, balls: 150, shoes: 200
            subtotal: 1450,
            tax: 0,
            total: 1450
          },
          createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
        }
      ];

      setBookings(defaultMockBookings);
      localStorage.setItem('pickleball_bookings', JSON.stringify(defaultMockBookings));
    }
  }, []);

  // Save to LocalStorage whenever bookings change
  const saveBookings = (newBookings) => {
    setBookings(newBookings);
    localStorage.setItem('pickleball_bookings', JSON.stringify(newBookings));
  };

  // --- USER ACCOUNT SYSTEM ---
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const storedUsers = localStorage.getItem('pickleball_users');
    if (storedUsers) {
      // Clean start: Filter out any customer accounts to delete any registered customer emails
      const parsedUsers = JSON.parse(storedUsers);
      const filteredUsers = parsedUsers.filter(u => u.role !== 'Customer');
      setUsers(filteredUsers);
      localStorage.setItem('pickleball_users', JSON.stringify(filteredUsers));
    } else {
      // Initialize with only Admin and Cashier roles (No pre-registered Customer emails)
      const defaultUsers = [
        {
          id: 'USR-001',
          name: 'System Admin',
          email: 'admin@netrally.com',
          phone: '0917-000-0000',
          password: 'adminpassword',
          role: 'Admin',
          status: 'Active',
          verified: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'USR-002',
          name: 'Alliah',
          email: 'cashier@netrally.com',
          phone: '0917-111-2222',
          password: 'cashierpassword',
          role: 'Cashier',
          status: 'Active',
          verified: true,
          createdAt: new Date().toISOString()
        }
      ];
      setUsers(defaultUsers);
      localStorage.setItem('pickleball_users', JSON.stringify(defaultUsers));
    }
  }, []);

  const addUser = (userData) => {
    const existingUser = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existingUser) {
      return { success: false, message: 'An account with this email address already exists.' };
    }

    const newUser = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Active',
      verified: userData.verified !== undefined ? userData.verified : true,
      createdAt: new Date().toISOString(),
      ...userData
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('pickleball_users', JSON.stringify(updatedUsers));
    return { success: true, user: newUser };
  };

  const authenticateUser = (email, password, role) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { success: false, message: 'Invalid email address.' };
    }
    if (user.password !== password) {
      return { success: false, message: 'Invalid password.' };
    }
    if (user.role !== role) {
      return { success: false, message: `Access denied. Account is not registered as a ${role}.` };
    }
    if (role === 'Customer' && user.verified === false) {
      return { success: false, message: 'Access denied. Please verify your email address first.' };
    }
    return { success: true, user };
  };


  // 3. Helper to Check Slot Availability
  const checkAvailability = (courtId, date, requestedSlots) => {
    // Find all bookings for this court and date that are not cancelled
    const activeDayBookings = bookings.filter(
      (b) => b.courtId === courtId && b.date === date && b.status !== 'Cancelled'
    );

    // Create a Set of already booked slots
    const takenSlots = new Set();
    activeDayBookings.forEach((b) => {
      b.slots.forEach((s) => takenSlots.add(s));
    });

    // Check if any requested slot is already taken
    const conflicts = requestedSlots.filter((s) => takenSlots.has(s));
    return {
      available: conflicts.length === 0,
      conflicts
    };
  };

  // 4. Rate Calculation Engine
  const calculateRates = (courtId, slots, addons) => {
    const court = COURTS.find((c) => c.id === courtId);
    if (!court) return null;

    let basePrice = 0;
    let peakSurcharge = 0;
    const hrs = slots.length;

    slots.forEach((slot) => {
      const peak = isPeakSlot(slot);
      if (peak) {
        basePrice += court.peakPricePerHour;
        peakSurcharge += (court.peakPricePerHour - court.pricePerHour);
      } else {
        basePrice += court.pricePerHour;
      }
    });

    // Paddles cost per hour
    const paddlesCost = (addons.paddles || 0) * GEAR_RATES.paddle * hrs;
    // Balls flat fee
    const ballsCost = addons.balls ? GEAR_RATES.balls : 0;
    // Shoes flat fee per pair
    const shoesCost = (addons.shoes || 0) * GEAR_RATES.shoes;
    const addonsCost = paddlesCost + ballsCost + shoesCost;
    const subtotal = basePrice + addonsCost;
    const tax = 0;
    const total = subtotal;

    return {
      basePrice,
      peakSurcharge,
      addonsCost,
      subtotal,
      tax,
      total
    };
  };

  // 5. Booking Creation
  const addBooking = (bookingData) => {
    const { courtId, date, slots, addons } = bookingData;
    
    // Safety check availability
    const { available, conflicts } = checkAvailability(courtId, date, slots);
    if (!available) {
      return {
        success: false,
        message: `Booking conflict! The slot(s) ${conflicts.join(', ')} are already reserved.`
      };
    }

    const rates = calculateRates(courtId, slots, addons);
    const id = `BK-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking = {
      id,
      ...bookingData,
      rates,
      createdAt: new Date().toISOString()
    };

    const updatedBookings = [newBooking, ...bookings];
    saveBookings(updatedBookings);

    return {
      success: true,
      booking: newBooking
    };
  };

  // 6. Update Booking Status
  const updateBookingStatus = (id, newStatus) => {
    const updated = bookings.map((b) => {
      if (b.id === id) {
        let paymentStatus = b.paymentStatus;
        if (newStatus === 'Paid' || newStatus === 'Checked-In' || newStatus === 'Completed') {
          paymentStatus = 'Paid';
        } else if (newStatus === 'Cancelled') {
          paymentStatus = 'Refunded / Cancelled';
        }
        return { ...b, status: newStatus, paymentStatus };
      }
      return b;
    });
    saveBookings(updated);
    return { success: true };
  };

  // 7. Cancel Booking
  const cancelBooking = (id) => {
    return updateBookingStatus(id, 'Cancelled');
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        courts: COURTS,
        operatingHours: OPERATING_HOURS,
        gearRates: GEAR_RATES,
        activeTab,
        setActiveTab,
        checkAvailability,
        calculateRates,
        addBooking,
        updateBookingStatus,
        cancelBooking,
        getRelativeDateString,
        users,
        addUser,
        authenticateUser
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

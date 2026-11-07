import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Hotel,
  Calendar,
  Clock,
  ShieldCheck,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  User,
  Mail,
  Phone,
  FileText,
  Printer,
  ChevronRight,
  Copy
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const BookingFlowPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const stateData = location.state;

  // If accessed directly without room selection, redirect to rooms
  useEffect(() => {
    if (!stateData?.room) {
      navigate('/rooms');
    }
  }, [stateData, navigate]);

  const { room, pricing, checkIn, checkOut, numberOfGuests } = stateData || {};

  // Form states
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [specialRequests, setSpecialRequests] = useState('');

  // Booking lifecycle state: 'form' | 'hold' | 'confirmed'
  const [bookingStep, setBookingStep] = useState('form');
  const [reservation, setReservation] = useState(null);
  const [holdTimeLeft, setHoldTimeLeft] = useState(600); // 10 minutes (600 seconds)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Simulated Payment Method
  const [paymentMethod, setPaymentMethod] = useState('simulated_card');
  const [simulatedCardNumber, setSimulatedCardNumber] = useState('4242 •••• •••• 4242');

  // Idempotency key generated once for this booking session
  const [idempotencyKey] = useState(() => `idem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);

  // Countdown timer for temporary hold
  useEffect(() => {
    let timer;
    if (bookingStep === 'hold' && holdTimeLeft > 0) {
      timer = setInterval(() => {
        setHoldTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setError('Hold has expired. Please select a room again to re-lock inventory.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [bookingStep, holdTimeLeft]);

  // Step 5: Create temporary hold
  const handleCreateHold = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        roomId: room._id,
        checkIn,
        checkOut,
        numberOfGuests: Number(numberOfGuests),
        guestDetails: {
          firstName,
          lastName,
          email,
          phone,
          specialRequests,
        },
        idempotencyKey,
      };

      const res = await api.post('/reservations', payload);
      if (res.success && res.data) {
        setReservation(res.data);
        setBookingStep('hold');
        setHoldTimeLeft(600); // 10 minutes
      }
    } catch (err) {
      setError(err.message || 'Failed to create reservation hold. The room may have just been booked.');
    } finally {
      setLoading(false);
    }
  };

  // Step 8: Confirm reservation with simulated payment
  const handleConfirmBooking = async () => {
    if (!reservation) return;

    setLoading(true);
    setError('');

    try {
      const res = await api.post(`/reservations/${reservation._id}/confirm`, {
        paymentMethod: 'simulated_card',
        idempotencyKey: `pay-${idempotencyKey}`,
      });

      if (res.success && res.data) {
        setReservation(res.data);
        setBookingStep('confirmed');
      }
    } catch (err) {
      setError(err.message || 'Payment simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const copyReference = () => {
    if (reservation?.bookingReference) {
      navigator.clipboard.writeText(reservation.bookingReference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!room) return null;

  return (
    <div className="min-h-screen bg-slate-50/60 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Stepper */}
        <div className="mb-8 flex items-center justify-between max-w-xl mx-auto text-xs font-semibold uppercase tracking-wider text-slate-400">
          <div className={`flex items-center gap-2 ${bookingStep === 'form' ? 'text-purple-600' : 'text-slate-700'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${bookingStep === 'form' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'}`}>
              1
            </span>
            <span>Guest Details</span>
          </div>
          <div className="w-10 h-0.5 bg-slate-200" />
          <div className={`flex items-center gap-2 ${bookingStep === 'hold' ? 'text-purple-600' : bookingStep === 'confirmed' ? 'text-slate-700' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${bookingStep === 'hold' ? 'bg-purple-600 text-white' : bookingStep === 'confirmed' ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-500'}`}>
              2
            </span>
            <span>Review & Pay</span>
          </div>
          <div className="w-10 h-0.5 bg-slate-200" />
          <div className={`flex items-center gap-2 ${bookingStep === 'confirmed' ? 'text-emerald-600 font-bold' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${bookingStep === 'confirmed' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
              3
            </span>
            <span>Confirmed</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STEP 1 & 2: GUEST DETAILS & TEMPORARY HOLD FORM
        ───────────────────────────────────────────────────────────── */}
        {bookingStep === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Guest Details Form */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-7 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-1">
                Guest Contact Details
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Your reservation confirmation and door key access will be delivered to this contact.
              </p>

              <form onSubmit={handleCreateHold} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 0199"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Quiet room, high floor, extra feather pillows, early check-in if available..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:border-purple-500 resize-none"
                  />
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 active:scale-98 text-white font-semibold text-sm rounded-xl shadow-md shadow-purple-200 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <span>Locking Room Inventory...</span>
                    ) : (
                      <>
                        <span>Hold Room & Proceed to Payment</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-center text-slate-400 mt-2">
                    🔒 Places a guaranteed 10-minute hold on this physical room to prevent double booking.
                  </p>
                </div>
              </form>
            </div>

            {/* Right: Stay Summary Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm h-fit">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
                Booking Summary
              </h3>

              <div className="pb-4 border-b border-slate-100">
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                  Room #{room.roomNumber}
                </span>
                <h4 className="text-lg font-bold text-slate-900">
                  {room.roomType?.name} Suite
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Floor {room.floor} • Max {room.roomType?.maxOccupancy} Guests</p>
              </div>

              <div className="py-4 border-b border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Check-In:</span>
                  <span className="font-semibold text-slate-800">{checkIn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Check-Out:</span>
                  <span className="font-semibold text-slate-800">{checkOut}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nights:</span>
                  <span className="font-semibold text-slate-800">{pricing?.numberOfNights} Nights</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Guests:</span>
                  <span className="font-semibold text-slate-800">{numberOfGuests} Guests</span>
                </div>
              </div>

              {/* Itemized Price Breakdown */}
              <div className="py-4 border-b border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Room Rate ({pricing?.numberOfNights} × ${pricing?.nightlyRate?.toFixed(2)})</span>
                  <span>${pricing?.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>State & Hotel Tax (12%)</span>
                  <span>${pricing?.taxAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Booking & Service Fee</span>
                  <span>$0.00 (Free)</span>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-800">Grand Total</span>
                <span className="text-2xl font-extrabold text-purple-600">
                  ${pricing?.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STEP 5-7: 10-MINUTE HOLD ACTIVE & SIMULATED PAYMENT
        ───────────────────────────────────────────────────────────── */}
        {bookingStep === 'hold' && reservation && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Hold Expiry Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-900">
                    Room Inventory Temporarily Locked
                  </h4>
                  <p className="text-xs text-amber-700">
                    Held exclusively for you. Complete payment before the timer expires.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 block">
                  Time Remaining
                </span>
                <span className="text-xl font-black font-mono text-amber-800">
                  {formatTimer(holdTimeLeft)}
                </span>
              </div>
            </div>

            {/* Payment Simulation Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl">
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
                    Simulated Sandbox Payment
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">
                    Complete Your Reservation
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total Due</span>
                  <span className="text-2xl font-black text-slate-900">
                    ${reservation.pricing?.totalAmount?.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Demo Notice */}
              <div className="mb-6 p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 text-purple-800 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  <strong>Safe Assessment Sandbox:</strong> This is a payment simulation. No real credit card details or external gateways are required.
                </span>
              </div>

              {/* Simulated Card Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Select Simulated Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('simulated_card')}
                      className={`p-3 rounded-xl border text-left text-xs flex items-center gap-2.5 transition-all ${
                        paymentMethod === 'simulated_card'
                          ? 'border-purple-600 bg-purple-50 text-purple-700 font-semibold'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-purple-600" />
                      <span>Simulated Credit Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('simulated_upi')}
                      className={`p-3 rounded-xl border text-left text-xs flex items-center gap-2.5 transition-all ${
                        paymentMethod === 'simulated_upi'
                          ? 'border-purple-600 bg-purple-50 text-purple-700 font-semibold'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span>Instant Sandbox Pay</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Demo Card Number
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={simulatedCardNumber}
                      className="w-full bg-white px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono text-slate-700"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        Expires
                      </label>
                      <input
                        type="text"
                        readOnly
                        value="12 / 28"
                        className="w-full bg-white px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        readOnly
                        value="888"
                        className="w-full bg-white px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono text-slate-700"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleConfirmBooking}
                  disabled={loading || holdTimeLeft === 0}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 active:scale-98 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" text="Confirming Transaction & Locks..." />
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Confirm & Pay ${reservation.pricing?.totalAmount?.toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STEP 9-10: CONFIRMED RESERVATION RECEIPT
        ───────────────────────────────────────────────────────────── */}
        {bookingStep === 'confirmed' && reservation && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-xl print:shadow-none print:border-none">
            {/* Header Success Animation */}
            <div className="text-center pb-8 border-b border-slate-100">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm shadow-emerald-200">
                <CheckCircle className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                Reservation Confirmed
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                Thank You for Choosing StayEase!
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Your luxury stay has been permanently locked in our system.
              </p>
            </div>

            {/* Unique Booking Reference Badge */}
            <div className="my-6 p-4 bg-purple-50/70 border border-purple-100 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 block">
                  Official Booking Reference
                </span>
                <span className="text-xl font-black font-mono text-purple-900">
                  {reservation.bookingReference}
                </span>
              </div>
              <button
                onClick={copyReference}
                className="px-3 py-1.5 bg-white border border-purple-200 rounded-xl text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* Itemized Confirmation Details */}
            <div className="grid grid-cols-2 gap-4 py-4 text-xs border-b border-slate-100">
              <div>
                <span className="text-slate-400 block mb-0.5">Guest Name</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {reservation.guestDetails?.firstName} {reservation.guestDetails?.lastName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Contact</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {reservation.guestDetails?.email}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Assigned Physical Room</span>
                <span className="font-semibold text-slate-800 text-sm">
                  Room #{room.roomNumber} (Floor {room.floor})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Room Category</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {room.roomType?.name}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Stay Dates</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {checkIn} → {checkOut} ({reservation.numberOfNights} Nights)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Total Paid (Simulated)</span>
                <span className="font-bold text-slate-900 text-sm">
                  ${reservation.pricing?.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment & Transaction Info */}
            <div className="py-4 text-xs text-slate-500 flex justify-between border-b border-slate-100">
              <span>Payment Ref: <code className="font-mono">{reservation.payment?.transactionId}</code></span>
              <span>Status: <strong className="text-emerald-600 uppercase">Paid</strong></span>
            </div>

            {/* Actions */}
            <div className="pt-8 flex flex-col sm:flex-row gap-3 print:hidden">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 px-4 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Confirmation Receipt</span>
              </button>
              <Link
                to="/my-bookings"
                className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-md shadow-purple-200"
              >
                <span>View My Bookings</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingFlowPage;


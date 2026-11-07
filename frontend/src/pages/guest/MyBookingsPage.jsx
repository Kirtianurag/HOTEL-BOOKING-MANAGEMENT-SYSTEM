import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  FileText,
  DollarSign,
  Hotel
} from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('Change of travel plans');
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reservations/my');
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelClick = (b) => {
    setSelectedBooking(b);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;
    setCancelling(true);
    try {
      const res = await api.post(`/reservations/${selectedBooking._id}/cancel`, {
        reason: cancelReason,
      });
      if (res.success) {
        setCancelModalOpen(false);
        fetchBookings(); // Refresh list
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel reservation');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
              Guest Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
              My Reservations History
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track upcoming arrivals, active stays, and past room reservations.
            </p>
          </div>
          <Link
            to="/rooms"
            className="self-start sm:self-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            + Book Another Room
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-20">
            <LoadingSpinner size="lg" text="Retrieving your reservation history..." />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto border border-slate-100 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Reservations Yet</h3>
            <p className="text-xs text-slate-500 mt-1.5">
              You haven't made any hotel reservations yet. Explore our luxury rooms and book your first stay today.
            </p>
            <Link
              to="/rooms"
              className="mt-6 inline-flex items-center gap-1.5 px-5 py-2.5 bg-purple-600 text-white text-xs font-semibold rounded-xl shadow-sm hover:bg-purple-700 transition-colors"
            >
              <span>Explore Available Rooms</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              const canCancel = ['HOLD', 'CONFIRMED'].includes(b.status);
              const inDate = new Date(b.checkIn).toISOString().split('T')[0];
              const outDate = new Date(b.checkOut).toISOString().split('T')[0];

              return (
                <div
                  key={b._id}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  {/* Left: Booking Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-slate-900">
                        {b.bookingReference}
                      </span>
                      <Badge status={b.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-600">
                      <span className="flex items-center gap-1.5 font-medium text-slate-800">
                        <Hotel className="w-3.5 h-3.5 text-purple-600" />
                        Room #{b.room?.roomNumber} ({b.roomType?.name})
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {inDate} → {outDate} ({b.numberOfNights} Nights)
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-slate-900">
                        ₹{b.pricing?.totalAmount?.toFixed(2)}
                      </span>
                    </div>

                    {b.cancelReason && (
                      <p className="text-[11px] text-rose-600 italic">
                        Cancellation Reason: {b.cancelReason}
                      </p>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2.5">
                    {canCancel && (
                      <button
                        onClick={() => handleCancelClick(b)}
                        className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Cancellation Modal */}
        <Modal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          title="Cancel Reservation"
        >
          {selectedBooking && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Are you sure you want to cancel booking <strong>{selectedBooking.bookingReference}</strong>?
                This will release the room-night inventory locks immediately.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Reason for Cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden"
                >
                  <option value="Change of travel plans">Change of travel plans</option>
                  <option value="Booked by mistake">Booked by mistake</option>
                  <option value="Found a different hotel">Found a different hotel</option>
                  <option value="Travel emergency">Travel emergency</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="flex-1 py-2.5 px-4 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Keep Reservation
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={cancelling}
                  className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default MyBookingsPage;


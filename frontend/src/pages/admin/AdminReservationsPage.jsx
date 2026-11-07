import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Search,
  Filter,
  Eye,
  XCircle,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

const AdminReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchRef, setSearchRef] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Details Modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedRes, setSelectedRes] = useState(null);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter && { status: statusFilter }),
        ...(searchRef && { search: searchRef }),
      });

      const res = await api.get(`/reservations/all?${params.toString()}`);
      if (res.success && res.data) {
        setReservations(res.data.reservations);
        setTotalPages(res.data.pages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReservations();
  };

  const handleCancelReservation = async (resId) => {
    const reason = window.prompt('Enter reason for administrative cancellation:');
    if (!reason) return;

    try {
      const res = await api.post(`/reservations/${resId}/cancel`, { reason });
      if (res.success) {
        setMessage('Reservation cancelled and inventory locks released');
        fetchReservations();
        setDetailsModalOpen(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to cancel reservation');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Master Reservations Roster
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete inventory log of holds, confirmed stays, checked-in guests, and cancellations.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search booking ref..."
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
            />
          </form>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="">All Statuses</option>
            <option value="HOLD">HOLD</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="CHECKED_IN">CHECKED_IN</option>
            <option value="CHECKED_OUT">CHECKED_OUT</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="py-20">
          <LoadingSpinner size="lg" text="Retrieving reservations list..." />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">Booking Ref</th>
                  <th className="py-3 px-6">Guest</th>
                  <th className="py-3 px-6">Room Assigned</th>
                  <th className="py-3 px-6">Check-In</th>
                  <th className="py-3 px-6">Check-Out</th>
                  <th className="py-3 px-6">Total Amount</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservations.map((r) => {
                  const inDate = new Date(r.checkIn).toISOString().split('T')[0];
                  const outDate = new Date(r.checkOut).toISOString().split('T')[0];
                  return (
                    <tr key={r._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-bold text-slate-900">
                        {r.bookingReference}
                      </td>
                      <td className="py-3.5 px-6 font-semibold text-slate-800">
                        {r.guestDetails?.firstName} {r.guestDetails?.lastName}
                        <span className="block text-[11px] font-normal text-slate-400 truncate max-w-[150px]">
                          {r.guestDetails?.email}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-700 font-medium">
                        Room #{r.room?.roomNumber} ({r.roomType?.name})
                      </td>
                      <td className="py-3.5 px-6 text-slate-600">{inDate}</td>
                      <td className="py-3.5 px-6 text-slate-600">{outDate}</td>
                      <td className="py-3.5 px-6 font-bold text-slate-900">
                        ${r.pricing?.totalAmount?.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-6">
                        <Badge status={r.status} />
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => {
                            setSelectedRes(r);
                            setDetailsModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-purple-700 hover:bg-purple-50 rounded-lg font-semibold text-xs transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {reservations.length} of {totalCount} reservations</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-slate-800">Page {page} of {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Reservation Breakdown & Audit"
      >
        {selectedRes && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-600 tracking-wider">
                  Booking Reference
                </span>
                <span className="text-base font-black font-mono text-slate-900 block">
                  {selectedRes.bookingReference}
                </span>
              </div>
              <Badge status={selectedRes.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-white border border-slate-100 rounded-xl">
              <div>
                <span className="text-slate-400 block">Guest</span>
                <span className="font-semibold text-slate-800">
                  {selectedRes.guestDetails?.firstName} {selectedRes.guestDetails?.lastName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Contact</span>
                <span className="font-semibold text-slate-800">{selectedRes.guestDetails?.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Assigned Room</span>
                <span className="font-semibold text-slate-800">
                  Room #{selectedRes.room?.roomNumber} (Floor {selectedRes.room?.floor})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Category</span>
                <span className="font-semibold text-slate-800">{selectedRes.roomType?.name}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({selectedRes.numberOfNights} nights)</span>
                <span>${selectedRes.pricing?.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax Amount (12%)</span>
                <span>${selectedRes.pricing?.taxAmount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>Grand Total</span>
                <span>${selectedRes.pricing?.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            {selectedRes.cancelReason && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700">
                <strong>Cancellation Reason:</strong> {selectedRes.cancelReason}
              </div>
            )}

            <div className="pt-4 flex gap-3">
              {['HOLD', 'CONFIRMED'].includes(selectedRes.status) && (
                <button
                  type="button"
                  onClick={() => handleCancelReservation(selectedRes._id)}
                  className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-xs"
                >
                  Cancel Booking & Release Locks
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminReservationsPage;


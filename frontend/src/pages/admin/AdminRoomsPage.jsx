import React, { useState, useEffect } from 'react';
import {
  DoorOpen,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

const AdminRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Create Room Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [roomNumber, setRoomNumber] = useState('');
  const [roomTypeId, setRoomTypeId] = useState('');
  const [floor, setFloor] = useState(1);
  const [status, setStatus] = useState('available');
  const [submitting, setSubmitting] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/rooms?status=${statusFilter}` : '/rooms';
      const [roomsRes, typesRes] = await Promise.all([
        api.get(url),
        api.get('/room-types'),
      ]);

      if (roomsRes.success) setRooms(roomsRes.data);
      if (typesRes.success) {
        setRoomTypes(typesRes.data);
        if (typesRes.data.length > 0 && !roomTypeId) {
          setRoomTypeId(typesRes.data[0]._id);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [statusFilter]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post('/rooms', {
        roomNumber,
        roomType: roomTypeId,
        floor: Number(floor),
        status,
        amenities: ['WiFi', 'Air Conditioning', 'TV'],
      });

      if (res.success) {
        setMessage(`Room ${roomNumber} created successfully!`);
        setCreateModalOpen(false);
        setRoomNumber('');
        fetchRooms();
      }
    } catch (err) {
      setError(err.message || 'Failed to create room');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      const res = await api.patch(`/rooms/${roomId}/status`, { status: newStatus });
      if (res.success) {
        setMessage('Room operational status updated');
        fetchRooms();
      }
    } catch (err) {
      setError(err.message || 'Failed to update room status');
    }
  };

  const handleDeleteRoom = async (roomId, num) => {
    if (!window.confirm(`Are you sure you want to delete Room #${num}?`)) return;
    try {
      const res = await api.delete(`/rooms/${roomId}`);
      if (res.success) {
        setMessage(`Room #${num} deleted successfully`);
        fetchRooms();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete room (it may have active reservations)');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Room Inventory & Status Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure physical room numbers, operational cleaning/maintenance states, and type mappings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="">All Operational Statuses</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="cleaning">Cleaning</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Physical Room</span>
          </button>
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

      {loading ? (
        <div className="py-20">
          <LoadingSpinner size="lg" text="Loading room inventory..." />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">Room Number</th>
                  <th className="py-3 px-6">Room Type</th>
                  <th className="py-3 px-6">Floor</th>
                  <th className="py-3 px-6">Max Capacity</th>
                  <th className="py-3 px-6">Base Rate</th>
                  <th className="py-3 px-6">Operational Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rooms.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-900 text-sm">
                      #{r.roomNumber}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-800">
                      {r.roomType?.name}
                    </td>
                    <td className="py-3.5 px-6 text-slate-500">
                      Floor {r.floor}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600">
                      {r.roomType?.maxOccupancy} Guests
                    </td>
                    <td className="py-3.5 px-6 font-bold text-slate-900">
                      ₹{r.roomType?.baseRate?.toFixed(2)}/nt
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex flex-col gap-1">
                        <select
                          value={r.status}
                          onChange={(e) => handleStatusChange(r._id, e.target.value)}
                          className={`border rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-hidden cursor-pointer ${
                            r.status === 'occupied'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-slate-50 text-slate-800 border-slate-200'
                          }`}
                        >
                          <option value="available">🟢 Available</option>
                          <option value="occupied">🟣 Occupied</option>
                          <option value="cleaning">🟡 Cleaning</option>
                          <option value="maintenance">🔴 Maintenance</option>
                          <option value="inactive">⚪ Inactive</option>
                        </select>
                        {r.activeReservation && (
                          <span
                            className="text-[10px] text-purple-700 font-semibold truncate max-w-[150px] inline-flex items-center gap-1"
                            title={`Booked by ${r.activeReservation.guestName} (${r.activeReservation.bookingReference})`}
                          >
                            <span>👤</span>
                            <span>{r.activeReservation.guestName}</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => handleDeleteRoom(r._id, r.roomNumber)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Room"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Room Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add New Physical Room"
      >
        <form onSubmit={handleCreateRoom} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Unique Room Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 501"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Room Category / Type *
            </label>
            <select
              value={roomTypeId}
              onChange={(e) => setRoomTypeId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden"
            >
              {roomTypes.map((rt) => (
                <option key={rt._id} value={rt._id}>
                  {rt.name} (₹{rt.baseRate}/night - Max {rt.maxOccupancy} Guests)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Floor Number *
              </label>
              <input
                type="number"
                min={1}
                required
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Operational Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden"
              >
                <option value="available">Available</option>
                <option value="cleaning">Cleaning</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="flex-1 py-2.5 px-4 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
            >
              {submitting ? 'Creating Room...' : 'Create Room'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminRoomsPage;


import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Users
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

const AdminRoomTypesPage = () => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxOccupancy, setMaxOccupancy] = useState(2);
  const [baseRate, setBaseRate] = useState(99.99);
  const [amenitiesInput, setAmenitiesInput] = useState('WiFi, TV, Air Conditioning, Mini Bar');
  const [submitting, setSubmitting] = useState(false);

  const fetchRoomTypes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/room-types');
      if (res.success) setRoomTypes(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch room types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const openCreateModal = () => {
    setEditingType(null);
    setName('');
    setDescription('');
    setMaxOccupancy(2);
    setBaseRate(99.99);
    setAmenitiesInput('WiFi, TV, Air Conditioning, Mini Bar');
    setModalOpen(true);
  };

  const openEditModal = (rt) => {
    setEditingType(rt);
    setName(rt.name);
    setDescription(rt.description);
    setMaxOccupancy(rt.maxOccupancy);
    setBaseRate(rt.baseRate);
    setAmenitiesInput(rt.amenities ? rt.amenities.join(', ') : '');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    const amenities = amenitiesInput.split(',').map((s) => s.trim()).filter(Boolean);

    try {
      if (editingType) {
        const res = await api.put(`/room-types/${editingType._id}`, {
          name,
          description,
          maxOccupancy: Number(maxOccupancy),
          baseRate: Number(baseRate),
          amenities,
        });
        if (res.success) setMessage(`Room type '${name}' updated successfully!`);
      } else {
        const res = await api.post('/room-types', {
          name,
          description,
          maxOccupancy: Number(maxOccupancy),
          baseRate: Number(baseRate),
          amenities,
        });
        if (res.success) setMessage(`Room type '${name}' created successfully!`);
      }
      setModalOpen(false);
      fetchRoomTypes();
    } catch (err) {
      setError(err.message || 'Failed to save room type');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (rt) => {
    if (!window.confirm(`Are you sure you want to delete room type '${rt.name}'?`)) return;
    try {
      const res = await api.delete(`/room-types/${rt._id}`);
      if (res.success) {
        setMessage(`Room type '${rt.name}' deleted successfully`);
        fetchRoomTypes();
      }
    } catch (err) {
      setError(err.message || 'Cannot delete room type (rooms are referencing it)');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Room Types & Rate Administration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure room classifications, base nightly rates, maximum occupancies, and amenity suites.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create Room Type</span>
        </button>
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
          <LoadingSpinner size="lg" text="Loading room types..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roomTypes.map((rt) => (
            <div
              key={rt._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">{rt.name}</h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(rt)}
                      className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(rt)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {rt.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {rt.amenities?.map((a, i) => (
                    <span
                      key={i}
                      className="text-[11px] bg-slate-50 text-slate-600 border border-slate-100 px-2.5 py-0.5 rounded-md font-medium"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Users className="w-4 h-4 text-purple-600" />
                  Max {rt.maxOccupancy} Guests
                </span>
                <span className="text-lg font-black text-slate-900">
                  ₹{rt.baseRate?.toFixed(2)} <span className="text-xs font-normal text-slate-400">/ night</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingType ? 'Edit Room Type' : 'Create Room Type'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Presidential Suite"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Description *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe room features, view, and unique furnishings..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Max Capacity (Guests) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={maxOccupancy}
                onChange={(e) => setMaxOccupancy(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Base Nightly Rate (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min={0}
                required
                value={baseRate}
                onChange={(e) => setBaseRate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Amenities (Comma-separated)
            </label>
            <input
              type="text"
              value={amenitiesInput}
              onChange={(e) => setAmenitiesInput(e.target.value)}
              placeholder="WiFi, TV, Jacuzzi, Balcony, Safe"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 py-2.5 px-4 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editingType ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminRoomTypesPage;


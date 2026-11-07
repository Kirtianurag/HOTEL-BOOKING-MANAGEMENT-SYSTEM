import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Home, Search, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const BookingSearchBar = ({ initialValues = {}, onSearch, compact = false }) => {
  const navigate = useNavigate();

  // Tomorrow & Day After as smart defaults
  const getDefaultDates = () => {
    const today = new Date();
    const inDate = new Date(today);
    inDate.setDate(today.getDate() + 1);
    const outDate = new Date(today);
    outDate.setDate(today.getDate() + 3);

    return {
      checkIn: inDate.toISOString().split('T')[0],
      checkOut: outDate.toISOString().split('T')[0],
    };
  };

  const defaults = getDefaultDates();

  const [checkIn, setCheckIn] = useState(initialValues.checkIn || defaults.checkIn);
  const [checkOut, setCheckOut] = useState(initialValues.checkOut || defaults.checkOut);
  const [guests, setGuests] = useState(initialValues.guests || 2);
  const [roomTypeId, setRoomTypeId] = useState(initialValues.roomTypeId || '');
  const [roomTypes, setRoomTypes] = useState([]);
  const [error, setError] = useState('');

  // Fetch active room types for the dropdown
  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const res = await api.get('/room-types?activeOnly=true');
        if (res.success && res.data) {
          setRoomTypes(res.data);
        }
      } catch (err) {
        console.error('Failed to load room types:', err);
      }
    };
    fetchRoomTypes();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');

    const todayStr = new Date().toISOString().split('T')[0];
    if (checkIn < todayStr) {
      setError('Check-in date cannot be in the past');
      return;
    }
    if (checkOut <= checkIn) {
      setError('Check-out date must be after check-in date');
      return;
    }

    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: guests.toString(),
      ...(roomTypeId && { roomTypeId }),
    });

    if (onSearch) {
      onSearch({ checkIn, checkOut, guests, roomTypeId });
    } else {
      navigate(`/rooms?${params.toString()}`);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className={`w-full ${compact ? '' : 'max-w-5xl mx-auto'}`}>
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-2xl p-4 sm:p-5 shadow-xl border border-slate-100 flex flex-col md:flex-row items-stretch md:items-center gap-3.5"
      >
        {/* Check-In */}
        <div className="flex-1 bg-slate-50 hover:bg-slate-100/70 rounded-xl p-3 border border-slate-200/60 transition-colors">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
            Check-In
          </label>
          <input
            type="date"
            min={minDate}
            value={checkIn}
            onChange={(e) => {
              setCheckIn(e.target.value);
              if (e.target.value >= checkOut) {
                const nextDay = new Date(e.target.value);
                nextDay.setDate(nextDay.getDate() + 1);
                setCheckOut(nextDay.toISOString().split('T')[0]);
              }
            }}
            required
            className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-hidden"
          />
        </div>

        {/* Check-Out */}
        <div className="flex-1 bg-slate-50 hover:bg-slate-100/70 rounded-xl p-3 border border-slate-200/60 transition-colors">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
            Check-Out
          </label>
          <input
            type="date"
            min={checkIn}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            required
            className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-hidden"
          />
        </div>

        {/* Guests */}
        <div className="flex-1 bg-slate-50 hover:bg-slate-100/70 rounded-xl p-3 border border-slate-200/60 transition-colors">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-purple-600" />
            Guests
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-hidden cursor-pointer"
          >
            <option value={1}>1 Guest</option>
            <option value={2}>2 Guests</option>
            <option value={3}>3 Guests</option>
            <option value={4}>4 Guests</option>
            <option value={5}>5 Guests</option>
            <option value={6}>6+ Guests</option>
          </select>
        </div>

        {/* Room Type */}
        <div className="flex-1 bg-slate-50 hover:bg-slate-100/70 rounded-xl p-3 border border-slate-200/60 transition-colors">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-purple-600" />
            Room Type
          </label>
          <select
            value={roomTypeId}
            onChange={(e) => setRoomTypeId(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-hidden cursor-pointer truncate"
          >
            <option value="">All Room Types</option>
            {roomTypes.map((rt) => (
              <option key={rt._id} value={rt._id}>
                {rt.name} (₹{rt.baseRate}/nt)
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <div className="flex items-center">
          <button
            type="submit"
            className="w-full md:w-auto h-full px-7 py-3.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-semibold text-sm rounded-xl shadow-md shadow-purple-200 hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-2.5 flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default BookingSearchBar;


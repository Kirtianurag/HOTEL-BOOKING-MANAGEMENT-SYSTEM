import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle,
  AlertCircle,
  Calendar,
  ArrowRight,
  Filter,
  Sparkles,
  SlidersHorizontal,
  X
} from 'lucide-react';
import BookingSearchBar from '../../components/booking/BookingSearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

const RoomsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const checkInParam = searchParams.get('checkIn');
  const checkOutParam = searchParams.get('checkOut');
  const guestsParam = searchParams.get('guests');
  const roomTypeIdParam = searchParams.get('roomTypeId');

  const [availableResults, setAvailableResults] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(roomTypeIdParam || '');
  const [sortBy, setSortBy] = useState('recommended'); // 'recommended' | 'price-asc' | 'price-desc' | 'capacity'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Default dates if none provided in query params
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

  const currentCheckIn = checkInParam || getDefaultDates().checkIn;
  const currentCheckOut = checkOutParam || getDefaultDates().checkOut;
  const currentGuests = guestsParam ? Number(guestsParam) : 2;

  // Sync selectedType when URL changes
  useEffect(() => {
    setSelectedType(roomTypeIdParam || '');
  }, [roomTypeIdParam]);

  // Load all active room types for category pills
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

  const roomImages = {
    Standard: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
    Deluxe: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
    Suite: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    Family: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
    'Executive Club': 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    'Presidential Villa': 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80',
  };

  const fetchAvailability = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        checkIn: currentCheckIn,
        checkOut: currentCheckOut,
        guests: currentGuests.toString(),
        ...(roomTypeIdParam && { roomType: roomTypeIdParam, roomTypeId: roomTypeIdParam }),
      });

      const res = await api.get(`/availability/search?${params.toString()}`);
      if (res.success && res.data) {
        setAvailableResults(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to search available rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [checkInParam, checkOutParam, guestsParam, roomTypeIdParam]);

  // Apply sorting
  const sortedResults = [...availableResults].sort((a, b) => {
    if (sortBy === 'price-asc') {
      return (a.pricing?.totalAmount || 0) - (b.pricing?.totalAmount || 0);
    }
    if (sortBy === 'price-desc') {
      return (b.pricing?.totalAmount || 0) - (a.pricing?.totalAmount || 0);
    }
    if (sortBy === 'capacity') {
      return (b.room?.roomType?.maxOccupancy || 0) - (a.room?.roomType?.maxOccupancy || 0);
    }
    return 0; // recommended order
  });

  const handleBookNow = (item) => {
    navigate('/book', {
      state: {
        room: item.room,
        pricing: item.pricing,
        checkIn: currentCheckIn,
        checkOut: currentCheckOut,
        numberOfGuests: currentGuests,
      },
    });
  };

  const selectedTypeName = roomTypes.find((rt) => rt._id === selectedType)?.name || selectedType;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24">
      {/* Search Header */}
      <div className="bg-white border-b border-slate-100 py-8 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
              Live Availability Search
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
              Available Rooms & Suites
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Select your stay dates to view real-time availability and guaranteed itemized pricing.
            </p>
          </div>

          <BookingSearchBar
            compact
            initialValues={{
              checkIn: currentCheckIn,
              checkOut: currentCheckOut,
              guests: currentGuests,
              roomTypeId: roomTypeIdParam || '',
            }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Sorting & Result Counts Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-y border-slate-200/80 mb-6 text-xs text-slate-600">
          <div>
            <span>
              Found <strong>{sortedResults.length}</strong> available room{sortedResults.length === 1 ? '' : 's'}
            </span>
            <span className="ml-2 text-slate-400">
              ({currentCheckIn} to {currentCheckOut})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="recommended">Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="capacity">Capacity (Guests)</option>
            </select>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-20">
            <LoadingSpinner size="lg" text="Searching available rooms in inventory..." />
          </div>
        )}

        {/* Empty State */}
        {!loading && sortedResults.length === 0 && !error && (
          <div className="bg-white rounded-3xl p-12 text-center max-w-xl mx-auto border border-slate-100 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No Rooms Available</h3>
            <p className="text-sm text-slate-500 mt-2">
              All rooms of this category or capacity are currently reserved or undergoing maintenance for the selected dates.
            </p>
            <p className="text-xs text-purple-600 font-medium mt-3">
              Try adjusting your check-in/out dates or selecting another room category in the search bar.
            </p>
          </div>
        )}

        {/* Results Grid */}
        {!loading && sortedResults.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedResults.map((item) => {
              const room = item.room;
              const roomType = room.roomType;
              const pricing = item.pricing;
              const img =
                roomImages[roomType?.name] ||
                (roomType?.images && roomType.images[0]) ||
                'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80';

              return (
                <div
                  key={room._id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col sm:flex-row"
                >
                  {/* Room Image */}
                  <div className="sm:w-2/5 relative h-52 sm:h-auto overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={img}
                      alt={roomType?.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 shadow-xs">
                      Room #{room.roomNumber}
                    </div>
                    <div className="absolute bottom-3 left-3 bg-slate-900/70 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1">
                      Floor {room.floor}
                    </div>
                  </div>

                  {/* Room Info & Pricing */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
                            {roomType?.name}
                          </span>
                          <h3 className="text-lg font-bold text-slate-900">
                            Room {room.roomNumber} - {roomType?.name}
                          </h3>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium border border-emerald-200">
                          Available
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                        {roomType?.description}
                      </p>

                      {/* Capacity & Key Amenities */}
                      <div className="mt-3.5 flex flex-wrap gap-2 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                          <Users className="w-3.5 h-3.5 text-purple-600" />
                          Up to {roomType?.maxOccupancy} Guests
                        </span>
                        {roomType?.amenities?.slice(0, 3).map((a, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Pricing Summary & Action */}
                    <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-extrabold text-slate-900">
                            ₹{pricing?.totalAmount?.toFixed(2)}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            total ({pricing?.numberOfNights} night{pricing?.numberOfNights > 1 ? 's' : ''})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          ₹{pricing?.nightlyRate?.toFixed(2)}/nt + ₹{(pricing?.taxAmount || 0).toFixed(2)} tax (12%)
                        </div>
                      </div>

                      <button
                        onClick={() => handleBookNow(item)}
                        className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-md shadow-purple-200 hover:shadow-lg transition-all flex items-center gap-1.5"
                      >
                        <span>Book Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomsPage;

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle,
  LogOut as LogOutIcon,
  Hotel,
  Calendar,
  Clock,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StaffDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('arrivals'); // 'arrivals' | 'departures' | 'search'
  const [arrivals, setArrivals] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchArrivals = async () => {
    try {
      const res = await api.get('/staff/arrivals');
      if (res.success && res.data) {
        setArrivals(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDepartures = async () => {
    try {
      const res = await api.get('/staff/departures');
      if (res.success && res.data) {
        setDepartures(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchArrivals(), fetchDepartures()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/staff/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.success && res.data) {
        setSearchResults(res.data);
        setActiveTab('search');
      }
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  // Staff Check-In action
  const handleCheckIn = async (reservationId) => {
    setActionLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await api.post(`/staff/${reservationId}/checkin`);
      if (res.success) {
        setMessage(`Guest successfully checked in! Room key issued.`);
        loadData();
      }
    } catch (err) {
      setError(err.message || 'Failed to check in guest');
    } finally {
      setActionLoading(false);
    }
  };

  // Staff Check-Out action
  const handleCheckOut = async (reservationId) => {
    setActionLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await api.post(`/staff/${reservationId}/checkout`);
      if (res.success) {
        setMessage(`Guest successfully checked out! Room released for cleaning.`);
        loadData();
      }
    } catch (err) {
      setError(err.message || 'Failed to check out guest');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
              Front Desk Operations
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
              Staff Concierge & Check-In Desk
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage live guest arrivals, check-ins, departures, and room releases.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search booking ref or guest name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-purple-500 shadow-2xs"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Search
            </button>
            <button
              type="button"
              onClick={loadData}
              title="Refresh desk"
              className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Feedback alerts */}
        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Operational Tabs */}
        <div className="flex border-b border-slate-200 mb-6 gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('arrivals')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'arrivals' ? 'text-purple-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Today's Arrivals</span>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs">
              {arrivals.length}
            </span>
            {activeTab === 'arrivals' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('departures')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'departures' ? 'text-purple-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Today's Departures</span>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs">
              {departures.length}
            </span>
            {activeTab === 'departures' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full" />
            )}
          </button>

          {searchResults.length > 0 && (
            <button
              onClick={() => setActiveTab('search')}
              className={`pb-3 relative transition-colors ${
                activeTab === 'search' ? 'text-purple-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Search Results</span>
              <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs">
                {searchResults.length}
              </span>
              {activeTab === 'search' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full" />
              )}
            </button>
          )}
        </div>

        {/* Content Table / Cards */}
        {loading ? (
          <div className="py-20">
            <LoadingSpinner size="lg" text="Loading front desk operational data..." />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {activeTab === 'arrivals' && arrivals.length === 0 && (
              <div className="p-12 text-center text-xs text-slate-400">
                No arrivals scheduled for today.
              </div>
            )}

            {activeTab === 'departures' && departures.length === 0 && (
              <div className="p-12 text-center text-xs text-slate-400">
                No departures scheduled for today.
              </div>
            )}

            {activeTab === 'search' && searchResults.length === 0 && (
              <div className="p-12 text-center text-xs text-slate-400">
                No reservations match your search query.
              </div>
            )}

            {((activeTab === 'arrivals' && arrivals.length > 0) ||
              (activeTab === 'departures' && departures.length > 0) ||
              (activeTab === 'search' && searchResults.length > 0)) && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-3.5 px-4">Booking Ref</th>
                      <th className="py-3.5 px-4">Guest Name</th>
                      <th className="py-3.5 px-4">Room #</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Stay Dates</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Desk Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(activeTab === 'arrivals'
                      ? arrivals
                      : activeTab === 'departures'
                      ? departures
                      : searchResults
                    ).map((r) => {
                      const inDate = new Date(r.checkIn).toISOString().split('T')[0];
                      const outDate = new Date(r.checkOut).toISOString().split('T')[0];

                      return (
                        <tr key={r._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                            {r.bookingReference}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">
                            {r.guestDetails?.firstName} {r.guestDetails?.lastName}
                            <span className="block text-[11px] font-normal text-slate-400">
                              {r.guestDetails?.phone}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-purple-700">
                            Room #{r.room?.roomNumber}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {r.roomType?.name}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {inDate} → {outDate}
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge status={r.status} />
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {r.status === 'CONFIRMED' && (
                              <button
                                onClick={() => handleCheckIn(r._id)}
                                disabled={actionLoading}
                                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-2xs"
                              >
                                Check In
                              </button>
                            )}
                            {r.status === 'CHECKED_IN' && (
                              <button
                                onClick={() => handleCheckOut(r._id)}
                                disabled={actionLoading}
                                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs transition-colors shadow-2xs"
                              >
                                Check Out
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboardPage;


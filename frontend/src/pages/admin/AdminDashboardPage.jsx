import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Hotel,
  DoorOpen,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  const [roomTypeData, setRoomTypeData] = useState([]);
  const [recentReservations, setRecentReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 30);
    const end = new Date(today);
    end.setDate(end.getDate() + 30);

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    const dateQuery = `?startDate=${startStr}&endDate=${endStr}`;

    try {
      const results = await Promise.allSettled([
        api.get('/reports/dashboard'),
        api.get(`/reports/revenue${dateQuery}`),
        api.get(`/reports/occupancy${dateQuery}`),
        api.get(`/reports/room-types${dateQuery}`),
        api.get('/reservations/all?limit=5'),
      ]);

      const [statsRes, revRes, occRes, rtRes, resRes] = results;

      if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
        setStats(statsRes.value.data);
      } else if (statsRes.status === 'rejected') {
        setError(statsRes.reason?.message || 'Failed to load executive statistics');
      }

      if (revRes.status === 'fulfilled' && revRes.value?.success && revRes.value.data?.dailyBreakdown) {
        setRevenueData(revRes.value.data.dailyBreakdown);
      }

      if (occRes.status === 'fulfilled' && occRes.value?.success && occRes.value.data?.dailyBreakdown) {
        setOccupancyData(occRes.value.data.dailyBreakdown);
      }

      if (rtRes.status === 'fulfilled' && rtRes.value?.success && rtRes.value.data) {
        setRoomTypeData(rtRes.value.data);
      }

      if (resRes.status === 'fulfilled' && resRes.value?.success && resRes.value.data?.reservations) {
        setRecentReservations(resRes.value.data.reservations);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

  if (loading) {
    return (
      <div className="py-24">
        <LoadingSpinner size="lg" text="Aggregating MongoDB metrics and reports..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Executive Operations Overview
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Live key performance indicators computed directly from MongoDB reservation records.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          7 KPI CARDS
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Total Rooms
          </span>
          <span className="text-2xl font-black text-slate-900">{stats?.totalRooms ?? 0}</span>
          <span className="text-[10px] text-slate-500 block mt-1">Active units</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 block mb-1">
            Available
          </span>
          <span className="text-2xl font-black text-emerald-600">{stats?.availableRooms ?? 0}</span>
          <span className="text-[10px] text-slate-500 block mt-1">Ready for guest</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-600 block mb-1">
            Occupied
          </span>
          <span className="text-2xl font-black text-purple-600">{stats?.occupiedRooms ?? 0}</span>
          <span className="text-[10px] text-slate-500 block mt-1">Checked in</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 block mb-1">
            Today Arrivals
          </span>
          <span className="text-2xl font-black text-blue-600">{stats?.todayArrivals ?? 0}</span>
          <span className="text-[10px] text-slate-500 block mt-1">Due today</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 block mb-1">
            Departures
          </span>
          <span className="text-2xl font-black text-amber-600">{stats?.todayDepartures ?? 0}</span>
          <span className="text-[10px] text-slate-500 block mt-1">Checking out</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block mb-1">
            Reservations
          </span>
          <span className="text-2xl font-black text-slate-900">{stats?.totalReservations ?? 0}</span>
          <span className="text-[10px] text-slate-500 block mt-1">Non-cancelled</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-purple-200 bg-purple-50/30 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 block mb-1">
            Total Revenue
          </span>
          <span className="text-2xl font-black text-purple-700">
            ₹{stats?.totalRevenue ? stats.totalRevenue.toFixed(0) : '0'}
          </span>
          <span className="text-[10px] text-purple-600 block mt-1">Verified earnings</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CHARTS SECTION (RECHARTS)
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend AreaChart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Revenue Performance</h3>
              <p className="text-xs text-slate-400">Daily booked revenue snapshot</p>
            </div>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
              Live Aggregation
            </span>
          </div>

          <div className="h-64">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    formatter={(val) => [`₹${val.toFixed(2)}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No historical revenue dates in selected period.
              </div>
            )}
          </div>
        </div>

        {/* Room Type Performance PieChart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Room Type Revenue Share</h3>
            <p className="text-xs text-slate-400">Revenue distribution by category</p>
          </div>

          <div className="h-56 my-2">
            {roomTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roomTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="totalRevenue"
                    nameKey="roomTypeName"
                  >
                    {roomTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    formatter={(val) => [`₹${val.toFixed(2)}`, 'Total']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No room type revenue records.
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3">
            {roomTypeData.slice(0, 4).map((rt, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="truncate text-slate-600">{rt.roomTypeName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          RECENT RESERVATIONS TABLE
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Reservations</h3>
            <p className="text-xs text-slate-400">Latest guest activity and lock statuses</p>
          </div>
          <Link
            to="/admin/reservations"
            className="text-xs font-semibold text-purple-600 hover:text-purple-700"
          >
            View All →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-6">Booking Ref</th>
                <th className="py-3 px-6">Guest</th>
                <th className="py-3 px-6">Room</th>
                <th className="py-3 px-6">Stay Dates</th>
                <th className="py-3 px-6">Amount</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentReservations.map((r) => {
                const inDate = new Date(r.checkIn).toISOString().split('T')[0];
                const outDate = new Date(r.checkOut).toISOString().split('T')[0];
                return (
                  <tr key={r._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-900">
                      {r.bookingReference}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-800">
                      {r.guestDetails?.firstName} {r.guestDetails?.lastName}
                    </td>
                    <td className="py-3.5 px-6 text-slate-700 font-medium">
                      Room #{r.room?.roomNumber} ({r.roomType?.name})
                    </td>
                    <td className="py-3.5 px-6 text-slate-500">
                      {inDate} → {outDate}
                    </td>
                    <td className="py-3.5 px-6 font-bold text-slate-900">
                      ₹{r.pricing?.totalAmount?.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-6">
                      <Badge status={r.status} />
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Link
                        to="/admin/reservations"
                        className="text-xs font-semibold text-purple-600 hover:text-purple-700"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;


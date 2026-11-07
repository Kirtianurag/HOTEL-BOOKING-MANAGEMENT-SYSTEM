import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  DoorOpen,
  ArrowRight,
  Filter,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminReportsPage = () => {
  // 30 days default date range
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const thirtyDaysAhead = new Date();
  thirtyDaysAhead.setDate(today.getDate() + 30);

  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(thirtyDaysAhead.toISOString().split('T')[0]);

  const [revenueReport, setRevenueReport] = useState(null);
  const [occupancyReport, setOccupancyReport] = useState(null);
  const [arrivals, setArrivals] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [roomTypePerf, setRoomTypePerf] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        api.get(`/reports/revenue?startDate=${startDate}&endDate=${endDate}`),
        api.get(`/reports/occupancy?startDate=${startDate}&endDate=${endDate}`),
        api.get('/reports/arrivals?days=14'),
        api.get('/reports/departures?days=14'),
        api.get(`/reports/room-types?startDate=${startDate}&endDate=${endDate}`),
      ]);

      const [revRes, occRes, arrRes, depRes, rtRes] = results;

      if (revRes.status === 'fulfilled' && revRes.value?.success) setRevenueReport(revRes.value.data);
      if (occRes.status === 'fulfilled' && occRes.value?.success) setOccupancyReport(occRes.value.data);
      if (arrRes.status === 'fulfilled' && arrRes.value?.success) setArrivals(arrRes.value.data);
      if (depRes.status === 'fulfilled' && depRes.value?.success) setDepartures(depRes.value.data);
      if (rtRes.status === 'fulfilled' && rtRes.value?.success) setRoomTypePerf(rtRes.value.data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    fetchReports();
  };

  return (
    <div className="space-y-8">
      {/* Header & Date Range Filter */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Hospitality Reporting & Financial Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Audited occupancy rates, verified revenue aggregates, and room type utilization pipelines.
          </p>
        </div>

        {/* Date Range Picker */}
        <form onSubmit={handleApplyFilter} className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 px-2">
            <span className="text-[11px] font-semibold text-slate-400">From</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-hidden"
            />
          </div>
          <span className="text-slate-300">→</span>
          <div className="flex items-center gap-1.5 px-2">
            <span className="text-[11px] font-semibold text-slate-400">To</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Apply Range
          </button>
        </form>
      </div>

      {loading ? (
        <div className="py-24">
          <LoadingSpinner size="lg" text="Executing MongoDB aggregation pipelines..." />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
                Total Period Revenue
              </span>
              <div className="text-3xl font-black text-slate-900 mt-2">
                ${revenueReport?.totalRevenue ? revenueReport.totalRevenue.toFixed(2) : '0.00'}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Excludes cancelled and expired hold reservations.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Average Occupancy Rate
              </span>
              <div className="text-3xl font-black text-slate-900 mt-2">
                {occupancyReport?.averageOccupancy ?? 0}%
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Formula: (Occupied Room-Nights ÷ Sellable Units) × 100
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Upcoming Arrivals & Departures
              </span>
              <div className="text-3xl font-black text-slate-900 mt-2">
                {arrivals.length + departures.length}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Next 14 days operational movements.
              </p>
            </div>
          </div>

          {/* Occupancy Trend BarChart */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Daily Occupancy Rate (%)
                </h3>
                <p className="text-xs text-slate-400">
                  Computed per stay date against total sellable active room inventory
                </p>
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                Formula Verified
              </span>
            </div>

            <div className="h-64">
              {occupancyReport?.dailyBreakdown?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={occupancyReport.dailyBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                      formatter={(val) => [`${val}%`, 'Occupancy']}
                    />
                    <Bar dataKey="occupancyRate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No occupancy locks logged in this date range.
                </div>
              )}
            </div>
          </div>

          {/* Room Type Performance Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Room Category Performance Breakdown
                </h3>
                <p className="text-xs text-slate-400">
                  Revenue, confirmed booking volume, and room-night yields by category
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-6">Room Category</th>
                    <th className="py-3 px-6">Confirmed Bookings</th>
                    <th className="py-3 px-6">Total Room-Nights</th>
                    <th className="py-3 px-6">Average Rate</th>
                    <th className="py-3 px-6 text-right">Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {roomTypePerf.map((rt, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-6 font-bold text-slate-900">
                        {rt.roomTypeName}
                      </td>
                      <td className="py-3.5 px-6 text-slate-700 font-semibold">
                        {rt.bookingCount} bookings
                      </td>
                      <td className="py-3.5 px-6 text-slate-600">
                        {rt.totalNights} nights
                      </td>
                      <td className="py-3.5 px-6 text-slate-600 font-mono">
                        ${rt.averageRate ? rt.averageRate.toFixed(2) : '0.00'}
                      </td>
                      <td className="py-3.5 px-6 text-right font-black text-purple-700 text-sm">
                        ${rt.totalRevenue?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReportsPage;


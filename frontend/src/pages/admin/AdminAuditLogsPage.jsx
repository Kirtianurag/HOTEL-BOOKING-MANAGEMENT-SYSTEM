import React, { useState, useEffect } from 'react';
import {
  ScrollText,
  Search,
  Filter,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  User
} from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [search, setSearch] = useState('');

  // Selected Log Modal for JSON payload inspect
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        ...(actionFilter && { action: actionFilter }),
        ...(entityFilter && { entityType: entityFilter }),
        ...(search && { search }),
      });

      const res = await api.get(`/audit?${params.toString()}`);
      if (res.success && res.data) {
        setLogs(res.data.logs);
        setTotalPages(res.data.pages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, entityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            System Security & Business Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable records of critical user logins, status modifications, reservations, and inventory transitions.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="">All Actions</option>
            <option value="USER_LOGIN">USER_LOGIN</option>
            <option value="ROOM_CREATED">ROOM_CREATED</option>
            <option value="ROOM_STATUS_UPDATED">ROOM_STATUS_UPDATED</option>
            <option value="RESERVATION_CREATED">RESERVATION_CREATED</option>
            <option value="RESERVATION_CONFIRMED">RESERVATION_CONFIRMED</option>
            <option value="RESERVATION_CANCELLED">RESERVATION_CANCELLED</option>
            <option value="GUEST_CHECKED_IN">GUEST_CHECKED_IN</option>
            <option value="GUEST_CHECKED_OUT">GUEST_CHECKED_OUT</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) => {
              setEntityFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="">All Entities</option>
            <option value="Reservation">Reservation</option>
            <option value="Room">Room</option>
            <option value="RoomType">RoomType</option>
            <option value="User">User</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20">
          <LoadingSpinner size="lg" text="Retrieving audit log entries..." />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">Timestamp</th>
                  <th className="py-3 px-6">User / Role</th>
                  <th className="py-3 px-6">Action</th>
                  <th className="py-3 px-6">Entity</th>
                  <th className="py-3 px-6">Entity ID</th>
                  <th className="py-3 px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const date = new Date(log.createdAt).toLocaleString();
                  return (
                    <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-6 font-mono text-slate-500 text-[11px]">
                        {date}
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="font-semibold text-slate-800">
                          {log.userId?.firstName ? `${log.userId.firstName} ${log.userId.lastName}` : 'System / Demo'}
                        </div>
                        <span className="text-[10px] font-bold uppercase text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-sm">
                          {log.userRole || 'SYSTEM'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-mono font-bold text-slate-900">
                        {log.action}
                      </td>
                      <td className="py-3.5 px-6 font-medium text-slate-600">
                        {log.entityType}
                      </td>
                      <td className="py-3.5 px-6 font-mono text-[11px] text-slate-400">
                        {log.entityId ? String(log.entityId).substring(0, 10) + '...' : '—'}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => {
                            setSelectedLog(log);
                            setModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-purple-700 hover:bg-purple-50 rounded-lg font-semibold text-xs transition-colors"
                        >
                          View Diff
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {logs.length} of {totalCount} logged events</span>
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

      {/* Audit Log Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Audit Log Entry Inspection"
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
              <div>
                <span className="text-slate-400 block">Action</span>
                <span className="font-bold font-mono text-purple-700">{selectedLog.action}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Acting Role</span>
                <span className="font-semibold text-slate-800">{selectedLog.userRole}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Entity</span>
                <span className="font-semibold text-slate-800">{selectedLog.entityType}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Timestamp</span>
                <span className="font-mono text-slate-600">
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {selectedLog.previousValues && (
              <div>
                <span className="font-bold text-slate-700 block mb-1">Previous Values:</span>
                <pre className="p-3 bg-slate-100 rounded-xl text-[11px] font-mono text-slate-800 overflow-x-auto">
                  {JSON.stringify(selectedLog.previousValues, null, 2)}
                </pre>
              </div>
            )}

            {selectedLog.newValues && (
              <div>
                <span className="font-bold text-slate-700 block mb-1">New Values:</span>
                <pre className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl text-[11px] font-mono text-purple-900 overflow-x-auto">
                  {JSON.stringify(selectedLog.newValues, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminAuditLogsPage;


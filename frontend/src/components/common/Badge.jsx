import React from 'react';

const Badge = ({ status, variant, children }) => {
  const statusStyles = {
    CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CHECKED_IN: 'bg-blue-50 text-blue-700 border-blue-200',
    CHECKED_OUT: 'bg-slate-100 text-slate-700 border-slate-200',
    HOLD: 'bg-amber-50 text-amber-700 border-amber-200',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
    available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cleaning: 'bg-amber-50 text-amber-700 border-amber-200',
    maintenance: 'bg-rose-50 text-rose-700 border-rose-200',
    inactive: 'bg-slate-100 text-slate-600 border-slate-200',
    admin: 'bg-purple-50 text-purple-700 border-purple-200',
    staff: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    guest: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const style = statusStyles[status] || statusStyles[variant] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}
    >
      {children || status}
    </span>
  );
};

export default Badge;


import React from 'react';
import { formatCurrency } from '../utils/helpers';
import { ChevronRight } from 'lucide-react';

export default function StatCard({ title, value, color, iconBg, iconColor, icon: Icon, onClick, badge }) {
  const isClickable = Boolean(onClick);

  return (
    <div 
      onClick={onClick}
      className={`bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all flex items-center justify-between group h-full relative overflow-hidden ${
        isClickable 
          ? 'cursor-pointer hover:border-red-300 hover:ring-2 hover:ring-red-100 hover:-translate-y-1 active:scale-[0.98]' 
          : ''
      }`}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wide group-hover:text-slate-700">
            {title}
          </h3>
          {badge && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 animate-pulse">
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <p className="text-2xl font-bold tracking-tight" style={{ color: color }}>
            {formatCurrency(value)}
          </p>
          {isClickable && (
            <ChevronRight size={14} className="text-slate-300 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all" />
          )}
        </div>
      </div>
      <div className={`p-3 rounded-xl ${iconBg} ${iconColor} opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-300`}>
        {Icon && <Icon size={20} strokeWidth={2} />}
      </div>
    </div>
  );
}

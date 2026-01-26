// src/components/StatCard.jsx
import React from 'react';
import { formatCurrency } from '../utils';

export default function StatCard({ title, value, subtext, color, borderColor, icon: Icon }) {
  return (
    <div className={`bg-white p-6 border-l-4 ${borderColor} rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full`}>
        <div className="flex justify-between items-start mb-2">
           <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</h3>
           {Icon && <Icon size={16} className="text-slate-300" />}
        </div>
        <div>
          <p className="text-3xl font-bold tracking-tighter" style={{ color: color }}>{formatCurrency(value)}</p>
          <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-slate-400">
              <span>{subtext}</span>
          </div>
        </div>
    </div>
  );
}
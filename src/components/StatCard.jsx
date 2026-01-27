import React from 'react';
import { formatCurrency } from '../utils';

export default function StatCard({ title, value, color, borderColor, icon: Icon }) {
  // สร้างสีพื้นหลังจางๆ จากสีหลัก
  const bgClass = color === 'black' ? 'bg-gray-100 text-gray-700' : 
                  color === '#C5A059' ? 'bg-orange-50 text-[#C5A059]' : 
                  'bg-red-50 text-red-500';

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 flex items-center justify-between group cursor-default">
        <div>
           <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-slate-600 transition-colors">{title}</h3>
           <p className="text-3xl font-black tracking-tight" style={{ color: color }}>{formatCurrency(value)}</p>
        </div>
        <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${bgClass} group-hover:scale-110 transition-transform duration-300`}>
           {Icon && <Icon size={24} strokeWidth={2} />}
        </div>
    </div>
  );
}
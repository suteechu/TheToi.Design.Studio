import React from 'react';
import { formatCurrency } from '../utils/helpers'; // ต้อง Import function ข้ามไฟล์

export default function StatCard({ title, value, color, iconBg, iconColor, icon: Icon }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all flex items-center justify-between group h-full">
        <div>
           <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 group-hover:text-slate-700">{title}</h3>
           <p className="text-2xl font-bold tracking-tight" style={{ color: color }}>{formatCurrency(value)}</p>
        </div>
        <div className={`p-3 rounded-xl ${iconBg} ${iconColor} opacity-80 group-hover:opacity-100`}>
           {Icon && <Icon size={20} strokeWidth={2} />}
        </div>
    </div>
  );
}
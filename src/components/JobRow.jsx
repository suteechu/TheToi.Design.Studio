import React from 'react';
import { Settings, X, FileText, CheckCircle, Clock } from 'lucide-react';
import { formatCurrency } from '../utils';

export default function JobRow({ job, team, onEdit, onDelete, onDoc }) {
  const balance = parseFloat(job.totalPrice) - parseFloat(job.receivedAmount);
  const isPaid = balance <= 0;
  
  // คำนวณกำไรสุทธิ: ราคาขายรวม - ต้นทุนจริง
  const netProfit = parseFloat(job.totalPrice) - (parseFloat(job.actualOutsourceFee) || 0);
  // คำนวณ % Margin
  const marginPercent = job.totalPrice > 0 ? (netProfit / job.totalPrice) * 100 : 0;

  return (
    <tr className="hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-0">
      <td className="px-8 py-5">
         <div className="font-bold text-sm text-slate-900 uppercase mb-1">{job.client}</div>
         <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-bold uppercase tracking-wide border border-slate-200">{job.projectType}</span>
            <span className="text-[11px] text-slate-400 font-medium italic">· {team?.name || 'No Team'}</span>
         </div>
      </td>
      <td className="px-8 py-5 text-right">
         <div className="font-bold text-sm text-slate-700">{formatCurrency(job.totalPrice)}</div>
         <div className="text-[10px] text-slate-400 font-medium">Full Amount</div>
      </td>
      
      {/* เพิ่มช่องแสดงกำไรสุทธิ */}
      <td className="px-8 py-5 text-right">
         <div className="font-bold text-sm text-emerald-600">{formatCurrency(netProfit)}</div>
         <div className="text-[10px] text-emerald-400 font-bold">{marginPercent.toFixed(1)}% Margin</div>
      </td>

      <td className="px-8 py-5 text-right">
         {isPaid ? (
            <div className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-100 shadow-sm"><CheckCircle size={14} strokeWidth={2.5}/> PAID</div>
         ) : (
            <div className="inline-flex items-center gap-1.5 text-red-500 bg-red-50 px-3 py-1.5 rounded-full text-xs font-bold border border-red-100 shadow-sm"><Clock size={14} strokeWidth={2.5}/> {formatCurrency(balance)}</div>
         )}
      </td>
      <td className="px-8 py-5 text-center">
         <div className="flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
            <button onClick={onDoc} className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-800 hover:border-slate-400 transition-all shadow-sm hover:shadow" title="เอกสาร"><FileText size={16}/></button>
            <button onClick={onEdit} className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#C5A059] hover:border-[#C5A059] transition-all shadow-sm hover:shadow" title="แก้ไข"><Settings size={16}/></button>
            <button onClick={onDelete} className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-500 transition-all shadow-sm hover:shadow" title="ลบ"><X size={16}/></button>
         </div>
      </td>
    </tr>
  );
}
import React from 'react';
import { Settings, X, CheckCircle, Clock, FileText, Share2, Bed, Bath, Car } from 'lucide-react'; // Import Icon
import { formatCurrency, formatThaiDate } from '../utils/helpers'; // Import Utils

export default function JobRow({ job, team, onEdit, onDelete, onDoc, onToggleStatus, onShare }) {
  const balance = parseFloat(job.totalPrice) - parseFloat(job.receivedAmount);
  const isPaid = balance <= 0;
  const netProfit = parseFloat(job.totalPrice) - (parseFloat(job.actualOutsourceFee) || 0);
  const marginPercent = job.totalPrice > 0 ? (netProfit / job.totalPrice) * 100 : 0;
  const isFinished = job.status === 'FINISHED';

  return (
    <tr className={`hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 text-xs ${isFinished ? 'opacity-60 bg-slate-50/50' : ''}`}>
      <td className="px-6 py-4"> 
         <div className="flex items-center gap-2 mb-1">
             <div className={`font-bold text-slate-900 uppercase text-sm ${isFinished ? 'line-through text-slate-400' : ''}`}>{job.client}</div>
             {isFinished && <span className="bg-emerald-100 text-emerald-600 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Finished</span>}
         </div>
         <div className="flex flex-col gap-1.5 text-slate-500">
            <div className="flex items-center gap-1.5">
                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold dark:text-slate-800">{job.projectType}</span>
                {job.area > 0 && <span className="text-[10px] font-medium text-slate-600">| {job.area} (Sqm.)</span>}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-medium text-slate-400">
                {(job.bedrooms > 0 || job.bathrooms > 0 || job.parking > 0) && (
                    <span className="flex items-center gap-2 text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                        {job.bedrooms > 0 && <span className="flex items-center gap-0.5"><Bed size={10}/>{job.bedrooms}</span>} 
                        {job.bathrooms > 0 && <span className="flex items-center gap-0.5"><Bath size={10}/>{job.bathrooms}</span>}
                        {job.parking > 0 && <span className="flex items-center gap-0.5"><Car size={10}/>{job.parking}</span>}
                    </span>
                )}
                <span className="flex items-center gap-1 text-[#C5A059] font-bold">
                    <Clock size={10}/> ส่ง: {formatThaiDate(job.deliveryDate)}
                </span>
            </div>
         </div>
      </td>
      <td className="px-6 py-4 text-right font-medium text-slate-700 align-top pt-5">{formatCurrency(job.totalPrice)}</td>
      <td className="px-6 py-4 text-right align-top pt-5">
         <div className="font-bold text-emerald-600">{formatCurrency(netProfit)}</div>
         <div className="text-[9px] text-emerald-500 font-bold">{marginPercent.toFixed(1)}%</div>
      </td>
      <td className="px-6 py-4 text-right align-top pt-5">
         {isPaid ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-[10px] font-bold border border-emerald-100"><CheckCircle size={12}/> ครบแล้ว</span>
         ) : (
            <span className="inline-flex items-center gap-1 text-red-500 bg-red-50 px-2 py-1 rounded-lg text-[10px] font-bold border border-red-100"><Clock size={12}/> {formatCurrency(balance)}</span>
         )}
      </td>
      <td className="px-6 py-4 text-center align-top pt-4">
         <div className="flex justify-center items-center gap-2">
            <button onClick={() => onShare(job)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-green-500 hover:border-green-500 transition-all shadow-sm" title="ส่งรายละเอียดทางไลน์"><Share2 size={16}/></button>
            <button onClick={onToggleStatus} className={`p-2 border rounded-lg transition-all shadow-sm ${isFinished ? 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600' : 'bg-white text-slate-300 border-slate-200 hover:text-emerald-500 hover:border-emerald-500'}`} title={isFinished ? "ส่งงานเรียบร้อยแล้ว" : "กดเพื่อยืนยันส่งงาน"}><CheckCircle size={16} /></button>
            <div className="w-px h-6 bg-slate-100 mx-1"></div>
            <button onClick={onDoc} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-black hover:border-slate-400 transition-all shadow-sm" title="เอกสาร"><FileText size={16}/></button>
            <button onClick={onEdit} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-[#C5A059] hover:border-[#C5A059] transition-all shadow-sm" title="แก้ไข"><Settings size={16}/></button>
            <button onClick={onDelete} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-red-500 hover:border-red-500 transition-all shadow-sm" title="ลบ"><X size={16}/></button>
         </div>
      </td>
    </tr>
  );
}
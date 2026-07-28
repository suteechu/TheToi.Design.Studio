import React from 'react';
import { Home, Wrench, Calendar as CalendarIcon, CheckCircle, Clock, Share2, FileText, Upload } from 'lucide-react';
import { formatCurrency, formatThaiDate } from '../utils/helpers';

const ImageWithEdit = ({ src, onEdit }) => (
  <div className="relative group w-12 h-12 shrink-0 cursor-pointer overflow-hidden rounded-xl shadow-sm border border-slate-200/60" onClick={onEdit} title="คลิกเพื่อเปลี่ยนรูป">
    {src ? (
      <img src={src} alt="job" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:opacity-80" onError={(e) => e.target.style.display='none'} />
    ) : (
      <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-100 transition-colors"><Home size={18}/></div>
    )}
    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-slate-900/40 backdrop-blur-[2px] transition-all duration-300">
      <div className="bg-white/90 text-slate-900 p-1.5 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300"><Upload size={14} strokeWidth={2.5}/></div>
    </div>
  </div>
);

export default function JobRow({ job, displayImage, onDoc, onShare, onEditImage }) {
  const pendingAmount = parseFloat(job.pendingAmount) || 0;
  const receivedAmount = parseFloat(job.receivedAmount) || 0;
  const balance = pendingAmount - receivedAmount;
  const isPaid = balance <= 0.1;
  const totalPrice = parseFloat(job.totalPrice) || 0;
  const sheetProfit = parseFloat(job.sheetProfit) || 0;
  const marginPercent = totalPrice > 0 ? (sheetProfit / totalPrice) * 100 : 0;
  const isFinished = job.status === 'FINISHED';

  return (
    <tr className={`hover:bg-slate-50/80 transition-all duration-300 border-b border-slate-100/50 last:border-0 text-xs group ${isFinished ? 'opacity-60 bg-slate-50/30' : ''}`}>
      
      <td className="px-4 py-4 text-center font-bold text-slate-400 border-r border-slate-100/50 w-12 group-hover:text-gold-500 transition-colors">{job.no}</td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-4">
          <ImageWithEdit src={displayImage} onEdit={() => onEditImage(job.id)} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className={`font-bold text-slate-900 uppercase text-sm tracking-wide truncate ${isFinished ? 'line-through text-slate-400' : ''}`}>{job.client}</span>
              <span className="text-[9px] font-bold tracking-wider uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md border border-slate-200/60 shadow-sm">{job.projectType}</span>
            </div>
            <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-3 items-center leading-tight">
              <span className="text-slate-700 font-medium flex items-center gap-1 bg-slate-100/50 px-1.5 py-0.5 rounded"><Wrench size={10} className="text-slate-400"/> {job.teamName}</span>
              <span className="text-gold-600 font-semibold bg-gold-50 px-1.5 py-0.5 rounded border border-gold-100">🏷️ {job.serviceType}</span>
              <span className="truncate max-w-[150px] sm:max-w-[250px]" title={job.spec}>
                {job.spec ?? '-'} {job.area > 0 && <span className="text-slate-400 ml-1">({job.area} ตร.ม.)</span>}
              </span>
            </div>
          </div>
        </div>
      </td>

      <td className="px-4 py-4 text-center w-32">
        <div className="flex flex-col items-center gap-1.5">
          <div className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-orange-100 flex items-center gap-1.5 whitespace-nowrap shadow-sm">
            <CalendarIcon size={12}/> {formatThaiDate(job.deliveryDate)}
          </div>
          {job.isMoneyReceived && <div className="text-[9px] text-emerald-600 font-bold flex items-center gap-1 tracking-wide"><CheckCircle size={10}/> รับเงินแล้ว</div>}
        </div>
      </td>

      <td className="px-4 py-4 text-right font-semibold text-slate-800 text-sm w-28">{formatCurrency(totalPrice)}</td>

      <td className="px-4 py-4 text-right w-28">
        <div className="font-bold text-emerald-600 text-sm">{formatCurrency(sheetProfit)}</div>
        <div className="text-[10px] text-emerald-500/80 font-bold tracking-wider">{marginPercent.toFixed(1)}% MARGIN</div>
      </td>

      <td className="px-4 py-4 text-right w-32">
        {isPaid ? (
          <span className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-emerald-100 shadow-sm">
            <CheckCircle size={12}/> ชำระครบ
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-red-600 bg-red-50 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-red-100 shadow-sm">
            <Clock size={12}/> {formatCurrency(balance)}
          </span>
        )}
      </td>

      <td className="px-4 py-4 text-center w-24">
        <div className="flex justify-center items-center gap-2">
          <button 
            onClick={() => onShare(job)} 
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-emerald-500 hover:border-emerald-200 hover:bg-emerald-50 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5" 
            title="แชร์ข้อมูล"
          >
            <Share2 size={16}/>
          </button>
          <button 
            onClick={() => onDoc(job)} 
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-800 hover:border-slate-400 hover:bg-slate-50 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5" 
            title="เอกสาร"
          >
            <FileText size={16}/>
          </button>
        </div>
      </td>
    </tr>
  );
}
import React from 'react';
import { Home, Wrench, Calendar as CalendarIcon, CheckCircle, Clock, Share2, FileText, Upload } from 'lucide-react';
import { formatCurrency, formatThaiDate } from '../utils/helpers';

// Helper Component สำหรับแสดงรูปภาพ
const ImageWithEdit = ({ src, onEdit }) => (
  <div className="relative group w-10 h-10 shrink-0 cursor-pointer" onClick={onEdit} title="คลิกเพื่อเปลี่ยนรูป">
    {src ? (
      <img src={src} alt="job" className="w-10 h-10 rounded-lg object-cover shadow-sm border border-slate-100 group-hover:opacity-70 transition-all" onError={(e) => e.target.style.display='none'} />
    ) : (
      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-slate-200 transition-all"><Home size={16}/></div>
    )}
    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
      <div className="bg-black/50 text-white p-1 rounded-full"><Upload size={10}/></div>
    </div>
  </div>
);

export default function JobRow({ job, displayImage, onDoc, onShare, onEditImage }) {
  // ✅ 1. คำนวณ Balance: (ค้างจ่าย - จ่ายแล้ว)
  const pendingAmount = parseFloat(job.pendingAmount) || 0;
  const receivedAmount = parseFloat(job.receivedAmount) || 0;
  const balance = pendingAmount - receivedAmount;

  // ✅ 2. เช็คสถานะจ่ายครบ
  const isPaid = balance <= 0.1; // ยอมรับเศษทศนิยมเล็กน้อย

  // ✅ 3. คำนวณ % กำไร
  const totalPrice = parseFloat(job.totalPrice) || 0;
  const sheetProfit = parseFloat(job.sheetProfit) || 0;
  const marginPercent = totalPrice > 0 ? (sheetProfit / totalPrice) * 100 : 0;

  const isFinished = job.status === 'FINISHED';

  return (
    <tr className={`hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 text-xs ${isFinished ? 'opacity-60 bg-slate-50/50' : ''}`}>
      
      {/* 1. NO */}
      <td className="px-2 py-3 text-center font-bold text-slate-400 border-r border-slate-50 w-10">{job.no}</td>

      {/* 2. Project Info */}
      <td className="px-3 py-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {/* เรียกใช้ฟังก์ชันเปลี่ยนรูปภาพเมื่อคลิก */}
            <ImageWithEdit src={displayImage} onEdit={() => onEditImage(job.id)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`font-bold text-slate-900 uppercase truncate ${isFinished ? 'line-through text-slate-400' : ''}`}>{job.client}</span>
              <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 rounded whitespace-nowrap border border-slate-200">{job.projectType}</span>
            </div>
            <div className="text-[10px] text-slate-500 flex flex-wrap gap-x-2 items-center leading-tight">
              <span className="text-blue-500 font-bold flex items-center gap-0.5"><Wrench size={8}/> {job.teamName}</span>
              <span className="text-slate-300">|</span>
              <span className="text-[#C5A059] font-bold">🏷️ {job.serviceType}</span>
              <span className="text-slate-300">|</span>
              <span className="truncate max-w-[150px] sm:max-w-[250px]" title={job.spec}>
                {job.spec ?? '-'} {job.area > 0 && <span className="text-slate-400">({job.area} ตร.ม.)</span>}
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* 3. Delivery Date */}
      <td className="px-3 py-3 text-center w-28">
        <div className="flex flex-col items-center gap-1">
          <div className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded text-[10px] font-bold border border-orange-100 flex items-center gap-1 whitespace-nowrap">
            <CalendarIcon size={10}/> {formatThaiDate(job.deliveryDate)}
          </div>
          {job.isMoneyReceived && <div className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5"><CheckCircle size={8}/> รับเงินแล้ว</div>}
        </div>
      </td>

      {/* 4. Contract Price */}
      <td className="px-3 py-3 text-right font-medium text-slate-700 w-24">{formatCurrency(totalPrice)}</td>

      {/* 5. Profit */}
      <td className="px-3 py-3 text-right w-24">
        <div className="font-bold text-emerald-600">{formatCurrency(sheetProfit)}</div>
        <div className="text-[9px] text-emerald-500 font-bold">{marginPercent.toFixed(1)}%</div>
      </td>

      {/* 6. Balance (ยอดค้างรับ) */}
      <td className="px-3 py-3 text-right w-28">
        {isPaid ? (
          <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100">
            <CheckCircle size={10}/> ครบแล้ว
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-red-500 bg-red-50 px-2 py-0.5 rounded text-[10px] font-bold border border-red-100">
            <Clock size={10}/> {formatCurrency(balance)}
          </span>
        )}
      </td>

      {/* 7. Manage (ปุ่มจัดการ) */}
      <td className="px-3 py-3 text-center w-20">
        <div className="flex justify-center items-center gap-1">
          <button 
            onClick={() => onShare(job)} 
            className="p-1.5 bg-white border border-slate-200 rounded hover:text-green-500 hover:border-green-500 transition-all shadow-sm" 
            title="แชร์ข้อมูล"
          >
            <Share2 size={14}/>
          </button>
          <button 
            onClick={() => onDoc(job)} 
            className="p-1.5 bg-white border border-slate-200 rounded hover:text-black hover:border-slate-400 transition-all shadow-sm" 
            title="เอกสาร"
          >
            <FileText size={14}/>
          </button>
        </div>
      </td>
    </tr>
  );
}
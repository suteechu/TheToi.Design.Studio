// src/components/JobRow.jsx
import React from 'react';
import { Clock, MoreHorizontal, FileText, AlertTriangle, PlayCircle } from 'lucide-react';

const formatCurrency = (num) => '฿' + (parseFloat(num)||0).toLocaleString();

export default function JobRow({ job, team, showInternal, onEdit, onDelete, onDoc }) {
  const isFinished = job.status === 'FINISHED';
  
  // คำนวณวัน
  const today = new Date();
  today.setHours(0,0,0,0);
  const delivery = new Date(job.deliveryDate);
  delivery.setHours(0,0,0,0);
  
  const diffTime = delivery - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // ตรรกะแจ้งเตือน (Highlight)
  let statusBadge;
  if (isFinished) {
      statusBadge = <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-100 text-emerald-600 border border-emerald-200">เสร็จสิ้น</span>;
  } else if (diffDays < 0) {
      // --- ส่วนที่เช็คว่าเกิน 14 วันหรือไม่ ---
      const overdueDays = Math.abs(diffDays);
      if (overdueDays > 14) {
          // เกิน 14 วัน -> สีแดงเข้ม + กระพริบ
          statusBadge = (
            <span className="px-2 py-1 rounded text-[10px] font-bold bg-red-600 text-white border border-red-700 flex items-center w-fit gap-1 animate-pulse shadow-sm">
               <AlertTriangle size={10} className="fill-white" /> เกิน {overdueDays} วัน!!
            </span>
          );
      } else {
          // เกินทั่วไป -> สีแดงอ่อน
          statusBadge = <span className="px-2 py-1 rounded text-[10px] font-bold bg-red-50 text-red-500 border border-red-100">เกิน {overdueDays} วัน</span>;
      }
  } else {
      statusBadge = <span className="px-2 py-1 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">เหลือ {diffDays} วัน</span>;
  }

  const received = parseFloat(job.receivedAmount) || 0;
  const total = parseFloat(job.totalPrice) || 0;
  const balance = total - received;
  const netProfit = total - (parseFloat(job.actualOutsourceFee) || 0);

  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${isFinished ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                {job.client.charAt(0)}
            </div>
            <div>
                <div className="font-bold text-sm text-slate-800">{job.client}</div>
                <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">{job.projectType}</span>
                    {/* แสดงวันเริ่มงาน (ถ้ามี) */}
                    {job.startDate && (
                        <span className="flex items-center gap-1 text-slate-400"><PlayCircle size={8}/> เริ่ม {new Date(job.startDate).toLocaleDateString('th-TH', {day:'numeric',month:'numeric'})}</span>
                    )}
                </div>
            </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1">
            {statusBadge}
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock size={10}/> ส่ง: {new Date(job.deliveryDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
            </span>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="font-bold text-sm">{formatCurrency(total)}</div>
        <div className="text-[10px] text-slate-400">{job.area} ตร.ม.</div>
      </td>
      
      {showInternal && (
         <td className="px-6 py-4 text-right">
            <div className="font-bold text-sm text-emerald-600">{formatCurrency(netProfit)}</div>
            <div className="text-[10px] text-slate-400">{(netProfit/total*100).toFixed(1)}%</div>
         </td>
      )}

      <td className="px-6 py-4 text-right">
        <div className={`font-bold text-sm ${balance > 0 ? 'text-red-500' : 'text-slate-300'}`}>{formatCurrency(balance)}</div>
        {balance > 0 && <div className="text-[10px] text-red-300">ค้างรับ</div>}
      </td>
      <td className="px-6 py-4 text-center">
         <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onDoc} className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-md transition-colors" title="เอกสาร"><FileText size={16}/></button>
            <button onClick={onEdit} className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-black rounded-md transition-colors" title="แก้ไข"><MoreHorizontal size={16}/></button>
         </div>
      </td>
    </tr>
  );
}
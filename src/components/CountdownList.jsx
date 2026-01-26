// src/components/CountdownList.jsx
import React from 'react';
import { Clock, Home, PenTool, AlertTriangle } from 'lucide-react';

// --- เพิ่มฟังก์ชันนี้กลับเข้ามาครับ ---
const formatCurrency = (num) => '฿' + (parseFloat(num)||0).toLocaleString();
// ----------------------------------

export default function CountdownList({ jobs, onEdit }) {
  // เรียงลำดับ: เอาที่ใกล้ถึงกำหนด หรือเกินกำหนดหนักๆ ขึ้นก่อน
  const sortedJobs = [...jobs].sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedJobs.map(job => {
        const today = new Date();
        today.setHours(0,0,0,0);
        const delivery = new Date(job.deliveryDate);
        delivery.setHours(0,0,0,0);
        const diffTime = delivery - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const isOverdue = diffDays < 0;
        const overdueDays = Math.abs(diffDays);
        const isCritical = isOverdue && overdueDays > 14; // เกิน 14 วัน

        // กำหนดสีของการ์ด
        let cardClass = "bg-white border-slate-200";
        let daysClass = "bg-slate-800 text-white";
        let label = "DAYS LEFT";

        if (job.status === 'FINISHED') {
             daysClass = "bg-emerald-500 text-white";
             label = "FINISHED";
        } else if (isCritical) {
             // สีแดงเข้ม ถ้าเกิน 14 วัน
             cardClass = "bg-red-50 border-red-500 shadow-lg shadow-red-100";
             daysClass = "bg-red-600 text-white animate-pulse";
             label = `OVERDUE ${overdueDays} DAYS!`;
        } else if (isOverdue) {
             // สีส้มแดง ถ้าเกินกำหนดทั่วไป
             cardClass = "bg-white border-orange-200";
             daysClass = "bg-orange-500 text-white";
             label = "OVERDUE";
        }

        return (
          <div key={job.id} onClick={() => onEdit(job)} 
               className={`p-4 rounded-xl border relative cursor-pointer hover:shadow-md transition-all group ${cardClass}`}>
            
            {/* กล่องนับถอยหลัง */}
            <div className="flex justify-between items-start mb-4">
               <div className={`px-3 py-2 rounded-lg text-center min-w-[80px] ${daysClass}`}>
                  <div className="text-xl font-bold leading-none">{job.status === 'FINISHED' ? '✓' : Math.abs(diffDays)}</div>
                  <div className="text-[9px] font-bold uppercase opacity-80">{label}</div>
               </div>
               <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Delivery</div>
                  <div className="text-xs font-bold flex items-center justify-end gap-1">
                     <Clock size={12}/> {new Date(job.deliveryDate).toLocaleDateString('th-TH')}
                  </div>
                  {/* แสดงวันเริ่ม (ถ้ามี) */}
                  {job.startDate && (
                     <div className="text-[10px] text-slate-300 mt-1">
                        Start: {new Date(job.startDate).toLocaleDateString('th-TH')}
                     </div>
                  )}
               </div>
            </div>

            {/* รายละเอียด */}
            <div>
               <h3 className="font-bold text-lg mb-1 group-hover:text-blue-600 transition-colors">{job.client}</h3>
               <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1"><Home size={12}/> {job.projectType}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="flex items-center gap-1"><PenTool size={12}/> {job.serviceType}</span>
               </div>
               
               <div className="pt-3 border-t border-dashed border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400">{job.area} ตร.ม.</span>
                  <div className="flex items-center gap-1">
                     <span className="text-xs text-slate-400">ค้างรับ:</span>
                     <span className={`font-bold text-sm ${(parseFloat(job.totalPrice)-parseFloat(job.receivedAmount))>0 ? 'text-red-500' : 'text-slate-300'}`}>
                        {formatCurrency((parseFloat(job.totalPrice)-parseFloat(job.receivedAmount)))}
                     </span>
                  </div>
               </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
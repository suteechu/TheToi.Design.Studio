// src/components/CountdownList.jsx
import React from 'react';
import { Calendar, ArrowRight, Bed, Bath, Car, HardHat } from 'lucide-react';
import { formatCurrency } from '../utils';

export default function CountdownList({ jobs, onEdit }) {
  const sortedJobs = [...jobs].sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));
  const today = new Date();
  today.setHours(0,0,0,0);

  return (
    <div className="space-y-4 pb-12">
      {sortedJobs.map(job => {
        const deadline = new Date(job.deliveryDate);
        const diffTime = deadline - today;
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let barColor = "bg-emerald-500"; 
        let bgColor = "bg-white";
        let textColor = "text-emerald-600";
        let statusText = "ปกติ";

        if (daysLeft < 0) {
            barColor = "bg-slate-400"; 
            textColor = "text-slate-500";
            statusText = "เกินกำหนด";
        } else if (daysLeft <= 3) {
            barColor = "bg-red-500"; 
            bgColor = "bg-red-50/50";
            textColor = "text-red-600";
            statusText = "ด่วนมาก!";
        } else if (daysLeft <= 7) {
            barColor = "bg-orange-400"; 
            textColor = "text-orange-500";
            statusText = "ต้องเร่ง";
        }

        const progressPercent = Math.max(0, Math.min(100, (1 - (daysLeft / 30)) * 100));

        return (
          <div key={job.id} onClick={() => onEdit(job)} className={`relative border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden ${bgColor}`}>
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${barColor}`}></div>
            <div className="p-5 pl-7">
                <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                        <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg text-white shadow-md ${barColor}`}>
                            <span className="text-xl font-bold leading-none">{daysLeft < 0 ? '!' : daysLeft}</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider">DAYS</span>
                        </div>
                        <div>
                            <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${textColor}`}>{statusText}</div>
                            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1"><Calendar size={12} /> ส่ง: {deadline.toLocaleDateString('th-TH')}</div>
                        </div>
                    </div>
                    <div className="text-right">
                         <div className="text-sm font-bold text-slate-900">{formatCurrency(job.totalPrice)}</div>
                         <div className="text-[9px] text-slate-400 font-bold uppercase">มูลค่างาน</div>
                    </div>
                </div>
                
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-base font-bold text-slate-800 group-hover:text-[#C5A059] transition-colors flex items-center gap-2">
                           {job.client} <ArrowRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                        </h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1"><HardHat size={12}/> {job.projectType}</span>
                            <span className="text-slate-300">|</span>
                            <span>{job.serviceType}</span>
                        </div>
                        
                        {/* --- เพิ่มไอคอนแสดงรายละเอียดห้อง --- */}
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded inline-block">
                             <span className="flex items-center gap-1" title="พื้นที่"><span className="font-bold text-slate-600">{job.area}</span> ตร.ม.</span>
                             {(job.bedrooms > 0) && <span className="flex items-center gap-1 text-slate-500"><Bed size={12}/> {job.bedrooms}</span>}
                             {(job.bathrooms > 0) && <span className="flex items-center gap-1 text-slate-500"><Bath size={12}/> {job.bathrooms}</span>}
                             {(job.parking > 0) && <span className="flex items-center gap-1 text-slate-500"><Car size={12}/> {job.parking}</span>}
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-1.5 w-full bg-slate-100 mt-0"><div className={`h-full ${barColor} opacity-50 transition-all duration-1000`} style={{ width: `${progressPercent}%` }}></div></div>
          </div>
        );
      })}
    </div>
  );
}
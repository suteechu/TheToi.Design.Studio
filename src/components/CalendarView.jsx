import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, DollarSign } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

export default function CalendarView({ jobs, onJobClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = useMemo(() => {
    return new Date(year, month + 1, 0).getDate();
  }, [year, month]);

  const firstDay = new Date(year, month, 1).getDay();
  const months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

  const getStatusColor = (job) => {
    if (job.status === 'FINISHED') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    const due = new Date(job.deliveryDate);
    const today = new Date();
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'bg-red-100 text-red-700 border-red-200';
    if (diff <= 7) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
            <CalendarIcon size={20} className="text-[#C5A059]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{months[month]} {year + 543}</h2>
            <p className="text-xs text-slate-400 font-medium">ตารางงานประจำเดือน</p>
          </div>
        </div>
        <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-500"><ChevronLeft size={18}/></button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 text-xs font-bold text-[#C5A059] hover:bg-orange-50 rounded-lg transition-colors">วันนี้</button>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-500"><ChevronRight size={18}/></button>
        </div>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
        {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((d, i) => (
          <div key={d} className={`py-3 text-center text-xs font-bold ${i === 0 || i === 6 ? 'text-red-400' : 'text-slate-500'}`}>{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 auto-rows-fr bg-slate-100 gap-px border-b border-slate-200">
        {[...Array(firstDay)].map((_, i) => <div key={`empty-${i}`} className="bg-white min-h-[120px]"></div>)}
        
        {[...Array(daysInMonth)].map((_, i) => {
          const d = i + 1;
          const dayJobs = (jobs || []).filter(j => {
            if (!j.deliveryDate) return false;
            try {
              const jd = new Date(j.deliveryDate);
              return jd.getDate() === d && jd.getMonth() === month && jd.getFullYear() === year;
            } catch (e) { return false; }
          });

          return (
            <div key={d} className="bg-white p-2 min-h-[120px] transition-all hover:bg-slate-50/50 group relative">
              <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                new Date().getDate() === d && new Date().getMonth() === month && new Date().getFullYear() === year 
                ? 'bg-[#C5A059] text-white shadow-md' 
                : 'text-slate-400 group-hover:text-slate-800'
              }`}>{d}</span>
              
              <div className="space-y-1.5 mt-1">
                {dayJobs.map(j => (
                  <div 
                    key={j.id} 
                    onClick={() => onJobClick(j)} 
                    className={`text-[10px] px-2 py-1.5 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ${getStatusColor(j)}`}
                  >
                    <div className="font-bold truncate">{j.client}</div>
                    <div className="flex justify-between items-center mt-0.5 opacity-80">
                      <span className="flex items-center gap-0.5"><Clock size={8}/> {j.projectType}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
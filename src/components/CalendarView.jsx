import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';

export default function CalendarView({ jobs, onJobClick, onMoveJob }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // ฟังก์ชันเลื่อนเดือน
  const changeMonth = (offset) => {
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
    setCurrentDate(new Date(newDate));
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sun
  
  // ปรับให้เริ่มวันจันทร์ (ถ้าต้องการเริ่มอาทิตย์ให้แก้ offset เป็น 0)
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 

  // ดึงงานของเดือนนี้มาแสดง
  const getJobsForDay = (day) => {
    return jobs.filter(job => {
      const d = new Date(job.deliveryDate);
      return d.getDate() === day && 
             d.getMonth() === currentDate.getMonth() && 
             d.getFullYear() === currentDate.getFullYear();
    });
  };

  // สร้าง Array ของช่องวันที่
  const days = [];
  // ช่องว่างก่อนวันที่ 1
  for (let i = 0; i < startOffset; i++) {
    days.push(null);
  }
  // วันที่ 1 ถึงสิ้นเดือน
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  // เติมช่องว่างให้ครบตาราง (เพื่อให้เส้นขอบสวยงาม)
  while (days.length % 7 !== 0) {
    days.push(null);
  }

  // --- Drag & Drop Logic ---
  const handleDragStart = (e, jobId) => {
    e.dataTransfer.setData("jobId", jobId);
  };

  const handleDrop = (e, day) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData("jobId");
    if (jobId && day && onMoveJob) {
       // สร้าง Date object ใหม่
       const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
       // ปรับเวลาให้เป็น Local เพื่อแก้ปัญหา Timezone เพี้ยน
       const offset = newDate.getTimezoneOffset();
       const localDate = new Date(newDate.getTime() - (offset*60*1000));
       onMoveJob(jobId, localDate.toISOString().split('T')[0]);
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  // -------------------------

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in zoom-in duration-300">
      
      {/* Header (เดือน/ปี) - ปรับให้เล็กและกระชับ */}
      <div className="flex justify-between items-center px-4 py-2 bg-slate-50 border-b border-slate-200 shrink-0 h-14">
        <h2 className="text-lg font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
           <span className="bg-black text-white px-2 py-0.5 rounded text-sm">
             {currentDate.toLocaleDateString('th-TH', { month: 'short' })}
           </span>
           {currentDate.toLocaleDateString('th-TH', { year: 'numeric' })}
        </h2>
        <div className="flex gap-1">
          <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"><ChevronLeft size={20} /></button>
          <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"><ChevronRight size={20} /></button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 bg-slate-100 border-b border-slate-200 shrink-0">
        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
          <div key={day} className="py-2 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest border-r last:border-r-0 border-slate-200">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid - ใช้ flex-1 เพื่อให้ยืดเต็มพื้นที่ที่เหลือ */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-slate-50">
        {days.map((day, index) => {
          const dayJobs = day ? getJobsForDay(day) : [];
          const isToday = day === new Date().getDate() && 
                          currentDate.getMonth() === new Date().getMonth() && 
                          currentDate.getFullYear() === new Date().getFullYear();

          return (
            <div 
              key={index}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day)}
              className={`
                border-b border-r border-slate-200 p-1 relative flex flex-col group transition-colors
                ${!day ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'}
                ${isToday ? 'bg-blue-50/30' : ''}
              `}
            >
              {/* วันที่ */}
              {day && (
                <div className={`
                  text-[10px] font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full ml-auto
                  ${isToday ? 'bg-black text-white' : 'text-slate-400 group-hover:text-slate-600'}
                `}>
                  {day}
                </div>
              )}

              {/* รายการงาน (Scroll ได้ถ้าเยอะเกิน) */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                 {dayJobs.map(job => (
                    <div 
                      key={job.id}
                      draggable 
                      onDragStart={(e) => handleDragStart(e, job.id)}
                      onClick={() => onJobClick(job)}
                      className={`
                        p-1.5 rounded cursor-pointer border shadow-sm text-[10px] transition-all hover:scale-[1.02] active:scale-95
                        ${job.status === 'FINISHED' 
                           ? 'bg-emerald-50 border-emerald-100 text-emerald-700 opacity-60 grayscale-[0.5]' 
                           : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md'
                        }
                      `}
                    >
                       <div className="font-bold truncate">{job.client}</div>
                       <div className="flex items-center gap-1 text-[9px] opacity-70 mt-0.5">
                          <Clock size={8} /> {job.projectType}
                       </div>
                    </div>
                 ))}
              </div>
            </div>
          );
        })}
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
      `}</style>
    </div>
  );
}
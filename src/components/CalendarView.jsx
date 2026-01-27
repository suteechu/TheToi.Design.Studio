import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarView({ jobs, onJobClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-in fade-in">
      <div className="p-4 border-b flex justify-between items-center bg-white">
         <h2 className="text-lg font-bold uppercase">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
         <div className="flex bg-slate-100 rounded p-1">
            <button onClick={() => setCurrentDate(new Date(year, month-1, 1))} className="p-1 hover:bg-white rounded shadow-sm"><ChevronLeft size={16}/></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 text-xs font-bold">Today</button>
            <button onClick={() => setCurrentDate(new Date(year, month+1, 1))} className="p-1 hover:bg-white rounded shadow-sm"><ChevronRight size={16}/></button>
         </div>
      </div>
      <div className="grid grid-cols-7 bg-slate-50 border-b">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => <div key={d} className="py-3 text-center text-[10px] font-bold text-slate-400">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 auto-rows-fr bg-slate-50 gap-px border-b border-slate-200">
        {[...Array(firstDay)].map((_, i) => <div key={`empty-${i}`} className="bg-white min-h-[100px]"></div>)}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const dayJobs = jobs.filter(j => {
             const d = new Date(j.deliveryDate);
             return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
          });
          return (
            <div key={day} className="bg-white p-2 min-h-[100px] relative group hover:bg-slate-50 transition-colors">
              <span className={`text-xs font-bold ${new Date().toDateString() === new Date(year, month, day).toDateString() ? 'bg-black text-white px-2 py-0.5 rounded-full' : 'text-slate-400'}`}>{day}</span>
              <div className="mt-2 space-y-1">
                {dayJobs.map(j => (
                  <div key={j.id} onClick={() => onJobClick(j)} className="text-[9px] px-2 py-1 rounded bg-blue-50 text-blue-600 truncate cursor-pointer hover:bg-blue-600 hover:text-white transition-colors border border-blue-100">
                    {j.client}
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
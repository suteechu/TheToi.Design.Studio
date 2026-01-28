import React, { useState, useMemo } from 'react';

export default function CalendarView({ jobs, onJobClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const safeDate = !isNaN(currentDate.getTime()) ? currentDate : new Date();
  
  const year = safeDate.getFullYear();
  const month = safeDate.getMonth();
  
  const daysInMonth = useMemo(() => {
    const d = new Date(year, month + 1, 0);
    return isNaN(d.getDate()) ? 30 : d.getDate();
  }, [year, month]);

  const firstDay = new Date(year, month, 1).getDay();
  const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-in fade-in">
      <div className="p-4 border-b flex justify-between items-center"><h2 className="text-base font-bold text-slate-800">{months[month]} {year+543}</h2><div className="flex bg-slate-50 rounded p-1"><button onClick={()=>setCurrentDate(new Date(year, month-1, 1))} className="px-2 text-xs">←</button><button onClick={()=>setCurrentDate(new Date())} className="px-2 text-xs font-bold text-[#C5A059]">วันนี้</button><button onClick={()=>setCurrentDate(new Date(year, month+1, 1))} className="px-2 text-xs">→</button></div></div>
      <div className="grid grid-cols-7 bg-slate-50 border-b">{['อา','จ','อ','พ','พฤ','ศ','ส'].map(d=><div key={d} className="py-2 text-center text-[10px] font-bold text-slate-400">{d}</div>)}</div>
      <div className="grid grid-cols-7 auto-rows-fr bg-slate-50 gap-px border-b border-slate-200">{[...Array(firstDay)].map((_,i)=><div key={`e-${i}`} className="bg-white min-h-[80px]"></div>)}{[...Array(daysInMonth)].map((_,i)=>{const d=i+1; const dayJobs=jobs.filter(j=>{
          if (!j.deliveryDate) return false;
          const jd = new Date(j.deliveryDate);
          if (isNaN(jd.getTime())) return false;
          return jd.getDate()===d && jd.getMonth()===month && jd.getFullYear()===year
      }); return(<div key={d} className="bg-white p-1.5 min-h-[80px]"><span className="text-[10px] font-bold text-slate-400">{d}</span><div className="mt-1 space-y-1">{dayJobs.map(j=><div key={j.id} onClick={()=>onJobClick(j)} className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 truncate cursor-pointer">{j.client}</div>)}</div></div>)})}</div>
    </div>
  );
}
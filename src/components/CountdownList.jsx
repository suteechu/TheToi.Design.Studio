import React from 'react';
import { Home, Calendar as CalendarIcon, Clock } from 'lucide-react';

export default function CountdownList({ jobs, onDoc }) {
  const sorted = [...jobs].sort((a,b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 p-4">
       {sorted.map(job => {
          const days = Math.ceil((new Date(job.deliveryDate) - new Date()) / (1000 * 60 * 60 * 24));
          const isOver = days < 0;
          const isToday = days === 0;
          
          let statusColor = 'bg-slate-100 text-slate-600 border-slate-200';
          if (isOver) statusColor = 'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/20';
          else if (isToday || days <= 3) statusColor = 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20';
          else if (days <= 7) statusColor = 'bg-gold-500 text-white border-gold-500 shadow-md shadow-gold-500/20';

          return (
            <div key={job.id} onClick={() => onDoc(job)} className={`glass-card p-5 cursor-pointer hover-lift group border-l-4 ${isOver ? 'border-l-red-500' : isToday || days <= 3 ? 'border-l-orange-500' : 'border-l-gold-500'}`}>
               <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-sm uppercase text-slate-900 group-hover:text-gold-600 transition-colors line-clamp-1">{job.client}</h3>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusColor} whitespace-nowrap flex items-center gap-1`}>
                     <Clock size={10} />
                     {isOver ? `เลยกำหนด ${Math.abs(days)} วัน` : isToday ? 'ครบกำหนดวันนี้' : `เหลือ ${days} วัน`}
                  </span>
               </div>
               
               <div className="flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                  <Home size={14} className="text-slate-400"/> {job.projectType}
               </div>
               
               <div className="mt-4 pt-4 border-t border-dashed border-slate-200 flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5"><CalendarIcon size={12}/> กำหนดส่ง</span>
                  <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{new Date(job.deliveryDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
               </div>
            </div>
          );
       })}
    </div>
  );
}
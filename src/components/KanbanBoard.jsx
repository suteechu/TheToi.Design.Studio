import React from 'react';
import { Clock, CheckCircle, Home, Calendar as CalendarIcon } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

export default function KanbanBoard({ jobs, onDoc }) {
  const inProgressJobs = jobs.filter(j => j.status !== 'FINISHED').sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));
  const finishedJobs = jobs.filter(j => j.status === 'FINISHED').sort((a, b) => new Date(b.deliveryDate) - new Date(a.deliveryDate));

  const Column = ({ title, icon: Icon, jobsList, colorClass, borderColorClass }) => (
    <div className="flex-1 min-w-[300px] bg-slate-100/50 rounded-2xl p-4 border border-slate-200/60 flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className={`font-bold flex items-center gap-2 ${colorClass}`}>
          <Icon size={18} /> {title}
        </h3>
        <span className="bg-white text-slate-500 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm border border-slate-200">
          {jobsList.length}
        </span>
      </div>
      
      <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1 pb-2" style={{ maxHeight: '600px' }}>
        {jobsList.map(job => {
          const days = Math.ceil((new Date(job.deliveryDate) - new Date()) / (1000 * 60 * 60 * 24));
          const isOver = days < 0;
          const isToday = days === 0;
          
          return (
            <div 
              key={job.id} 
              onClick={() => onDoc(job)} 
              className={`bg-white p-4 rounded-xl cursor-pointer hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md border-l-4 border-y border-r border-slate-100 group ${borderColorClass}`}
            >
               <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-sm uppercase text-slate-800 group-hover:text-gold-600 transition-colors line-clamp-2">{job.client}</h4>
               </div>
               
               <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mb-4">
                  <Home size={12} className="text-slate-400"/> {job.projectType}
               </div>

               <div className="flex justify-between items-end">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ยอดรวม</span>
                    <span className="text-sm font-bold text-slate-700">{formatCurrency(job.totalPrice)}</span>
                  </div>

                  {job.status !== 'FINISHED' && (
                    <div className={`text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 ${isOver ? 'bg-red-50 text-red-600' : isToday || days <= 3 ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                       <Clock size={10} />
                       {isOver ? `เลยกำหนด` : isToday ? 'วันนี้' : `เหลือ ${days} วัน`}
                    </div>
                  )}
                  {job.status === 'FINISHED' && (
                    <div className="text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 bg-emerald-50 text-emerald-600">
                       <CheckCircle size={10} />
                       ส่งงานแล้ว
                    </div>
                  )}
               </div>
            </div>
          );
        })}
        {jobsList.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-sm font-medium border-2 border-dashed border-slate-200 rounded-xl">
            ไม่มีงานในหมวดหมู่นี้
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-6 p-2 overflow-x-auto">
      <Column 
        title="กำลังดำเนินการ (In Progress)" 
        icon={Clock} 
        jobsList={inProgressJobs} 
        colorClass="text-blue-600" 
        borderColorClass="border-l-blue-500"
      />
      <Column 
        title="เสร็จสิ้นแล้ว (Finished)" 
        icon={CheckCircle} 
        jobsList={finishedJobs} 
        colorClass="text-emerald-600" 
        borderColorClass="border-l-emerald-500"
      />
    </div>
  );
}

import React from 'react';
import { Home } from 'lucide-react';

export default function CountdownList({ jobs, onEdit }) {
  const sorted = [...jobs].sort((a,b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
       {sorted.map(job => {
          const days = Math.ceil((new Date(job.deliveryDate) - new Date()) / (1000 * 60 * 60 * 24));
          const isOver = days < 0;
          return (
            <div key={job.id} onClick={() => onEdit(job)} className={`bg-white p-5 rounded-xl border cursor-pointer hover:shadow-md transition-all ${isOver ? 'border-red-200 bg-red-50/10' : 'border-slate-100'}`}>
               <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-sm uppercase">{job.client}</h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${isOver ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                     {isOver ? `${Math.abs(days)} วันที่แล้ว` : `อีก ${days} วัน`}
                  </span>
               </div>
               <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Home size={12}/> {job.projectType}
               </div>
               <div className="mt-3 pt-3 border-t border-dashed border-slate-200 flex justify-between text-xs">
                  <span className="text-slate-400">กำหนดส่ง:</span>
                  <span className="font-bold">{new Date(job.deliveryDate).toLocaleDateString('th-TH')}</span>
               </div>
            </div>
          );
       })}
    </div>
  );
}
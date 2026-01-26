// src/components/JobRow.jsx
import React from 'react';
import { formatCurrency } from '../utils';
import { Image as ImageIcon, Settings, Trash2, Clock, Bed, Bath, Car, HardHat } from 'lucide-react';

export default function JobRow({ job, team, showInternal, onEdit, onDelete, onDoc }) {
   const balance = parseFloat(job.totalPrice || 0) - parseFloat(job.receivedAmount || 0);
   const percentPaid = job.totalPrice > 0 ? (job.receivedAmount / job.totalPrice) * 100 : 0;
   
   const cost = parseFloat(job.actualOutsourceFee) || 0;
   const profit = (parseFloat(job.totalPrice) || 0) - cost;

   let badgeClass = "bg-red-50 text-red-500 border-red-100";
   let statusText = "ค้างจ่าย";

   if (balance <= 0 && job.totalPrice > 0) {
      badgeClass = "bg-green-50 text-green-600 border-green-200";
      statusText = "เสร็จสิ้น";
   } else if (percentPaid >= 50) {
      badgeClass = "bg-yellow-50 text-yellow-600 border-yellow-200";
      statusText = "มัดจำ 50%";
   } else if (percentPaid > 0) {
      badgeClass = "bg-orange-50 text-orange-600 border-orange-200";
      statusText = "บางส่วน";
   }

   const daysLeft = Math.ceil((new Date(job.deliveryDate) - new Date()) / (1000 * 60 * 60 * 24));
   let deadlineClass = "text-slate-400";
   if(daysLeft <= 3 && balance > 0) deadlineClass = "text-red-500 font-bold animate-pulse";
   else if(daysLeft <= 7 && balance > 0) deadlineClass = "text-orange-500 font-bold";

   return (
      <tr className="hover:bg-slate-50 transition-all border-b border-slate-50 group">
         <td className="px-6 py-4 cursor-pointer" onClick={onDoc}>
            <div className="flex items-center gap-4">
               {job.image ? (
                 <img src={job.image} alt="Project" className="w-12 h-12 object-cover rounded-md border border-slate-200 shadow-sm" />
               ) : (
                 <div className="w-12 h-12 bg-slate-100 rounded-md flex items-center justify-center text-slate-300">
                    <ImageIcon size={20} />
                 </div>
               )}
               <div>
                  <div className="font-bold text-slate-900 uppercase text-xs tracking-tight">{job.client}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                     {job.serviceType} <span className="text-slate-300 mx-1">|</span> {job.projectType}
                  </div>
                  
                  {/* --- แสดงข้อมูลห้อง --- */}
                  <div className="text-[9px] text-slate-400 mt-1 flex items-center gap-3">
                      {(job.bedrooms > 0) && <span className="flex items-center gap-1"><Bed size={10}/> {job.bedrooms}</span>}
                      {(job.bathrooms > 0) && <span className="flex items-center gap-1"><Bath size={10}/> {job.bathrooms}</span>}
                      {(job.parking > 0) && <span className="flex items-center gap-1"><Car size={10}/> {job.parking}</span>}
                  </div>

                  <div className={`text-[9px] mt-1 flex items-center gap-1 ${deadlineClass}`}>
                     <Clock size={10} /> ส่งงาน: {new Date(job.deliveryDate).toLocaleDateString('th-TH')} ({daysLeft} วัน)
                  </div>
               </div>
            </div>
         </td>
         <td className="px-6 py-4"><span className={`px-2 py-1 text-[9px] font-bold uppercase border rounded-md whitespace-nowrap ${badgeClass}`}>{statusText}</span></td>
         <td className="px-6 py-4 text-right font-medium text-xs tracking-tighter text-slate-900">{formatCurrency(job.totalPrice)}</td>
         
         {showInternal && (
             <td className="px-6 py-4 text-right">
                 <div className="text-emerald-500 font-bold text-xs">{formatCurrency(profit)}</div>
                 <div className="text-[8px] text-slate-400 uppercase">กำไรสุทธิ</div>
             </td>
         )}
         
         <td className={`px-6 py-4 text-right font-bold text-sm ${balance > 0 ? 'text-red-600' : 'text-slate-300'}`}>{formatCurrency(balance)}</td>
         <td className="px-6 py-4 text-center">
            <div className="flex justify-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={(e) => { e.stopPropagation(); onDoc(); }} className="bg-black text-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest hover:bg-[#C5A059] rounded transition-colors shadow-sm">เอกสาร</button>
               <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 text-slate-400 hover:text-black hover:bg-slate-100 rounded transition-colors"><Settings size={14} /></button>
               <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={14} /></button>
            </div>
         </td>
      </tr>
   );
}
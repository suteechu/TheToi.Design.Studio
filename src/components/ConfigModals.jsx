import React, { useState } from 'react';
import { X, Plus, FileText, Printer, Home, Bed, Car, FolderOpen } from 'lucide-react';
import { formatThaiDate } from '../utils/helpers';

export const CountdownList = ({ jobs, onEdit, onToggleStatus, onShare }) => {
    const sorted = [...jobs].sort((a,b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
         {sorted.length > 0 ? sorted.map(job => {
            const start = new Date(job.startDate || new Date()); const end = new Date(job.deliveryDate); const today = new Date();
            const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 14;
            const daysLeft = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
            const daysPassed = totalDays - daysLeft;
            let progress = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));
            const isFinished = job.status === 'FINISHED';
            let statusColor = daysLeft < 0 ? "bg-red-600" : daysLeft <= 3 ? "bg-red-500" : daysLeft <= 7 ? "bg-orange-400" : "bg-emerald-500";
            let statusText = daysLeft < 0 ? "เกินกำหนด" : daysLeft <= 3 ? "ด่วนมาก" : daysLeft <= 7 ? "ใกล้ถึง" : "ปกติ";
            if (isFinished) { statusColor = "bg-emerald-600"; statusText = "ส่งงานแล้ว"; progress = 100; }
  
            return (
              <div key={job.id} onClick={() => onEdit(job)} className={`bg-white p-5 rounded-2xl border border-slate-100 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group relative overflow-hidden ${isFinished ? 'opacity-90' : ''}`}>
                 <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-center items-center p-6 text-center border border-slate-200 hover-card">
                     <h3 className="font-bold text-lg text-slate-800 mb-2 uppercase">{job.client}</h3>
                     <div className="space-y-1 text-xs text-slate-500 mb-4">
                         <p className="font-medium">{job.projectType}</p>
                         <p>เริ่ม: {formatThaiDate(job.startDate)} - ส่ง: {formatThaiDate(job.deliveryDate)}</p>
                         <p>ขนาด: {job.area || '-'} ตร.ม.</p>
                     </div>
                     <div className="flex gap-2">
                         <button onClick={(e) => { e.stopPropagation(); onEdit(job); }} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-slate-700">แก้ไข</button>
                         <button onClick={(e) => { e.stopPropagation(); onShare(job); }} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-blue-600">แชร์</button>
                         <button onClick={(e) => { e.stopPropagation(); onToggleStatus(job.id); }} className={`px-4 py-2 rounded-lg text-xs font-bold border shadow-sm ${isFinished ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'}`}>{isFinished ? 'ยกเลิกส่งงาน' : 'ยืนยันส่งงาน'}</button>
                     </div>
                 </div>
                 <div className="flex justify-between items-start mb-3">
                     <div><h3 className={`font-bold text-sm uppercase ${isFinished ? 'text-slate-500 line-through decoration-2 decoration-slate-300' : 'text-slate-800'}`}>{job.client}</h3><div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1"><Home size={10}/> {job.projectType}</div></div>
                     <div className={`px-2 py-1 rounded-lg text-[9px] font-bold text-white uppercase tracking-wider shadow-sm ${statusColor}`}>{statusText}</div>
                 </div>
                 <div className="flex items-center gap-3 text-[10px] text-slate-400 mb-3 bg-slate-50 p-1.5 rounded">
                     {(job.bedrooms > 0 || job.bathrooms > 0 || job.parking > 0) ? (
                          <>{job.bedrooms > 0 && <span className="flex items-center gap-0.5"><Bed size={10}/>{job.bedrooms}</span>}{job.bathrooms > 0 && <span className="flex items-center gap-0.5"><Bath size={10}/>{job.bathrooms}</span>}{job.parking > 0 && <span className="flex items-center gap-0.5"><Car size={10}/>{job.parking}</span>}</>
                     ) : <span>ไม่มีรายละเอียดสเปค</span>}
                     {job.area > 0 && <span>| {job.area} (Sqm.)</span>}
                 </div>
                 <div className="flex justify-between items-end mb-1.5"><span className="text-3xl font-bold text-slate-900 tracking-tight">{isFinished ? 'DONE' : Math.abs(daysLeft)}<span className="text-[10px] font-bold text-slate-400 ml-1">{isFinished ? '' : 'วัน'}</span></span><span className="text-[9px] text-slate-400 font-bold uppercase">{Math.round(progress)}% ใช้ไป</span></div>
                 <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3"><div className={`h-full ${statusColor} transition-all duration-1000`} style={{ width: `${progress}%` }}></div></div>
                 <div className="pt-3 border-t border-dashed border-slate-200 flex justify-between text-[10px] font-medium items-center">
                     <div className="text-slate-400">ส่ง: <span className="text-slate-900 font-bold">{formatThaiDate(job.deliveryDate)}</span></div>
                     <div className={`w-2.5 h-2.5 rounded-full ${isFinished ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                 </div>
              </div>
            );
         }) : (
             <div className="col-span-3 text-center py-20 text-slate-300">
                 <FolderOpen size={48} className="mx-auto mb-3 opacity-20"/>
                 <p>ยังไม่มีรายการงาน</p>
                 <p className="text-xs mt-1">กดปุ่ม + Create ด้านบน หรือนำเข้า CSV เพื่อเริ่มใช้งาน</p>
             </div>
         )}
      </div>
    );
};

export const DocSelectModal = ({ onClose, onSelect }) => (<div className="fixed inset-0 bg-black/60 z-[65] flex items-center justify-center p-4"><div className="bg-white p-6 rounded-2xl text-center max-w-sm w-full"><h3 className="text-xs font-bold uppercase mb-6 text-slate-500">เลือกเอกสาร (Select)</h3><div className="flex gap-3 justify-center"><button onClick={()=>onSelect('QUOTATION')} className="flex-1 p-4 border rounded-xl flex flex-col items-center gap-2 hover:bg-slate-50"><FileText size={20} className="text-slate-400"/><span className="text-xs font-bold">ใบเสนอราคา</span></button><button onClick={()=>onSelect('RECEIPT')} className="flex-1 p-4 border border-[#C5A059]/30 bg-[#C5A059]/5 rounded-xl flex flex-col items-center gap-2 hover:bg-[#C5A059]/10"><Printer size={20} className="text-[#C5A059]"/><span className="text-xs font-bold text-[#C5A059]">ใบเสร็จ</span></button></div><button onClick={onClose} className="mt-6 text-[10px] font-bold text-slate-400 underline">ยกเลิก</button></div></div>);
export const TeamModal = ({ teams, onClose, onAdd, onDelete }) => { const [name, setName] = useState(''); const [rate, setRate] = useState(80); return (<div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"><div className="bg-white w-full max-w-md p-6 rounded-2xl"><div className="flex justify-between mb-4"><h3 className="font-bold text-sm">จัดการทีมช่าง</h3><button onClick={onClose}><X size={16}/></button></div><div className="flex gap-2 mb-4"><input placeholder="ชื่อ..." className="flex-1 border p-2 rounded-lg text-xs" value={name} onChange={e=>setName(e.target.value)} /><input type="number" className="w-16 border p-2 rounded-lg text-xs text-center" value={rate} onChange={e=>setRate(e.target.value)} /><button onClick={()=>{if(name){onAdd({name, ratePerSqm: rate}); setName('');}}} className="bg-black text-white p-2 rounded-lg"><Plus size={16}/></button></div><div className="space-y-2 max-h-[250px] overflow-y-auto">{teams.map(t=><div key={t.id} className="flex justify-between p-2 border rounded-lg items-center text-xs"><span>{t.name}</span><button onClick={()=>onDelete(t.id)}><X size={12}/></button></div>)}</div></div></div>); };
export const ProjectTypeModal = ({ list, onClose }) => (<div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"><div className="bg-white w-full max-w-sm p-6 rounded-2xl"><h3 className="font-bold text-sm mb-4">ประเภทงาน</h3><div className="space-y-2 max-h-[300px] overflow-y-auto">{list.map((t,i)=><div key={i} className="p-2 border rounded-lg text-xs">{t}</div>)}</div><button onClick={onClose} className="mt-4 w-full border p-2 rounded-lg text-xs">ปิด</button></div></div>);
export const ServiceTypeModal = ({ list, onClose }) => (<div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"><div className="bg-white w-full max-w-sm p-6 rounded-2xl"><h3 className="font-bold text-sm mb-4">บริการ</h3><div className="space-y-2 max-h-[300px] overflow-y-auto">{list.map((t,i)=><div key={i} className="p-2 border rounded-lg text-xs">{t}</div>)}</div><button onClick={onClose} className="mt-4 w-full border p-2 rounded-lg text-xs">ปิด</button></div></div>);
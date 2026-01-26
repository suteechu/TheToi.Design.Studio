// src/components/ConfigModals.jsx
import React from 'react';
import { Trash2, FileSpreadsheet, Printer } from 'lucide-react';

export const TeamModal = ({ teams, onClose, onAdd, onDelete }) => (
   <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md shadow-2xl p-8 border-t-8 border-[#C5A059] rounded-xl">
         <h2 className="text-xl font-bold uppercase mb-8">จัดการ <span className="text-[#C5A059]">ทีมช่าง</span></h2>
         <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); onAdd({ name: fd.get('teamName'), ratePerSqm: parseFloat(fd.get('rate')) }); e.target.reset(); }} className="space-y-4 mb-8 bg-slate-50 p-6 rounded-lg">
            <input name="teamName" required placeholder="ชื่อทีมช่าง..." className="w-full px-4 py-3 bg-white border border-slate-100 rounded focus:outline-none focus:border-[#C5A059] text-sm font-bold uppercase" />
            <div className="relative">
               <input name="rate" type="number" required defaultValue="80" placeholder="เรทค่าแรง..." className="w-full px-4 py-3 bg-white border border-slate-100 rounded focus:outline-none focus:border-[#C5A059] text-sm pl-10" />
               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs">฿</span>
            </div>
            <button type="submit" className="w-full py-3 bg-[#C5A059] text-white text-xs font-bold uppercase hover:bg-[#1A1A1A] transition-all rounded">เพิ่มทีม</button>
         </form>
         <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
            {teams.map(t => (
               <div key={t.id} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded hover:border-[#C5A059] transition-colors">
                  <div><p className="text-xs font-bold text-slate-900">{t.name}</p><p className="text-[9px] text-[#C5A059] font-bold">RATE: ฿{t.ratePerSqm}/SQM</p></div>
                  <button onClick={() => onDelete(t.id)} className="text-slate-200 hover:text-red-500"><Trash2 size={16} /></button>
               </div>
            ))}
         </div>
         <button onClick={onClose} className="w-full mt-6 text-[10px] font-bold text-slate-400 uppercase hover:text-black">ปิด</button>
      </div>
   </div>
);

// Modal สำหรับจัดการ "ประเภทงาน" (Project Type)
export const ProjectTypeModal = ({ list, onClose, onAdd, onDelete }) => (
   <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md shadow-2xl p-8 border-t-8 border-[#C5A059] rounded-xl">
         <h2 className="text-xl font-bold uppercase mb-8">จัดการ <span className="text-[#C5A059]">ประเภทงาน (Project)</span></h2>
         <form onSubmit={(e) => { e.preventDefault(); const val = new FormData(e.target).get('name'); if(val) onAdd(val); e.target.reset(); }} className="space-y-4 mb-8 bg-slate-50 p-6 rounded-lg">
            <input name="name" required placeholder="เช่น บ้านสองชั้น..." className="w-full px-4 py-3 bg-white border border-slate-100 rounded focus:outline-none focus:border-[#C5A059] text-sm font-bold uppercase" />
            <button type="submit" className="w-full py-3 bg-[#C5A059] text-white text-xs font-bold uppercase hover:bg-[#1A1A1A] transition-all rounded">เพิ่มรายการ</button>
         </form>
         <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
            {list.map((t, i) => (
               <div key={i} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded hover:border-[#C5A059] transition-colors">
                  <p className="text-xs font-bold text-slate-900 uppercase">{t}</p>
                  <button onClick={() => onDelete(i)} className="text-slate-200 hover:text-red-500"><Trash2 size={16} /></button>
               </div>
            ))}
         </div>
         <button onClick={onClose} className="w-full mt-6 text-[10px] font-bold text-slate-400 uppercase hover:text-black">ปิด</button>
      </div>
   </div>
);

// Modal สำหรับจัดการ "ชนิดงาน" (Service Type)
export const ServiceTypeModal = ({ list, onClose, onAdd, onDelete }) => (
   <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md shadow-2xl p-8 border-t-8 border-black rounded-xl">
         <h2 className="text-xl font-bold uppercase mb-8">จัดการ <span className="text-black">ชนิดงาน (Service)</span></h2>
         <form onSubmit={(e) => { e.preventDefault(); const val = new FormData(e.target).get('name'); if(val) onAdd(val); e.target.reset(); }} className="space-y-4 mb-8 bg-slate-50 p-6 rounded-lg">
            <input name="name" required placeholder="เช่น แบบก่อสร้าง+3D..." className="w-full px-4 py-3 bg-white border border-slate-100 rounded focus:outline-none focus:border-black text-sm font-bold uppercase" />
            <button type="submit" className="w-full py-3 bg-black text-white text-xs font-bold uppercase hover:bg-[#C5A059] transition-all rounded">เพิ่มรายการ</button>
         </form>
         <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
            {list.map((t, i) => (
               <div key={i} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded hover:border-black transition-colors">
                  <p className="text-xs font-bold text-slate-900 uppercase">{t}</p>
                  <button onClick={() => onDelete(i)} className="text-slate-200 hover:text-red-500"><Trash2 size={16} /></button>
               </div>
            ))}
         </div>
         <button onClick={onClose} className="w-full mt-6 text-[10px] font-bold text-slate-400 uppercase hover:text-black">ปิด</button>
      </div>
   </div>
);

export const DocSelectModal = ({ onClose, onSelect }) => (
   <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[65] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-10 text-center border-t-8 border-black rounded-xl">
         <h3 className="text-lg font-bold uppercase mb-8">เลือกประเภทเอกสาร</h3>
         <div className="grid grid-cols-2 gap-4">
            <button onClick={() => onSelect('QUOTATION')} className="py-6 border border-slate-200 hover:border-black hover:bg-slate-50 transition-all font-bold uppercase text-xs tracking-widest w-full rounded-lg flex flex-col items-center gap-2"><FileSpreadsheet size={24} /><span>ใบเสนอราคา<br/>(Quotation)</span></button>
            <button onClick={() => onSelect('RECEIPT')} className="py-6 bg-[#C5A059] text-white hover:bg-[#1A1A1A] transition-all font-bold uppercase text-xs tracking-widest w-full rounded-lg flex flex-col items-center gap-2 shadow-lg"><Printer size={24} /><span>ใบเสร็จรับเงิน<br/>(Receipt)</span></button>
         </div>
         <button onClick={onClose} className="mt-8 text-[10px] text-slate-400 font-bold uppercase">ยกเลิก</button>
      </div>
   </div>
);
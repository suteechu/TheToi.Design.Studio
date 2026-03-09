// src/components/DocSelectModal.jsx
import React from 'react';
import { FileText, Printer } from 'lucide-react';

export default function DocSelectModal({ onClose, onSelect }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-[65] flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-2xl text-center max-w-sm w-full shadow-2xl">
        <h3 className="text-xs font-bold uppercase mb-6 text-slate-500">เลือกเอกสาร (Select)</h3>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={() => onSelect('QUOTATION')} 
            className="flex-1 p-4 border rounded-xl flex flex-col items-center gap-2 hover:bg-slate-50 transition-all cursor-pointer group"
          >
            <FileText size={20} className="text-slate-400 group-hover:text-slate-600"/>
            <span className="text-xs font-bold text-slate-600 group-hover:text-slate-800">ใบเสนอราคา</span>
          </button>
          <button 
            onClick={() => onSelect('RECEIPT')} 
            className="flex-1 p-4 border border-[#C5A059]/30 bg-[#C5A059]/5 rounded-xl flex flex-col items-center gap-2 hover:bg-[#C5A059]/10 transition-all cursor-pointer group"
          >
            <Printer size={20} className="text-[#C5A059]"/>
            <span className="text-xs font-bold text-[#C5A059]">ใบเสร็จ</span>
          </button>
        </div>
        <button onClick={onClose} className="mt-6 text-[10px] font-bold text-slate-400 underline hover:text-slate-600 cursor-pointer">ยกเลิก</button>
      </div>
    </div>
  );
}
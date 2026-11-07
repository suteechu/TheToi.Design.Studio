// src/components/DocSelectModal.jsx
import React from 'react';
import { FileText, Printer, X } from 'lucide-react';

export default function DocSelectModal({ onClose, onSelect }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white p-6 rounded-2xl text-center max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="ปิด"
        >
          <X size={18} />
        </button>
        <h3 className="text-xs font-bold uppercase mb-6 text-slate-500">เลือกเอกสาร (Select Document)</h3>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={() => onSelect('QUOTATION')} 
            className="flex-1 p-4 border border-slate-200 rounded-xl flex flex-col items-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer group shadow-sm hover:shadow"
          >
            <FileText size={22} className="text-slate-500 group-hover:text-slate-700"/>
            <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900">ใบเสนอราคา</span>
          </button>
          <button 
            onClick={() => onSelect('RECEIPT')} 
            className="flex-1 p-4 border border-[#C5A059]/40 bg-[#C5A059]/5 rounded-xl flex flex-col items-center gap-2 hover:bg-[#C5A059]/15 transition-all cursor-pointer group shadow-sm hover:shadow"
          >
            <Printer size={22} className="text-[#C5A059]"/>
            <span className="text-xs font-bold text-[#C5A059]">ใบเสร็จ</span>
          </button>
        </div>
        <button onClick={onClose} className="mt-6 text-xs font-medium text-slate-400 hover:text-slate-600 cursor-pointer">
          ยกเลิก
        </button>
      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { X, Plus, Trash2, GripVertical, FileText, Printer, ChevronRight } from 'lucide-react';

const useDragDrop = (list, onReorder) => {
  const dragItem = useRef(); const dragOverItem = useRef();
  const start = (e, pos) => { dragItem.current = pos; };
  const enter = (e, pos) => { dragOverItem.current = pos; };
  const end = () => {
    const copy = [...list]; const item = copy.splice(dragItem.current, 1)[0];
    copy.splice(dragOverItem.current, 0, item);
    dragItem.current = null; dragOverItem.current = null;
    onReorder(copy);
  };
  return { start, enter, end };
};

export function TeamModal({ teams, onClose, onAdd, onDelete, onReorder }) {
  const [name, setName] = useState(''); const [rate, setRate] = useState(80);
  const { start, enter, end } = useDragDrop(teams, onReorder);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-6 rounded-3xl shadow-2xl animate-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
           <h3 className="font-bold text-sm uppercase tracking-widest text-slate-500">Manage Teams</h3>
           <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><X size={18} className="text-slate-400 hover:text-black"/></button>
        </div>
        <div className="flex gap-2 mb-6">
           <input placeholder="ชื่อทีม..." className="flex-1 p-3 bg-gray-50 border border-transparent focus:bg-white focus:border-slate-200 rounded-xl text-sm font-bold outline-none transition-all" value={name} onChange={e => setName(e.target.value)} />
           <input type="number" className="w-20 p-3 bg-gray-50 border border-transparent focus:bg-white focus:border-slate-200 rounded-xl text-sm text-center outline-none" value={rate} onChange={e => setRate(e.target.value)} />
           <button onClick={() => { if(name) { onAdd({name, ratePerSqm: rate}); setName(''); }}} className="bg-black text-white p-3 rounded-xl hover:bg-slate-800 transition-all shadow-md"><Plus size={20}/></button>
        </div>
        <div className="space-y-2 overflow-y-auto max-h-[400px] pr-1">
           {teams.map((t, i) => (
             <div key={t.id} draggable onDragStart={(e)=>start(e,i)} onDragEnter={(e)=>enter(e,i)} onDragEnd={end} onDragOver={e=>e.preventDefault()} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl cursor-move group hover:border-[#C5A059] hover:shadow-sm transition-all">
                <div className="flex items-center gap-3">
                   <GripVertical size={16} className="text-slate-300 group-hover:text-[#C5A059] transition-colors"/>
                   <div><span className="text-xs font-bold text-slate-800 uppercase block">{t.name}</span><span className="text-[10px] text-slate-400">Rate: ฿{t.ratePerSqm}</span></div>
                </div>
                <button onClick={() => onDelete(t.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16}/></button>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}

export function DocSelectModal({ onClose, onSelect }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[65] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl text-center max-w-lg w-full shadow-2xl animate-in zoom-in duration-200">
        <h3 className="text-xs font-bold uppercase mb-8 tracking-[0.3em] text-slate-400">Select Document Type</h3>
        <div className="flex gap-4 justify-center">
          <button onClick={() => onSelect('QUOTATION')} className="flex-1 p-6 border border-slate-200 hover:border-black rounded-2xl transition-all group hover:shadow-xl bg-white flex flex-col items-center gap-3">
             <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-black group-hover:text-white transition-colors"><FileText size={20}/></div>
             <span className="font-bold text-slate-800 uppercase text-xs tracking-widest">Quotation</span>
          </button>
          <button onClick={() => onSelect('RECEIPT')} className="flex-1 p-6 border border-[#C5A059]/20 bg-[#C5A059]/5 hover:bg-[#C5A059] rounded-2xl transition-all group hover:shadow-xl flex flex-col items-center gap-3">
             <div className="w-12 h-12 bg-[#C5A059]/20 rounded-full flex items-center justify-center text-[#C5A059] group-hover:bg-white group-hover:text-[#C5A059] transition-colors"><Printer size={20}/></div>
             <span className="font-bold text-[#C5A059] group-hover:text-white uppercase text-xs tracking-widest">Receipt</span>
          </button>
        </div>
        <button onClick={onClose} className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:text-black transition-colors underline decoration-slate-300 underline-offset-4">Cancel Selection</button>
      </div>
    </div>
  );
}

// ... ProjectTypeModal & ServiceTypeModal ใช้สไตล์เดียวกับ TeamModal ครับ
export function ProjectTypeModal({ list, onClose, onReorder }) {
    const { start, enter, end } = useDragDrop(list, onReorder);
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md p-6 rounded-3xl shadow-2xl">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4"><h3 className="font-bold text-sm uppercase tracking-widest text-slate-500">Project Types</h3><button onClick={onClose}><X size={18} className="text-slate-400 hover:text-black"/></button></div>
          <div className="space-y-2 overflow-y-auto max-h-[400px] pr-1">
             {list.map((t, i) => (
               <div key={i} draggable onDragStart={(e)=>start(e,i)} onDragEnter={(e)=>enter(e,i)} onDragEnd={end} onDragOver={e=>e.preventDefault()} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl cursor-move group hover:border-[#C5A059] hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3"><GripVertical size={16} className="text-slate-300 group-hover:text-[#C5A059]"/><span className="text-xs font-bold text-slate-700 uppercase">{t}</span></div><ChevronRight size={14} className="text-slate-300"/>
               </div>
             ))}
          </div>
        </div>
      </div>
    );
}

export function ServiceTypeModal({ list, onClose, onReorder }) {
    const { start, enter, end } = useDragDrop(list, onReorder);
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md p-6 rounded-3xl shadow-2xl">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4"><h3 className="font-bold text-sm uppercase tracking-widest text-slate-500">Service Types</h3><button onClick={onClose}><X size={18} className="text-slate-400 hover:text-black"/></button></div>
          <div className="space-y-2 overflow-y-auto max-h-[400px] pr-1">
             {list.map((t, i) => (
               <div key={i} draggable onDragStart={(e)=>start(e,i)} onDragEnter={(e)=>enter(e,i)} onDragEnd={end} onDragOver={e=>e.preventDefault()} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl cursor-move group hover:border-[#C5A059] hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3"><GripVertical size={16} className="text-slate-300 group-hover:text-[#C5A059]"/><span className="text-xs font-bold text-slate-700 uppercase">{t}</span></div><ChevronRight size={14} className="text-slate-300"/>
               </div>
             ))}
          </div>
        </div>
      </div>
    );
}
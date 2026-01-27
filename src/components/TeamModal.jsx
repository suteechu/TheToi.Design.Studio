import React, { useRef } from 'react';
import { X, GripVertical } from 'lucide-react';

export default function TeamModal({ teams, onClose, onDelete, onReorder }) {
  const dragItem = useRef(); 
  const dragOverItem = useRef();

  const handleSort = () => {
    let _teams = [...teams];
    const draggedItemContent = _teams.splice(dragItem.current, 1)[0];
    _teams.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null; 
    dragOverItem.current = null;
    onReorder(_teams);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl">
        <h3 className="font-bold text-lg mb-6 border-b pb-4 uppercase tracking-widest flex justify-between items-center">
            Manage Teams <X size={20} className="cursor-pointer hover:text-red-500" onClick={onClose}/>
        </h3>
        <div className="space-y-2 overflow-y-auto max-h-[400px]">
           {teams.map((t, i) => (
             <div key={t.id} draggable onDragStart={() => (dragItem.current = i)} onDragEnter={() => (dragOverItem.current = i)} onDragEnd={handleSort} onDragOver={e => e.preventDefault()} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-move group transition-all hover:border-black">
                <div className="flex items-center gap-3"><GripVertical size={16} className="text-slate-300 group-hover:text-black"/><span className="text-xs font-bold uppercase">{t.name}</span></div>
                <button onClick={() => onDelete(t.id)} className="text-slate-300 hover:text-red-500"><X size={14}/></button>
             </div>
           ))}
        </div>
        <div className="mt-4 text-[10px] text-slate-400 text-center italic">Drag and drop to reorder teams</div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { X, User, Home, Calculator, PenTool, CheckSquare, Square } from 'lucide-react';

export default function JobModal({ job, teams, projectTypes, serviceTypes, onClose, onSave }) {
  const [formData, setFormData] = useState({
    id: job?.id || `J${Math.floor(Math.random() * 100000)}`,
    client: job?.client || '', 
    projectType: job?.projectType || projectTypes[0], 
    serviceType: job?.serviceType || serviceTypes[0], 
    teamId: job?.teamId || (teams[0]?.id || ''),
    area: job?.area || 0, 
    unitPrice: job?.unitPrice || 0, 
    totalPrice: job?.totalPrice || 0, 
    
    // ค่าวิชาชีพ (Default 0)
    feeEng: job?.feeEng || 0, 
    feeArch: job?.feeArch || 0, 
    feeSuper: job?.feeSuper || 0,
    
    receivedAmount: job?.receivedAmount || 0, 
    actualOutsourceFee: job?.actualOutsourceFee || 0, 
    note: job?.note || '',
    startDate: job?.startDate || new Date().toISOString().split('T')[0],
    deliveryDate: job?.deliveryDate || '', 
    bedrooms: job?.bedrooms || '', 
    bathrooms: job?.bathrooms || '', 
    parking: job?.parking || ''
  });

  // --- Auto Calculation (คำนวณอัตโนมัติ) ---
  useEffect(() => {
    const area = parseFloat(formData.area) || 0;
    const price = parseFloat(formData.unitPrice) || 0;
    // รวมค่าวิชาชีพ
    const fees = (parseFloat(formData.feeEng)||0) + (parseFloat(formData.feeArch)||0) + (parseFloat(formData.feeSuper)||0);
    // สูตร: (พื้นที่ x ราคาต่อหน่วย) + ค่าวิชาชีพทั้งหมด
    setFormData(prev => ({ ...prev, totalPrice: (area * price) + fees }));
  }, [formData.area, formData.unitPrice, formData.feeEng, formData.feeArch, formData.feeSuper]);

  // ฟังก์ชันสลับค่า (Toggle 0 <-> 5000)
  const toggleFee = (field) => {
    setFormData(prev => ({
        ...prev,
        [field]: prev[field] === 5000 ? 0 : 5000 // ถ้า 5000 อยู่แล้วให้เป็น 0, ถ้าไม่ใช่ให้เป็น 5000
    }));
  };

  const labelClass = "text-[10px] font-bold text-slate-400 uppercase mb-1.5 block tracking-widest";
  const inputClass = "w-full p-3.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-black/20 outline-none font-medium text-sm transition-all hover:bg-gray-100";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center shrink-0 bg-white">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#C5A059]/10 rounded-xl flex items-center justify-center text-[#C5A059]"><PenTool size={20}/></div>
             <div>
                <h3 className="font-bold text-xl text-slate-800 tracking-tight">PROJECT EDITOR</h3>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Create or Update Details</p>
             </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-black transition-all"><X size={20}/></button>
        </div>
        
        {/* Form Body */}
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="flex-1 overflow-y-auto p-8 grid grid-cols-12 gap-10">
          
          {/* Left Column: ข้อมูลลูกค้า & สเปคบ้าน */}
          <div className="col-span-7 space-y-8">
             <div className="space-y-6">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2 uppercase tracking-widest"><User size={16} className="text-[#C5A059]"/> Customer Info</h4>
                <div><label className={labelClass}>Client Name</label><input required className={`${inputClass} text-lg font-bold text-slate-900`} value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} placeholder="ระบุชื่อลูกค้า..." /></div>
                <div className="grid grid-cols-2 gap-4">
                   <div><label className={labelClass}>Start Date</label><input type="date" className={inputClass} value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} /></div>
                   <div><label className={labelClass}>Delivery Date</label><input type="date" required className={`${inputClass} bg-red-50 text-red-600 font-bold`} value={formData.deliveryDate} onChange={e => setFormData({...formData, deliveryDate: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div><label className={labelClass}>Project Type</label><select className={inputClass} value={formData.projectType} onChange={e => setFormData({...formData, projectType: e.target.value})}>{projectTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                   <div><label className={labelClass}>Service Type</label><select className={inputClass} value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})}>{serviceTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                </div>
                <div><label className={labelClass}>Assigned Team</label><select className={inputClass} value={formData.teamId} onChange={e => setFormData({...formData, teamId: e.target.value})}>{teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
             </div>
             
             <div className="pt-6 border-t border-dashed border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2 mb-4 uppercase tracking-widest"><Home size={16} className="text-[#C5A059]"/> Spec Details</h4>
                <div className="grid grid-cols-3 gap-4">
                   <div><label className={labelClass}>Bedrooms</label><input type="number" className={`${inputClass} text-center font-bold`} value={formData.bedrooms} onChange={e => setFormData({...formData, bedrooms: e.target.value})} /></div>
                   <div><label className={labelClass}>Bathrooms</label><input type="number" className={`${inputClass} text-center font-bold`} value={formData.bathrooms} onChange={e => setFormData({...formData, bathrooms: e.target.value})} /></div>
                   <div><label className={labelClass}>Parking</label><input type="number" className={`${inputClass} text-center font-bold`} value={formData.parking} onChange={e => setFormData({...formData, parking: e.target.value})} /></div>
                </div>
             </div>
          </div>

          {/* Right Column: ค่าใช้จ่าย & ค่าวิชาชีพ */}
          <div className="col-span-5 space-y-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100 h-fit">
             <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2 uppercase tracking-widest"><Calculator size={16} className="text-[#C5A059]"/> Cost & Fees</h4>
             
             <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Area (sq.m.)</label><input type="number" className={inputClass} value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} /></div>
                <div><label className={labelClass}>Price / Unit</label><input type="number" className={inputClass} value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: e.target.value})} /></div>
             </div>
             
             {/* --- Professional Fees (Checkbox Section) --- */}
             <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Professional Fees (ค่าวิชาชีพ)</p>
                
                {['feeEng', 'feeArch', 'feeSuper'].map((f, i) => {
                   const labels = ['Engineer', 'Architect', 'Supervisor'];
                   const isChecked = formData[f] === 5000; // เช็คว่าค่าเป็น 5000 หรือไม่
                   return (
                      <div 
                        key={f} 
                        onClick={() => toggleFee(f)}
                        className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-all ${isChecked ? 'bg-[#C5A059]/10 border-[#C5A059]' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}
                      >
                         <div className="flex items-center gap-3">
                            {isChecked ? <CheckSquare size={20} className="text-[#C5A059] fill-current"/> : <Square size={20} className="text-slate-300"/>}
                            <span className={`text-sm font-bold ${isChecked ? 'text-[#C5A059]' : 'text-slate-500'}`}>{labels[i]}</span>
                         </div>
                         <span className={`text-sm font-bold ${isChecked ? 'text-[#C5A059]' : 'text-slate-300'}`}>
                            {isChecked ? '฿5,000' : '฿0'}
                         </span>
                      </div>
                   );
                })}
             </div>
             {/* ------------------------------------------ */}

             {/* ยอดรวมสุทธิ */}
             <div className="bg-[#1A1A1A] p-8 rounded-2xl text-center shadow-xl shadow-black/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[#C5A059] opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-widest relative z-10">Total Contract Value</p>
                <p className="text-[#C5A059] text-4xl font-black italic tracking-tight relative z-10">฿{formData.totalPrice.toLocaleString()}</p>
             </div>

             <div><label className={labelClass}>Received Amount</label><input type="number" className={`${inputClass} font-bold text-emerald-600 text-lg`} value={formData.receivedAmount} onChange={e => setFormData({...formData, receivedAmount: parseFloat(e.target.value)||0})} /></div>
             
             <textarea placeholder="หมายเหตุเพิ่มเติม..." rows={3} className={inputClass} value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})}></textarea>
             
             <button type="submit" className="w-full py-4 bg-black text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 hover:shadow-xl transition-all uppercase tracking-widest text-xs">Save Project Data</button>
          </div>
        </form>
      </div>
    </div>
  );
}
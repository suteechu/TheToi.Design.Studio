import React, { useState, useEffect } from 'react';
import { X, PenTool, User, Home, Calculator, CheckSquare, Square, Wallet } from 'lucide-react';

export default function JobModal({ job, teams, projectTypes, serviceTypes, specs, onClose, onSave }) {
  const defaultTeamId = (teams && teams.length > 0) ? teams[0].id : '';
  const todayStr = new Date().toISOString().split('T')[0];
  const next14Days = new Date(); next14Days.setDate(next14Days.getDate() + 14);
  const next14DaysStr = next14Days.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    id: job?.id || `J${Math.floor(Math.random() * 1000000)}`,
    client: job?.client || '', projectType: job?.projectType || projectTypes[0], serviceType: job?.serviceType || serviceTypes[0], 
    teamId: job?.teamId || defaultTeamId,
    area: job?.area || 0, unitPrice: job?.unitPrice || 0, totalPrice: job?.totalPrice || 0, 
    feeEng: job?.feeEng || 0, feeArch: job?.feeArch || 0, feeSuper: job?.feeSuper || 0,
    receivedAmount: job?.receivedAmount || 0, actualOutsourceFee: job?.actualOutsourceFee || 0, note: job?.note || '',
    startDate: job?.startDate || todayStr, deliveryDate: job?.deliveryDate || next14DaysStr,
    bedrooms: job?.bedrooms || '', bathrooms: job?.bathrooms || '', parking: job?.parking || '',
    status: job?.status || 'IN_PROGRESS'
  });

  const handleTeamChange = (e) => {
      const newTeamId = e.target.value;
      const selectedTeam = teams.find(t => t.id === newTeamId);
      setFormData(prev => ({ ...prev, teamId: newTeamId, unitPrice: selectedTeam ? selectedTeam.ratePerSqm : 0 }));
  };

  const handleSpecChange = (e) => {
      const spec = e.target.value;
      if (!spec || spec === '-') return;
      const bedrooms = spec.match(/(\d+)ห้องนอน/)?.[1] || '';
      const bathrooms = spec.match(/(\d+)ห้องน้ำ/)?.[1] || '';
      const parking = spec.match(/(\d+)จอดรถ/)?.[1] || '';
      setFormData(prev => ({ ...prev, bedrooms, bathrooms, parking }));
  };

  useEffect(() => {
    const area = parseFloat(formData.area) || 0; const price = parseFloat(formData.unitPrice) || 0;
    const fees = (parseFloat(formData.feeEng)||0) + (parseFloat(formData.feeArch)||0) + (parseFloat(formData.feeSuper)||0);
    setFormData(prev => ({ ...prev, totalPrice: (area * price) + fees }));
  }, [formData.area, formData.unitPrice, formData.feeEng, formData.feeArch, formData.feeSuper]);

  const toggleFee = (field) => setFormData(prev => ({ ...prev, [field]: prev[field] === 5000 ? 0 : 5000 }));
  const labelClass = "text-[10px] font-bold text-slate-500 uppercase mb-1 block tracking-wide";
  const inputClass = "w-full p-2.5 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-black/20 outline-none font-medium text-xs transition-all hover:bg-gray-100";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0 bg-white">
          <div className="flex items-center gap-3"><div className="w-8 h-8 bg-[#C5A059]/10 rounded-lg flex items-center justify-center text-[#C5A059]"><PenTool size={16}/></div><div><h3 className="font-bold text-lg text-slate-800">จัดการโครงการ (Project)</h3></div></div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-black"><X size={18}/></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="flex-1 overflow-y-auto p-6 grid grid-cols-12 gap-6">
          <div className="col-span-7 space-y-6">
             <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide"><User size={14} className="text-[#C5A059]"/> ข้อมูลลูกค้า</h4>
                <div><label className={labelClass}>ชื่อลูกค้า</label><input required className={`${inputClass} text-sm font-bold text-slate-900`} value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} placeholder="ระบุชื่อลูกค้า..." /></div>
                <div className="grid grid-cols-2 gap-3"><div><label className={labelClass}>วันเริ่ม</label><input type="date" className={inputClass} value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} /></div><div><label className={labelClass}>กำหนดส่ง</label><input type="date" required className={`${inputClass} bg-red-50 text-red-600 font-bold`} value={formData.deliveryDate} onChange={e => setFormData({...formData, deliveryDate: e.target.value})} /></div></div>
                <div className="grid grid-cols-2 gap-3"><div><label className={labelClass}>ประเภทงาน</label><select className={inputClass} value={formData.projectType} onChange={e => setFormData({...formData, projectType: e.target.value})}>{projectTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div><div><label className={labelClass}>บริการ</label><select className={inputClass} value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})}>{serviceTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div></div>
                <div><label className={labelClass}>ทีมช่าง (เลือกแล้วราคาปรับ Auto)</label><select className={inputClass} value={formData.teamId} onChange={handleTeamChange}>{teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
             </div>
             <div className="pt-4 border-t border-dashed border-slate-200"><h4 className="text-xs font-bold text-slate-900 flex items-center gap-2 mb-3 uppercase tracking-wide"><Home size={14} className="text-[#C5A059]"/> สเปคงาน</h4>
                <div className="mb-3"><label className={labelClass}>เลือกสเปคด่วน (Auto-Fill)</label><select className={`${inputClass} border-blue-100 bg-blue-50/50 text-blue-600`} onChange={handleSpecChange}><option value="">-- เลือกสเปคมาตรฐาน --</option>{specs.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                <div className="grid grid-cols-3 gap-3"><div><label className={labelClass}>นอน</label><input type="number" className={`${inputClass} text-center`} value={formData.bedrooms} onChange={e => setFormData({...formData, bedrooms: e.target.value})} /></div><div><label className={labelClass}>น้ำ</label><input type="number" className={`${inputClass} text-center`} value={formData.bathrooms} onChange={e => setFormData({...formData, bathrooms: e.target.value})} /></div><div><label className={labelClass}>จอดรถ</label><input type="number" className={`${inputClass} text-center`} value={formData.parking} onChange={e => setFormData({...formData, parking: e.target.value})} /></div></div></div>
          </div>
          <div className="col-span-5 space-y-5 bg-slate-50 p-5 rounded-2xl border border-slate-100 h-fit">
             <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide"><Calculator size={14} className="text-[#C5A059]"/> ราคา & ค่าใช้จ่าย</h4>
             <div className="grid grid-cols-2 gap-3"><div><label className={labelClass}>พื้นที่ (ตร.ม.)</label><input type="number" className={inputClass} value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} /></div><div><label className={labelClass}>ราคา/หน่วย</label><input type="number" className={inputClass} value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: e.target.value})} /></div></div>
             <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">ค่าวิชาชีพ (Revenue)</p>
                    <div className="space-y-1.5">
                        {['วิศวกร', 'สถาปนิก', 'คุมงาน'].map((label, i) => { 
                            const fieldName = ['feeEng', 'feeArch', 'feeSuper'][i]; 
                            const isChecked = formData[fieldName] === 5000;
                            const boxClass = isChecked ? 'bg-[#C5A059]/10 border-[#C5A059]' : 'bg-gray-50 border-transparent hover:bg-gray-100';
                            const textClass = isChecked ? 'text-[#C5A059]' : 'text-slate-500';
                            const priceClass = isChecked ? 'text-[#C5A059]' : 'text-slate-300';
                            return (
                                <div key={fieldName} onClick={() => toggleFee(fieldName)} className={`flex justify-between items-center p-2 rounded-lg border cursor-pointer transition-all ${boxClass}`}>
                                    <div className="flex items-center gap-2">
                                        {isChecked ? <CheckSquare size={14} className="text-[#C5A059]"/> : <Square size={14} className="text-slate-300"/>}
                                        <span className={`text-[11px] font-bold ${textClass}`}>{label}</span>
                                    </div>
                                    <span className={`text-[11px] font-bold ${priceClass}`}>{isChecked ? '5,000' : '0'}</span>
                                </div>
                            ); 
                        })}
                    </div>
                </div>
                <div className="pt-3 border-t border-dashed border-slate-200"><label className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Wallet size={10}/> ต้นทุนจริง (Cost)</label><input type="number" className="w-full p-2 bg-red-50/50 border border-transparent rounded-lg text-xs font-bold text-red-600 outline-none text-right" placeholder="0.00" value={formData.actualOutsourceFee} onChange={e => setFormData({...formData, actualOutsourceFee: parseFloat(e.target.value)||0})} /></div>
             </div>
             <div className="bg-[#1A1A1A] p-6 rounded-xl text-center shadow-lg relative overflow-hidden"><p className="text-[9px] text-slate-400 font-bold uppercase mb-1 tracking-widest">มูลค่าสัญญา</p><p className="text-[#C5A059] text-3xl font-bold tracking-tight">฿{formData.totalPrice.toLocaleString()}</p></div>
             <div><label className={labelClass}>รับเงินแล้ว</label><input type="number" className={`${inputClass} font-bold text-emerald-600`} value={formData.receivedAmount} onChange={e => setFormData({...formData, receivedAmount: parseFloat(e.target.value)||0})} /></div>
             <button type="submit" className="w-full py-3 bg-black text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all uppercase tracking-widest text-xs">บันทึก (Save)</button>
          </div>
        </form>
      </div>
    </div>
  );
};
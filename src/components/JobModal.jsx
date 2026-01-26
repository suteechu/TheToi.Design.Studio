// src/components/JobModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, PenTool, RefreshCw, User, Briefcase, Calculator, Home, Info } from 'lucide-react';
import { getLocalDateStr } from '../utils';

export default function JobModal({ job, teams, projectTypes, serviceTypes, onClose, onSave }) {
   
   // ค่าเริ่มต้น
   const [formData, setFormData] = useState({
      id: job?.id || `J${Date.now().toString().slice(-5)}`,
      client: job?.client || '',
      projectType: job?.projectType || projectTypes[0] || '',
      serviceType: job?.serviceType || serviceTypes[0] || '',
      area: job?.area || 0,
      unitPrice: job?.unitPrice || 150,
      bedrooms: job?.bedrooms || '',
      bathrooms: job?.bathrooms || '',
      parking: job?.parking || '',
      teamId: job?.teamId || (teams[0]?.id || ''),
      deliveryDate: job?.deliveryDate || getLocalDateStr(14),
      receivedAmount: job?.receivedAmount || 0,
      feeEng: job?.feeEng || 0,
      feeArch: job?.feeArch || 0,
      feeSuper: job?.feeSuper || 0,
      actualOutsourceFee: job?.actualOutsourceFee || 0,
      totalPrice: job?.totalPrice || 0,
      image: job?.image || null
   });

   const [isManualPrice, setIsManualPrice] = useState(false); 
   
   // หาข้อมูลทีมช่างที่เลือกอยู่ (เพื่อดึงเรทราคาต้นทุน)
   const currentTeam = teams.find(t => t.id === formData.teamId);

   // สูตรคำนวณ Auto
   useEffect(() => {
      if (!isManualPrice) {
          const designFee = formData.area * formData.unitPrice;
          const totalFee = parseFloat(formData.feeEng) + parseFloat(formData.feeArch) + parseFloat(formData.feeSuper);
          const calculatedTotal = Math.ceil(designFee + totalFee);
          
          setFormData(prev => {
             if (prev.totalPrice !== calculatedTotal) return { ...prev, totalPrice: calculatedTotal };
             return prev;
          });
      }
   }, [formData.area, formData.unitPrice, formData.feeEng, formData.feeArch, formData.feeSuper, isManualPrice]);

   const handleSubmit = (e) => {
      e.preventDefault();
      const d = new Date(formData.deliveryDate);
      onSave({
         ...formData,
         jobYear: d.getFullYear().toString(),
         quarter: (d.getMonth() + 1) <= 3 ? 'Q1' : (d.getMonth() + 1) <= 6 ? 'Q2' : (d.getMonth() + 1) <= 9 ? 'Q3' : 'Q4'
      });
   };

   const handleChangeAuto = (field, value) => {
       setIsManualPrice(false);
       setFormData(prev => ({ ...prev, [field]: value }));
   };

   const handleImage = (e) => {
      const file = e.target.files[0];
      if (file) {
         if (file.size > 2 * 1024 * 1024) return alert("Max 2MB");
         const reader = new FileReader();
         reader.onloadend = () => setFormData({ ...formData, image: reader.result });
         reader.readAsDataURL(file);
      }
   };

   // CSS Classes
   const inputClass = "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold focus:outline-none focus:border-black transition-colors";
   const labelClass = "text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1 flex items-center gap-1";
   const sectionHeader = "text-xs font-bold uppercase text-black border-b border-slate-100 pb-2 mb-3 flex items-center gap-2";

   return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
         <div className="bg-white w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh] rounded-xl overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
               <h2 className="text-lg font-bold uppercase flex items-center gap-2">
                  <span className="bg-black text-white w-6 h-6 flex items-center justify-center rounded text-xs">{job ? 'E' : 'N'}</span>
                  {job ? 'แก้ไขข้อมูล' : 'สร้างโปรเจกต์ใหม่'}
               </h2>
               <div className="flex gap-4">
                  {!isManualPrice ? (
                     <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-1 rounded font-bold flex items-center gap-1"><RefreshCw size={10} /> Auto Calc</span>
                  ) : (
                     <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded font-bold cursor-pointer" onClick={() => setIsManualPrice(false)}>Manual Mode (Reset)</span>
                  )}
                  <button onClick={onClose}><X size={20} className="text-slate-300 hover:text-black" /></button>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar bg-[#F9FAFB]">
               <div className="p-6 grid grid-cols-12 gap-6">
                  
                  {/* --- LEFT COLUMN --- */}
                  <div className="col-span-12 md:col-span-7 space-y-5">
                     
                     {/* 1. Project Info */}
                     <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                        <h3 className={sectionHeader}><User size={14} /> ข้อมูลลูกค้า & โครงการ</h3>
                        <div className="flex gap-4 mb-4">
                           <div className="shrink-0">
                              <div className="group cursor-pointer w-24 h-24 border-2 border-dashed border-slate-200 hover:border-black bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden relative" onClick={() => document.getElementById('imgInput').click()}>
                                 {formData.image ? <img src={formData.image} className="absolute inset-0 w-full h-full object-cover" alt="Preview" /> : <div className="text-center text-slate-300 group-hover:text-black"><ImageIcon size={20} /></div>}
                                 <input type="file" id="imgInput" className="hidden" accept="image/*" onChange={handleImage} />
                              </div>
                           </div>
                           <div className="flex-1 space-y-3">
                              <div><label className={labelClass}>ลูกค้า (Client)</label><input required className={inputClass} value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} placeholder="ระบุชื่อลูกค้า..." /></div>
                              <div className="grid grid-cols-2 gap-3">
                                 <div><label className={labelClass}>ส่งงาน (Date)</label><input type="date" required className={inputClass} value={formData.deliveryDate} onChange={e => setFormData({...formData, deliveryDate: e.target.value})} /></div>
                                 <div><label className={labelClass}>ทีมช่าง (Team)</label><select className={inputClass} value={formData.teamId} onChange={e => setFormData({...formData, teamId: e.target.value})}>{teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                              </div>
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           <div><label className={labelClass}>ประเภท (Project Type)</label><select className={inputClass} value={formData.projectType} onChange={e => setFormData({...formData, projectType: e.target.value})}>{projectTypes.map((t, i) => <option key={i} value={t}>{t}</option>)}</select></div>
                           <div><label className={labelClass}>ชนิดงาน (Service Type)</label><select className={inputClass} value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})}>{serviceTypes.map((t, i) => <option key={i} value={t}>{t}</option>)}</select></div>
                        </div>
                     </div>

                     {/* 2. Specs */}
                     <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                        <h3 className={sectionHeader}><Home size={14} /> รายละเอียดพื้นที่</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div><label className={labelClass}>ห้องนอน</label><input type="number" min="0" className={inputClass} value={formData.bedrooms} onChange={e => setFormData({...formData, bedrooms: e.target.value})} placeholder="-" /></div>
                            <div><label className={labelClass}>ห้องน้ำ</label><input type="number" min="0" className={inputClass} value={formData.bathrooms} onChange={e => setFormData({...formData, bathrooms: e.target.value})} placeholder="-" /></div>
                            <div><label className={labelClass}>จอดรถ</label><input type="number" min="0" className={inputClass} value={formData.parking} onChange={e => setFormData({...formData, parking: e.target.value})} placeholder="-" /></div>
                        </div>
                     </div>
                  </div>

                  {/* --- RIGHT COLUMN --- */}
                  <div className="col-span-12 md:col-span-5 space-y-5">
                     
                     {/* 3. Cost Calculation */}
                     <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                        <h3 className={sectionHeader}><Calculator size={14} /> คำนวณราคา</h3>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                           <div>
                              <label className={labelClass}>พื้นที่ (ตร.ม.)</label>
                              <input type="number" min="0" className={`${inputClass} text-lg`} value={formData.area} onChange={e => handleChangeAuto('area', parseFloat(e.target.value) || 0)} />
                           </div>
                           
                           {/* --- ส่วนที่เพิ่มใหม่: Tooltip ราคาทีมช่าง --- */}
                           <div>
                              <label className={labelClass}>ราคา (บาท/ตร.ม.)</label>
                              <div className="relative group/tip">
                                  <input 
                                    type="number" 
                                    min="0" 
                                    className={`${inputClass} text-lg text-[#C5A059] cursor-help`} 
                                    value={formData.unitPrice} 
                                    onChange={e => handleChangeAuto('unitPrice', parseFloat(e.target.value) || 0)} 
                                    title={currentTeam ? `ต้นทุนทีม: ฿${currentTeam.ratePerSqm}/ตร.ม.` : 'กรุณาเลือกทีมช่าง'} 
                                  />
                                  {/* Tooltip เมื่อเอาเมาส์ชี้ */}
                                  {currentTeam && (
                                     <div className="absolute bottom-full left-0 mb-2 hidden group-hover/tip:block bg-black text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-10 pointer-events-none">
                                         ต้นทุนทีม: ฿{currentTeam.ratePerSqm}
                                     </div>
                                  )}
                              </div>
                              {/* ข้อความบอกต้นทุนด้านล่าง (เห็นตลอดเวลา) */}
                              {currentTeam ? (
                                  <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-400">
                                      <Info size={10} /> 
                                      <span>ต้นทุนทีม: <span className="font-bold text-slate-600">฿{currentTeam.ratePerSqm}</span></span>
                                  </div>
                              ) : (
                                  <div className="text-[9px] text-red-300 mt-1 italic">*เลือกทีมช่างก่อน</div>
                              )}
                           </div>
                           {/* ----------------------------------------- */}

                        </div>
                        
                        {/* Fees */}
                        <div className="bg-slate-50 p-3 rounded border border-slate-100 space-y-2">
                           <p className="text-[10px] font-bold text-slate-400 uppercase">ค่าวิชาชีพเพิ่มเติม</p>
                           {['feeEng', 'feeArch', 'feeSuper'].map((f, i) => {
                              const labels = ['วิศวกร (Eng)', 'สถาปนิก (Arch)', 'ควบคุมงาน (Super)'];
                              return (
                                 <div key={f} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                       <input type="checkbox" checked={formData[f] > 0} onChange={e => { setIsManualPrice(false); setFormData({...formData, [f]: e.target.checked ? 5000 : 0}); }} className="accent-black w-3 h-3" />
                                       <span className="text-[10px] font-bold text-slate-700">{labels[i]}</span>
                                    </div>
                                    {formData[f] > 0 ? (
                                       <input type="number" className="w-20 text-right text-[10px] font-bold bg-white border border-slate-200 rounded px-1 py-0.5" value={formData[f]} onChange={e => handleChangeAuto(f, parseFloat(e.target.value) || 0)} />
                                    ) : <span className="text-[10px] text-slate-300">-</span>}
                                 </div>
                              );
                           })}
                        </div>
                     </div>

                     {/* 4. Cost & Summary */}
                     <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                        <h3 className={sectionHeader}><Briefcase size={14} /> สรุปยอดเงิน</h3>
                        <div className="space-y-3">
                           <div>
                              <label className={labelClass}>ต้นทุนจริง (Cost)</label>
                              <input type="number" className={`${inputClass} text-red-500`} value={formData.actualOutsourceFee} onChange={e => setFormData({...formData, actualOutsourceFee: parseFloat(e.target.value) || 0})} />
                           </div>
                           <div>
                              <label className={labelClass}>จ่ายแล้ว (Paid)</label>
                              <input type="number" className={`${inputClass} text-emerald-600`} value={formData.receivedAmount} onChange={e => setFormData({...formData, receivedAmount: parseFloat(e.target.value) || 0})} />
                           </div>
                           
                           <div className="pt-3 border-t border-slate-100">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">ยอดรวมสุทธิ (Total Price)</label>
                              <div className="relative">
                                 <input type="number" className="w-full bg-[#1A1A1A] text-[#C5A059] text-2xl font-bold px-4 py-3 rounded-lg focus:outline-none" value={formData.totalPrice} onChange={(e) => { setIsManualPrice(true); setFormData({...formData, totalPrice: parseFloat(e.target.value) || 0}); }} />
                                 {isManualPrice && <PenTool size={12} className="absolute top-4 right-4 text-white/20" />}
                              </div>
                           </div>
                        </div>
                     </div>

                  </div>
               </div>
            </form>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-white shrink-0">
               <button onClick={(e) => document.querySelector('form').requestSubmit()} className="w-full py-3 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#C5A059] transition-all rounded-lg shadow-lg">บันทึกข้อมูล (Save Project)</button>
            </div>
         </div>
      </div>
   );
}
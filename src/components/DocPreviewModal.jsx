// src/components/DocPreviewModal.jsx
import React from 'react';
import { X, HardHat } from 'lucide-react';
import { formatCurrency } from '../utils';

export default function DocPreviewModal({ job, team, type, onClose }) {
   const handlePrint = () => window.print();
   
   const handleImage = () => {
      if (!window.html2canvas) return alert("รอโหลดไลบรารีสักครู่...");
      const el = document.getElementById('receiptCaptureArea');
      const btns = el.querySelectorAll('.no-capture');
      btns.forEach(b => b.style.display = 'none'); 
      window.html2canvas(el, { scale: 2, backgroundColor: '#fff', useCORS: true }).then(canvas => {
         btns.forEach(b => b.style.display = ''); 
         const a = document.createElement('a');
         a.download = `${type}-${job.client}.png`;
         a.href = canvas.toDataURL();
         a.click();
      }).catch(err => { btns.forEach(b => b.style.display = ''); console.error(err); });
   };

   const docNo = type === 'QUOTATION' ? `QTN-${job.id}` : `REC-${job.id}`;
   const designFee = job.area * job.unitPrice; // ค่าแบบ

   return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[70] flex items-center justify-center p-4 overflow-y-auto">
         <div id="receiptCaptureArea" className="w-full max-w-3xl bg-white p-8 md:p-12 border border-slate-100 rounded-lg relative my-8 shadow-2xl">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-300 hover:text-black no-print no-capture p-2"><X size={24} /></button>
            
            <div className="flex flex-col md:flex-row justify-between items-start border-b border-black pb-6 mb-6">
               <div className="mb-4 md:mb-0">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-14 h-14 bg-black flex items-center justify-center rounded-sm"><span className="text-white text-3xl font-bold">S</span></div>
                     <div><h2 className="text-2xl font-bold uppercase tracking-tighter">Sutheechu Design Studio</h2><p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1 italic">Architecture & Interior Design Service</p></div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium leading-relaxed">
                     <p>บ้านเลขที่ 35/1 หมู่ 5 ตำบลไผ่ต่ำ อำเภอหนองแค</p>
                     <p>จังหวัดสระบุรี 18140</p>
                     <p className="font-bold text-black mt-1">Tel: (+66) 83-720-5937 (คุณสุธีร์)</p>
                  </div>
               </div>
               <div className="text-left md:text-right">
                  <h3 className="text-2xl font-light text-slate-800 uppercase tracking-widest mb-2">{type === 'QUOTATION' ? 'ใบเสนอราคา' : 'ใบเสร็จรับเงิน'}</h3>
                  <p className="text-[10px] font-bold text-black uppercase tracking-widest">NO: {docNo}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Date: {new Date().toLocaleDateString('th-TH')}</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
               <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3 italic">ลูกค้า (Customer):</p>
                  <p className="text-lg font-bold text-slate-900 uppercase underline decoration-[#C5A059] decoration-4 underline-offset-4">{job.client}</p>
                  <p className="text-[11px] text-slate-500 mt-2 uppercase font-bold border-l-2 border-[#C5A059] pl-3">{job.projectType}</p>
                  <p className="text-[10px] text-slate-500 mt-1 pl-3 font-semibold flex items-center gap-1"><HardHat size={12} className="text-[#C5A059]" /> {job.serviceType}</p>
               </div>
               <div className="bg-black p-6 text-white rounded-lg shadow-lg">
                  <p className="text-[9px] font-bold text-[#C5A059] uppercase tracking-widest mb-2 italic">ช่องทางการชำระเงิน:</p>
                  <p className="text-xs font-bold mb-1">ธนาคารกสิกรไทย (K-Bank)</p>
                  <p className="text-xl font-bold tracking-[0.1em] text-[#C5A059]">035-8-94074-9</p>
                  <p className="text-[10px] opacity-60 mt-1 uppercase font-bold">ชื่อบัญชี: สุธีร์ ชุยรัมย์</p>
               </div>
            </div>

            <table className="w-full mb-6 border-collapse">
               <thead><tr className="border-b-2 border-black text-[10px] font-bold uppercase tracking-widest text-slate-900"><th className="text-left py-4">รายการ (Description)</th><th className="text-right py-4">จำนวนเงิน (THB)</th></tr></thead>
               <tbody className="divide-y divide-slate-200">
                  {/* รายการที่ 1: ค่าแบบ */}
                  <tr>
                     <td className="py-4 pr-4">
                         <p className="font-bold text-slate-900 text-sm uppercase">ค่าบริการออกแบบ (Design Fee)</p>
                         <p className="text-[10px] text-slate-400 mt-1 uppercase">พื้นที่ {job.area} ตร.ม. x ฿{job.unitPrice}/ตร.ม.</p>
                     </td>
                     <td className="py-4 text-right font-bold text-sm align-top">{formatCurrency(designFee)}</td>
                  </tr>
                  
                  {/* รายการย่อย: ค่าวิชาชีพ */}
                  {[
                    {l:'ค่าวิชาชีพวิศวกร (Engineer Fee)', v: job.feeEng}, 
                    {l:'ค่าวิชาชีพสถาปนิก (Architect Fee)', v: job.feeArch}, 
                    {l:'ค่าบริการควบคุมงาน (Supervisor Fee)', v: job.feeSuper}
                  ].filter(f => f.v > 0).map((f, i) => (
                     <tr key={i}><td className="py-3 pl-4 text-[10px] text-slate-600 uppercase italic bg-slate-50">{f.l}</td><td className="py-3 text-right text-[10px] text-slate-600 font-bold bg-slate-50">{formatCurrency(f.v)}</td></tr>
                  ))}
               </tbody>
            </table>

            <div className="flex justify-end mb-10">
               <div className="w-full md:w-80 space-y-4">
                  <div className="flex justify-between text-xs font-bold text-slate-900 uppercase tracking-widest border-t border-black pt-4"><span>รวมเป็นเงินทั้งสิ้น</span><span className="text-lg">{formatCurrency(job.totalPrice)}</span></div>
                  {type === 'RECEIPT' && (
                     <>
                        <div className="flex justify-between text-xs font-bold text-[#C5A059] uppercase border-t border-slate-100 pt-4"><span>ชำระแล้ว (Paid)</span><span>{formatCurrency(job.receivedAmount)}</span></div>
                        <div className="flex justify-between items-center pt-4 border-t-4 border-black"><span className="text-[10px] font-bold uppercase tracking-[0.2em]">ยอดคงเหลือ</span><span className={`text-xl font-bold italic font-semibold ${job.totalPrice-job.receivedAmount > 0 ? 'text-red-600' : 'text-black'}`}>{formatCurrency(job.totalPrice-job.receivedAmount)}</span></div>
                     </>
                  )}
               </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 no-print border-t border-slate-100 pt-8 no-capture justify-center md:justify-end">
               <button onClick={handlePrint} className="flex-1 md:flex-none px-6 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#C5A059] transition-all rounded shadow-md">พิมพ์เอกสาร / PDF</button>
               <button onClick={handleImage} className="flex-1 md:flex-none px-6 py-3 bg-[#C5A059] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#A68541] transition-all rounded shadow-md">บันทึกรูปภาพ</button>
            </div>
         </div>
      </div>
   );
}
import React, { useRef } from 'react';
import { X, Printer } from 'lucide-react';

export default function DocPreviewModal({ job, team, type, onClose }) {
  const printRef = useRef();
  const isReceipt = type === 'RECEIPT';
  const balance = parseFloat(job.totalPrice) - parseFloat(job.receivedAmount);
  const roomDetails = [job?.bedrooms && `${job.bedrooms} ห้องนอน`, job?.bathrooms && `${job.bathrooms} ห้องน้ำ`, job?.parking && `จอดรถ ${job.parking} คัน`].filter(Boolean).join(' • ');

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const printWindow = window.open('', '', 'width=800,height=1100');
    printWindow.document.write(`<html><head><title>Print Document</title><style>@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;700&display=swap');body{font-family:'Sarabun',sans-serif;padding:40px;color:#333;}.text-gold{color:#C5A059;}.bg-black{background-color:#000;color:#fff;}.font-bold{font-weight:bold;}.text-right{text-align:right;}table{width:100%;border-collapse:collapse;margin-top:20px;}th,td{padding:12px;border-bottom:1px solid #eee;}</style></head><body>${content}</body></html>`);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[70] flex items-center justify-center p-4 overflow-y-auto no-scrollbar">
      <div className="bg-white w-[210mm] min-h-[297mm] p-12 relative text-slate-800 shadow-2xl rounded-sm">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-black no-print">✕</button>
        <div ref={printRef}>
          <div className="flex justify-between items-start border-b-4 border-black pb-8 mb-8">
             <div className="flex gap-6">
                <div className="w-20 h-20 bg-black flex items-center justify-center rounded shadow-lg text-white text-3xl font-bold font-sans">S</div>
                <div>
                   <h1 className="text-2xl font-bold uppercase italic tracking-tight">SUTHEECHU DESIGN STUDIO</h1>
                   <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase italic tracking-widest leading-relaxed">Architecture & Interior Design<br/>📞 083-720-5937</p>
                </div>
             </div>
             <div className="text-right uppercase">
                <h2 className="text-4xl font-light mb-4 tracking-tighter italic">{isReceipt ? 'ใบเสร็จรับเงิน' : 'ใบเสนอราคา'}</h2>
                <p className="text-xs font-bold tracking-[0.2em]">NO: QTN-{job.id}</p>
                <p className="text-xs text-slate-400 mt-1 uppercase">Date: {new Date().toLocaleDateString('th-TH')}</p>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-10 mb-10 items-start">
             <div className="border-l-4 border-[#C5A059] pl-6 py-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase italic mb-1">Customer:</p>
                <p className="text-3xl font-bold uppercase mb-4 underline decoration-[#C5A059] decoration-4 underline-offset-8">{job.client}</p>
                <div className="text-sm font-bold text-slate-600 uppercase italic space-y-1">
                   <p className="text-black">🏷️ {job.serviceType || job.projectType}</p>
                   {roomDetails && <p className="text-[#C5A059] font-bold">📌 {roomDetails}</p>}
                   {team && <p className="text-xs text-slate-400 lowercase italic border-t pt-2 mt-2">👷 Team: {team.name}</p>}
                </div>
             </div>
             <div className="bg-black p-6 text-white text-center rounded-sm border-t-4 border-[#C5A059] shadow-xl">
                <p className="text-[10px] text-[#C5A059] font-bold uppercase tracking-widest mb-2 italic">Payment Info:</p>
                <p className="text-xs font-bold mb-1 italic font-sans">K-Bank (กสิกรไทย)</p>
                <p className="text-3xl font-bold tracking-widest text-[#C5A059] mb-1 font-sans">035-8-94074-9</p>
                <p className="text-[10px] font-bold uppercase opacity-80 italic tracking-widest font-sans">ชื่อบัญชี: สุธีร์ ชุยรัมย์</p>
             </div>
          </div>
          <table className="w-full mb-10 border-collapse italic">
             <thead className="border-b-2 border-black text-[10px] font-bold uppercase tracking-widest"><tr className="text-left text-slate-400"><th className="py-4">Description</th><th className="py-4 text-right">Amount (THB)</th></tr></thead>
             <tbody>
                <tr className="border-b"><td className="py-8 font-bold text-lg">Architecture Design Service (Design Fee)<p className="text-xs font-normal text-slate-400 mt-1 uppercase italic tracking-tighter">Area {job.area} SQ.M. X Studio Standard Rate</p></td><td className="text-right font-bold text-2xl tracking-tighter italic">฿{(parseFloat(job.totalPrice) - (parseFloat(job.feeEng)||0) - (parseFloat(job.feeArch)||0) - (parseFloat(job.feeSuper)||0)).toLocaleString()}</td></tr>
                {parseFloat(job.feeEng) > 0 && <tr><td className="py-2 text-xs text-slate-400 lowercase">Engineer sign-off</td><td className="text-right text-xs font-bold text-slate-500 italic">฿{parseFloat(job.feeEng).toLocaleString()}</td></tr>}
                {parseFloat(job.feeArch) > 0 && <tr><td className="py-2 text-xs text-slate-400 lowercase">Architect sign-off</td><td className="text-right text-xs font-bold text-slate-500 italic">฿{parseFloat(job.feeArch).toLocaleString()}</td></tr>}
                {parseFloat(job.feeSuper) > 0 && <tr><td className="py-2 text-xs text-slate-400 lowercase">Site supervision</td><td className="text-right text-xs font-bold text-slate-500 italic">฿{parseFloat(job.feeSuper).toLocaleString()}</td></tr>}
             </tbody>
          </table>
          <div className="flex justify-end border-t-2 border-black pt-8 mb-20">
             <div className="w-80 space-y-4">
                <div className="flex justify-between font-bold text-slate-900 text-2xl uppercase tracking-tighter italic"><span>Grand Total</span><span>฿{parseFloat(job.totalPrice).toLocaleString()}</span></div>
                {isReceipt && <div className="flex justify-between font-bold text-[#C5A059] border-t border-slate-100 pt-4 uppercase text-lg italic"><span>Paid</span><span>฿{parseFloat(job.receivedAmount).toLocaleString()}</span></div>}
                <div className="flex justify-between font-bold text-4xl border-t-4 border-black pt-6 uppercase tracking-tighter text-red-600"><span>Balance</span><span>฿{balance.toLocaleString()}</span></div>
             </div>
          </div>
        </div>
        <div className="mt-12 no-print flex gap-4"><button onClick={handlePrint} className="flex-1 py-4 bg-black text-white font-bold rounded-xl shadow-xl uppercase text-xs tracking-widest hover:bg-slate-800 transition-all">Print PDF Document</button></div>
      </div>
    </div>
  );
}
import React, { useRef } from 'react';
import { X, Printer, Image as ImageIcon } from 'lucide-react';
import { useReactToPrint } from 'react-to-print'; // ✅ เรียกใช้ Library

export default function DocPreviewModal({ job, type, onClose }) {
  const componentRef = useRef(); // อ้างอิงส่วนที่จะพิมพ์
  if (!job) return null;

  const isReceipt = type === 'RECEIPT';

  // --- Helper Functions ---
  const val = (n) => parseFloat(n) || 0;
  const fmt = (n) => `฿${val(n).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;

  // --- คำนวณค่าต่างๆ ---
  const designFee     = val(job.designFee);
  const feeEng        = val(job.feeEng);
  const feeArch       = val(job.feeArch);
  const feeSuper      = val(job.feeSuper);
  const totalProfFees = val(job.totalProfessionalFees);

  const totalPrice    = designFee + totalProfFees; // ยอดสัญญา
  const receivedAmount = val(job.receivedAmount);
  
  // ยอดคงเหลือ = ยอดบิล (ตามที่คุณต้องการ)
  const balance = totalPrice; 

  // ✅ ฟังก์ชันพิมพ์แบบใหม่ (ใช้ react-to-print)
  const handlePrint = useReactToPrint({
    contentRef: componentRef, // ใช้ contentRef แทน content
    documentTitle: `${isReceipt ? 'Receipt' : 'Quotation'}_${job.client}`,
    onAfterPrint: () => console.log('Print success'),
  });

  const handleSaveImage = () => {
    if (window.html2canvas && componentRef.current) {
      window.html2canvas(componentRef.current, { scale: 2 }).then(c => {
        const l = document.createElement('a');
        l.download = `${isReceipt?'Receipt':'Quotation'}_${job.client ?? 'Doc'}.png`;
        l.href = c.toDataURL();
        l.click();
      });
    } else {
      alert('ไม่พบ Library html2canvas (ลองใช้ Print to PDF แทน)');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[70] flex items-start justify-center p-4 overflow-y-auto">
      {/* ปุ่มปิด (ไม่ถูกพิมพ์) */}
      <button onClick={onClose} className="fixed top-4 right-4 z-[80] p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-all shadow-lg cursor-pointer">
        <X size={24} />
      </button>

      <div className="bg-white w-[210mm] min-h-[297mm] p-10 relative text-slate-800 shadow-2xl rounded-sm mt-8 mb-8">
        
        {/* ✅ พื้นที่ที่จะถูกพิมพ์ (อ้างอิงด้วย ref={componentRef}) */}
        <div ref={componentRef} className="bg-white p-8">
          
          {/* Style เฉพาะตอนพิมพ์ */}
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;600&display=swap');
            @media print {
              body { -webkit-print-color-adjust: exact; }
              @page { size: A4; margin: 20mm; }
            }
            .doc-font { font-family: 'IBM Plex Sans Thai', sans-serif !important; color: #333; }
          `}</style>

          <div className="doc-font">
            {/* --- Header --- */}
            <div className="flex justify-between items-start border-b-4 border-black pb-6 mb-6">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-black flex items-center justify-center rounded-lg text-white text-2xl font-bold">S</div>
                <div>
                  <h1 className="text-xl font-bold uppercase tracking-tight">SUTHEECHU DESIGN STUDIO</h1>
                  <div className="text-[10px] text-slate-500 mt-1 font-medium">
                    <p>35/1 หมู่ 5 ต.ไผ่ต่ำ อ.หนองแค จ.สระบุรี 18140</p>
                    <p>Tel: (+66) 83 720 5937</p>
                    <p className="mt-1 font-bold text-[#C5A059]">Architecture & Interior Design</p>
                  </div>
                </div>
              </div>
              <div className="text-right uppercase">
                <h2 className="text-3xl font-light mb-2 tracking-tighter">{isReceipt ? 'ใบเสร็จรับเงิน' : 'ใบเสนอราคา'}</h2>
                <p className="text-[10px] font-bold text-slate-400 tracking-widest">{isReceipt ? 'RECEIPT' : 'QUOTATION'}</p>
                <p className="text-[10px] font-bold mt-1">NO: QTN-{job.no}</p>
                <p className="text-[10px] text-slate-400">Date: {new Date().toLocaleDateString('th-TH')}</p>
              </div>
            </div>

            {/* --- Customer & Payment Info --- */}
            <div className="grid grid-cols-2 gap-8 mb-8 items-start">
              <div className="border-l-4 border-[#C5A059] pl-4 py-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Customer (ลูกค้า):</p>
                <p className="text-2xl font-bold uppercase mb-2">{job.client}</p>
                <div className="text-xs text-slate-600">
                  <p>🏷️ {job.serviceType}</p>
                  {job.teamName && <p className="mt-1">👷 Team: {job.teamName}</p>}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <p className="text-[10px] text-[#C5A059] font-bold uppercase tracking-widest mb-1">Payment Info:</p>
                <p className="text-xs font-bold">K-Bank (กสิกรไทย)</p>
                <p className="text-xl font-bold tracking-widest text-[#C5A059]">035-8-94074-9</p>
                <p className="text-[10px] font-bold uppercase text-slate-400">ชื่อบัญชี: สุธีร์ ชุยรัมย์</p>
              </div>
            </div>

            {/* --- Table --- */}
            <table className="w-full mb-8 border-collapse">
              <thead className="border-b-2 border-black text-[10px] font-bold uppercase">
                <tr className="text-left text-slate-400">
                  <th className="py-2">รายการ (Description)</th>
                  <th className="py-2 text-right">จำนวนเงิน (Amount)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-4 font-bold text-sm">
                    Architecture Design Service (ค่าบริการออกแบบ)
                    <div className="text-[10px] font-normal text-slate-500 mt-1 space-y-0.5">
                      <p>• พื้นที่ที่ใช้สอย: {job.area ?? 0} ตร.ม. (Standard Rate)</p>
                      <p className="text-slate-400">• {job.spec ?? '-'}</p>
                    </div>
                  </td>
                  <td className="text-right font-bold text-lg">{fmt(designFee)}</td>
                </tr>
                {feeEng  > 0 && (<tr><td className="py-2 text-xs">ค่าวิศวกร (Engineer)</td><td className="text-right text-xs font-bold">{fmt(feeEng)}</td></tr>)}
                {feeArch > 0 && (<tr><td className="py-2 text-xs">ค่าสถาปนิก (Architect)</td><td className="text-right text-xs font-bold">{fmt(feeArch)}</td></tr>)}
                {feeSuper> 0 && (<tr><td className="py-2 text-xs">ค่าคุมงาน (Supervisor)</td><td className="text-right text-xs font-bold">{fmt(feeSuper)}</td></tr>)}
              </tbody>
            </table>

            {/* --- Footer (Totals) --- */}
            <div className="flex justify-end border-t-2 border-black pt-6 mb-10">
              <div className="w-64 space-y-2">
                <div className="flex justify-between font-bold text-slate-900 text-lg">
                  <span>รวมทั้งสิ้น</span>
                  <span>{fmt(totalPrice)}</span>
                </div>
                {isReceipt && (
                  <div className="flex justify-between font-bold text-[#C5A059] border-t border-slate-100 pt-2 text-sm">
                    <span>ชำระแล้ว</span>
                    <span>{fmt(receivedAmount)}</span>
                  </div>
                )}
                {/* ยอดคงเหลือ = ยอดบิล */}
                <div className="flex justify-between font-bold text-2xl border-t-2 border-black pt-2 text-red-600">
                  <span>คงเหลือ</span>
                  <span>{fmt(balance)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Buttons (ไม่ถูกพิมพ์) --- */}
        <div className="mt-8 flex gap-3 justify-center">
          <button onClick={handlePrint} className="px-6 py-3 bg-black text-white font-bold rounded-lg shadow-md hover:bg-slate-800 text-xs flex gap-2 items-center">
            <Printer size={14}/> พิมพ์ (PDF)
          </button>
          <button onClick={handleSaveImage} className="px-6 py-3 bg-[#C5A059] text-white font-bold rounded-lg shadow-md hover:bg-[#b08d4b] text-xs flex gap-2 items-center">
            <ImageIcon size={14}/> บันทึกรูป
          </button>
        </div>
      </div>
    </div>
  );
}
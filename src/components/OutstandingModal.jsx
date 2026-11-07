// src/components/OutstandingModal.jsx
import React, { useState, useMemo } from 'react';
import { 
  X, AlertTriangle, FileText, Share2, Copy, Check, 
  Calendar, Search, User, Briefcase, DollarSign, ExternalLink
} from 'lucide-react';
import { formatCurrency, formatThaiDate } from '../utils/helpers';

export default function OutstandingModal({ jobs, onClose, onDoc, onShare }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  // กรองเฉพาะงานที่มียอดค้างชำระ
  const unpaidJobs = useMemo(() => {
    return jobs
      .map(j => {
        const isPaid = j.isMoneyReceived === true || (parseFloat(j.pendingAmount) || 0) === 0;
        const balance = isPaid ? 0 : (parseFloat(j.pendingAmount) || Math.max(0, (parseFloat(j.totalPrice) || 0) - (parseFloat(j.receivedAmount) || 0)));
        return {
          ...j,
          unpaidBalance: balance
        };
      })
      .filter(j => j.unpaidBalance > 0);
  }, [jobs]);

  // คำนวณยอดรวมของงานค้างรับ
  const totalOutstanding = useMemo(() => {
    return unpaidJobs.reduce((sum, j) => sum + j.unpaidBalance, 0);
  }, [unpaidJobs]);

  const totalContract = useMemo(() => {
    return unpaidJobs.reduce((sum, j) => sum + (parseFloat(j.totalPrice) || 0), 0);
  }, [unpaidJobs]);

  const totalReceived = useMemo(() => {
    return unpaidJobs.reduce((sum, j) => sum + (parseFloat(j.receivedAmount) || 0), 0);
  }, [unpaidJobs]);

  // ค้นหาตามชื่อลูกค้า หรือทีมช่าง
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return unpaidJobs;
    const q = searchTerm.toLowerCase();
    return unpaidJobs.filter(j => 
      (j.client && j.client.toLowerCase().includes(q)) ||
      (j.teamName && j.teamName.toLowerCase().includes(q)) ||
      (j.projectType && j.projectType.toLowerCase().includes(q)) ||
      (j.no && String(j.no).includes(q))
    );
  }, [unpaidJobs, searchTerm]);

  // คัดลอกสรุปรายการค้างรับทั้งหมดส่ง LINE
  const handleCopySummary = () => {
    let text = `📋 รายการค้างรับทั้งหมด (@TheToi.Design.Studio)\n`;
    text += `จำนวนทั้งหมด: ${unpaidJobs.length} โครงการ\n`;
    text += `ยอดค้างรับรวม: ${formatCurrency(totalOutstanding)}\n`;
    text += `------------------------------------\n`;
    unpaidJobs.forEach((j, idx) => {
      text += `${idx + 1}. ${j.client} (${j.projectType})\n`;
      text += `   ทีมช่าง: ${j.teamName || '-'}\n`;
      text += `   ยอดสัญญา: ${formatCurrency(j.totalPrice)} | ค้างชำระ: ${formatCurrency(j.unpaidBalance)}\n`;
    });
    text += `------------------------------------\n`;
    text += `อัปเดต ณ วันที่ ${new Date().toLocaleDateString('th-TH')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-red-50/50 via-white to-amber-50/30">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shadow-inner">
              <AlertTriangle size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">รายการค้างรับ (Outstanding Jobs)</h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">
                  {unpaidJobs.length} รายการ
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ยอดค้างชำระรวมทั้งหมด <span className="font-bold text-red-600">{formatCurrency(totalOutstanding)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:border-gold-300 rounded-xl text-xs font-bold text-slate-700 hover:text-gold-700 shadow-sm transition-all"
              title="คัดลอกสรุปรายการค้างรับทั้งหมด"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอกสรุป'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="ปิดหน้าต่าง"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อลูกค้า, ทีมช่าง หรือประเภทงาน..."
              className="w-full pl-9 pr-4 py-2 text-xs font-medium bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end text-xs text-slate-500">
            <button
              onClick={handleCopySummary}
              className="sm:hidden flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอกสรุป'}</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold text-slate-400">
                แสดง {filteredList.length} จาก {unpaidJobs.length} รายการ
              </span>
            </div>
          </div>
        </div>

        {/* Content Table / Cards */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {filteredList.length > 0 ? (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
              {filteredList.map((job) => (
                <div 
                  key={job.id} 
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  {/* Left Info */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                      #{job.no}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-gold-600 transition-colors">
                          {job.client}
                        </h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
                          {job.projectType}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Briefcase size={12} className="text-slate-400" />
                          ทีมช่าง: <strong className="text-slate-700 font-medium">{job.teamName || '-'}</strong>
                        </span>
                        {job.deliveryDate && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-slate-400" />
                            กำหนดส่ง: <strong className="text-slate-700 font-medium">{formatThaiDate(job.deliveryDate)}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Financial Figures */}
                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 shrink-0">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">ยอดสัญญา</span>
                      <span className="text-xs font-semibold text-slate-600">
                        {formatCurrency(job.totalPrice)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-red-500 tracking-wider block">ค้างชำระ</span>
                      <span className="text-base font-extrabold text-red-600">
                        {formatCurrency(job.unpaidBalance)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 pl-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDoc(job);
                        }}
                        className="p-2 bg-slate-50 hover:bg-gold-50 border border-slate-200 hover:border-gold-300 text-slate-600 hover:text-gold-700 rounded-xl transition-all shadow-sm cursor-pointer"
                        title="ออกเอกสาร / ใบเสนอราคา / ใบเสร็จ"
                      >
                        <FileText size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onShare(job);
                        }}
                        className="p-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-600 hover:text-emerald-700 rounded-xl transition-all shadow-sm cursor-pointer"
                        title="คัดลอกข้อความสรุปส่ง LINE"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center">
              <AlertTriangle size={36} className="text-slate-300 mb-2" />
              <p className="text-sm font-medium">ไม่พบรายการค้างรับตามคำค้นหา</p>
            </div>
          )}
        </div>

        {/* Footer Summary */}
        <div className="p-4 sm:p-5 bg-slate-50/90 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-xs w-full sm:w-auto justify-around sm:justify-start">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">ยอดสัญญารวม</span>
              <span className="font-bold text-slate-800 text-sm">{formatCurrency(totalContract)}</span>
            </div>
            <div className="w-px h-7 bg-slate-200"></div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">ชำระแล้ว</span>
              <span className="font-bold text-emerald-600 text-sm">{formatCurrency(totalReceived)}</span>
            </div>
            <div className="w-px h-7 bg-slate-200"></div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">ยอดค้างรับสุทธิ</span>
              <span className="font-extrabold text-red-600 text-base">{formatCurrency(totalOutstanding)}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Search, Settings, Save, FolderOpen, AlertTriangle, FileSpreadsheet,
  LayoutDashboard, TrendingUp, Users, Hammer, List, Table as TableIcon,
  Download, Upload, Eye, EyeOff, X, Check, MoreHorizontal, PenTool, Home,
  Calculator, StickyNote, CheckSquare, Square, Wallet, CheckCircle, Clock,
  FileText, Printer, GripVertical, ChevronRight, RefreshCw, User, Calendar as CalendarIcon,
  Image as ImageIcon, Bed, Bath, Car, Moon, Sun
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, AreaChart, Area
} from 'recharts';

// --- 1. HELPER: Safe LocalStorage Loader ---
const safeJSONParse = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error loading ${key}:`, error);
    return fallback;
  }
};

const formatCurrency = (amount) => 
  `฿${(parseFloat(amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

// --- 2. DATA ---
const DEFAULT_TEAMS = [
  { id: 'T1', name: 'ช่างนิติพันธ์ เปือยยะ (อุดรธานี)', ratePerSqm: 80 },
  { id: 'T2', name: 'ช่างมนตรี อุ่นแก้ว (ปทุมธานี)', ratePerSqm: 70 },
  { id: 'T3', name: 'ช่างนิพนธ์ ชัยจรินันท์ (สระบุรี)', ratePerSqm: 85 },
  { id: 'T4', name: 'ช่างสุธีร์ ชุยรัมย์ (สระบุรี)', ratePerSqm: 85 },
  { id: 'T5', name: 'ช่างต่อเติม (ทั่วไป)', ratePerSqm: 0 },
  { id: 'T6', name: 'อื่น (ระบุเอง)', ratePerSqm: 0 }
];

const DEFAULT_PROJECT_TYPES = ["บ้านพักอาศัยชั้นเดียว", "บ้านพักอาศัยชั้นครึ่ง", "บ้านพักอาศัยสองชั้น", "บ้านพักอาศัยน็อคดาวน์", "อาคารหอพัก", "อพาร์ทเม้นท์", "บ้านชั้นเดียว", "อื่น"];
const DEFAULT_SERVICE_TYPES = ["แบบก่อสร้าง+3D", "แบบก่อสร้าง", "ชุดเรนเดอร์3D", "ผังบริเวณ", "อื่น"];

const INITIAL_JOBS = [
  { 
      id: 'J25001', client: 'คุณแววมยุรา', teamId: 'T1', 
      projectType: 'บ้านพักอาศัยชั้นเดียว', serviceType: 'แบบก่อสร้าง+3D', 
      area: 150, unitPrice: 150, totalPrice: 37500, receivedAmount: 0, 
      feeEng: 5000, feeArch: 5000, feeSuper: 5000, actualOutsourceFee: 11500, 
      deliveryDate: '2026-08-25', startDate: '2026-08-10', note: 'กำไรสุทธิ: 26000', status: 'IN_PROGRESS',
      bedrooms: 3, bathrooms: 2, parking: 1
  },
  { 
      id: 'J25002', client: 'คุณวรรศิา อุ่นกาย', teamId: 'T2', 
      projectType: 'บ้านพักอาศัยชั้นเดียว', serviceType: 'แบบก่อสร้าง', 
      area: 120, unitPrice: 150, totalPrice: 18000, receivedAmount: 18000, 
      feeEng: 0, feeArch: 0, feeSuper: 0, actualOutsourceFee: 2000, 
      startDate: '2025-12-09', deliveryDate: '2025-12-17', 
      bedrooms: 2, bathrooms: 1, parking: 1,
      note: 'งานเร่งด่วน'
  }
];

// --- 3. GLOBAL STYLES ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@100;200;300;400;500;600;700&display=swap');
    
    :root { --font-main: 'IBM Plex Sans Thai', sans-serif; }
    * { font-family: var(--font-main) !important; box-sizing: border-box; }
    body { background-color: #F8FAFC; color: #1E293B; font-size: 13px; transition: background-color 0.3s, color 0.3s; }

    /* Dark Mode */
    body.dark { background-color: #0F172A !important; color: #F1F5F9 !important; }
    body.dark .bg-white { background-color: #1E293B !important; color: #F1F5F9 !important; border-color: #334155 !important; }
    body.dark .bg-gray-50, body.dark .bg-slate-50 { background-color: #0F172A !important; }
    body.dark .text-slate-900, body.dark .text-slate-800, body.dark .text-slate-700 { color: #F1F5F9 !important; }
    body.dark .text-slate-500, body.dark .text-slate-400 { color: #94A3B8 !important; }
    body.dark input, body.dark select, body.dark textarea { background-color: #0F172A !important; border-color: #334155 !important; color: #F1F5F9 !important; }
    body.dark button.bg-white { background-color: #1E293B !important; border-color: #334155 !important; color: #F1F5F9 !important; }
    body.dark .fixed.inset-0.bg-black\\/60 { background-color: rgba(0,0,0,0.85) !important; }

    /* Print Override */
    @media print {
      body.dark, body.dark .bg-white { background-color: white !important; color: black !important; }
      .no-print { display: none !important; }
    }

    input, select, textarea, button { font-family: var(--font-main) !important; font-size: 13px !important; }
    .glass-card { background: white; border: 1px solid #E2E8F0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 2px; }
  `}</style>
);

// --- 4. SUB-COMPONENTS ---

const StatCard = ({ title, value, color, iconBg, iconColor, icon: Icon }) => (
  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all flex items-center justify-between group h-full">
      <div>
         <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 group-hover:text-slate-700">{title}</h3>
         <p className="text-2xl font-bold tracking-tight" style={{ color: color }}>{formatCurrency(value)}</p>
      </div>
      <div className={`p-3 rounded-xl ${iconBg} ${iconColor} opacity-80 group-hover:opacity-100`}>
         {Icon && <Icon size={20} strokeWidth={2} />}
      </div>
  </div>
);

const JobRow = ({ job, team, onEdit, onDelete, onDoc }) => {
  const balance = parseFloat(job.totalPrice) - parseFloat(job.receivedAmount);
  const isPaid = balance <= 0;
  const netProfit = parseFloat(job.totalPrice) - (parseFloat(job.actualOutsourceFee) || 0);
  const marginPercent = job.totalPrice > 0 ? (netProfit / job.totalPrice) * 100 : 0;
  
  // Safe date formatting
  const formatDate = (d) => {
      try {
          return new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
      } catch (e) {
          return '-';
      }
  };

  return (
    <tr className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 text-xs">
      <td className="px-6 py-4"> 
         <div className="font-bold text-slate-900 uppercase text-sm mb-1">{job.client}</div>
         <div className="flex flex-col gap-1 text-slate-500">
            <div className="flex items-center gap-1.5">
                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold dark:text-slate-800">{job.projectType}</span>
                <span className="text-[10px]">· {team?.name || '-'}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-medium text-slate-400 mt-0.5">
                {(job.bedrooms || job.bathrooms) && (
                    <span className="flex items-center gap-1 text-slate-500">
                        {job.bedrooms && <><Bed size={10}/>{job.bedrooms}</>} 
                        {job.bathrooms && <><Bath size={10}/>{job.bathrooms}</>}
                    </span>
                )}
                <span className="flex items-center gap-1 text-[#C5A059] bg-[#C5A059]/10 px-1.5 rounded">
                    <CalendarIcon size={10}/> ส่ง: {formatDate(job.deliveryDate)}
                </span>
            </div>
         </div>
      </td>
      <td className="px-6 py-4 text-right font-medium text-slate-700 align-top pt-5">{formatCurrency(job.totalPrice)}</td>
      <td className="px-6 py-4 text-right align-top pt-5">
         <div className="font-bold text-emerald-600">{formatCurrency(netProfit)}</div>
         <div className="text-[9px] text-emerald-500 font-bold">{marginPercent.toFixed(1)}%</div>
      </td>
      <td className="px-6 py-4 text-right align-top pt-5">
         {isPaid ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-[10px] font-bold border border-emerald-100"><CheckCircle size={12}/> ครบแล้ว</span>
         ) : (
            <span className="inline-flex items-center gap-1 text-red-500 bg-red-50 px-2 py-1 rounded-lg text-[10px] font-bold border border-red-100"><Clock size={12}/> {formatCurrency(balance)}</span>
         )}
      </td>
      <td className="px-6 py-4 text-center align-top pt-4">
         <div className="flex justify-center items-center gap-2">
            <button onClick={onDoc} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-black hover:border-slate-400 transition-all shadow-sm" title="เอกสาร"><FileText size={16}/></button>
            <button onClick={onEdit} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-[#C5A059] hover:border-[#C5A059] transition-all shadow-sm" title="แก้ไข"><Settings size={16}/></button>
            <button onClick={onDelete} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-red-500 hover:border-red-500 transition-all shadow-sm" title="ลบ"><X size={16}/></button>
         </div>
      </td>
    </tr>
  );
};

const JobModal = ({ job, teams, projectTypes, serviceTypes, onClose, onSave }) => {
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
    bedrooms: job?.bedrooms || '', bathrooms: job?.bathrooms || '', parking: job?.parking || ''
  });

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
                <div><label className={labelClass}>ทีมช่าง</label><select className={inputClass} value={formData.teamId} onChange={e => setFormData({...formData, teamId: e.target.value})}>{teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
             </div>
             <div className="pt-4 border-t border-dashed border-slate-200"><h4 className="text-xs font-bold text-slate-900 flex items-center gap-2 mb-3 uppercase tracking-wide"><Home size={14} className="text-[#C5A059]"/> สเปคงาน</h4><div className="grid grid-cols-3 gap-3"><div><label className={labelClass}>นอน</label><input type="number" className={`${inputClass} text-center`} value={formData.bedrooms} onChange={e => setFormData({...formData, bedrooms: e.target.value})} /></div><div><label className={labelClass}>น้ำ</label><input type="number" className={`${inputClass} text-center`} value={formData.bathrooms} onChange={e => setFormData({...formData, bathrooms: e.target.value})} /></div><div><label className={labelClass}>จอดรถ</label><input type="number" className={`${inputClass} text-center`} value={formData.parking} onChange={e => setFormData({...formData, parking: e.target.value})} /></div></div></div>
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
                            return (
                                <div 
                                    key={fieldName} 
                                    onClick={() => toggleFee(fieldName)} 
                                    className={`flex justify-between items-center p-2 rounded-lg border cursor-pointer transition-all ${
                                        isChecked ? 'bg-[#C5A059]/10 border-[#C5A059]' : 'bg-gray-50 border-transparent hover:bg-gray-100'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {isChecked ? <CheckSquare size={14} className="text-[#C5A059]"/> : <Square size={14} className="text-slate-300"/>}
                                        <span className={`text-[11px] font-bold ${isChecked ? 'text-[#C5A059]' : 'text-slate-500'}`}>{label}</span>
                                    </div>
                                    <span className={`text-[11px] font-bold ${isChecked ? 'text-[#C5A059]' : 'text-slate-300'}`}>
                                        {isChecked ? '5,000' : '0'}
                                    </span>
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

const CountdownList = ({ jobs, onEdit }) => {
  const sorted = [...jobs].sort((a,b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
       {sorted.map(job => {
          const start = new Date(job.startDate || new Date()); const end = new Date(job.deliveryDate); const today = new Date();
          const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 14;
          const daysLeft = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
          const daysPassed = totalDays - daysLeft;
          let progress = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));
          let statusColor = daysLeft < 0 ? "bg-red-600" : daysLeft <= 3 ? "bg-red-500" : daysLeft <= 7 ? "bg-orange-400" : "bg-emerald-500";
          let statusText = daysLeft < 0 ? "เกินกำหนด" : daysLeft <= 3 ? "ด่วนมาก" : daysLeft <= 7 ? "ใกล้ถึง" : "ปกติ";

          return (
            <div key={job.id} onClick={() => onEdit(job)} className="bg-white p-5 rounded-2xl border border-slate-100 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group">
               <div className="flex justify-between items-start mb-3"><div><h3 className="font-bold text-sm text-slate-800 uppercase">{job.client}</h3><div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1"><Home size={10}/> {job.projectType}</div></div><div className={`px-2 py-1 rounded-lg text-[9px] font-bold text-white uppercase tracking-wider ${statusColor}`}>{statusText}</div></div>
               <div className="flex justify-between items-end mb-1.5"><span className="text-3xl font-bold text-slate-900 tracking-tight">{Math.abs(daysLeft)}<span className="text-[10px] font-bold text-slate-400 ml-1">วัน</span></span><span className="text-[9px] text-slate-400 font-bold uppercase">{Math.round(progress)}% ใช้ไป</span></div>
               <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3"><div className={`h-full ${statusColor} transition-all duration-1000`} style={{ width: `${progress}%` }}></div></div>
               <div className="pt-3 border-t border-dashed border-slate-200 flex justify-between text-[10px] font-medium"><div className="text-slate-400">เริ่ม: <span className="text-slate-600">{start.toLocaleDateString('th-TH')}</span></div><div className="text-slate-400">ส่ง: <span className="text-slate-900 font-bold">{end.toLocaleDateString('th-TH')}</span></div></div>
            </div>
          );
       })}
    </div>
  );
};

const DocPreviewModal = ({ job, team, type, onClose }) => {
  const printRef = useRef(); const isReceipt = type === 'RECEIPT'; const balance = parseFloat(job.totalPrice) - parseFloat(job.receivedAmount);
  const handlePrint = () => { const content = printRef.current.innerHTML; const w = window.open('', '', 'width=800,height=1100'); w.document.write(`<html><head><style>@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;600&display=swap');body{font-family:'IBM Plex Sans Thai',sans-serif !important;padding:40px;color:#333;}.text-gold{color:#C5A059;}.bg-black{background-color:#000;color:#fff;}.font-bold{font-weight:bold;}.text-right{text-align:right;}table{width:100%;border-collapse:collapse;margin-top:20px;}th,td{padding:10px;border-bottom:1px solid #eee;font-size:12px;}</style></head><body>${content}</body></html>`); w.document.close(); setTimeout(() => w.print(), 500); };
  const handleSaveImage = () => { if (window.html2canvas) window.html2canvas(printRef.current, { scale: 2 }).then(c => { const l = document.createElement('a'); l.download = `${isReceipt?'Receipt':'Quotation'}_${job.client}.png`; l.href = c.toDataURL(); l.click(); }); else alert('ไม่พบ html2canvas'); };
  
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[70] flex items-center justify-center p-4 overflow-y-auto no-scrollbar">
      <div className="bg-white w-[210mm] min-h-[297mm] p-10 relative text-slate-800 shadow-2xl rounded-sm">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-300 hover:text-black no-print">✕</button>
        <div ref={printRef} className="bg-white p-4">
          <div className="flex justify-between items-start border-b-4 border-black pb-6 mb-6">
             <div className="flex gap-4"><div className="w-16 h-16 bg-black flex items-center justify-center rounded-lg text-white text-2xl font-bold">S</div><div><h1 className="text-xl font-bold uppercase tracking-tight">SUTHEECHU DESIGN STUDIO</h1><div className="text-[10px] text-slate-500 mt-1 font-medium"><p>35/1 หมู่ 5 ต.ไผ่ต่ำ อ.หนองแค จ.สระบุรี 18140</p><p>Tel: (+66) 83 720 5937</p><p className="mt-1 font-bold text-[#C5A059]">Architecture & Interior Design</p></div></div></div>
             <div className="text-right uppercase"><h2 className="text-3xl font-light mb-2 tracking-tighter">{isReceipt?'ใบเสร็จรับเงิน':'ใบเสนอราคา'}</h2><p className="text-[10px] font-bold text-slate-400 tracking-widest">{isReceipt?'RECEIPT':'QUOTATION'}</p><p className="text-[10px] font-bold mt-1">NO: QTN-{job.id}</p><p className="text-[10px] text-slate-400">Date: {new Date().toLocaleDateString('th-TH')}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-8 mb-8 items-start">
             <div className="border-l-4 border-[#C5A059] pl-4 py-1"><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Customer (ลูกค้า):</p><p className="text-2xl font-bold uppercase mb-2">{job.client}</p><div className="text-xs text-slate-600"><p>🏷️ {job.serviceType}</p>{team && <p className="mt-1">👷 Team: {team.name}</p>}</div></div>
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-100"><p className="text-[10px] text-[#C5A059] font-bold uppercase tracking-widest mb-1">Payment Info:</p><p className="text-xs font-bold">K-Bank (กสิกรไทย)</p><p className="text-xl font-bold tracking-widest text-[#C5A059]">035-8-94074-9</p><p className="text-[10px] font-bold uppercase text-slate-400">ชื่อบัญชี: สุธีร์ ชุยรัมย์</p></div>
          </div>
          <table className="w-full mb-8 border-collapse"><thead className="border-b-2 border-black text-[10px] font-bold uppercase"><tr className="text-left text-slate-400"><th className="py-2">รายการ (Description)</th><th className="py-2 text-right">จำนวนเงิน (Amount)</th></tr></thead>
             <tbody>
                <tr className="border-b">
                    <td className="py-4 font-bold text-sm">
                        Architecture Design Service (ค่าบริการออกแบบ)
                        <div className="text-[10px] font-normal text-slate-500 mt-1 space-y-0.5">
                           <p>• พื้นที่ใช้สอย: {job.area || 0} ตร.ม. (Standard Rate)</p>
                           {(job.bedrooms || job.bathrooms || job.parking) && (
                               <p className="text-slate-400">
                                   • ฟังก์ชัน: {job.bedrooms ? `${job.bedrooms} นอน` : ''} {job.bathrooms ? `/ ${job.bathrooms} น้ำ` : ''} {job.parking ? `/ ${job.parking} จอดรถ` : ''}
                               </p>
                           )}
                        </div>
                    </td>
                    <td className="text-right font-bold text-lg">฿{(parseFloat(job.totalPrice) - (parseFloat(job.feeEng)||0) - (parseFloat(job.feeArch)||0) - (parseFloat(job.feeSuper)||0)).toLocaleString()}</td>
                </tr>
                {parseFloat(job.feeEng) > 0 && <tr><td className="py-2 text-xs">ค่าวิศวกร (Engineer)</td><td className="text-right text-xs font-bold">฿{parseFloat(job.feeEng).toLocaleString()}</td></tr>}
                {parseFloat(job.feeArch) > 0 && <tr><td className="py-2 text-xs">ค่าสถาปนิก (Architect)</td><td className="text-right text-xs font-bold">฿{parseFloat(job.feeArch).toLocaleString()}</td></tr>}
                {parseFloat(job.feeSuper) > 0 && <tr><td className="py-2 text-xs">ค่าคุมงาน (Supervisor)</td><td className="text-right text-xs font-bold">฿{parseFloat(job.feeSuper).toLocaleString()}</td></tr>}
             </tbody>
          </table>
          <div className="flex justify-end border-t-2 border-black pt-6 mb-10"><div className="w-64 space-y-2"><div className="flex justify-between font-bold text-slate-900 text-lg"><span>รวมทั้งสิ้น</span><span>฿{parseFloat(job.totalPrice).toLocaleString()}</span></div>{isReceipt && <div className="flex justify-between font-bold text-[#C5A059] border-t border-slate-100 pt-2 text-sm"><span>ชำระแล้ว</span><span>฿{parseFloat(job.receivedAmount).toLocaleString()}</span></div>}<div className="flex justify-between font-bold text-2xl border-t-2 border-black pt-2 text-red-600"><span>คงเหลือ</span><span>฿{balance.toLocaleString()}</span></div></div></div>
        </div>
        <div className="mt-8 no-print flex gap-3 justify-center"><button onClick={handlePrint} className="px-6 py-3 bg-black text-white font-bold rounded-lg shadow-md hover:bg-slate-800 text-xs flex gap-2"><Printer size={14}/> พิมพ์</button><button onClick={handleSaveImage} className="px-6 py-3 bg-[#C5A059] text-white font-bold rounded-lg shadow-md hover:bg-[#b08d4b] text-xs flex gap-2"><ImageIcon size={14}/> บันทึกรูป</button></div>
      </div>
    </div>
  );
};

// ... CalendarView, Modals (Small adjustment for compactness)
const CalendarView = ({ jobs, onJobClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear(); const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate(); const firstDay = new Date(year, month, 1).getDay();
  const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-in fade-in">
      <div className="p-4 border-b flex justify-between items-center"><h2 className="text-base font-bold text-slate-800">{months[month]} {year+543}</h2><div className="flex bg-slate-50 rounded p-1"><button onClick={()=>setCurrentDate(new Date(year, month-1, 1))} className="px-2 text-xs">←</button><button onClick={()=>setCurrentDate(new Date())} className="px-2 text-xs font-bold text-[#C5A059]">วันนี้</button><button onClick={()=>setCurrentDate(new Date(year, month+1, 1))} className="px-2 text-xs">→</button></div></div>
      <div className="grid grid-cols-7 bg-slate-50 border-b">{['อา','จ','อ','พ','พฤ','ศ','ส'].map(d=><div key={d} className="py-2 text-center text-[10px] font-bold text-slate-400">{d}</div>)}</div>
      <div className="grid grid-cols-7 auto-rows-fr bg-slate-50 gap-px border-b border-slate-200">{[...Array(firstDay)].map((_,i)=><div key={`e-${i}`} className="bg-white min-h-[80px]"></div>)}{[...Array(daysInMonth)].map((_,i)=>{const d=i+1; const dayJobs=jobs.filter(j=>{const jd=new Date(j.deliveryDate); return jd.getDate()===d && jd.getMonth()===month && jd.getFullYear()===year}); return(<div key={d} className="bg-white p-1.5 min-h-[80px]"><span className="text-[10px] font-bold text-slate-400">{d}</span><div className="mt-1 space-y-1">{dayJobs.map(j=><div key={j.id} onClick={()=>onJobClick(j)} className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 truncate cursor-pointer">{j.client}</div>)}</div></div>)})}</div>
    </div>
  );
};

const DocSelectModal = ({ onClose, onSelect }) => (<div className="fixed inset-0 bg-black/60 z-[65] flex items-center justify-center p-4"><div className="bg-white p-6 rounded-2xl text-center max-w-sm w-full"><h3 className="text-xs font-bold uppercase mb-6 text-slate-500">เลือกเอกสาร (Select)</h3><div className="flex gap-3 justify-center"><button onClick={()=>onSelect('QUOTATION')} className="flex-1 p-4 border rounded-xl flex flex-col items-center gap-2 hover:bg-slate-50"><FileText size={20} className="text-slate-400"/><span className="text-xs font-bold">ใบเสนอราคา</span></button><button onClick={()=>onSelect('RECEIPT')} className="flex-1 p-4 border border-[#C5A059]/30 bg-[#C5A059]/5 rounded-xl flex flex-col items-center gap-2 hover:bg-[#C5A059]/10"><Printer size={20} className="text-[#C5A059]"/><span className="text-xs font-bold text-[#C5A059]">ใบเสร็จ</span></button></div><button onClick={onClose} className="mt-6 text-[10px] font-bold text-slate-400 underline">ยกเลิก</button></div></div>);
const TeamModal = ({ teams, onClose, onAdd, onDelete }) => { const [name, setName] = useState(''); const [rate, setRate] = useState(80); return (<div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"><div className="bg-white w-full max-w-md p-6 rounded-2xl"><div className="flex justify-between mb-4"><h3 className="font-bold text-sm">จัดการทีมช่าง</h3><button onClick={onClose}><X size={16}/></button></div><div className="flex gap-2 mb-4"><input placeholder="ชื่อ..." className="flex-1 border p-2 rounded-lg text-xs" value={name} onChange={e=>setName(e.target.value)} /><input type="number" className="w-16 border p-2 rounded-lg text-xs text-center" value={rate} onChange={e=>setRate(e.target.value)} /><button onClick={()=>{if(name){onAdd({name, ratePerSqm: rate}); setName('');}}} className="bg-black text-white p-2 rounded-lg"><Plus size={16}/></button></div><div className="space-y-2 max-h-[250px] overflow-y-auto">{teams.map(t=><div key={t.id} className="flex justify-between p-2 border rounded-lg items-center text-xs"><span>{t.name}</span><button onClick={()=>onDelete(t.id)}><X size={12}/></button></div>)}</div></div></div>); };
const ProjectTypeModal = ({ list, onClose }) => (<div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"><div className="bg-white w-full max-w-sm p-6 rounded-2xl"><h3 className="font-bold text-sm mb-4">ประเภทงาน</h3><div className="space-y-2 max-h-[300px] overflow-y-auto">{list.map((t,i)=><div key={i} className="p-2 border rounded-lg text-xs">{t}</div>)}</div><button onClick={onClose} className="mt-4 w-full border p-2 rounded-lg text-xs">ปิด</button></div></div>);
const ServiceTypeModal = ({ list, onClose }) => (<div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"><div className="bg-white w-full max-w-sm p-6 rounded-2xl"><h3 className="font-bold text-sm mb-4">บริการ</h3><div className="space-y-2 max-h-[300px] overflow-y-auto">{list.map((t,i)=><div key={i} className="p-2 border rounded-lg text-xs">{t}</div>)}</div><button onClick={onClose} className="mt-4 w-full border p-2 rounded-lg text-xs">ปิด</button></div></div>);

// --- 4. MAIN APP ---
export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [listViewMode, setListViewMode] = useState('table');
  const [teams, setTeams] = useState(() => safeJSONParse('stu_teams', DEFAULT_TEAMS));
  const [projectTypes, setProjectTypes] = useState(() => safeJSONParse('stu_projectTypes', DEFAULT_PROJECT_TYPES));
  const [serviceTypes, setServiceTypes] = useState(() => safeJSONParse('stu_serviceTypes', DEFAULT_SERVICE_TYPES));
  const [jobs, setJobs] = useState(() => safeJSONParse('stu_jobs', INITIAL_JOBS));
  const [activeModal, setActiveModal] = useState(null); 
  const [editingJob, setEditingJob] = useState(null);
  const [docConfig, setDocConfig] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(() => safeJSONParse('stu_dark_mode', false));

  // Sync to LocalStorage
  useEffect(() => localStorage.setItem('stu_teams', JSON.stringify(teams)), [teams]);
  useEffect(() => localStorage.setItem('stu_projectTypes', JSON.stringify(projectTypes)), [projectTypes]);
  useEffect(() => localStorage.setItem('stu_serviceTypes', JSON.stringify(serviceTypes)), [serviceTypes]);
  useEffect(() => localStorage.setItem('stu_jobs', JSON.stringify(jobs)), [jobs]);
  
  // Sync Dark Mode
  useEffect(() => {
    localStorage.setItem('stu_dark_mode', JSON.stringify(isDarkMode));
    if (isDarkMode) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  }, [isDarkMode]);

  // Force Restore Default Teams if Empty
  useEffect(() => {
    if (!teams || teams.length === 0) setTeams(DEFAULT_TEAMS);
  }, [teams]);

  const stats = useMemo(() => {
    let totalProfit = 0, totalBalance = 0;
    const qDataRaw = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
    const yDataRaw = {};
    jobs.forEach(j => {
      const price = parseFloat(j.totalPrice) || 0;
      const profit = price - (parseFloat(j.actualOutsourceFee) || 0);
      const balance = price - (parseFloat(j.receivedAmount) || 0);
      totalProfit += profit;
      if (balance > 0) totalBalance += balance;
      if (j.deliveryDate) {
         try {
             const d = new Date(j.deliveryDate); const y = d.getFullYear(); const m = d.getMonth() + 1;
             const q = m <= 3 ? 'Q1' : m <= 6 ? 'Q2' : m <= 9 ? 'Q3' : 'Q4';
             if (!yDataRaw[y]) yDataRaw[y] = 0; yDataRaw[y] += profit;
             if (y === 2025) qDataRaw[q] += profit;
         } catch (e) {}
      }
    });
    const qData2025 = Object.keys(qDataRaw).map(k => ({ name: k, profit: qDataRaw[k] }));
    const yData = Object.keys(yDataRaw).sort().map(k => ({ name: k, profit: yDataRaw[k] }));
    return { totalProfit, totalBalance, qData2025, yData };
  }, [jobs]);

  const handleSaveJob = (jobData) => {
    if (editingJob) setJobs(jobs.map(j => j.id === jobData.id ? jobData : j));
    else setJobs([jobData, ...jobs]);
    setActiveModal(null); setEditingJob(null);
  };

  const handleBackup = () => { const data = { teams, projectTypes, serviceTypes, jobs }; const blob = new Blob([JSON.stringify(data)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'thetoi_backup.json'; a.click(); };
  const handleRestore = (e) => { const reader = new FileReader(); reader.onload = (ev) => { try { const d = JSON.parse(ev.target.result); if(d.jobs) setJobs(d.jobs); if(d.teams) setTeams(d.teams); alert('สำเร็จ!'); } catch(err) { alert('ไฟล์ผิดพลาด'); } }; reader.readAsText(e.target.files[0]); };
  const handleSystemReset = () => { if(window.confirm('ล้างข้อมูลทั้งหมด?')) { localStorage.clear(); window.location.reload(); } };

  return (
    <>
      <GlobalStyles />
      <div className="min-h-screen bg-gray-50/50 font-sans text-slate-800 p-4 md:p-6 transition-colors duration-300">
        <div className="max-w-[1400px] mx-auto">
          {/* Header & Nav */}
          <nav className="mb-6 bg-white/80 backdrop-blur-xl p-3 rounded-2xl shadow-sm border border-white/20 flex flex-col md:flex-row justify-between items-center gap-3 sticky top-2 z-40 no-print">
              <div className="flex items-center gap-3 px-2"><div className="w-10 h-10 flex items-center justify-center bg-black rounded-xl text-white font-bold text-xl shadow-lg">S</div><div><h1 className="text-lg font-bold uppercase tracking-tight text-slate-900">SUTHEECHU <span className="text-[#C5A059] font-light">DESIGN</span></h1><p className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">Management System</p></div></div>
              <div className="flex bg-gray-100/80 p-1 rounded-xl"><button onClick={() => setCurrentView('dashboard')} className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all flex items-center gap-2 ${currentView === 'dashboard' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-black'}`}><LayoutDashboard size={14}/> Dashboard</button><button onClick={() => setCurrentView('calendar')} className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all flex items-center gap-2 ${currentView === 'calendar' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-black'}`}><FileSpreadsheet size={14}/> Calendar</button></div>
              <div className="flex gap-2">
                  <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-black">{isDarkMode ? <Sun size={16}/> : <Moon size={16}/>}</button>
                  <div className="w-px h-8 bg-slate-200 mx-1"></div>
                  <button onClick={handleBackup} className="p-2.5 bg-white border border-slate-100 rounded-xl hover:bg-slate-50"><Save size={16}/></button><button onClick={() => fileInputRef.current.click()} className="p-2.5 bg-white border border-slate-100 rounded-xl hover:bg-slate-50"><FolderOpen size={16}/></button><input type="file" ref={fileInputRef} className="hidden" onChange={handleRestore} accept=".json" /><button onClick={handleSystemReset} className="p-2.5 bg-white border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-xl"><RefreshCw size={16}/></button>
              </div>
          </nav>

          {currentView === 'dashboard' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col xl:flex-row justify-between mb-6 items-end gap-4">
                    <div className="flex-1 w-full bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2"><div className="bg-gray-50 p-2 rounded-xl"><Search size={16} className="text-slate-400"/></div><input className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-slate-300" placeholder="ค้นหา..." onChange={e => setSearchTerm(e.target.value)} /><div className="flex gap-1"><button onClick={() => setListViewMode('table')} className={`p-2 rounded-lg ${listViewMode === 'table' ? 'bg-black text-white' : 'text-slate-400'}`}><TableIcon size={16}/></button><button onClick={() => setListViewMode('list')} className={`p-2 rounded-lg ${listViewMode === 'list' ? 'bg-black text-white' : 'text-slate-400'}`}><List size={16}/></button></div></div>
                    <div className="flex gap-2 shrink-0"><button onClick={() => setActiveModal('serviceType')} className="px-3 py-2.5 bg-white border rounded-xl font-bold text-[10px] uppercase flex items-center gap-2 shadow-sm"><Settings size={14}/> Config</button><button onClick={() => setActiveModal('team')} className="px-3 py-2.5 bg-white border rounded-xl font-bold text-[10px] uppercase flex items-center gap-2 shadow-sm"><Users size={14}/> Teams</button><button onClick={() => { setEditingJob(null); setActiveModal('job'); }} className="px-5 py-2.5 bg-[#1A1A1A] text-white rounded-xl font-bold text-[10px] uppercase shadow-lg hover:bg-[#C5A059] flex items-center gap-2"><Plus size={14}/> Create</button></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                   <StatCard title="กำไรสุทธิ (Net Profit)" value={stats.totalProfit} color="#10B981" iconBg="bg-emerald-50" iconColor="text-emerald-500" icon={TrendingUp} />
                   <StatCard title="ยอดค้างรับ (Outstanding)" value={stats.totalBalance} color="#EF4444" iconBg="bg-red-50" iconColor="text-red-500" icon={AlertTriangle} />
                   <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-[120px]"><h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quarterly Profit</h3><div className="h-16 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={stats.qData2025}><defs><linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#C5A059" stopOpacity={0.3}/><stop offset="95%" stopColor="#C5A059" stopOpacity={0}/></linearGradient></defs><Tooltip contentStyle={{display:'none'}} cursor={{stroke: '#C5A059', strokeWidth: 1}} /><Area type="monotone" dataKey="profit" stroke="#C5A059" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" /><XAxis dataKey="name" hide /></AreaChart></ResponsiveContainer></div></div>
                   <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-[120px]"><h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Yearly Trend</h3><div className="h-16 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={stats.yData}><Tooltip cursor={{fill: 'transparent'}} contentStyle={{display:'none'}} /><Bar dataKey="profit" fill="#1A1A1A" radius={[4, 4, 0, 0]} /><XAxis dataKey="name" hide /></BarChart></ResponsiveContainer></div></div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden min-h-[400px]">
                  {listViewMode === 'table' ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          <tr><th className="px-6 py-4">Project</th><th className="px-6 py-4 text-right">Contract</th><th className="px-6 py-4 text-right text-emerald-600">Profit</th><th className="px-6 py-4 text-right">Balance</th><th className="px-6 py-4 text-center">Manage</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {jobs.filter(j => j.client.toLowerCase().includes(searchTerm.toLowerCase())).map(job => (
                              <JobRow key={job.id} job={job} team={teams.find(t => t.id === job.teamId)} onEdit={() => { setEditingJob(job); setActiveModal('job'); }} onDelete={() => setJobs(jobs.filter(x => x.id !== job.id))} onDoc={() => { setDocConfig({ jobId: job.id }); setActiveModal('docSelect'); }} />
                           ))}
                        </tbody>
                      </table>
                    </div>
                  ) : <CountdownList jobs={jobs} onEdit={(j) => { setEditingJob(j); setActiveModal('job'); }} />}
                </div>
             </div>
          )}
          {currentView === 'calendar' && <CalendarView jobs={jobs} onJobClick={(job) => { setEditingJob(job); setActiveModal('job'); }} />}
        </div>
      </div>

      {activeModal === 'job' && <JobModal job={editingJob} teams={teams} projectTypes={projectTypes} serviceTypes={serviceTypes} onClose={() => setActiveModal(null)} onSave={handleSaveJob} />}
      {activeModal === 'team' && <TeamModal teams={teams} onClose={() => setActiveModal(null)} onReorder={setTeams} onAdd={(t) => setTeams([...teams, {...t, id: Date.now()}])} onDelete={(id) => setTeams(teams.filter(t => t.id !== id))} />}
      {activeModal === 'projectType' && <ProjectTypeModal list={projectTypes} onClose={() => setActiveModal(null)} />}
      {activeModal === 'serviceType' && <ServiceTypeModal list={serviceTypes} onClose={() => setActiveModal(null)} />}
      {activeModal === 'docSelect' && <DocSelectModal onClose={() => setActiveModal(null)} onSelect={(type) => { setDocConfig({ ...docConfig, type }); setActiveModal('docPreview'); }} />}
      {activeModal === 'docPreview' && docConfig && <DocPreviewModal job={jobs.find(j => j.id === docConfig.jobId)} team={teams.find(t => t.id === jobs.find(j => j.id === docConfig.jobId)?.teamId)} type={docConfig.type} onClose={() => setActiveModal(null)} />}
    </>
  );
}
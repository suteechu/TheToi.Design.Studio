import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Search, Settings, Save, FolderOpen, AlertTriangle, FileSpreadsheet,
  LayoutDashboard, TrendingUp, Users, Hammer, List, Table as TableIcon,
  Download, Upload, Eye, EyeOff, X, Check, MoreHorizontal, PenTool, Home,
  Calculator, StickyNote, CheckSquare, Square, Wallet, CheckCircle, Clock,
  FileText, Printer, GripVertical, ChevronRight, RefreshCw, User, Calendar as CalendarIcon,
  Image as ImageIcon, Bed, Bath, Car, Moon, Sun, Cloud, Share2, Filter, FileUp, FileDown,
  BarChart2, RotateCcw, Trash2, PieChart as PieChartIcon
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, LabelList, PieChart, Pie, Cell, Legend
} from 'recharts';

// ==========================================
// 1. HELPER FUNCTIONS
// ==========================================
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

const formatThaiDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('th-TH', { 
      day: 'numeric', 
      month: 'short', 
      year: '2-digit' 
    });
  } catch (e) { return '-'; }
};

const COLORS = ['#C5A059', '#1A1A1A', '#64748B', '#94A3B8', '#CBD5E1', '#EF4444', '#3B82F6', '#10B981'];

// ==========================================
// 2. DATA CONFIGURATION (จาก CSV)
// ==========================================

const IMPORTED_TEAMS = [
  { id: 'T1', name: 'ช่างนิติพันธ์ เปือยยะ', ratePerSqm: 80 },
  { id: 'T2', name: 'ช่างนิติพันธ์(งานทั้วไป)', ratePerSqm: 1 },
  { id: 'T3', name: 'ช่างนิพนธ์ ชัยจรินันท์', ratePerSqm: 70 },
  { id: 'T4', name: 'ช่างนิพนธ์(งานทั้วไป)', ratePerSqm: 1 },
  { id: 'T5', name: 'ช่างมนตรี อุ่นแก้ว', ratePerSqm: 70 },
  { id: 'T6', name: 'ช่างมนตรี(งานทั้วไป)', ratePerSqm: 1 },
  { id: 'T7', name: 'ช่างสุธีร์ ชุยรัมย์', ratePerSqm: 80 },
  { id: 'T8', name: 'ช่างสุธีร์(งานทั้วไป)', ratePerSqm: 1 },
  { id: 'T9', name: 'ช่างPAR', ratePerSqm: 85 },
  { id: 'T10', name: 'PAR(Job)', ratePerSqm: 1 },
  { id: 'T11', name: 'BOQ', ratePerSqm: 35 },
  { id: 'T12', name: 'อื่นฯ', ratePerSqm: 1 },
  { id: 'T13', name: 'ไม่ระบุ', ratePerSqm: 1 }
];

const IMPORTED_PROJECT_TYPES = [
  "บ้านพักอาศัยชั้นเดียว", "บ้านพักอาศัยชั้นครึ่ง", "บ้านพักอาศัยสองชั้น", 
  "บ้านน็อคดาวน์", "อาคารหอพัก", "อพาร์ทเม้นท์", "ต่อเติม", 
  "3Dเรนเดอร์", "BOQ", "เอกสารวิชาชีพ", "ทั่วไปฯ", "อื่นฯ"
];

const IMPORTED_SERVICE_TYPES = [
  "แบบก่อสร้าง+3D", "แบบก่อสร้าง", "BOQ", "ชุด3Dเรนเดอร์", 
  "เหมาชุดผังโครงการ", "ผังบริเวณ", "ต่อเติม", "เอกสารวิชาชีพ", 
  "ทั่วไปฯ", "อื่นฯ"
];

const IMPORTED_SPECS = [
  "1ห้องนอน 1ห้องน้ำ", "2ห้องนอน 1ห้องน้ำ", "2ห้องนอน 2ห้องน้ำ", "2ห้องนอน 3ห้องน้ำ",
  "3ห้องนอน 1ห้องน้ำ", "3ห้องนอน 2ห้องน้ำ", "3ห้องนอน 3ห้องน้ำ", 
  "4ห้องนอน 2ห้องน้ำ", "4ห้องนอน 3ห้องน้ำ", "4ห้องนอน 4ห้องน้ำ",
  "5ห้องนอน 3ห้องน้ำ", 
  "2ห้องนอน 2ห้องน้ำ 2จอดรถ", "3ห้องนอน 2ห้องน้ำ 2จอดรถ", 
  "4ห้องนอน 3ห้องน้ำ 2จอดรถ", "5ห้องนอน 3ห้องน้ำ 2จอดรถ", 
  "อื่นฯ", "-"
];

const INITIAL_JOBS = []; // Clean Start

// ==========================================
// 3. GLOBAL STYLES
// ==========================================
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@100;200;300;400;500;600;700&display=swap');
    :root { --font-main: 'IBM Plex Sans Thai', sans-serif; }
    * { font-family: var(--font-main) !important; box-sizing: border-box; }
    body { background-color: #F8FAFC; color: #1E293B; font-size: 13px; transition: background-color 0.3s, color 0.3s; }
    body.dark { background-color: #0F172A !important; color: #F1F5F9 !important; }
    body.dark .bg-white { background-color: #1E293B !important; color: #F1F5F9 !important; border-color: #334155 !important; }
    body.dark .bg-gray-50, body.dark .bg-slate-50 { background-color: #0F172A !important; }
    body.dark .text-slate-900, body.dark .text-slate-800, body.dark .text-slate-700 { color: #F1F5F9 !important; }
    body.dark .text-slate-500, body.dark .text-slate-400 { color: #94A3B8 !important; }
    body.dark input, body.dark select, body.dark textarea { background-color: #0F172A !important; border-color: #334155 !important; color: #F1F5F9 !important; }
    body.dark button.bg-white { background-color: #1E293B !important; border-color: #334155 !important; color: #F1F5F9 !important; }
    body.dark .fixed.inset-0.bg-black\\/60 { background-color: rgba(0,0,0,0.85) !important; }
    body.dark .hover-card { background-color: #334155 !important; border-color: #475569 !important; color: #F1F5F9 !important; }
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

// ==========================================
// 4. SUB-COMPONENTS
// ==========================================

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

const JobRow = ({ job, team, onEdit, onDelete, onDoc, onToggleStatus, onShare }) => {
  const balance = parseFloat(job.totalPrice) - parseFloat(job.receivedAmount);
  const isPaid = balance <= 0;
  const netProfit = parseFloat(job.totalPrice) - (parseFloat(job.actualOutsourceFee) || 0);
  const marginPercent = job.totalPrice > 0 ? (netProfit / job.totalPrice) * 100 : 0;
  const isFinished = job.status === 'FINISHED';

  return (
    <tr className={`hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 text-xs ${isFinished ? 'opacity-60 bg-slate-50/50' : ''}`}>
      <td className="px-6 py-4"> 
         <div className="flex items-center gap-2 mb-1">
             <div className={`font-bold text-slate-900 uppercase text-sm ${isFinished ? 'line-through text-slate-400' : ''}`}>{job.client}</div>
             {isFinished && <span className="bg-emerald-100 text-emerald-600 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Finished</span>}
         </div>
         <div className="flex flex-col gap-1.5 text-slate-500">
            <div className="flex items-center gap-1.5">
                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold dark:text-slate-800">{job.projectType}</span>
                {job.area > 0 && <span className="text-[10px] font-medium text-slate-600">| {job.area} (Sqm.)</span>}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-medium text-slate-400">
                {(job.bedrooms > 0 || job.bathrooms > 0 || job.parking > 0) && (
                    <span className="flex items-center gap-2 text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                        {job.bedrooms > 0 && <span className="flex items-center gap-0.5"><Bed size={10}/>{job.bedrooms}</span>} 
                        {job.bathrooms > 0 && <span className="flex items-center gap-0.5"><Bath size={10}/>{job.bathrooms}</span>}
                        {job.parking > 0 && <span className="flex items-center gap-0.5"><Car size={10}/>{job.parking}</span>}
                    </span>
                )}
                <span className="flex items-center gap-1 text-[#C5A059] font-bold">
                    <CalendarIcon size={10}/> ส่ง: {formatThaiDate(job.deliveryDate)}
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
            <button onClick={() => onShare(job)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-green-500 hover:border-green-500 transition-all shadow-sm" title="ส่งรายละเอียดทางไลน์"><Share2 size={16}/></button>
            <button onClick={onToggleStatus} className={`p-2 border rounded-lg transition-all shadow-sm ${isFinished ? 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600' : 'bg-white text-slate-300 border-slate-200 hover:text-emerald-500 hover:border-emerald-500'}`} title={isFinished ? "ส่งงานเรียบร้อยแล้ว" : "กดเพื่อยืนยันส่งงาน"}><CheckCircle size={16} /></button>
            <div className="w-px h-6 bg-slate-100 mx-1"></div>
            <button onClick={onDoc} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-black hover:border-slate-400 transition-all shadow-sm" title="เอกสาร"><FileText size={16}/></button>
            <button onClick={onEdit} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-[#C5A059] hover:border-[#C5A059] transition-all shadow-sm" title="แก้ไข"><Settings size={16}/></button>
            <button onClick={onDelete} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-red-500 hover:border-red-500 transition-all shadow-sm" title="ลบ"><X size={16}/></button>
         </div>
      </td>
    </tr>
  );
};

const JobModal = ({ job, teams, projectTypes, serviceTypes, specs, onClose, onSave }) => {
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
      setFormData(prev => ({
          ...prev,
          teamId: newTeamId,
          unitPrice: selectedTeam ? selectedTeam.ratePerSqm : 0
      }));
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

const CountdownList = ({ jobs, onEdit, onToggleStatus, onShare }) => {
  const sorted = [...jobs].sort((a,b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
       {sorted.length > 0 ? sorted.map(job => {
          const start = new Date(job.startDate || new Date()); const end = new Date(job.deliveryDate); const today = new Date();
          const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 14;
          const daysLeft = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
          const daysPassed = totalDays - daysLeft;
          let progress = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));
          const isFinished = job.status === 'FINISHED';
          
          let statusColor = daysLeft < 0 ? "bg-red-600" : daysLeft <= 3 ? "bg-red-500" : daysLeft <= 7 ? "bg-orange-400" : "bg-emerald-500";
          let statusText = daysLeft < 0 ? "เกินกำหนด" : daysLeft <= 3 ? "ด่วนมาก" : daysLeft <= 7 ? "ใกล้ถึง" : "ปกติ";
          if (isFinished) { statusColor = "bg-emerald-600"; statusText = "ส่งงานแล้ว"; progress = 100; }

          return (
            <div key={job.id} onClick={() => onEdit(job)} className={`bg-white p-5 rounded-2xl border border-slate-100 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all group relative overflow-hidden ${isFinished ? 'opacity-90' : ''}`}>
               <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-center items-center p-6 text-center border border-slate-200 hover-card">
                   <h3 className="font-bold text-lg text-slate-800 mb-2 uppercase">{job.client}</h3>
                   <div className="space-y-1 text-xs text-slate-500 mb-4">
                       <p className="font-medium">{job.projectType}</p>
                       <p>เริ่ม: {formatThaiDate(job.startDate)} - ส่ง: {formatThaiDate(job.deliveryDate)}</p>
                       <p>ขนาด: {job.area || '-'} ตร.ม.</p>
                   </div>
                   <div className="flex gap-2">
                       <button onClick={(e) => { e.stopPropagation(); onEdit(job); }} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-slate-700">แก้ไข</button>
                       <button onClick={(e) => { e.stopPropagation(); onShare(job); }} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-blue-600">แชร์</button>
                       <button onClick={(e) => { e.stopPropagation(); onToggleStatus(job.id); }} className={`px-4 py-2 rounded-lg text-xs font-bold border shadow-sm ${isFinished ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'}`}>{isFinished ? 'ยกเลิกส่งงาน' : 'ยืนยันส่งงาน'}</button>
                   </div>
               </div>
               <div className="flex justify-between items-start mb-3">
                   <div><h3 className={`font-bold text-sm uppercase ${isFinished ? 'text-slate-500 line-through decoration-2 decoration-slate-300' : 'text-slate-800'}`}>{job.client}</h3><div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1"><Home size={10}/> {job.projectType}</div></div>
                   <div className={`px-2 py-1 rounded-lg text-[9px] font-bold text-white uppercase tracking-wider shadow-sm ${statusColor}`}>{statusText}</div>
               </div>
               <div className="flex items-center gap-3 text-[10px] text-slate-400 mb-3 bg-slate-50 p-1.5 rounded">
                   {(job.bedrooms > 0 || job.bathrooms > 0 || job.parking > 0) ? (
                        <>{job.bedrooms > 0 && <span className="flex items-center gap-0.5"><Bed size={10}/>{job.bedrooms}</span>}{job.bathrooms > 0 && <span className="flex items-center gap-0.5"><Bath size={10}/>{job.bathrooms}</span>}{job.parking > 0 && <span className="flex items-center gap-0.5"><Car size={10}/>{job.parking}</span>}</>
                   ) : <span>ไม่มีรายละเอียดสเปค</span>}
                   {job.area > 0 && <span>| {job.area} (Sqm.)</span>}
               </div>
               <div className="flex justify-between items-end mb-1.5"><span className="text-3xl font-bold text-slate-900 tracking-tight">{isFinished ? 'DONE' : Math.abs(daysLeft)}<span className="text-[10px] font-bold text-slate-400 ml-1">{isFinished ? '' : 'วัน'}</span></span><span className="text-[9px] text-slate-400 font-bold uppercase">{Math.round(progress)}% ใช้ไป</span></div>
               <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3"><div className={`h-full ${statusColor} transition-all duration-1000`} style={{ width: `${progress}%` }}></div></div>
               <div className="pt-3 border-t border-dashed border-slate-200 flex justify-between text-[10px] font-medium items-center">
                   <div className="text-slate-400">ส่ง: <span className="text-slate-900 font-bold">{formatThaiDate(job.deliveryDate)}</span></div>
                   <div className={`w-2.5 h-2.5 rounded-full ${isFinished ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
               </div>
            </div>
          );
       }) : (
           <div className="col-span-3 text-center py-20 text-slate-300">
               <FolderOpen size={48} className="mx-auto mb-3 opacity-20"/>
               <p>ยังไม่มีรายการงาน</p>
               <p className="text-xs mt-1">กดปุ่ม + Create ด้านบน หรือนำเข้า CSV เพื่อเริ่มใช้งาน</p>
           </div>
       )}
    </div>
  );
};

const DocPreviewModal = ({ job, team, type, onClose }) => {
  const printRef = useRef(); const isReceipt = type === 'RECEIPT'; const balance = parseFloat(job.totalPrice) - parseFloat(job.receivedAmount);
  const handlePrint = () => { const content = printRef.current.innerHTML; const w = window.open('', '', 'width=800,height=1100'); w.document.write(`<html><head><style>@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;600&display=swap');body{font-family:'IBM Plex Sans Thai',sans-serif !important;padding:40px;color:#333;}.text-gold{color:#C5A059;}.bg-black{background-color:#000;color:#fff;}.font-bold{font-weight:bold;}.text-right{text-align:right;}table{width:100%;border-collapse:collapse;margin-top:20px;}th,td{padding:10px;border-bottom:1px solid #eee;font-size:12px;}</style></head><body>${content}</body></html>`); w.document.close(); setTimeout(() => w.print(), 500); };
  const handleSaveImage = () => { if (window.html2canvas) window.html2canvas(printRef.current, { scale: 2 }).then(c => { const l = document.createElement('a'); l.download = `${isReceipt?'Receipt':'Quotation'}_${job.client}.png`; l.href = c.toDataURL(); l.click(); }); else alert('ไม่พบ html2canvas'); };
  
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[70] flex items-start justify-center p-4 overflow-y-auto">
      <button onClick={onClose} className="fixed top-4 right-4 z-[80] p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-all shadow-lg no-print cursor-pointer"><X size={24} /></button>
      <div className="bg-white w-[210mm] min-h-[297mm] p-10 relative text-slate-800 shadow-2xl rounded-sm mt-8 mb-8 animate-in slide-in-from-bottom-4 fade-in duration-300">
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

const CalendarView = ({ jobs, onJobClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  // SAFE GUARD: Ensure currentDate is valid, else fallback to today
  const safeDate = !isNaN(currentDate.getTime()) ? currentDate : new Date();
  
  const year = safeDate.getFullYear();
  const month = safeDate.getMonth();
  
  // SAFE GUARD: Valid days in month
  const daysInMonth = useMemo(() => {
    const d = new Date(year, month + 1, 0);
    return isNaN(d.getDate()) ? 30 : d.getDate();
  }, [year, month]);

  const firstDay = new Date(year, month, 1).getDay();
  const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-in fade-in">
      <div className="p-4 border-b flex justify-between items-center"><h2 className="text-base font-bold text-slate-800">{months[month]} {year+543}</h2><div className="flex bg-slate-50 rounded p-1"><button onClick={()=>setCurrentDate(new Date(year, month-1, 1))} className="px-2 text-xs">←</button><button onClick={()=>setCurrentDate(new Date())} className="px-2 text-xs font-bold text-[#C5A059]">วันนี้</button><button onClick={()=>setCurrentDate(new Date(year, month+1, 1))} className="px-2 text-xs">→</button></div></div>
      <div className="grid grid-cols-7 bg-slate-50 border-b">{['อา','จ','อ','พ','พฤ','ศ','ส'].map(d=><div key={d} className="py-2 text-center text-[10px] font-bold text-slate-400">{d}</div>)}</div>
      <div className="grid grid-cols-7 auto-rows-fr bg-slate-50 gap-px border-b border-slate-200">{[...Array(firstDay)].map((_,i)=><div key={`e-${i}`} className="bg-white min-h-[80px]"></div>)}{[...Array(daysInMonth)].map((_,i)=>{const d=i+1; const dayJobs=jobs.filter(j=>{
          if (!j.deliveryDate) return false;
          const jd = new Date(j.deliveryDate);
          if (isNaN(jd.getTime())) return false; // SAFE GUARD: Skip invalid dates
          return jd.getDate()===d && jd.getMonth()===month && jd.getFullYear()===year
      }); return(<div key={d} className="bg-white p-1.5 min-h-[80px]"><span className="text-[10px] font-bold text-slate-400">{d}</span><div className="mt-1 space-y-1">{dayJobs.map(j=><div key={j.id} onClick={()=>onJobClick(j)} className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 truncate cursor-pointer">{j.client}</div>)}</div></div>)})}</div>
    </div>
  );
};

const DocSelectModal = ({ onClose, onSelect }) => (<div className="fixed inset-0 bg-black/60 z-[65] flex items-center justify-center p-4"><div className="bg-white p-6 rounded-2xl text-center max-w-sm w-full"><h3 className="text-xs font-bold uppercase mb-6 text-slate-500">เลือกเอกสาร (Select)</h3><div className="flex gap-3 justify-center"><button onClick={()=>onSelect('QUOTATION')} className="flex-1 p-4 border rounded-xl flex flex-col items-center gap-2 hover:bg-slate-50"><FileText size={20} className="text-slate-400"/><span className="text-xs font-bold">ใบเสนอราคา</span></button><button onClick={()=>onSelect('RECEIPT')} className="flex-1 p-4 border border-[#C5A059]/30 bg-[#C5A059]/5 rounded-xl flex flex-col items-center gap-2 hover:bg-[#C5A059]/10"><Printer size={20} className="text-[#C5A059]"/><span className="text-xs font-bold text-[#C5A059]">ใบเสร็จ</span></button></div><button onClick={onClose} className="mt-6 text-[10px] font-bold text-slate-400 underline">ยกเลิก</button></div></div>);
const TeamModal = ({ teams, onClose, onAdd, onDelete }) => { const [name, setName] = useState(''); const [rate, setRate] = useState(80); return (<div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"><div className="bg-white w-full max-w-md p-6 rounded-2xl"><div className="flex justify-between mb-4"><h3 className="font-bold text-sm">จัดการทีมช่าง</h3><button onClick={onClose}><X size={16}/></button></div><div className="flex gap-2 mb-4"><input placeholder="ชื่อ..." className="flex-1 border p-2 rounded-lg text-xs" value={name} onChange={e=>setName(e.target.value)} /><input type="number" className="w-16 border p-2 rounded-lg text-xs text-center" value={rate} onChange={e=>setRate(e.target.value)} /><button onClick={()=>{if(name){onAdd({name, ratePerSqm: rate}); setName('');}}} className="bg-black text-white p-2 rounded-lg"><Plus size={16}/></button></div><div className="space-y-2 max-h-[250px] overflow-y-auto">{teams.map(t=><div key={t.id} className="flex justify-between p-2 border rounded-lg items-center text-xs"><span>{t.name}</span><button onClick={()=>onDelete(t.id)}><X size={12}/></button></div>)}</div></div></div>); };
const ProjectTypeModal = ({ list, onClose }) => (<div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"><div className="bg-white w-full max-w-sm p-6 rounded-2xl"><h3 className="font-bold text-sm mb-4">ประเภทงาน</h3><div className="space-y-2 max-h-[300px] overflow-y-auto">{list.map((t,i)=><div key={i} className="p-2 border rounded-lg text-xs">{t}</div>)}</div><button onClick={onClose} className="mt-4 w-full border p-2 rounded-lg text-xs">ปิด</button></div></div>);
const ServiceTypeModal = ({ list, onClose }) => (<div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"><div className="bg-white w-full max-w-sm p-6 rounded-2xl"><h3 className="font-bold text-sm mb-4">บริการ</h3><div className="space-y-2 max-h-[300px] overflow-y-auto">{list.map((t,i)=><div key={i} className="p-2 border rounded-lg text-xs">{t}</div>)}</div><button onClick={onClose} className="mt-4 w-full border p-2 rounded-lg text-xs">ปิด</button></div></div>);

// ==========================================
// 4. MAIN APP COMPONENT
// ==========================================

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [listViewMode, setListViewMode] = useState('table');
  
  // NOTE: Key _v14 for Clean Start with Analytics
  const [teams, setTeams] = useState(() => safeJSONParse('stu_teams_v14', IMPORTED_TEAMS));
  const [projectTypes, setProjectTypes] = useState(() => safeJSONParse('stu_projectTypes_v14', IMPORTED_PROJECT_TYPES));
  const [serviceTypes, setServiceTypes] = useState(() => safeJSONParse('stu_serviceTypes_v14', IMPORTED_SERVICE_TYPES));
  const [specs, setSpecs] = useState(() => safeJSONParse('stu_specs_v14', IMPORTED_SPECS));
  const [jobs, setJobs] = useState(() => safeJSONParse('stu_jobs_v14', INITIAL_JOBS));
  
  const [activeModal, setActiveModal] = useState(null); 
  const [editingJob, setEditingJob] = useState(null);
  const [docConfig, setDocConfig] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState('ALL');
  const fileInputRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(() => safeJSONParse('stu_dark_mode', false));
  const [saveStatus, setSaveStatus] = useState('✅ บันทึกแล้ว');

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('stu_teams_v14', JSON.stringify(teams));
    localStorage.setItem('stu_projectTypes_v14', JSON.stringify(projectTypes));
    localStorage.setItem('stu_serviceTypes_v14', JSON.stringify(serviceTypes));
    localStorage.setItem('stu_specs_v14', JSON.stringify(specs));
    localStorage.setItem('stu_jobs_v14', JSON.stringify(jobs));
    
    setSaveStatus('⏳ กำลังบันทึก...');
    const timer = setTimeout(() => setSaveStatus('✅ บันทึกอัตโนมัติแล้ว'), 500);
    return () => clearTimeout(timer);
  }, [teams, projectTypes, serviceTypes, specs, jobs]);
  
  // Sync Dark Mode
  useEffect(() => {
    localStorage.setItem('stu_dark_mode', JSON.stringify(isDarkMode));
    if (isDarkMode) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  }, [isDarkMode]);

  // Handle Clear All Data (To Empty)
  const handleClearAll = () => {
    if(window.confirm('⚠️ คำเตือน: คุณต้องการลบข้อมูล "ทั้งหมด" ให้เป็นค่าว่างใช่หรือไม่?\n\nข้อมูลทุกอย่างจะหายไป และคุณต้องเริ่มสร้างใหม่หรือนำเข้า CSV เอง')) {
      setJobs([]);
      alert('ล้างข้อมูลงานเรียบร้อย (ระบบว่างเปล่า)');
    }
  };

  // Handle Restore Defaults
  const handleRestoreDefaults = () => {
    if(window.confirm('คุณต้องการกู้คืนการตั้งค่าเริ่มต้นใช่หรือไม่?')) {
      setTeams(IMPORTED_TEAMS);
      setProjectTypes(IMPORTED_PROJECT_TYPES);
      setServiceTypes(IMPORTED_SERVICE_TYPES);
      setSpecs(IMPORTED_SPECS);
      alert('กู้คืนการตั้งค่าเริ่มต้นเรียบร้อย');
    }
  };

  // CSV Import Function
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split('\n').filter(row => row.trim());
      const header = rows[0].split(',');

      const parseDate = (val) => {
          if (!val) return '';
          let dateStr = val.replace(/"/g, '').trim(); 
          const dmyMatch = dateStr.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/);
          if (dmyMatch) {
              let [_, d, m, y] = dmyMatch;
              if (y.length === 2) y = '20' + y;
              if (parseInt(y) > 2400) y = (parseInt(y) - 543).toString();
              return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
          }
          const ymdMatch = dateStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
          if (ymdMatch) {
              return `${ymdMatch[1]}-${ymdMatch[2].padStart(2,'0')}-${ymdMatch[3].padStart(2,'0')}`;
          }
          return '';
      };

      if (header[0].includes('ทีมช่าง') && header[2].includes('บาท/ตรม')) {
        const newTeams = rows.slice(1).map((row, idx) => {
          const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.trim().replace(/^"|"$/g, ''));
          return {
            id: `T${Date.now()}_${idx}`,
            name: cols[0]?.trim(),
            ratePerSqm: parseFloat(cols[2]) || 0
          };
        }).filter(t => t.name);
        setTeams([...teams, ...newTeams]);
        alert(`นำเข้าทีมช่างสำเร็จ ${newTeams.length} รายการ`);
      } else if (header[0].includes('ปี') && header[5].includes('ชื่อเจ้าของบ้าน')) {
        const newJobs = rows.slice(1).map((row, idx) => {
          const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.trim().replace(/^"|"$/g, ''));
          if (!cols[5]) return null;

          const parseMoney = (val) => parseFloat((val || '').replace(/[$,]/g, '')) || 0;
          const spec = cols[8] || '';
          const bedrooms = spec.match(/(\d+)ห้องนอน/)?.[1] || '';
          const bathrooms = spec.match(/(\d+)ห้องน้ำ/)?.[1] || '';
          const parking = spec.match(/(\d+)จอดรถ/)?.[1] || '';

          return {
            id: `IMP${Date.now()}_${idx}`,
            client: cols[5]?.trim(),
            teamId: teams.find(t => t.name === cols[4]?.trim())?.id || '',
            projectType: cols[6]?.trim() || 'อื่นฯ',
            serviceType: cols[7]?.trim() || 'อื่นฯ',
            bedrooms, bathrooms, parking,
            area: parseFloat(cols[9]) || 0,
            unitPrice: parseMoney(cols[10]),
            totalPrice: parseMoney(cols[20]) > 0 ? parseMoney(cols[20]) : (parseFloat(cols[9]) * parseMoney(cols[10])), 
            receivedAmount: parseMoney(cols[17]), 
            actualOutsourceFee: parseMoney(cols[15]), 
            startDate: parseDate(cols[1]),
            deliveryDate: parseDate(cols[2]),
            status: cols[3]?.trim() === 'Done' ? 'FINISHED' : 'IN_PROGRESS'
          };
        }).filter(j => j);
        setJobs([...jobs, ...newJobs]);
        alert(`นำเข้าประวัติงานสำเร็จ ${newJobs.length} รายการ`);
      } else {
        alert('รูปแบบไฟล์ไม่ถูกต้อง');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportCSV = () => {
      const headers = ["ปี","วันรับงาน","วันส่งงาน","ส่งงาน","ทีมช่าง","ชื่อเจ้าของบ้าน","ประเภทงาน","บริการ","สเปคงาน","บ้าน(ตรม.)","ราคา(ตรม.)","ค่าแบบ","ค่าวิศวกร","ค่าสถาปนิก","ค่าคุมงาน","ค่าดำเนินวิชาชีพ","ค้างจ่าย","จ่ายแล้ว","กําไรสุทธิ","วันชำระ"];
      const csvContent = [
        headers.join(","),
        ...jobs.map(j => {
           const team = teams.find(t => t.id === j.teamId);
           const profit = (parseFloat(j.totalPrice) || 0) - (parseFloat(j.actualOutsourceFee) || 0);
           const balance = (parseFloat(j.totalPrice) || 0) - (parseFloat(j.receivedAmount) || 0);
           const fees = (parseFloat(j.feeEng)||0) + (parseFloat(j.feeArch)||0) + (parseFloat(j.feeSuper)||0);
           const designFee = (parseFloat(j.totalPrice)||0) - fees; 
           return [
             new Date(j.startDate).getFullYear() || "", 
             j.startDate || "",
             j.deliveryDate || "",
             j.status === 'FINISHED' ? 'Done' : '-',
             team ? team.name : "",
             `"${j.client}"`, 
             j.projectType,
             j.serviceType,
             `"${j.bedrooms}ห้องนอน ${j.bathrooms}ห้องน้ำ ${j.parking}จอดรถ"`,
             j.area,
             j.unitPrice,
             designFee,
             j.feeEng,
             j.feeArch,
             j.feeSuper,
             j.actualOutsourceFee,
             balance,
             j.receivedAmount,
             profit,
             "" 
           ].join(",");
        })
      ].join("\n");

      const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Job-Suteechu_Export.csv";
      link.click();
  };

  // --- ANALYTICS LOGIC START ---
  const stats = useMemo(() => {
    let totalProfit = 0, totalBalance = 0;
    let profit2024 = 0, profit2025 = 0, profit2026 = 0;
    
    // NEW: Data structures for charts
    const monthlyDataRaw = Array(12).fill(0);
    const typeCount = {}; // For Pie Chart
    const teamRevenue = {}; // For Bar Chart
    let totalRevenue = 0;
    let totalCost = 0;

    jobs.forEach(j => {
      const price = parseFloat(j.totalPrice) || 0;
      const cost = (parseFloat(j.actualOutsourceFee) || 0) + (parseFloat(j.feeEng)||0) + (parseFloat(j.feeArch)||0) + (parseFloat(j.feeSuper)||0);
      const profit = price - (parseFloat(j.actualOutsourceFee) || 0); // Simplified net profit
      const balance = price - (parseFloat(j.receivedAmount) || 0);
      
      totalRevenue += price;
      totalCost += cost;
      totalProfit += profit;
      if (balance > 0) totalBalance += balance;

      // Type Count
      typeCount[j.projectType] = (typeCount[j.projectType] || 0) + 1;

      // Team Revenue
      if (j.teamId) {
          const tName = teams.find(t => t.id === j.teamId)?.name || 'Unknown';
          teamRevenue[tName] = (teamRevenue[tName] || 0) + price;
      }

      if (j.deliveryDate) {
         try {
             const d = new Date(j.deliveryDate); 
             if (!isNaN(d.getTime())) {
                 const y = d.getFullYear(); const m = d.getMonth();
                 if (y === 2024) profit2024 += profit;
                 if (y === 2025) {
                     profit2025 += profit;
                     monthlyDataRaw[m] += profit;
                 }
                 if (y === 2026) profit2026 += profit;
             }
         } catch (e) {}
      }
    });

    // Process Pie Chart Data
    const pieData = Object.entries(typeCount).map(([name, value]) => ({ name, value }));
    
    // Process Donut Chart Data (Revenue vs Cost vs Profit)
    // Note: To make donut make sense, let's show Cost vs Net Profit split of Revenue
    const donutData = [
        { name: 'ต้นทุน (Cost)', value: totalCost },
        { name: 'กำไรสุทธิ (Net)', value: totalRevenue - totalCost }
    ];

    // Process Top Teams
    const topTeams = Object.entries(teamRevenue)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({ name, value }));

    // Monthly Chart Data
    const mNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const monthlyChartData = monthlyDataRaw.map((p, i) => ({ name: mNames[i], profit: p }));
    
    // Average
    const avgTicket = jobs.length > 0 ? totalRevenue / jobs.length : 0;

    return { 
        totalProfit, totalBalance, profit2024, profit2025, profit2026, 
        monthlyChartData, pieData, donutData, topTeams, avgTicket 
    };
  }, [jobs, teams]);
  // --- ANALYTICS LOGIC END ---

  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      const matchesSearch = j.client.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      if (filterStatus === 'ALL') return true;
      if (filterStatus === 'ACTIVE') return j.status !== 'FINISHED';
      if (filterStatus === 'FINISHED') return j.status === 'FINISHED';
      if (filterStatus === 'UNPAID') return (parseFloat(j.totalPrice) - parseFloat(j.receivedAmount)) > 0;
      return true;
    });
  }, [jobs, searchTerm, filterStatus]);

  const handleSaveJob = (jobData) => {
    if (editingJob) setJobs(jobs.map(j => j.id === jobData.id ? jobData : j));
    else setJobs([jobData, ...jobs]);
    setActiveModal(null); setEditingJob(null);
  };

  const handleToggleStatus = (jobId) => {
    setJobs(jobs.map(j => j.id === jobId ? { ...j, status: j.status === 'FINISHED' ? 'IN_PROGRESS' : 'FINISHED' } : j));
  };

  const handleShare = (job) => {
    const teamName = teams.find(t => t.id === job.teamId)?.name || '-';
    const balance = parseFloat(job.totalPrice) - parseFloat(job.receivedAmount);
    
    let specs = '';
    if (job.bedrooms) specs += `${job.bedrooms}นอน `;
    if (job.bathrooms) specs += `${job.bathrooms}น้ำ `;
    if (job.parking) specs += `${job.parking}จอด`;
    if (!specs.trim()) specs = '-';

    const text = `
📋 *รายละเอียดโครงการ*
👤 ลูกค้า: ${job.client}
🏗️ ประเภท: ${job.projectType}
🎯 สเปคงาน: ${specs}
📏 พื้นที่: ${job.area || 0} ตร.ม.
🧑‍🔧 ทีมช่าง: ${teamName}
🧾 ค้างจ่าย: ${formatCurrency(balance)}
💰 ยอดสุทธิ: ${formatCurrency(job.totalPrice)}
------------------
SUTHEECHU DESIGN STUDIO
    `.trim();
    navigator.clipboard.writeText(text);
    alert('คัดลอกรายละเอียดแล้ว (พร้อมส่งไลน์)');
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
              <div className="flex bg-gray-100/80 p-1 rounded-xl">
                  <button onClick={() => setCurrentView('dashboard')} className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all flex items-center gap-2 ${currentView === 'dashboard' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-black'}`}><LayoutDashboard size={14}/> Dashboard</button>
                  <button onClick={() => setCurrentView('calendar')} className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all flex items-center gap-2 ${currentView === 'calendar' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-black'}`}><FileSpreadsheet size={14}/> Calendar</button>
                  <button onClick={() => setCurrentView('analytics')} className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all flex items-center gap-2 ${currentView === 'analytics' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-black'}`}><BarChart2 size={14}/> Analytics</button>
              </div>
              <div className="flex gap-2 items-center">
                  <span className="text-[10px] text-slate-400 font-bold bg-slate-100/50 px-3 py-1.5 rounded-full mr-2 hidden md:block border border-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">{saveStatus}</span>
                  <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-black">{isDarkMode ? <Sun size={16}/> : <Moon size={16}/>}</button>
                  <div className="w-px h-8 bg-slate-200 mx-1"></div>
                  {/* Import/Export */}
                  <label className="p-2.5 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer text-slate-500 hover:text-black" title="Import CSV"><FileUp size={16}/><input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} /></label>
                  <button onClick={handleExportCSV} className="p-2.5 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-black" title="Export CSV"><FileDown size={16}/></button>
                  <button onClick={handleBackup} className="p-2.5 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-black" title="Backup"><Save size={16}/></button><button onClick={() => fileInputRef.current.click()} className="p-2.5 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-black" title="Restore"><FolderOpen size={16}/></button><input type="file" ref={fileInputRef} className="hidden" onChange={handleRestore} accept=".json" />
                  {/* Reset Buttons */}
                  <button onClick={handleRestoreDefaults} className="p-2.5 bg-white border border-blue-100 text-blue-400 hover:bg-blue-50 hover:text-blue-500 rounded-xl" title="Restore Defaults"><RotateCcw size={16}/></button>
                  <button onClick={handleClearAll} className="p-2.5 bg-white border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-xl" title="Clear All"><Trash2 size={16}/></button>
              </div>
          </nav>

          {currentView === 'dashboard' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col xl:flex-row justify-between mb-6 items-end gap-4">
                    <div className="flex-1 w-full bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <div className="bg-gray-50 p-2 rounded-xl"><Search size={16} className="text-slate-400"/></div>
                            <input className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-slate-300" placeholder="ค้นหาชื่อลูกค้า..." onChange={e => setSearchTerm(e.target.value)} />
                            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                                <button onClick={() => setListViewMode('table')} className={`p-2 rounded-lg transition-all ${listViewMode === 'table' ? 'bg-white text-black shadow-sm' : 'text-slate-400'}`}><TableIcon size={16}/></button>
                                <button onClick={() => setListViewMode('list')} className={`p-2 rounded-lg transition-all ${listViewMode === 'list' ? 'bg-white text-black shadow-sm' : 'text-slate-400'}`}><List size={16}/></button>
                            </div>
                        </div>
                        {/* Filter Tabs */}
                        <div className="flex gap-2 border-t border-slate-100 pt-2 overflow-x-auto pb-1">
                            {[
                                { id: 'ALL', label: 'ทั้งหมด', icon: List },
                                { id: 'ACTIVE', label: 'กำลังดำเนินการ', icon: Clock },
                                { id: 'FINISHED', label: 'เสร็จสิ้นแล้ว', icon: CheckCircle },
                                { id: 'UNPAID', label: 'ค้างรับเงิน', icon: AlertTriangle }
                            ].map(tab => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setFilterStatus(tab.id)}
                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${filterStatus === tab.id ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                >
                                    <tab.icon size={12}/> {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-2 shrink-0"><button onClick={() => setActiveModal('serviceType')} className="px-3 py-2.5 bg-white border rounded-xl font-bold text-[10px] uppercase flex items-center gap-2 shadow-sm"><Settings size={14}/> Config</button><button onClick={() => setActiveModal('team')} className="px-3 py-2.5 bg-white border rounded-xl font-bold text-[10px] uppercase flex items-center gap-2 shadow-sm"><Users size={14}/> Teams</button><button onClick={() => { setEditingJob(null); setActiveModal('job'); }} className="px-5 py-2.5 bg-[#1A1A1A] text-white rounded-xl font-bold text-[10px] uppercase shadow-lg hover:bg-[#C5A059] flex items-center gap-2"><Plus size={14}/> Create</button></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
                   <StatCard title="กำไรสุทธิรวม (Total Profit)" value={stats.totalProfit} color="#10B981" iconBg="bg-emerald-50" iconColor="text-emerald-500" icon={TrendingUp} />
                   <StatCard title="ยอดค้างรับ (Outstanding)" value={stats.totalBalance} color="#EF4444" iconBg="bg-red-50" iconColor="text-red-500" icon={AlertTriangle} />
                   <StatCard title="Net Profit 2024" value={stats.profit2024} color="#64748B" iconBg="bg-slate-50" iconColor="text-slate-500" icon={Wallet} />
                   <StatCard title="Net Profit 2025" value={stats.profit2025} color="#3B82F6" iconBg="bg-blue-50" iconColor="text-blue-500" icon={Wallet} />
                   <StatCard title="Net Profit 2026" value={stats.profit2026} color="#C5A059" iconBg="bg-[#C5A059]/10" iconColor="text-[#C5A059]" icon={Wallet} />
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden min-h-[400px]">
                  {listViewMode === 'table' ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          <tr><th className="px-6 py-4">Project</th><th className="px-6 py-4 text-right">Contract</th><th className="px-6 py-4 text-right text-emerald-600">Profit</th><th className="px-6 py-4 text-right">Balance</th><th className="px-6 py-4 text-center">Manage</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {filteredJobs.length > 0 ? filteredJobs.map(job => (
                              <JobRow key={job.id} job={job} team={teams.find(t => t.id === job.teamId)} onEdit={() => { setEditingJob(job); setActiveModal('job'); }} onDelete={() => setJobs(jobs.filter(x => x.id !== job.id))} onDoc={() => { setDocConfig({ jobId: job.id }); setActiveModal('docSelect'); }} onToggleStatus={() => handleToggleStatus(job.id)} onShare={() => handleShare(job)} />
                           )) : (
                               <tr><td colSpan="5" className="text-center py-10 text-slate-400">ไม่พบข้อมูล</td></tr>
                           )}
                        </tbody>
                        {filteredJobs.length > 0 && (
                            <tfoot className="bg-slate-50/50 font-bold text-xs text-slate-600 border-t border-slate-200">
                                <tr>
                                    <td className="px-6 py-3 text-right">รวมทั้งหมด ({filteredJobs.length} รายการ)</td>
                                    <td className="px-6 py-3 text-right">{formatCurrency(filteredJobs.reduce((sum, j) => sum + parseFloat(j.totalPrice), 0))}</td>
                                    <td className="px-6 py-3 text-right text-emerald-600">{formatCurrency(filteredJobs.reduce((sum, j) => sum + (parseFloat(j.totalPrice) - parseFloat(j.actualOutsourceFee)), 0))}</td>
                                    <td className="px-6 py-3 text-right text-red-500">{formatCurrency(filteredJobs.reduce((sum, j) => sum + (parseFloat(j.totalPrice) - parseFloat(j.receivedAmount)), 0))}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
                      </table>
                    </div>
                  ) : <CountdownList jobs={filteredJobs} onEdit={(j) => { setEditingJob(j); setActiveModal('job'); }} onToggleStatus={(id) => handleToggleStatus(id)} onShare={(j) => handleShare(j)} />}
                </div>
             </div>
          )}
          {currentView === 'analytics' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                 <h2 className="text-2xl font-bold mb-6 text-slate-800">Analytics & Trends</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between"><div><p className="text-xs text-slate-400 font-bold uppercase">Average Project Value</p><p className="text-2xl font-bold text-slate-800">{formatCurrency(stats.avgTicket)}</p></div><div className="p-3 bg-blue-50 text-blue-500 rounded-xl"><Calculator size={20}/></div></div>
                    {/* Add more summary cards here if needed */}
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Monthly Trend */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Monthly Profit Trend (2025)</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.monthlyChartData}>
                                    <defs>
                                        <linearGradient id="colorProfitMonthly" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#C5A059" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={(val) => `฿${val/1000}k`} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} formatter={(value) => formatCurrency(value)} />
                                    <Area type="monotone" dataKey="profit" stroke="#C5A059" strokeWidth={3} fillOpacity={1} fill="url(#colorProfitMonthly)" dot={{r: 4, fill: '#C5A059'}} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Teams */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Top 5 Performing Teams</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.topTeams} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} formatter={(value) => formatCurrency(value)} />
                                    <Bar dataKey="value" fill="#1A1A1A" radius={[0, 4, 4, 0]} barSize={20}>
                                        <LabelList dataKey="value" position="right" formatter={(val) => formatCurrency(val)} style={{ fill: '#64748B', fontSize: 11, fontWeight: 'bold' }} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Project Type Distribution (Pie) */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Project Types Distribution</h3>
                        <div className="h-[300px] w-full flex justify-center">
                             {stats.pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={stats.pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {stats.pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                             ) : <div className="flex items-center justify-center h-full text-slate-300">No Data</div>}
                        </div>
                    </div>

                    {/* Financial Health (Donut) */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Financial Health (Cost vs Profit)</h3>
                        <div className="h-[300px] w-full flex justify-center">
                             {stats.donutData[0].value > 0 || stats.donutData[1].value > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={stats.donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            <Cell fill="#EF4444" /> {/* Cost */}
                                            <Cell fill="#10B981" /> {/* Profit */}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '12px' }} formatter={(value) => formatCurrency(value)} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                             ) : <div className="flex items-center justify-center h-full text-slate-300">No Data</div>}
                        </div>
                    </div>
                 </div>
             </div>
          )}
          {currentView === 'calendar' && <CalendarView jobs={jobs} onJobClick={(job) => { setEditingJob(job); setActiveModal('job'); }} />}
        </div>
      </div>

      {activeModal === 'job' && <JobModal job={editingJob} teams={teams} projectTypes={projectTypes} serviceTypes={serviceTypes} specs={specs} onClose={() => setActiveModal(null)} onSave={handleSaveJob} />}
      {activeModal === 'team' && <TeamModal teams={teams} onClose={() => setActiveModal(null)} onReorder={setTeams} onAdd={(t) => setTeams([...teams, {...t, id: Date.now()}])} onDelete={(id) => setTeams(teams.filter(t => t.id !== id))} />}
      {activeModal === 'projectType' && <ProjectTypeModal list={projectTypes} onClose={() => setActiveModal(null)} />}
      {activeModal === 'serviceType' && <ServiceTypeModal list={serviceTypes} onClose={() => setActiveModal(null)} />}
      {activeModal === 'docSelect' && <DocSelectModal onClose={() => setActiveModal(null)} onSelect={(type) => { setDocConfig({ ...docConfig, type }); setActiveModal('docPreview'); }} />}
      {activeModal === 'docPreview' && docConfig && <DocPreviewModal job={jobs.find(j => j.id === docConfig.jobId)} team={teams.find(t => t.id === jobs.find(j => j.id === docConfig.jobId)?.teamId)} type={docConfig.type} onClose={() => setActiveModal(null)} />}
    </>
  );
}
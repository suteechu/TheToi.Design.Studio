import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search, LayoutDashboard, TrendingUp, Table as TableIcon, List,
  Clock, CheckCircle, AlertTriangle, Wallet, Edit3, RefreshCw, 
  BarChart2, ArrowUpDown, Calendar as CalendarIcon, ChevronLeft, ChevronRight
} from 'lucide-react';

// --- Imports Components ---
import StatCard from './components/StatCard';
import JobRow from './components/JobRow';
import CountdownList from './components/CountdownList';
import CalendarView from './components/CalendarView';
import DocSelectModal from './components/DocSelectModal';
import DocPreviewModal from './components/DocPreviewModal';
import AnalyticsView from './components/AnalyticsView';

// --- Imports Helpers ---
import { safeJSONParse, formatCurrency, convertSheetDate, processImageLink } from './utils/helpers';

// ==========================================
// 🔴 แหล่งข้อมูล Google Sheets
// ==========================================
const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1-BbEaEcDijNyE1h-riqzXFL1rM8uR7b2/export?format=csv";
const ITEMS_PER_PAGE = 20;

// ==========================================
// 2. STYLES
// ==========================================
const GlobalStyles = () => (
  <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@100;200;300;400;500;600;700&display=swap');:root{--font-main:'IBM Plex Sans Thai',sans-serif}*{font-family:var(--font-main)!important;box-sizing:border-box}body{background-color:#F8FAFC;color:#1E293B;font-size:13px}input,button,select,textarea{font-family:var(--font-main)!important;font-size:13px!important}.glass-card{background:#fff;border:1px solid #E2E8F0;box-shadow:0 2px 4px rgba(0,0,0,.05)}::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:0 0}::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:2px}@media print{.no-print{display:none!important}}`}</style>
);

// ==========================================
// 🔥 CORE PARSER (อัปเดตใหม่ ป้องกันเว็บค้าง 100%)
// ==========================================
const parseCSV = (text) => {
  const rows = text.split('\n').filter(row => row.trim());
  if (rows.length < 2) return [];

  return rows.slice(1).map((row) => {
    const cols = [];
    let curr = '';
    let inQuotes = false;

    // ใช้วิธีอ่านทีละตัวอักษร ปลอดภัยกว่า Regex ไม่มีทางเกิด Infinite Loop
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cols.push(curr);
        curr = '';
      } else {
        curr += char;
      }
    }
    cols.push(curr); // ใส่คอลัมน์สุดท้าย

    // ทำความสะอาดข้อความและลบเครื่องหมายคำพูดส่วนเกิน
    const cleanCols = cols.map(val => {
      return val.trim().replace(/^"|"$/g, '').replace(/""/g, '"');
    });

    if (cleanCols.length < 7) return null;

    const pm = (val) => {
      const num = parseFloat((val ?? '').toString().replace(/[$,]/g, ''));
      return isNaN(num) ? 0 : num;
    };

    const no = parseInt(cleanCols[0]) || 0;
    const client      = cleanCols[6]  ?? 'ไม่ระบุชื่อ';
    const teamName    = cleanCols[5]  ?? 'ไม่ระบุ';
    const projectType = cleanCols[7]  ?? 'อื่นๆ';
    const serviceType = cleanCols[8]  ?? 'อื่นๆ';
    const spec        = cleanCols[9]  ?? '';
    const area        = parseFloat(cleanCols[10]) || 0;

    const designFee   = pm(cleanCols[12]);
    const feeEng      = pm(cleanCols[13]);
    const feeArch     = pm(cleanCols[14]);
    const feeSuper    = pm(cleanCols[15]);
    const totalProfessionalFees = feeEng + feeArch + feeSuper;

    const actualOutsourceFee = pm(cleanCols[16]);
    const pendingAmount      = pm(cleanCols[17]); 
    const receivedAmount     = pm(cleanCols[18]);
    const sheetProfit        = pm(cleanCols[19]);
    const isMoneyReceived    = (cleanCols[20] ?? '').toUpperCase() === 'TRUE';

    const calculatedTotal = designFee + totalProfessionalFees;
    const totalPrice = calculatedTotal;

    const startDate    = convertSheetDate(cleanCols[2]);
    const deliveryDate = convertSheetDate(cleanCols[3]);
    const imageLink    = processImageLink(cleanCols[22]);

    return {
      id: `G${no}`, no, client, teamName, projectType, serviceType, spec, area,
      totalPrice, receivedAmount, pendingAmount, sheetProfit, actualOutsourceFee, isMoneyReceived,
      designFee, feeEng, feeArch, feeSuper, totalProfessionalFees,
      startDate, deliveryDate,
      status: (cleanCols[4] === 'Done' || cleanCols[4] === 'TRUE' || cleanCols[4] === 'ส่งงานแล้ว') ? 'FINISHED' : 'IN_PROGRESS',
      csvImage: imageLink
    };
  }).filter(j => j && j.client);
};

// ==========================================
// 3. MAIN APP COMPONENT
// ==========================================
export default function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState('dashboard');
  const [listViewMode, setListViewMode] = useState('table');
  const [customImages, setCustomImages] = useState(() => safeJSONParse('stu_custom_images', {}));
  useEffect(() => { try { localStorage.setItem('stu_custom_images', JSON.stringify(customImages)); } catch (e) {} }, [customImages]);
  const fileInputRef = useRef(null);
  const [editingJobId, setEditingJobId] = useState(null);

  const [sortConfig, setSortConfig] = useState({ key: 'no', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1); 

  useEffect(() => {
    if (GOOGLE_SHEET_URL) {
      fetch(GOOGLE_SHEET_URL)
        .then(res => res.text())
        .then(csv => {
          const newJobs = parseCSV(csv);
          if(newJobs.length > 0) setJobs(newJobs);
        })
        .catch(err => console.error("Error fetching Google Sheet:", err));
    }
  }, []);

  const [filterStatus, setFilterStatus] = useState('ALL');
  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterStatus]);

  const [activeModal, setActiveModal] = useState(null);
  const [docConfig, setDocConfig] = useState(null);

  const handleShare = (job) => {
    const teamName = job.teamName ?? '-';
    const balance = (parseFloat(job.pendingAmount) || 0) - (parseFloat(job.receivedAmount) || 0);
    
    const designFee = parseFloat(job.designFee) || 0;
    const feeEng = parseFloat(job.feeEng) || 0;
    const feeArch = parseFloat(job.feeArch) || 0;
    const feeSuper = parseFloat(job.feeSuper) || 0;

    let text = `📋 *รายละเอียดโครงการ*\n`;
    text += `👤 ลูกค้า: ${job.client}\n`;
    text += `🏗️ ประเภท: ${job.projectType}\n`;
    text += `🎯 สเปคงาน: ${job.spec ?? '-'}\n`;
    text += `📏 พื้นที่: ${job.area ?? 0} ตร.ม.\n`;
    text += `👷 ทีมช่าง: ${teamName}\n`;
    
    if (designFee > 0) text += `🎨 ค่าแบบ: ${formatCurrency(designFee)}\n`;
    if (feeEng > 0)    text += `👷‍♂️ วิศวกร: ${formatCurrency(feeEng)}\n`;
    if (feeArch > 0)   text += `📐 สถาปนิก: ${formatCurrency(feeArch)}\n`;
    if (feeSuper > 0)  text += `📋 คุมงาน: ${formatCurrency(feeSuper)}\n`;

    if (balance > 0) {
      text += `🧾 ค้างจ่าย: ${formatCurrency(job.totalPrice)}\n`;
    } else {
      text += `💰 ยอดรวม: ${formatCurrency(job.totalPrice)}\n`;
    }

    text += `------------------\n`;
    text += `SUTHEECHU DESIGN STUDIO`;

    navigator.clipboard.writeText(text);
    alert('คัดลอกข้อความเรียบร้อย (พร้อมส่งไลน์)');
  };

  const handleEditImage = (jobId) => {
    setEditingJobId(jobId);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && editingJobId) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target.result;
        setCustomImages(prev => ({ ...prev, [editingJobId]: base64Image }));
        setEditingJobId(null);
      };
      reader.onerror = () => { alert("Error reading file"); setEditingJobId(null); };
      reader.readAsDataURL(file);
    }
  };

  const openDocSelect = (job) => {
    setDocConfig({ jobId: job.id });
    setActiveModal('docSelect');
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const stats = useMemo(() => {
    let totalProfit = 0, totalBalance = 0;
    let profit2024 = 0, profit2025 = 0, profit2026 = 0;
    const monthlyDataRaw = Array(12).fill(0);
    const typeCount = {};
    const teamRevenue = {};
    let totalRevenue = 0;
    let totalCost = 0;

    jobs.forEach(j => {
      const price = parseFloat(j.totalPrice) || 0;
      const profit = parseFloat(j.sheetProfit) || 0;
      const balance = (parseFloat(j.pendingAmount) || 0) - (parseFloat(j.receivedAmount) || 0);
      const cost = (parseFloat(j.actualOutsourceFee) || 0) + (parseFloat(j.totalProfessionalFees) || 0);
      
      totalRevenue += price;
      totalCost += cost;
      totalProfit += profit;
      totalBalance += balance;
      
      typeCount[j.projectType] = (typeCount[j.projectType] || 0) + 1;
      if (j.teamName) { teamRevenue[j.teamName] = (teamRevenue[j.teamName] || 0) + price; }
      if (j.deliveryDate) {
        try {
          const d = new Date(j.deliveryDate);
          if (!isNaN(d.getTime())) {
            const y = d.getFullYear(); const m = d.getMonth();
            if (y === 2024) profit2024 += profit;
            if (y === 2025) { profit2025 += profit; monthlyDataRaw[m] += profit; }
            if (y === 2026) profit2026 += profit;
          }
        } catch (e) {}
      }
    });

    const pieData = Object.entries(typeCount).map(([name, value]) => ({ name, value }));
    const donutData = [{ name: 'ต้นทุน', value: totalCost }, { name: 'กำไร', value: totalProfit }];
    const topTeams = Object.entries(teamRevenue).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value }));
    const mNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const monthlyChartData = monthlyDataRaw.map((p, i) => ({ name: mNames[i], profit: p }));
    const avgTicket = jobs.length > 0 ? totalRevenue / jobs.length : 0;
    
    return { totalProfit, totalBalance, profit2024, profit2025, profit2026, monthlyChartData, pieData, donutData, topTeams, avgTicket };
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    let result = jobs.filter(j => {
      const matchesSearch = j.client.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      if (filterStatus === 'ALL') return true;
      if (filterStatus === 'ACTIVE') return j.status !== 'FINISHED';
      if (filterStatus === 'FINISHED') return j.status === 'FINISHED';
      if (filterStatus === 'UNPAID') return ((parseFloat(j.pendingAmount) || 0) - (parseFloat(j.receivedAmount) || 0)) > 0;
      return true;
    });

    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'balance') {
          aValue = (parseFloat(a.pendingAmount) || 0) - (parseFloat(a.receivedAmount) || 0);
          bValue = (parseFloat(b.pendingAmount) || 0) - (parseFloat(b.receivedAmount) || 0);
        } else if (['totalPrice', 'sheetProfit', 'receivedAmount', 'no'].includes(sortConfig.key)) {
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
        } else if (sortConfig.key === 'deliveryDate') {
          aValue = new Date(aValue).getTime() || 0;
          bValue = new Date(bValue).getTime() || 0;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [jobs, searchTerm, filterStatus, sortConfig]);

  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredJobs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredJobs, currentPage]);

  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);

  const ThSortable = ({ label, sortKey, align = 'text-left', width }) => (
    <th 
      className={`px-6 py-4 ${align} cursor-pointer group hover:bg-slate-100 transition-colors select-none ${width ? width : ''}`} 
      onClick={() => handleSort(sortKey)}
    >
      <div className={`flex items-center gap-1 ${align === 'text-right' ? 'justify-end' : align === 'text-center' ? 'justify-center' : 'justify-start'}`}>
        {label} 
        {sortConfig.key === sortKey ? (
          <ArrowUpDown size={12} className={`ml-1 ${sortConfig.direction === 'asc' ? 'text-emerald-500' : 'text-red-500'}`} />
        ) : (
          <ArrowUpDown size={12} className="ml-1 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    </th>
  );

  const PaginationControls = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 bg-white">
        <div className="text-xs text-slate-400">
          แสดง {((currentPage - 1) * ITEMS_PER_PAGE) + 1} ถึง {Math.min(currentPage * ITEMS_PER_PAGE, filteredJobs.length)} จาก {filteredJobs.length} รายการ
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-500"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="flex items-center px-3 text-sm font-bold text-slate-600 bg-slate-50 rounded-lg border border-slate-100">
            หน้า {currentPage} / {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-500"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <GlobalStyles />
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />

      <div className="min-h-screen bg-gray-50/50 font-sans text-slate-800 p-4 md:p-6 transition-colors duration-300">
        <div className="max-w-[1400px] mx-auto">
          {/* Header & Nav */}
          <nav className="mb-6 bg-white/80 backdrop-blur-xl p-3 rounded-2xl shadow-sm border border-white/20 flex flex-col md:flex-row justify-between items-center gap-3 sticky top-2 z-40 no-print">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 flex items-center justify-center bg-black rounded-xl text-white font-bold text-xl shadow-lg">S</div>
              <div>
                <h1 className="text-lg font-bold uppercase tracking-tight text-slate-900">SUTHEECHU <span className="text-[#C5A059] font-light">DESIGN</span></h1>
                <p className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">Management System</p>
              </div>
            </div>
            <div className="flex bg-gray-100/80 p-1 rounded-xl">
              <button onClick={() => setCurrentView('dashboard')} className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all flex items-center gap-2 ${currentView === 'dashboard' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-black'}`}><LayoutDashboard size={14}/> Dashboard</button>
              <button onClick={() => setCurrentView('calendar')} className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all flex items-center gap-2 ${currentView === 'calendar' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-black'}`}><CalendarIcon size={14}/> Calendar</button>
              <button onClick={() => setCurrentView('analytics')} className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all flex items-center gap-2 ${currentView === 'analytics' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-black'}`}><TrendingUp size={14}/> Analytics</button>
            </div>
            <div className="flex gap-2 items-center">
              <a href="https://docs.google.com/spreadsheets/d/1-BbEaEcDijNyE1h-riqzXFL1rM8uR7b2/edit?gid=1035027015#gid=1035027015" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-emerald-600 flex items-center gap-2 transition-all shadow-sm" title="แก้ไขข้อมูลใน Google Sheets"><Edit3 size={16}/> <span className="text-[10px] font-bold hidden sm:inline">Edit Sheet</span></a>
              <div className="w-px h-8 bg-slate-200 mx-1"></div>
              <button onClick={() => window.location.reload()} className="p-2.5 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-black" title="Refresh Data"><RefreshCw size={16}/></button>
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
                  <div className="flex gap-2 border-t border-slate-100 pt-2 overflow-x-auto pb-1">
                    {[
                      { id: 'ALL', label: 'ทั้งหมด', icon: List },
                      { id: 'ACTIVE', label: 'กำลังดำเนินการ', icon: Clock },
                      { id: 'FINISHED', label: 'เสร็จสิ้นแล้ว', icon: CheckCircle },
                      { id: 'UNPAID', label: 'ค้างรับ', icon: AlertTriangle }
                    ].map(tab => (
                      <button key={tab.id} onClick={() => setFilterStatus(tab.id)} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${filterStatus === tab.id ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                        <tab.icon size={12}/> {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
                <StatCard title="กำไรรวม (Total Profit)" value={stats.totalProfit} color="#10B981" iconBg="bg-emerald-50" iconColor="text-emerald-500" icon={TrendingUp} />
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
                        <tr>
                          <ThSortable label="#" sortKey="no" align="text-center" />
                          <ThSortable label="Project" sortKey="client" />
                          <ThSortable label="Delivery Date" sortKey="deliveryDate" align="text-center" />
                          <ThSortable label="Contract" sortKey="totalPrice" align="text-right" />
                          <ThSortable label="Profit" sortKey="sheetProfit" align="text-right" />
                          <ThSortable label="Balance" sortKey="balance" align="text-right" />
                          <th className="px-6 py-4 text-center">Manage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {paginatedJobs.length > 0 ? paginatedJobs.map(job => (
                          <JobRow key={job.id} job={job}
                            displayImage={customImages[job.id] || job.image || job.csvImage}
                            onEditImage={handleEditImage}
                            onDoc={() => { setDocConfig({ jobId: job.id }); setActiveModal('docSelect'); }}
                            onShare={handleShare}
                          />
                        )) : (
                          <tr><td colSpan="7" className="text-center py-10 text-slate-400">กำลังโหลดข้อมูล หรือไม่พบข้อมูล...</td></tr>
                        )}
                      </tbody>
                    </table>
                    <PaginationControls />
                  </div>
                ) : (
                  <div>
                    <CountdownList jobs={paginatedJobs} customImages={customImages} onEditImage={handleEditImage} onDoc={(job) => { setDocConfig({ jobId: job.id }); setActiveModal('docSelect'); }} onShare={(job) => handleShare(job)} />
                    <PaginationControls />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ✅ แก้บั๊กหน้าเว็บค้าง เปลี่ยนการเรียกใช้ AnalyticsView และ CalendarView ใหม่ */}
          {currentView === 'analytics' && <AnalyticsView stats={stats} />}
          {currentView === 'calendar' && <CalendarView jobs={jobs} onJobClick={(job) => { setDocConfig({ jobId: job.id }); setActiveModal('docSelect'); }} />}

        </div>
      </div>

      {activeModal === 'docSelect' && <DocSelectModal onClose={() => setActiveModal(null)} onSelect={(type) => { setDocConfig({ ...docConfig, type }); setActiveModal('docPreview'); }} />}
      {activeModal === 'docPreview' && docConfig && <DocPreviewModal job={jobs.find(j => j.id === docConfig.jobId)} type={docConfig.type} onClose={() => setActiveModal(null)} />}
    </>
  );
}
// src/App.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Search, Eye, EyeOff, Upload, Download, LayoutDashboard, TrendingUp,
  BarChart3, AlertCircle, FileSpreadsheet, Wand2, AlertTriangle, Calendar as CalendarIcon, 
  PenTool, Users, Clock, Table as TableIcon, List, Settings, Hammer 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, LineChart, Line, Cell, LabelList
} from 'recharts';

// Imports
import { DEFAULT_TEAMS, DEFAULT_PROJECT_TYPES, DEFAULT_SERVICE_TYPES, INITIAL_JOBS, formatCurrency } from './utils';
import StatCard from './components/StatCard';
import CalendarView from './components/CalendarView';
import JobRow from './components/JobRow';
import JobModal from './components/JobModal';
import DocPreviewModal from './components/DocPreviewModal';
import CountdownList from './components/CountdownList';
import { TeamModal, ProjectTypeModal, ServiceTypeModal, DocSelectModal } from './components/ConfigModals';

export default function App() {
  // Load Libraries
  useEffect(() => {
    if (!window.html2canvas) {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        script.async = true;
        document.body.appendChild(script);
    }
    const link = document.createElement('link');
    link.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@100;200;300;400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const [currentView, setCurrentView] = useState('dashboard');
  const [listViewMode, setListViewMode] = useState('table'); 
  
  // Data States
  const [teams, setTeams] = useState(() => JSON.parse(localStorage.getItem('stu_teams')) || DEFAULT_TEAMS);
  const [projectTypes, setProjectTypes] = useState(() => JSON.parse(localStorage.getItem('stu_projectTypes')) || DEFAULT_PROJECT_TYPES);
  const [serviceTypes, setServiceTypes] = useState(() => JSON.parse(localStorage.getItem('stu_serviceTypes')) || DEFAULT_SERVICE_TYPES);
  const [jobs, setJobs] = useState(() => JSON.parse(localStorage.getItem('stu_jobs')) || INITIAL_JOBS);
  
  const [activeModal, setActiveModal] = useState(null); 
  const [editingJob, setEditingJob] = useState(null);
  const [docConfig, setDocConfig] = useState(null);
  const [showInternalCost, setShowInternalCost] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTeamFilter, setActiveTeamFilter] = useState("ALL");

  useEffect(() => { localStorage.setItem('stu_teams', JSON.stringify(teams)); }, [teams]);
  useEffect(() => { localStorage.setItem('stu_projectTypes', JSON.stringify(projectTypes)); }, [projectTypes]);
  useEffect(() => { localStorage.setItem('stu_serviceTypes', JSON.stringify(serviceTypes)); }, [serviceTypes]);
  useEffect(() => { localStorage.setItem('stu_jobs', JSON.stringify(jobs)); }, [jobs]);

  const stats = useMemo(() => {
    let totalProfit = 0, totalBalance = 0, totalRevenue = 0;
    const qData = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
    const yData = {};
    jobs.forEach(j => {
      const price = parseFloat(j.totalPrice) || 0;
      const cost = parseFloat(j.actualOutsourceFee) || 0; 
      const profit = price - cost; 
      
      totalProfit += profit;
      totalBalance += (price - (parseFloat(j.receivedAmount)||0));
      totalRevenue += price; 
      
      if (j.jobYear === '2025') qData[j.quarter] = (qData[j.quarter] || 0) + profit;
      const yr = j.jobYear || 'Other';
      yData[yr] = (yData[yr] || 0) + profit;
    });
    return { totalProfit, totalBalance, totalRevenue, qData, yData };
  }, [jobs]);

  const topDebtors = jobs.map(j => ({ ...j, balance: (parseFloat(j.totalPrice)||0) - (parseFloat(j.receivedAmount)||0) })).filter(j => j.balance > 0).sort((a, b) => b.balance - a.balance).slice(0, 5);
  const chartDataQ = Object.keys(stats.qData).map(k => ({ name: k, profit: stats.qData[k] }));
  const chartDataY = Object.keys(stats.yData).sort().map(k => ({ name: k, profit: stats.yData[k] }));

  // Handlers
  const handleSaveJob = (jobData) => {
    if (editingJob) setJobs(jobs.map(j => j.id === jobData.id ? jobData : j));
    else setJobs([jobData, ...jobs]);
    setActiveModal(null); setEditingJob(null);
  };
  const handleDeleteJob = (id) => { if (window.confirm("ยืนยันการลบ?")) setJobs(jobs.filter(j => j.id !== id)); };
  const handleAddTeam = (t) => setTeams([...teams, { ...t, id: `T${Date.now()}` }]);
  const handleDeleteTeam = (id) => { if (window.confirm("ลบทีม?")) setTeams(teams.filter(t => t.id !== id)); };
  
  // --- ฟังก์ชันย้ายงาน (Drag & Drop) ---
  const handleMoveJob = (jobId, newDate) => {
      // อัปเดตวันที่ส่งงานใหม่ (Update job date)
      const d = new Date(newDate);
      const newQuarter = (d.getMonth() + 1) <= 3 ? 'Q1' : (d.getMonth() + 1) <= 6 ? 'Q2' : (d.getMonth() + 1) <= 9 ? 'Q3' : 'Q4';
      
      setJobs(prevJobs => prevJobs.map(j => 
          j.id === jobId ? { ...j, deliveryDate: newDate, jobYear: d.getFullYear().toString(), quarter: newQuarter } : j
      ));
  };
  // ---------------------------------

  const exportCSV = () => {
     const headers = ["ID","Client","Service","Type","Total","Profit"];
     const rows = [headers.join(','), ...jobs.map(j => `${j.id},"${j.client}","${j.serviceType}","${j.projectType}",${j.totalPrice},${j.totalPrice - (j.actualOutsourceFee||0)}`)];
     const blob = new Blob(["\uFEFF"+rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
     const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'export.csv'; link.click();
  };

  const filteredJobs = jobs.filter(j => (j.client.toLowerCase().includes(searchTerm.toLowerCase()) || (j.projectType||'').toLowerCase().includes(searchTerm.toLowerCase())) && (activeTeamFilter === 'ALL' || j.teamId === activeTeamFilter));

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-slate-800 pb-20" style={{ fontFamily: '"IBM Plex Sans Thai", sans-serif' }}>
      <div className="max-w-[1440px] mx-auto">
        <nav className="mb-6 md:mb-10 sticky top-0 z-40 bg-white/80 backdrop-blur-md p-4 md:p-6 shadow-sm border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center bg-black rounded-md"><span className="text-white font-bold text-xl">S</span></div>
              <div><h1 className="text-xl md:text-2xl font-bold tracking-tight uppercase">@TheToi <span className="text-[#C5A059] font-light">DESIGN STUDIO</span></h1></div>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg">
               {['dashboard', 'financial', 'calendar'].map(v => (
                   <button key={v} onClick={() => setCurrentView(v)} className={`px-4 py-2 text-xs font-bold uppercase rounded-md flex items-center gap-2 ${currentView === v ? 'bg-black text-white' : 'text-slate-500'}`}>{v}</button>
               ))}
            </div>
            <div className="flex gap-2">
                <button onClick={exportCSV} className="p-2 border rounded"><Download size={16}/></button>
                <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="p-2 border text-red-300 rounded"><AlertTriangle size={16}/></button>
            </div>
        </nav>

        <div className="px-4 md:px-8">
            {currentView === 'dashboard' && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
                      <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                         <button onClick={() => setListViewMode('table')} className={`px-4 py-2 text-xs font-bold uppercase rounded-md flex items-center gap-2 transition-all ${listViewMode === 'table' ? 'bg-white text-black shadow-sm' : 'text-slate-400 hover:text-black'}`}><TableIcon size={14} /> Table</button>
                         <button onClick={() => setListViewMode('list')} className={`px-4 py-2 text-xs font-bold uppercase rounded-md flex items-center gap-2 transition-all ${listViewMode === 'list' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400 hover:text-black'}`}><List size={14} /> Countdown</button>
                      </div>

                      <div className="flex gap-2">
                          <button onClick={() => setShowInternalCost(!showInternalCost)} className={`px-3 py-2 text-[10px] border rounded-lg flex items-center gap-2 transition-colors ${showInternalCost ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white text-slate-500'}`}>{showInternalCost ? <EyeOff size={14} /> : <Eye size={14} />} Profit</button>
                          
                          <button onClick={() => setActiveModal('serviceType')} className="px-3 py-2 border rounded-lg text-xs font-bold uppercase flex items-center gap-2 hover:border-black"><Settings size={14} /> Service</button>
                          <button onClick={() => setActiveModal('projectType')} className="px-3 py-2 border rounded-lg text-xs font-bold uppercase flex items-center gap-2 hover:border-black"><Hammer size={14} /> Project</button>
                          <button onClick={() => setActiveModal('team')} className="px-3 py-2 border rounded-lg text-xs font-bold uppercase flex items-center gap-2 hover:border-black"><Users size={14} /> Team</button>
                          
                          <button onClick={() => { setEditingJob(null); setActiveModal('job'); }} className="px-6 py-2 bg-black text-white rounded-lg text-xs font-bold uppercase flex items-center gap-2"><Plus size={14} /> New</button>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                   <StatCard title="Net Profit" value={stats.totalProfit} subtext="กำไรสุทธิ" color="black" borderColor="border-l-black" icon={TrendingUp} />
                   <StatCard title="Revenue" value={stats.totalRevenue} subtext="ยอดขายรวม" color="#C5A059" borderColor="border-l-[#C5A059]" icon={BarChart} />
                   <StatCard title="Balance" value={stats.totalBalance} subtext="ค้างรับ" color="#DC2626" borderColor="border-l-[#DC2626]" icon={FileSpreadsheet} />
                  </div>

                  <div className="p-4 border-b flex justify-between bg-white rounded-t-xl border border-slate-200">
                      <div className="relative w-full md:w-auto"><Search className="absolute left-3 top-2 text-slate-300" size={16} /><input className="w-full md:w-64 pl-9 py-1 bg-slate-50 rounded text-sm" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                      <div className="flex gap-2 overflow-auto"><button onClick={() => setActiveTeamFilter('ALL')} className={`px-3 py-1 text-[10px] border rounded-full ${activeTeamFilter==='ALL'?'bg-black text-white':''}`}>ALL</button>{teams.map(t => <button key={t.id} onClick={() => setActiveTeamFilter(t.id)} className={`px-3 py-1 text-[10px] border rounded-full ${activeTeamFilter===t.id?'bg-black text-white':''}`}>{t.name.split(' ')[0]}</button>)}</div>
                  </div>

                  <div className="bg-white border-x border-b border-slate-200 rounded-b-xl overflow-hidden p-0 min-h-[400px]">
                     {listViewMode === 'table' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                            <thead className="bg-slate-50 text-[10px] uppercase text-slate-400"><tr><th className="px-6 py-4">Project</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Total</th>{showInternalCost && <th className="px-6 py-4 text-right text-emerald-500">Net Profit</th>}<th className="px-6 py-4 text-right">Balance</th><th className="px-6 py-4 text-center">Action</th></tr></thead>
                            <tbody>{filteredJobs.map(job => (
                                <JobRow key={job.id} job={job} team={teams.find(t => t.id === job.teamId)} showInternal={showInternalCost} onEdit={() => { setEditingJob(job); setActiveModal('job'); }} onDelete={() => handleDeleteJob(job.id)} onDoc={() => { setDocConfig({ jobId: job.id }); setActiveModal('docSelect'); }} />
                            ))}</tbody>
                            </table>
                        </div>
                     ) : (
                        <div className="p-4 bg-slate-50/50">
                            <CountdownList jobs={filteredJobs} onEdit={(job) => { setEditingJob(job); setActiveModal('job'); }} />
                        </div>
                     )}
                  </div>
               </div>
            )}

            {currentView === 'financial' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="bg-white p-6 rounded-xl border h-[300px]"><h4 className="text-xs font-bold mb-4">Quarterly Profit</h4><ResponsiveContainer><LineChart data={chartDataQ}><XAxis dataKey="name" /><YAxis /><RechartsTooltip /><Line type="monotone" dataKey="profit" stroke="#C5A059" strokeWidth={3} /></LineChart></ResponsiveContainer></div>
                    <div className="bg-white p-6 rounded-xl border h-[300px]"><h4 className="text-xs font-bold mb-4">Yearly</h4><ResponsiveContainer><BarChart data={chartDataY}><XAxis dataKey="name" /><YAxis /><Bar dataKey="profit" fill="#1A1A1A" /></BarChart></ResponsiveContainer></div>
                    <div className="bg-white p-6 rounded-xl border col-span-1 md:col-span-2"><h4 className="text-xs font-bold mb-4 text-red-500">Top Debtors</h4>{topDebtors.map(j => <div key={j.id} className="flex justify-between p-3 border-b"><span>{j.client}</span><span className="font-bold text-red-500">{formatCurrency(j.balance)}</span></div>)}</div>
                </div>
            )}

            {/* เพิ่ม onMoveJob เข้าไปใน CalendarView */}
            {currentView === 'calendar' && <CalendarView jobs={jobs} onJobClick={(job) => { setEditingJob(job); setActiveModal('job'); }} onMoveJob={handleMoveJob} />}
        </div>
      </div>

      {activeModal === 'job' && <JobModal job={editingJob} teams={teams} projectTypes={projectTypes} serviceTypes={serviceTypes} onClose={() => { setActiveModal(null); setEditingJob(null); }} onSave={handleSaveJob} />}
      {activeModal === 'team' && <TeamModal teams={teams} onClose={() => setActiveModal(null)} onAdd={handleAddTeam} onDelete={handleDeleteTeam} />}
      {activeModal === 'projectType' && <ProjectTypeModal list={projectTypes} onClose={() => setActiveModal(null)} onAdd={(val) => setProjectTypes([...projectTypes, val])} onDelete={(i) => { const n = [...projectTypes]; n.splice(i, 1); setProjectTypes(n); }} />}
      {activeModal === 'serviceType' && <ServiceTypeModal list={serviceTypes} onClose={() => setActiveModal(null)} onAdd={(val) => setServiceTypes([...serviceTypes, val])} onDelete={(i) => { const n = [...serviceTypes]; n.splice(i, 1); setServiceTypes(n); }} />}
      {activeModal === 'docSelect' && <DocSelectModal onClose={() => setActiveModal(null)} onSelect={(type) => { setDocConfig({ ...docConfig, type }); setActiveModal('docPreview'); }} />}
      {activeModal === 'docPreview' && docConfig && <DocPreviewModal job={jobs.find(j => j.id === docConfig.jobId)} team={teams.find(t => t.id === jobs.find(j => j.id === docConfig.jobId)?.teamId)} type={docConfig.type} onClose={() => setActiveModal(null)} />}
    </div>
  );
}
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { formatCurrency } from '../utils/helpers';
import { TrendingUp, Users, Award, Target } from 'lucide-react';

const COLORS = ['#C5A059', '#1A1A1A', '#64748B', '#94A3B8', '#EF4444', '#10B981'];

export default function AnalyticsView({ stats }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="text-[#C5A059]" /> Analytics & Insights
          </h2>
          <p className="text-slate-400 text-sm mt-1">วิเคราะห์ข้อมูลเชิงลึกและแนวโน้มธุรกิจ</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1">
            <Target size={12}/> เป้าหมายปีนี้: 100%
          </span>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Monthly Trend (Area Chart) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-slate-700 mb-6 flex justify-between items-center">
            <span>📈 กำไรรายเดือน (Monthly Profit)</span>
            <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">2025</span>
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyChartData}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C5A059" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} 
                  formatter={(value) => formatCurrency(value)} 
                  cursor={{ stroke: '#C5A059', strokeWidth: 1, strokeDasharray: '5 5' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#C5A059" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorProfit)" 
                  activeDot={{r: 6, strokeWidth: 0, fill: '#1A1A1A'}}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Team Performance (Bar Chart) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2">
            <Users size={16} className="text-blue-500"/> ทีมงานยอดเยี่ยม (Top Teams)
          </h3>
          <div className="h-[300px] w-full">
            {stats.topTeams.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topTeams} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 11, fill: '#64748b'}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                    formatter={(value) => formatCurrency(value)} 
                  />
                  <Bar dataKey="value" fill="#1A1A1A" radius={[0, 6, 6, 0]} barSize={24} animationDuration={1500}>
                    {/* ไล่สี Bar ตามลำดับ */}
                    {stats.topTeams.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#C5A059' : index === 1 ? '#1A1A1A' : '#94A3B8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full text-slate-300">No Data</div>}
          </div>
        </div>

        {/* 3. Project Types (Donut Chart) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2">
            <Award size={16} className="text-orange-500"/> สัดส่วนประเภทงาน (Project Types)
          </h3>
          <div className="h-[250px] w-full flex justify-center relative">
            {stats.pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={stats.pieData} 
                    cx="50%" cy="50%" 
                    innerRadius={60} 
                    outerRadius={80} 
                    paddingAngle={5} 
                    dataKey="value"
                    cornerRadius={6}
                  >
                    {stats.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{fontSize: '11px'}} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full text-slate-300">No Data</div>}
            {/* Center Text */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center pointer-events-none">
              <div className="text-3xl font-bold text-slate-800">{stats.pieData.reduce((a,b)=>a+b.value,0)}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-widest">Projects</div>
            </div>
          </div>
        </div>

        {/* 4. Cost vs Profit (Pie Chart with Custom Design) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-slate-700 mb-6">สุขภาพการเงิน (Financial Health)</h3>
          <div className="h-[250px] w-full flex justify-center">
            {(stats.donutData[0].value > 0 || stats.donutData[1].value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={stats.donutData} 
                    cx="50%" cy="50%" 
                    innerRadius={60} 
                    outerRadius={80} 
                    paddingAngle={2} 
                    dataKey="value"
                    startAngle={180}
                    endAngle={0}
                  >
                    <Cell fill="#EF4444" stroke="none" />
                    <Cell fill="#10B981" stroke="none" />
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px' }} formatter={(value) => formatCurrency(value)} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full text-slate-300">No Data</div>}
          </div>
          <div className="flex justify-between px-10 -mt-10">
             <div className="text-center">
                <div className="text-xs text-red-400 font-bold uppercase">Outstanding</div>
                <div className="text-lg font-bold text-red-600">{formatCurrency(stats.donutData[0].value)}</div>
             </div>
             <div className="text-center">
                <div className="text-xs text-emerald-400 font-bold uppercase">Received</div>
                <div className="text-lg font-bold text-emerald-600">{formatCurrency(stats.donutData[1].value)}</div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
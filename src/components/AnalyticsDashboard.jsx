import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { DollarSign, TrendingUp, Bitcoin, Coins, Calendar, Download } from 'lucide-react';

const formatCurrency = (amount, currency = 'THB') => {
  return new Intl.NumberFormat(currency === 'THB' ? 'th-TH' : 'en-US', { 
    style: 'currency', 
    currency: currency, 
    minimumFractionDigits: currency === 'USD' ? 2 : 0 
  }).format(amount);
};

const StatCard = ({ title, value, change, icon: Icon, isPositive, subtitle }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1 group-hover:text-gray-700 transition-colors">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-gold-600 transition-colors">{value}</h3>
      <div className="mt-2 flex items-center text-sm">
        {change && (
          <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{change}
          </span>
        )}
        <span className="text-gray-400">{subtitle || 'ข้อมูลตามปีที่เลือก'}</span>
      </div>
    </div>
    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-gold-50 group-hover:text-gold-600 transition-all duration-300 group-hover:scale-110">
      <Icon size={24} />
    </div>
  </div>
);

export default function AnalyticsDashboard({ stats, jobs = [] }) {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [isLoading, setIsLoading] = useState(false);
  const [btcPrice, setBtcPrice] = useState(null);
  const [goldPriceUsd, setGoldPriceUsd] = useState(null);

  // ดึงปีทั้งหมดที่มีในข้อมูล
  const availableYears = useMemo(() => {
    const yearsSet = new Set();
    jobs.forEach(j => {
      if (j.deliveryDate) {
        const d = new Date(j.deliveryDate);
        if (!isNaN(d.getTime())) {
          yearsSet.add(d.getFullYear().toString());
        }
      }
    });
    const sorted = Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
    return sorted.length > 0 ? sorted : ['2026', '2025', '2024'];
  }, [jobs]);

  // คำนวณสถิติและกราฟรายเดือนแบบไดนามิกตามปีที่เลือก
  const activeStats = useMemo(() => {
    if (!jobs || jobs.length === 0) return stats;

    const mNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const monthlyRaw = Array(12).fill(0).map(() => ({ revenue: 0, profit: 0, count: 0 }));
    let totalRevenue = 0;
    let totalProfit = 0;
    const typeRevenue = {};
    const teamRevenue = {};

    jobs.forEach(j => {
      let isMatch = false;
      let monthIndex = -1;

      if (j.deliveryDate) {
        const d = new Date(j.deliveryDate);
        if (!isNaN(d.getTime())) {
          const yr = d.getFullYear().toString();
          monthIndex = d.getMonth();
          if (selectedYear === 'all' || yr === selectedYear) {
            isMatch = true;
          }
        }
      } else if (selectedYear === 'all') {
        isMatch = true;
      }

      if (isMatch) {
        const price = parseFloat(j.totalPrice) || 0;
        const profit = parseFloat(j.sheetProfit) || 0;

        totalRevenue += price;
        totalProfit += profit;

        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyRaw[monthIndex].revenue += price;
          monthlyRaw[monthIndex].profit += profit;
          monthlyRaw[monthIndex].count++;
        }

        if (j.projectType) {
          typeRevenue[j.projectType] = (typeRevenue[j.projectType] || 0) + price;
        }
        if (j.teamName) {
          teamRevenue[j.teamName] = (teamRevenue[j.teamName] || 0) + price;
        }
      }
    });

    const monthlyChartData = monthlyRaw.map((data, i) => ({
      name: mNames[i],
      revenue: data.revenue,
      profit: data.profit,
      count: data.count
    }));

    const revenueByType = Object.entries(typeRevenue)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const topTeams = Object.entries(teamRevenue)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    return {
      totalRevenue,
      totalProfit,
      monthlyChartData,
      revenueByType,
      topTeams
    };
  }, [jobs, selectedYear, stats]);

  const handleYearChange = (newYear) => {
    setIsLoading(true);
    setSelectedYear(newYear);
    setTimeout(() => {
      setIsLoading(false);
    }, 200);
  };

  // ดึงราคา BTC และ PAXG จาก Binance (เปิด CORS และรวดเร็ว ไม่ค้าง)
  useEffect(() => {
    const fetchCryptoPrices = () => {
      fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT')
        .then(res => res.json())
        .then(data => {
          if (data?.price) setBtcPrice(parseFloat(data.price));
        })
        .catch(err => console.error("Error fetching BTC:", err));

      fetch('https://api.binance.com/api/v3/ticker/price?symbol=PAXGUSDT')
        .then(res => res.json())
        .then(data => {
          if (data?.price) setGoldPriceUsd(parseFloat(data.price));
        })
        .catch(err => console.error("Error fetching Gold (PAXG):", err));
    };

    fetchCryptoPrices();
    const intervalId = setInterval(fetchCryptoPrices, 60000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-6">
        
        {/* Header & Filter Controls */}
        <div className="glass-card p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">ภาพรวมระบบ <span className="text-gold-500 font-light">(Analytics)</span></h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">
              วิเคราะห์รายได้และประสิทธิภาพงาน {selectedYear === 'all' ? '(รวมทุกปี)' : `(ประจำปี ${selectedYear})`}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-inner">
              <Calendar size={14} className="text-gold-500" />
              <label htmlFor="analytics-year-select" className="text-xs font-bold text-slate-600">เลือกปี:</label>
              <select 
                id="analytics-year-select"
                value={selectedYear}
                onChange={(e) => handleYearChange(e.target.value)}
                className="bg-transparent text-slate-800 text-xs font-bold outline-none cursor-pointer pr-2"
              >
                {availableYears.map(yr => (
                  <option key={yr} value={yr}>
                    ปี {yr} {yr === '2026' ? '(ล่าสุด)' : ''}
                  </option>
                ))}
                <option value="all">รวมทุกปี (All Time)</option>
              </select>
            </div>
            
            <button 
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-gold-500 transition-colors text-xs font-bold flex items-center gap-1.5 shadow-sm w-full sm:w-auto"
            >
              <Download size={14} /> พิมพ์รายงาน
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center glass-card">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard 
                title={`รายได้รวม (${selectedYear === 'all' ? 'ทุกปี' : selectedYear})`} 
                value={formatCurrency(activeStats?.totalRevenue || 0)} 
                subtitle={`จากวันกำหนดส่งปี ${selectedYear}`} 
                icon={DollarSign} 
                isPositive={true} 
              />
              <StatCard 
                title={`กำไรรวม (${selectedYear === 'all' ? 'ทุกปี' : selectedYear})`} 
                value={formatCurrency(activeStats?.totalProfit || 0)} 
                subtitle={`จากวันกำหนดส่งปี ${selectedYear}`} 
                icon={TrendingUp} 
                isPositive={true} 
              />
              <StatCard 
                title="ราคา Bitcoin (USD)" 
                value={btcPrice ? formatCurrency(btcPrice, 'USD') : "กำลังโหลด..."} 
                change="Realtime" 
                subtitle="จาก Binance" 
                icon={Bitcoin} 
                isPositive={true} 
              />
              <StatCard 
                title="ราคาทองแท่ง PAXG (USD)" 
                value={goldPriceUsd ? formatCurrency(goldPriceUsd, 'USD') : "กำลังโหลด..."} 
                change="Realtime" 
                subtitle="จาก Binance" 
                icon={Coins} 
                isPositive={false} 
              />
            </div>

            {/* Monthly Revenue Line Chart */}
            <div className="glass-card p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                <div>
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
                    รายได้จริง รายเดือน {selectedYear === 'all' ? '(รวมทุกปี)' : `(ประจำปี ${selectedYear})`}
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    คำนวณจากยอดโครงการตามกำหนดส่งงานในแต่ละเดือน
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 text-gold-600 font-bold">
                    <span className="w-3 h-3 rounded-full bg-[#C5A059]"></span> ยอดรายได้ (Revenue)
                  </span>
                </div>
              </div>

              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activeStats?.monthlyChartData || []} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748B', fontSize: 12, fontWeight: 'bold' }} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748B', fontSize: 11, fontWeight: 'bold' }} 
                      tickFormatter={(val) => `฿${(val >= 1000 ? (val / 1000).toLocaleString() + 'k' : val)}`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                      formatter={(value, name) => [
                        formatCurrency(value), 
                        name === 'revenue' ? 'รายได้' : 'กำไร'
                      ]}
                      labelFormatter={(label) => `เดือน ${label} (${selectedYear})`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#C5A059" 
                      strokeWidth={3} 
                      dot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: '#C5A059' }} 
                      activeDot={{ r: 7, fill: '#C5A059' }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Advanced Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Donut Chart: Revenue by Project Type */}
              <div className="glass-card p-6">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6">
                  สัดส่วนรายได้ ตามประเภทงาน ({selectedYear})
                </h2>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activeStats?.revenueByType || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {(activeStats?.revenueByType || []).map((entry, index) => {
                          const colors = ['#C5A059', '#0F172A', '#334155', '#64748B', '#94A3B8'];
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                        })}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontWeight: 'bold' }}
                        formatter={(value) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  {(activeStats?.revenueByType || []).slice(0, 5).map((entry, index) => {
                    const colors = ['bg-[#C5A059]', 'bg-[#0F172A]', 'bg-[#334155]', 'bg-[#64748B]', 'bg-[#94A3B8]'];
                    return (
                      <div key={index} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase">
                        <span className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></span>
                        {entry.name} ({formatCurrency(entry.value)})
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bar Chart: Top Teams */}
              <div className="glass-card p-6">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6">
                  ผู้รับเหมาที่สร้างรายได้สูงสุด ({selectedYear})
                </h2>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeStats?.topTeams || []} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 'bold' }} tickFormatter={(val) => `฿${(val/1000)}k`} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11, fontWeight: 'bold' }} width={90} />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontWeight: 'bold' }}
                        formatter={(value) => formatCurrency(value)}
                      />
                      <Bar dataKey="value" fill="#0F172A" radius={[0, 4, 4, 0]} barSize={24}>
                        {(activeStats?.topTeams || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#C5A059' : '#0F172A'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

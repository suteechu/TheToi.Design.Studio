import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Users, DollarSign, TrendingUp, Activity, Bitcoin, Coins } from 'lucide-react';



const formatCurrency = (amount, currency = 'THB') => {
  return new Intl.NumberFormat(currency === 'THB' ? 'th-TH' : 'en-US', { 
    style: 'currency', 
    currency: currency, 
    minimumFractionDigits: currency === 'USD' ? 2 : 0 
  }).format(amount);
};

const StatCard = ({ title, value, change, icon: Icon, isPositive }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between group hover:shadow-md transition-all duration-300 hover:-translate-y-1">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1 group-hover:text-gray-700 transition-colors">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-gold-600 transition-colors">{value}</h3>
      <div className="mt-2 flex items-center text-sm">
        <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{change}
        </span>
        <span className="text-gray-400 ml-2">จากเดือนที่แล้ว</span>
      </div>
    </div>
    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-gold-50 group-hover:text-gold-600 transition-all duration-300 group-hover:scale-110">
      <Icon size={24} />
    </div>
  </div>
);

export default function AnalyticsDashboard({ stats }) {
  const [timeframe, setTimeframe] = useState('this_year');
  const [isLoading, setIsLoading] = useState(false);
  const [btcPrice, setBtcPrice] = useState(null);
  const [goldPriceUsd, setGoldPriceUsd] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [timeframe]);

  useEffect(() => {
    const fetchCryptoPrices = () => {
      fetch('https://api.coindesk.com/v1/bpi/currentprice/USD.json')
        .then(res => res.json())
        .then(data => {
          if (data?.bpi?.USD?.rate_float) setBtcPrice(data.bpi.USD.rate_float);
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
        
        <div className="glass-card p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">ภาพรวมระบบ <span className="text-gold-500 font-light">(Analytics)</span></h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">ติดตามประสิทธิภาพและสถิติสำคัญของระบบ</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <select 
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold uppercase rounded-lg focus:ring-gold-500 focus:border-gold-500 block p-2.5 outline-none hover:border-gold-300 transition-colors cursor-pointer"
            >
              <option value="last_7_days">7 วันล่าสุด</option>
              <option value="this_month">เดือนนี้</option>
              <option value="this_year">ปีนี้</option>
            </select>
            
            <button className="px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-gold-500 transition-colors text-xs font-bold uppercase tracking-wider shadow-sm w-full sm:w-auto">
              ดาวน์โหลดรายงาน
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center glass-card">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard title="รายได้รวม" value={formatCurrency(stats?.totalRevenue || 0)} change="-" icon={DollarSign} isPositive={true} />
              <StatCard title="กำไรรวม" value={formatCurrency(stats?.totalProfit || 0)} change="-" icon={TrendingUp} isPositive={true} />
              <StatCard title="ราคา Bitcoin (USD)" value={btcPrice ? formatCurrency(btcPrice, 'USD') : "กำลังโหลด..."} change="1.5%" icon={Bitcoin} isPositive={true} />
              <StatCard title="ราคาทองแท่ง (USD)" value={goldPriceUsd ? formatCurrency(goldPriceUsd, 'USD') : "กำลังโหลด..."} change="-0.3%" icon={Coins} isPositive={false} />
            </div>

            <div className="glass-card p-6">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6">รายได้จริง รายเดือน</h2>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats?.monthlyChartData || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 'bold' }} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 'bold' }} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#C5A059" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, fill: '#C5A059' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Advanced Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Donut Chart: Revenue by Project Type */}
              <div className="glass-card p-6">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6">สัดส่วนรายได้ ตามประเภทงาน</h2>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats?.revenueByType || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {(stats?.revenueByType || []).map((entry, index) => {
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
                  {(stats?.revenueByType || []).slice(0, 4).map((entry, index) => {
                    const colors = ['bg-[#C5A059]', 'bg-[#0F172A]', 'bg-[#334155]', 'bg-[#64748B]'];
                    return (
                      <div key={index} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase">
                        <span className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></span>
                        {entry.name}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bar Chart: Top Teams */}
              <div className="glass-card p-6">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6">ผู้รับเหมาที่สร้างรายได้สูงสุด (Top Teams)</h2>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.topTeams || []} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 'bold' }} tickFormatter={(val) => `฿${(val/1000)}k`} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11, fontWeight: 'bold' }} width={80} />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontWeight: 'bold' }}
                        formatter={(value) => formatCurrency(value)}
                      />
                      <Bar dataKey="value" fill="#0F172A" radius={[0, 4, 4, 0]} barSize={24}>
                        {(stats?.topTeams || []).map((entry, index) => (
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
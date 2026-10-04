import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, Users, UserCog, FileText, Building2, Truck, HardHat, Package, 
  Wallet, TrendingUp, TrendingDown, ArrowRight
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip
} from 'recharts';

export default function DashboardHome() {
  const [data, setData] = useState({
    stats: {},
    financials: {},
    recent_reports: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const res = await fetch(`${apiUrl}/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  const statCards = [
    { title: 'Sites', value: data.stats.total_sites || 0, icon: MapPin, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', link: '/sites' },
    { title: 'Reports', value: data.stats.total_reports || 0, icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', link: '/reports-list' },
    { title: 'Incharges', value: data.stats.total_incharge || 0, icon: UserCog, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20', link: '/incharge' },
    { title: 'Staff', value: data.stats.total_staff || 0, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', link: '/salary' },
    { title: 'Suppliers', value: data.stats.total_suppliers || 0, icon: Truck, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20', link: '/suppliers' },
    { title: 'Subcontract', value: data.stats.total_subcontractors || 0, icon: HardHat, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20', link: '/subcontractor' },
    { title: 'Materials', value: data.stats.total_materials || 0, icon: Package, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', link: '/material/in' },
    { title: 'Accounts', value: data.stats.total_accounts || 0, icon: Building2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', link: '/accounts' },
  ];

  const financialCards = [
    { title: 'HO Income', value: formatCurrency(data.financials.ho_income), icon: TrendingUp, color: 'text-emerald-500' },
    { title: 'HO Expense', value: formatCurrency(data.financials.ho_expense), icon: TrendingDown, color: 'text-red-500' },
    { title: 'Supplier Pay', value: formatCurrency(data.financials.supplier_payments), icon: Wallet, color: 'text-amber-500' },
    { title: 'Staff Salaries', value: formatCurrency(data.financials.total_salary_paid), icon: Users, color: 'text-purple-500' },
  ];

  const financialChartData = [
    { name: 'HO Expense', value: parseFloat(data.financials.ho_expense) || 0, color: '#ef4444' },
    { name: 'Supplier Pay', value: parseFloat(data.financials.supplier_payments) || 0, color: '#f59e0b' },
    { name: 'Staff Salaries', value: parseFloat(data.financials.total_salary_paid) || 0, color: '#a855f7' },
  ];

  const operationalChartData = [
    { name: 'Sites', count: data.stats.total_sites || 0 },
    { name: 'Staff', count: data.stats.total_staff || 0 },
    { name: 'Suppliers', count: data.stats.total_suppliers || 0 },
    { name: 'Subcntr', count: data.stats.total_subcontractors || 0 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header (Compact) */}
      <div className="flex justify-between items-end mb-2">
      </div>

      {/* Top 8 Mini Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {statCards.map((card, i) => (
          <Link to={card.link} key={i} className="block group">
            <div className={`border border-gray-100 dark:border-gray-800 rounded-xl p-3 flex flex-col justify-center items-center text-center hover:border-gray-300 dark:hover:border-gray-600 transition-colors bg-white dark:bg-gray-900 h-full`}>
              <card.icon className={`w-5 h-5 mb-2 ${card.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-none mb-1">{card.value}</h3>
              <p className="text-[9px] sm:text-[10px] font-semibold text-gray-500 uppercase tracking-wider truncate max-w-full w-full">{card.title}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Middle Row: 3 Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Col 1: Financial Cards (Vertical Stack) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm h-full flex flex-col">
            <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Finances
            </h2>
            <div className="space-y-4 flex-1">
              {financialCards.map((card, i) => (
                <div key={i} className="flex justify-between items-center border-b border-gray-50 dark:border-gray-800/50 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-800`}>
                      <card.icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{card.title}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">{card.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Col 2: Pie Chart */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 text-center">Expense Breakdown</h2>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={financialChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {financialChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Col 3: Bar Chart */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 text-center">Entity Counts</h2>
          <div className="h-[220px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={operationalChartData} margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11}} />
                <BarTooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '8px', border: '1px solid #f3f4f6', fontSize: '12px'}} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Activity */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4" /> Recent Reports
          </h2>
          <Link to="/reports-list" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase font-semibold">
              <tr>
                <th className="px-4 py-2.5 rounded-tl-lg">Date</th>
                <th className="px-4 py-2.5">Site</th>
                <th className="px-4 py-2.5">Incharge</th>
                <th className="px-4 py-2.5 rounded-tr-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
              {data.recent_reports && data.recent_reports.length > 0 ? (
                data.recent_reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{report.date}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{report.site?.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{report.site_incharge}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-md font-medium">
                        Submitted
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-6 text-center text-gray-500">No recent reports found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

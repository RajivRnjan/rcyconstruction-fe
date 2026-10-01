import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, MapPin, Users, UserCog } from 'lucide-react';

export default function DashboardHome() {
  const [stats, setStats] = useState({
    total_projects: '-',
    total_sites: '-',
    total_staff: '-',
    total_incharge: '-'
  });

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
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { title: 'Total Sites', value: stats.total_sites, icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', link: '/sites' },
    { title: 'Total Staff', value: stats.total_staff, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30', link: '/salary' },
    { title: 'Total Site Incharge', value: stats.total_incharge, icon: UserCog, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', link: '/incharge' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back to RCY Construction Panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <Link to={card.link} key={i} className="block group">
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm group-hover:shadow-lg group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-all cursor-pointer h-full">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl ${card.bg} group-hover:scale-110 transition-transform`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{card.title}</p>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{card.value}</h3>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Eye, Edit, Filter, Plus, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DailyReportsList = () => {
    const [reports, setReports] = useState([]);
    
    const [sites, setSites] = useState([]);
    
    
    const [filterSite, setFilterSite] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();

    const fetchDropdowns = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
            const [projRes, siteRes] = await Promise.all([
                
                fetch(`${apiUrl}/sites`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            
            if (siteRes.ok) setSites(await siteRes.json());
        } catch (e) {
            console.error("Error fetching dropdowns:", e);
        }
    };

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
            
            let url = `${apiUrl}/daily-reports?`;
            
            if (filterSite) url += `site_id=${filterSite}&`;

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setReports(await res.json());
            }
        } catch (e) {
            console.error("Error fetching reports:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDropdowns();
    }, []);

    useEffect(() => {
        fetchReports();
    }, [filterSite]);

    const filteredSites = sites;

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Reports List</h1>
                    <p className="text-gray-500 text-sm mt-1">View and manage all historical daily reports.</p>
                </div>
                <button 
                    onClick={() => navigate('/daily-report')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition"
                >
                    <Plus className="w-4 h-4" /> New Report
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex items-center gap-2 text-gray-500"><Filter className="w-4 h-4"/> Filters:</div>


                <select 
                    value={filterSite} 
                    onChange={e => setFilterSite(e.target.value)}
                    className="w-full md:w-64 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none"
                    disabled={filteredSites.length === 0}
                >
                    <option value="">All Sites</option>
                    {filteredSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-gray-500 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Site</th>
                                <th className="px-6 py-4 font-medium">Incharge</th>
                                <th className="px-6 py-4 font-medium">Outst. Balance</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading ? (
                                <tr><td colSpan="5" className="text-center py-8 text-gray-400">Loading...</td></tr>
                            ) : reports.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-8 text-gray-400">No reports found matching your filters.</td></tr>
                            ) : (
                                reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-blue-500"/>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">{report.date}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                            {report.site_name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                            {report.site_incharge || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-mono">
                                            ₹{parseFloat(report.outstanding_balance).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => navigate(`/daily-report?id=${report.id}`)}
                                                className="text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 inline-flex font-medium text-xs transition-colors"
                                            >
                                                <Edit className="w-3.5 h-3.5"/> Edit / View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DailyReportsList;

import React, { useState, useEffect } from 'react';
import { toast } from "react-hot-toast";
import { useConfirm } from "../components/ConfirmProvider";
import { Eye, Edit, Filter, Plus, Calendar, Trash2, Search, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import Pagination from '../components/Pagination';

const DailyReportsList = () => {
    const confirm = useConfirm();
    const [reports, setReports] = useState([]);
    
    const [sites, setSites] = useState([]);
    
    
    const [filterSite, setFilterSite] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const navigate = useNavigate();

    const fetchDropdowns = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
            const siteRes = await fetch(`${apiUrl}/sites?all=true`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (siteRes.ok) setSites(await siteRes.json());
        } catch (e) {
            console.error("Error fetching dropdowns:", e);
        }
    };

    useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchReports = async (page = 1, search = '') => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
            
            let url = `${apiUrl}/daily-reports?page=${page}&search=${search}&`;
            
            if (filterSite) url += `site_id=${filterSite}&`;
            if (filterStartDate) url += `start_date=${filterStartDate}&`;
            if (filterEndDate) url += `end_date=${filterEndDate}&`;

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.data) {
                    setReports(data.data);
                    setPagination(data);
                } else {
                    setReports(data);
                    setPagination(null);
                }
            }
        } catch (e) {
            console.error("Error fetching reports:", e);
        } finally {
            setIsLoading(false);
        }
    };


    const handleDelete = async (id) => {
        if (!await confirm('Are you sure you want to delete this report?')) return;
        try {
            const token = localStorage.getItem('admin_token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
            const res = await fetch(`${apiUrl}/daily-reports/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchReports();
            } else {
                toast('Failed to delete report');
            }
        } catch (e) {
            console.error(e);
            toast('Error deleting report');
        }
    };

    useEffect(() => {

        fetchDropdowns();
    }, []);

    useEffect(() => {
        fetchReports(currentPage, debouncedSearch);
    }, [filterSite, filterStartDate, filterEndDate, currentPage, debouncedSearch]);

    
    
    
    

    
    const fetchFullReportsData = async (reportsToFetch) => {
        const token = localStorage.getItem('admin_token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const fullData = [];
        for (const r of reportsToFetch) {
            const res = await fetch(`${apiUrl}/daily-reports/${r.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                // Attach the site name from the list view so it's not N/A
                data.report.site_name = r.site_name; 
                fullData.push(data);
            }
        }
        return fullData;
    };
const handleExportList = async (type) => {
        try {
            toast.loading("Gathering full details...", { id: 'export' });
            const token = localStorage.getItem('admin_token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
            let url = `${apiUrl}/daily-reports?all=true&`;
            if (filterSite) url += `site_id=${filterSite}&`;
            if (filterStartDate) url += `start_date=${filterStartDate}&`;
            if (filterEndDate) url += `end_date=${filterEndDate}&`;
            if (debouncedSearch) url += `search=${debouncedSearch}&`;

            const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!res.ok) throw new Error("Failed to fetch list");
            const listData = await res.json();
            
            const fullReports = await fetchFullReportsData(listData);
            
            if (type === 'excel') {
                const wb = XLSX.utils.book_new();
                
                // 1. Main Reports Sheet
                const reportsSheet = fullReports.map(d => ({
                    Date: d.report.date,
                    Site: d.report.site?.name || d.report.site_name || 'N/A',
                    Incharge: d.report.site_incharge,
                    'Outstanding Balance': d.report.outstanding_balance
                }));
                XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reportsSheet), "Overview");

                // 2. Expenses Sheet
                const expensesData = [];
                fullReports.forEach(d => {
                    if (d.report.expenses) {
                        d.report.expenses.forEach(e => {
                            expensesData.push({
                                Date: d.report.date,
                                Site: d.report.site?.name || d.report.site_name || 'N/A',
                                Type: e.type,
                                Name: e.name || '-',
                                Amount: e.amount
                            });
                        });
                    }
                });
                if (expensesData.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expensesData), "Expenses");

                // 3. Staff Sheet
                const staffData = [];
                fullReports.forEach(d => {
                    if (d.report.staff) {
                        d.report.staff.forEach(s => {
                            staffData.push({
                                Date: d.report.date,
                                Site: d.report.site?.name || d.report.site_name || 'N/A',
                                'Staff Name': s.name,
                                Status: s.status
                            });
                        });
                    }
                });
                if (staffData.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(staffData), "Staff Attendance");

                // 4. Material In Sheet
                const matInData = [];
                fullReports.forEach(d => {
                    if (d.material_in) {
                        d.material_in.forEach(m => {
                            matInData.push({
                                Date: d.report.date,
                                Site: d.report.site?.name || d.report.site_name || 'N/A',
                                Supplier: m.supplier?.name || '-',
                                Material: m.material?.name || '-',
                                Qnty: m.qnty,
                                Unit: m.unit || '-',
                                Rate: m.rate || 0,
                                Amount: m.amount || 0
                            });
                        });
                    }
                });
                if (matInData.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(matInData), "Material In");

                // 5. Material Used Sheet
                const matUsedData = [];
                fullReports.forEach(d => {
                    if (d.material_used) {
                        d.material_used.forEach(m => {
                            matUsedData.push({
                                Date: d.report.date,
                                Site: d.report.site?.name || d.report.site_name || 'N/A',
                                Material: m.material?.name || '-',
                                Qnty: m.qnty,
                                Unit: m.unit || '-',
                                Remark: m.remark || '-'
                            });
                        });
                    }
                });
                if (matUsedData.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(matUsedData), "Material Used");
                
                
                // 5.5 Material Transfer Sheet
                const matTransferData = [];
                fullReports.forEach(d => {
                    if (d.material_transfer) {
                        d.material_transfer.forEach(m => {
                            matTransferData.push({
                                Date: d.report.date,
                                Site: d.report.site?.name || d.report.site_name || 'N/A',
                                'To Site': m.toSite?.name || m.to_site_id || '-',
                                Material: m.material?.name || '-',
                                Qnty: m.qnty,
                                Unit: m.unit || '-',
                                Remark: m.remark || '-'
                            });
                        });
                    }
                });
                if (matTransferData.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(matTransferData), "Material Transfer");
// 6. Subcontractors Sheet
                const subData = [];
                fullReports.forEach(d => {
                    if (d.report.subcontractors) {
                        d.report.subcontractors.forEach(s => {
                            subData.push({
                                Date: d.report.date,
                                Site: d.report.site?.name || d.report.site_name || 'N/A',
                                Subcontractor: s.name || '-',
                                Labour: s.no_of_labour || 0,
                                'Work Details': s.work_details || '-',
                                Amount: s.amount || 0
                            });
                        });
                    }
                });
                if (subData.length > 0) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(subData), "Subcontractors");

                XLSX.writeFile(wb, `Daily_Reports_Detailed.xlsx`);
            } else if (type === 'pdf') {
                const doc = new jsPDF('landscape');
                doc.text("Daily Reports (Detailed)", 14, 15);
                
                // For PDF, we can do multi-table
                let currentY = 25;
                
                fullReports.forEach((d, index) => {
                    if (index > 0) { doc.addPage(); currentY = 20; }
                    doc.setFontSize(14);
                    doc.text(`Report: ${d.report.date} | Site: ${d.report.site?.name || d.report.site_name || 'N/A'} | Incharge: ${d.report.site_incharge}`, 14, currentY);
                    currentY += 10;
                    
                    if (d.report.expenses && d.report.expenses.length > 0) {
                        autoTable(doc, {
                            startY: currentY,
                            head: [['Expense Type', 'Name', 'Amount']],
                            body: d.report.expenses.map(e => [e.type, e.name || '-', e.amount]),
                            theme: 'grid', styles: { fontSize: 8 }
                        });
                        currentY = doc.lastAutoTable.finalY + 10;
                    }
                    
                    if (d.report.staff && d.report.staff.length > 0) {
                        autoTable(doc, {
                            startY: currentY,
                            head: [['Staff Name', 'Status']],
                            body: d.report.staff.map(s => [s.name, s.status]),
                            theme: 'grid', styles: { fontSize: 8 }
                        });
                        currentY = doc.lastAutoTable.finalY + 10;
                    }
                    
                    if (d.material_in && d.material_in.length > 0) {
                        autoTable(doc, {
                            startY: currentY,
                            head: [['Material In', 'Qnty', 'Unit', 'Amount']],
                            body: d.material_in.map(m => [m.material?.name || '-', m.qnty, m.unit || '-', m.amount || 0]),
                            theme: 'grid', styles: { fontSize: 8 }
                        });
                        currentY = doc.lastAutoTable.finalY + 10;
                    }
                    
                    if (d.material_used && d.material_used.length > 0) {
                        autoTable(doc, {
                            startY: currentY,
                            head: [['Material Used', 'Qnty', 'Unit', 'Remark']],
                            body: d.material_used.map(m => [m.material?.name || '-', m.qnty, m.unit || '-', m.remark || '-']),
                            theme: 'grid', styles: { fontSize: 8 }
                        });
                        currentY = doc.lastAutoTable.finalY + 10;
                    }
                    
                    if (d.report.subcontractors && d.report.subcontractors.length > 0) {
                        autoTable(doc, {
                            startY: currentY,
                            head: [['Subcontractor', 'Labour', 'Work Details', 'Amount']],
                            body: d.report.subcontractors.map(s => [s.name || '-', s.no_of_labour || 0, s.work_details || '-', s.amount || 0]),
                            theme: 'grid', styles: { fontSize: 8 }
                        });
                        currentY = doc.lastAutoTable.finalY + 10;
                    }
if (d.material_transfer && d.material_transfer.length > 0) {
                        autoTable(doc, {
                            startY: currentY,
                            head: [['Material Transfer (To Site)', 'Material', 'Qnty', 'Unit']],
                            body: d.material_transfer.map(m => [m.toSite?.name || m.to_site_id || '-', m.material?.name || '-', m.qnty, m.unit || '-']),
                            theme: 'grid', styles: { fontSize: 8 }
                        });
                        currentY = doc.lastAutoTable.finalY + 10;
                    }
                }); // End of fullReports.forEach loop
                
                doc.save(`Daily_Reports_Detailed.pdf`);
            }
            
            toast.success("Export successful", { id: 'export' });
        } catch (error) {
            console.error("Export failed", error);
            toast.error("Export failed", { id: 'export' });
        }
    };

    const filteredSites = sites;

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => handleExportList('excel')}
                        className="bg-green-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-green-700 transition"
                    >
                        <Download className="w-4 h-4" /> Export Excel
                    </button>
                    <button 
                        onClick={() => handleExportList('pdf')}
                        className="bg-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-red-700 transition"
                    >
                        <Download className="w-4 h-4" /> Export PDF
                    </button>
                    <button 
                        onClick={() => navigate('/daily-report')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition"
                    >
                        <Plus className="w-4 h-4" /> New Report
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex items-center gap-2 text-gray-500"><Filter className="w-4 h-4"/> Filters:</div>


                <select 
                    value={filterSite} 
                    onChange={e => { setFilterSite(e.target.value); setCurrentPage(1); }}
                    className="w-full md:w-64 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none"
                    disabled={filteredSites.length === 0}
                >
                    <option value="">All Sites</option>
                    {filteredSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                        <div className="flex items-center space-x-2">
                            <input
                                type="date"
                                value={filterStartDate}
                                onChange={(e) => { setFilterStartDate(e.target.value); setCurrentPage(1); }}
                                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-32 p-2"
                            />
                            <span className="text-gray-500 dark:text-gray-400">to</span>
                            <input
                                type="date"
                                value={filterEndDate}
                                onChange={(e) => { setFilterEndDate(e.target.value); setCurrentPage(1); }}
                                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-32 p-2"
                            />
                        </div>
                        <div className="relative w-full md:w-64">
                          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input 
                            type="text" 
                            placeholder="Search by Incharge..." 
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        {(filterSite || filterStartDate || filterEndDate || searchQuery) && (
                            <button
                                onClick={() => { setFilterSite(''); setFilterStartDate(''); setFilterEndDate(''); setSearchQuery(''); setCurrentPage(1); }}
                                className="text-sm text-red-500 hover:text-red-700 transition-colors"
                            >
                                Clear
                            </button>
                        )}
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
                                <th className="px-6 py-4 font-medium">Updated At</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading ? (
                                <tr><td colSpan="6" className="text-center py-8 text-gray-400">Loading...</td></tr>
                            ) : reports.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-8 text-gray-400">No reports found matching your filters.</td></tr>
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
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-xs">
                                            {new Date(report.updated_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            <button 
                                                onClick={() => navigate(`/daily-report?id=${report.id}`)}
                                                className="text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 inline-flex font-medium text-xs transition-colors"
                                            >
                                                <Edit className="w-3.5 h-3.5"/> Edit / View
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(report.id)}
                                                className="text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-900/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 inline-flex font-medium text-xs transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5"/> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination pagination={pagination} onPageChange={setCurrentPage} />
        </div>
    );
};

export default DailyReportsList;

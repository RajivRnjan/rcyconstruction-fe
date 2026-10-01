import { useState, useEffect } from 'react';
import { toast } from "react-hot-toast";
import { useConfirm } from "../components/ConfirmProvider";
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import SiteInchargeModal from '../components/SiteInchargeModal';
import Pagination from '../components/Pagination';

export default function SiteIncharge() {
  const confirm = useConfirm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [sites, setSites] = useState([]);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const res = await fetch(`${apiUrl}/sites?all=1`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setSites(await res.json());
      } catch (e) {
        console.error(e);
      }
    };
    fetchSites();
  }, []);

  useEffect(() => {
    fetchRecords(currentPage, debouncedSearch, filterSite);
  }, [currentPage, debouncedSearch, filterSite]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchRecords = async (page = 1, search = '', site = '') => {
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${apiUrl}/site-incharges`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setRecords(data.data);
          setPagination(data);
        } else {
          setRecords(data);
          setPagination(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch site incharge records:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleSuccess = () => {
    fetchRecords();
  };

  const handleOpenModal = (mode, record = null) => {
    setModalMode(mode);
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  const handleDelete = async (id) => {
    if (!await confirm('Are you sure you want to delete this record?')) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${apiUrl}/site-incharges/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        fetchRecords();
      } else {
        toast('Failed to delete record');
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      toast('Error deleting record');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">SITE INCHARGE</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Manage site incharge balances and expenses</p>
        </div>
        <button 
          onClick={() => handleOpenModal('create')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-5 h-5" />
          Add Record
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xl transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-gray-950/50 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Date</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Site Name</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Site Incharge</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Opening Bal</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Credit</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Debit Account</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Exp</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Balance</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 transition-colors duration-300">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">Loading data...</td>
                </tr>
              ) : (!records || records.length === 0) ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">No records found.</td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 text-gray-900 dark:text-white">{record.date || '-'}</td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white max-w-[150px] truncate">{record.site?.name || '-'}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{record.name}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">₹{record.opening_bal}</td>
                    <td className="px-6 py-4 text-green-600 dark:text-green-400 font-medium">₹{record.credit}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300 truncate max-w-[150px]">{record.debit_account || '-'}</td>
                    <td className="px-6 py-4 text-red-600 dark:text-red-400 font-medium">₹{record.exp}</td>
                    <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">₹{record.balance}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => handleOpenModal('view', record)} className="text-gray-400 hover:text-blue-600 transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleOpenModal('edit', record)} className="text-gray-400 hover:text-amber-600 transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(record.id)} className="text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination pagination={pagination} onPageChange={setCurrentPage} />

      <SiteInchargeModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSuccess={handleSuccess}
        initialData={selectedRecord}
        mode={modalMode}
      />
    </div>
  );
}

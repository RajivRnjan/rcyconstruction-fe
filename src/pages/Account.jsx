import { useState, useEffect } from 'react';
import { toast } from "react-hot-toast";
import { useConfirm } from "../components/ConfirmProvider";
import { Plus, Edit2, Trash2, Eye, Search } from 'lucide-react';
import Pagination from '../components/Pagination';
import AccountModal from '../components/AccountModal';
import AccountHistoryModal from '../components/AccountHistoryModal';
import { History } from 'lucide-react';

export default function Account() {
  const confirm = useConfirm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedAccountForHistory, setSelectedAccountForHistory] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchAccounts = async (page = 1, search = '') => {
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${apiUrl}/accounts?page=${page}&search=${search}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setAccounts(data.data);
          setPagination(data);
        } else {
          setAccounts(data);
          setPagination(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch]);

  const handleSuccess = () => {
    fetchAccounts();
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
    if (!await confirm('Are you sure you want to delete this record?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${apiUrl}/accounts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        fetchAccounts();
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
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Account Details</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-right">Opening Balance</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-right">Receipt Amount</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-right">Payment Amount</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-right">Balance</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Details</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 transition-colors duration-300">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">Loading data...</td>
                </tr>
              ) : (!accounts || accounts.length === 0) ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">No records found. Click "Add Record" to create one.</td>
                </tr>
              ) : (
                accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{acc.account_details}</td>
                    <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">₹{parseFloat(acc.opening_balance).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-emerald-600 dark:text-emerald-400 font-medium">₹{parseFloat(acc.receipt_amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-red-600 dark:text-red-400 font-medium">₹{parseFloat(acc.payment_amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-blue-600 dark:text-blue-400 font-medium">₹{parseFloat(acc.balance).toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 max-w-[200px] truncate">{acc.details || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                                                <button onClick={() => { setSelectedAccountForHistory(acc); setIsHistoryModalOpen(true); }} className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors" title="View Ledger/History">
                          <History className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleOpenModal('view', acc)} className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleOpenModal('edit', acc)} className="text-gray-400 hover:text-amber-600 dark:hover:text-yellow-400 transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(acc.id)} className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete">
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

      <AccountHistoryModal 
        isOpen={isHistoryModalOpen}
        onClose={() => { setIsHistoryModalOpen(false); setSelectedAccountForHistory(null); }}
        accountId={selectedAccountForHistory?.id}
        accountDetails={selectedAccountForHistory?.account_details}
      />

      <AccountModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSuccess={handleSuccess}
        initialData={selectedRecord}
        mode={modalMode}
      />
    </div>
  );
}

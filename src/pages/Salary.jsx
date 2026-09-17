import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import SalaryModal from '../components/SalaryModal';

export default function Salary() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSalaries = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${apiUrl}/staff-salaries`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSalaries(data);
      }
    } catch (error) {
      console.error('Failed to fetch staff salaries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, []);

  const handleSuccess = () => {
    fetchSalaries();
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
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${apiUrl}/staff-salaries/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        fetchSalaries();
      } else {
        alert('Failed to delete record');
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('Error deleting record');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">STAFF SALARY</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Manage all staff salary details</p>
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
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Month</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Name</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-right">Salary</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-right">Prv. Month Due/Adv</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-center">Total Working Day</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-right">Current Month Salary</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-right">Debit Amount</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-right">Balance</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Remark</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 transition-colors duration-300">
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center text-gray-500">Loading data...</td>
                </tr>
              ) : salaries.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center text-gray-500">No records found. Click "Add Record" to create one.</td>
                </tr>
              ) : (
                salaries.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{record.month || '-'}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{record.name}</td>
                    <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">₹{parseFloat(record.salary).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-yellow-600 dark:text-yellow-400">₹{parseFloat(record.prv_month_due_adv).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center text-gray-700 dark:text-gray-300">{record.total_working_day}</td>
                    <td className="px-6 py-4 text-right text-emerald-600 dark:text-emerald-400">₹{parseFloat(record.current_month_salary).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-red-600 dark:text-red-400">₹{parseFloat(record.debit_amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-blue-600 dark:text-blue-400 font-bold">₹{parseFloat(record.balance).toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 max-w-[150px] truncate">{record.remark || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => handleOpenModal('view', record)} className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleOpenModal('edit', record)} className="text-gray-400 hover:text-amber-600 dark:hover:text-yellow-400 transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(record.id)} className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete">
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

      <SalaryModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSuccess={handleSuccess}
        initialData={selectedRecord}
        mode={modalMode}
      />
    </div>
  );
}

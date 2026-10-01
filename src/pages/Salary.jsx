import { useState, useEffect } from 'react';
import { toast } from "react-hot-toast";
import { useConfirm } from "../components/ConfirmProvider";
import { Plus, Edit2, Trash2, Eye, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import Pagination from '../components/Pagination';
import SalaryModal from '../components/SalaryModal';


const AttendanceCalendarModal = ({ isOpen, onClose, staffName }) => {
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (!isOpen || !staffName) return;
    const fetchDates = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('admin_token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const res = await fetch(`${apiUrl}/staff-attendance?name=${encodeURIComponent(staffName)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setDates(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDates();
  }, [isOpen, staffName]);

  if (!isOpen) return null;

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const presentSet = new Set(dates);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
        <h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-white">Attendance</h3>
        <p className="text-sm text-gray-500 mb-4">{staffName}</p>
        
        {loading ? (
          <div className="h-48 flex items-center justify-center text-gray-400">Loading...</div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shadow-sm"><ChevronLeft className="w-5 h-5" /></button>
                <div className="font-semibold">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
                <button onClick={handleNextMonth} className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shadow-sm"><ChevronRight className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="text-xs font-bold text-gray-400">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isPresent = presentSet.has(dateStr);
                    return (
                        <div key={day} className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm ${isPresent ? 'bg-emerald-500 text-white font-bold' : 'text-gray-600 dark:text-gray-300'}`}>
                            {day}
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div> Present</div>
                <div className="text-gray-500 font-medium">Total: {dates.filter(d => d.startsWith(`${currentMonth.getFullYear()}-${String(currentMonth.getMonth()+1).padStart(2,'0')}`)).length} days this month</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Salary() {
  const confirm = useConfirm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [isCalModalOpen, setIsCalModalOpen] = useState(false);
  const [calStaffName, setCalStaffName] = useState('');


  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchSalaries = async (page = 1, search = '') => {
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${apiUrl}/staff-salaries?page=${page}&search=${search}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setSalaries(data.data);
          setPagination(data);
        } else {
          setSalaries(data);
          setPagination(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch staff salaries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch]);

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
    if (!await confirm('Are you sure you want to delete this record?')) {
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
          <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white uppercase">STAFF SALARY</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Manage all staff salary details</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search salaries..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button 
              onClick={() => handleOpenModal('create')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-600/20 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Add Record
            </button>
        </div>
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
              ) : (!salaries || salaries.length === 0) ? (
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
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                          <span className="text-gray-700 dark:text-gray-300">{record.total_working_day}</span>
                          <button onClick={() => { setCalStaffName(record.name); setIsCalModalOpen(true); }} className="text-blue-500 hover:text-blue-600 bg-blue-50 dark:bg-blue-900/30 p-1.5 rounded-lg transition-colors" title="View Calendar">
                              <CalendarIcon className="w-4 h-4" />
                          </button>
                      </div>
                    </td>
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
      <Pagination pagination={pagination} onPageChange={setCurrentPage} />
      <SalaryModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSuccess={handleSuccess}
        initialData={selectedRecord}
        mode={modalMode}
      />
      <AttendanceCalendarModal 
        isOpen={isCalModalOpen} 
        onClose={() => setIsCalModalOpen(false)} 
        staffName={calStaffName} 
      />

    </div>
  );
}

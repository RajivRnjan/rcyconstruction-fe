import { useState, useEffect } from 'react';
import { toast } from "react-hot-toast";
import { useConfirm } from "../components/ConfirmProvider";
import { Plus, Edit2, Trash2, Eye, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import Pagination from '../components/Pagination';
import SupplierModal from '../components/SupplierModal';
import SupplierTransactionModal from '../components/SupplierTransactionModal';


const SupplierPaymentCalendarModal = ({ isOpen, onClose, supplierName }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (!isOpen || !supplierName) return;
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('admin_token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const res = await fetch(`${apiUrl}/supplier-payments?name=${encodeURIComponent(supplierName)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setPayments(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [isOpen, supplierName]);

  if (!isOpen) return null;

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  // Map of date string to total amount paid on that date
  const paymentMap = {};
  payments.forEach(p => {
    paymentMap[p.date] = (paymentMap[p.date] || 0) + parseFloat(p.amount);
  });

  const monthPayments = payments.filter(p => p.date.startsWith(`${currentMonth.getFullYear()}-${String(currentMonth.getMonth()+1).padStart(2,'0')}`));
  const totalMonthAmount = monthPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
        <h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-white">Payments</h3>
        <p className="text-sm text-gray-500 mb-4">{supplierName}</p>
        
        {loading ? (
          <div className="h-48 flex items-center justify-center text-gray-400">Loading...</div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-100 transition-colors shadow-sm"><ChevronLeft className="w-5 h-5" /></button>
                <div className="font-semibold">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
                <button onClick={handleNextMonth} className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-100 transition-colors shadow-sm"><ChevronRight className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="text-xs font-bold text-gray-400">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-4">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const amount = paymentMap[dateStr];
                    return (
                        <div key={day} className={`w-10 h-10 mx-auto flex flex-col items-center justify-center rounded text-xs ${amount ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800' : 'text-gray-600 dark:text-gray-300'}`}>
                            <span>{day}</span>
                            {amount && <span className="text-[9px] leading-tight mt-0.5" title={`₹${amount}`}>₹{(amount/1000).toFixed(1)}k</span>}
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm">
                <div className="text-gray-500 font-medium">Monthly Total:</div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400">₹{totalMonthAmount.toLocaleString()}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Supplier() {
  const confirm = useConfirm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [isCalModalOpen, setIsCalModalOpen] = useState(false);
  const [calSupplierName, setCalSupplierName] = useState('');


  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchSuppliers = async (page = 1, search = '') => {
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${apiUrl}/suppliers?page=${page}&search=${search}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setSuppliers(data.data);
          setPagination(data);
        } else {
          setSuppliers(data);
          setPagination(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch]);

  const handleSuccess = () => {
    fetchSuppliers();
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
    if (!await confirm('Are you sure you want to delete this supplier?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${apiUrl}/suppliers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        fetchSuppliers();
      } else {
        toast('Failed to delete supplier');
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast('Error deleting supplier');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white uppercase">SUPPLIERS</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Manage supplier details</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name, GST..." 
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
              Add Supplier
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xl transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-gray-950/50 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Supplier Name</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Contact Number</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">GST Number</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Address</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-center">Total Paid</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 transition-colors duration-300">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading data...</td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No records found. Click "Add Supplier" to create one.</td>
                </tr>
              ) : (
                suppliers.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{record.name}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{record.contact_number || '-'}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{record.gst_number || '-'}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 max-w-[200px] truncate">{record.address || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹{parseFloat(record.total_paid || 0).toLocaleString()}</span>
                          <button onClick={() => { setCalSupplierName(record.name); setIsCalModalOpen(true); }} className="text-blue-500 hover:text-blue-600 bg-blue-50 dark:bg-blue-900/30 p-1.5 rounded-lg transition-colors" title="View Payments">
                              <CalendarIcon className="w-4 h-4" />
                          </button>
                      </div>
                    </td>
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


      <SupplierTransactionModal
        isOpen={isLedgerModalOpen}
        onClose={() => { setIsLedgerModalOpen(false); fetchSuppliers(); }}
        supplier={selectedRecord}
      />
      <SupplierPaymentCalendarModal isOpen={isCalModalOpen} onClose={() => setIsCalModalOpen(false)} supplierName={calSupplierName} />
      <SupplierModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSuccess={handleSuccess}
        initialData={selectedRecord}
        mode={modalMode}
      />
    </div>
  );
}

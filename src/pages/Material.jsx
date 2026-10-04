import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download } from 'lucide-react';
import { toast } from "react-hot-toast";
import { useConfirm } from "../components/ConfirmProvider";
import { Plus, Edit2, Trash2, Eye, Search } from 'lucide-react';
import Pagination from '../components/Pagination';
import MaterialModal from '../components/MaterialModal';

export default function Material() {
  const confirm = useConfirm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  
  const handleExport = async (type) => {
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      const res = await fetch(`${apiUrl}/materials?all=true`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      
      const flatData = data.map(m => ({
          'Material Name': m.name,
          'Unit': m.unit || '-',
          'Description': m.description || '-'
      }));
      
      if (type === 'excel') {
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(flatData), "Materials List");
          XLSX.writeFile(wb, "Materials_List.xlsx");
      } else if (type === 'pdf') {
          const doc = new jsPDF();
          doc.text("Materials List", 14, 15);
          autoTable(doc, {
              startY: 20,
              head: [['Material Name', 'Unit', 'Description']],
              body: flatData.map(d => [d['Material Name'], d.Unit, d.Description]),
              theme: 'grid', styles: { fontSize: 9 }
          });
          doc.save("Materials_List.pdf");
      }
    } catch (e) {
      console.error(e);
      toast.error("Export failed");
    }
  };
useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchMaterials = async (page = 1, search = '') => {
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${apiUrl}/materials?page=${page}&search=${search}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setMaterials(data.data);
          setPagination(data);
        } else {
          setMaterials(data);
          setPagination(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch materials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch]);

  const handleSuccess = () => {
    fetchMaterials();
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
    if (!await confirm('Are you sure you want to delete this material?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${apiUrl}/materials/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        fetchMaterials();
      } else {
        toast('Failed to delete material');
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      toast('Error deleting material');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search materials..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
              <button onClick={() => handleExport('excel')} className="flex-1 sm:flex-none bg-green-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20 text-sm font-medium whitespace-nowrap">
                  <Download className="w-4 h-4" /> Excel
              </button>
              <button onClick={() => handleExport('pdf')} className="flex-1 sm:flex-none bg-red-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 text-sm font-medium whitespace-nowrap">
                  <Download className="w-4 h-4" /> PDF
              </button>
              <button 
                onClick={() => handleOpenModal('create')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-600/20 whitespace-nowrap font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Material
              </button>
            </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xl transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-gray-950/50 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Material Name</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Unit</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Description</th>
                <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 transition-colors duration-300">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">Loading data...</td>
                </tr>
              ) : (!materials || materials.length === 0) ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No records found. Click "Add Material" to create one.</td>
                </tr>
              ) : (
                materials.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{record.name}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs font-medium uppercase">
                        {record.unit || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 max-w-[250px] truncate">{record.description || '-'}</td>
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

      <MaterialModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSuccess={handleSuccess}
        initialData={selectedRecord}
        mode={modalMode}
      />
    </div>
  );
}

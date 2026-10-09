import React, { useState, useEffect } from 'react';
import { X, Edit2, Trash2, Calendar, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';
import { useConfirm } from './ConfirmProvider';

export default function SubcontractorHistoryModal({ name, onClose, onEdit }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const confirm = useConfirm();

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const res = await fetch(`${apiUrl}/subcontractors/${encodeURIComponent(name)}/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  
  const handleExport = (type) => {
    if (history.length === 0) return;
    
    let totalLabour = 0;
    let totalAmount = 0;
    
    const flatData = history.map(h => {
        const lCount = parseFloat(h.no_of_labour) || 0;
        const amt = parseFloat(h.amount) || 0;
        totalLabour += lCount;
        totalAmount += amt;
        return {
            'Date': h.date || '-',
            'Site': h.site?.name || '-',
            'Labour Count': lCount,
            'Amount': amt,
            'Work Details': h.work_details || '-'
        };
    });

    flatData.push({
        'Date': 'TOTAL',
        'Site': '',
        'Labour Count': totalLabour,
        'Amount': totalAmount,
        'Work Details': ''
    });
    
    if (type === 'excel') {
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(flatData), "History");
        XLSX.writeFile(wb, `${name}_History.xlsx`);
    } else if (type === 'pdf') {
        const doc = new jsPDF();
        doc.text(`History for ${name}`, 14, 15);
        autoTable(doc, {
            startY: 20,
            head: [['Date', 'Site', 'Labour Count', 'Amount', 'Work Details']],
            body: flatData.map(d => [d['Date'], d['Site'], d['Labour Count'], d['Amount'], d['Work Details']]),
            theme: 'grid', styles: { fontSize: 9 }
        });
        doc.save(`${name}_History.pdf`);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [name]);

  const handleDelete = async (id) => {
    if (await confirm('Are you sure you want to delete this record?')) {
      try {
        const token = localStorage.getItem('admin_token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        const res = await fetch(`${apiUrl}/subcontractors/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          toast.success('Record deleted successfully');
          fetchHistory();
        } else {
          toast.error('Failed to delete record');
        }
      } catch (error) {
        toast.error('Error deleting record');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">History for {name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">All dates and amounts</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-300 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 dark:bg-gray-900/30">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No history found.</div>
          ) : (
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 dark:bg-gray-950/50 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Date</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Site</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Labour Count</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Work Details</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {history.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3 text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {record.date || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white max-w-[150px] truncate">{record.site?.name || '-'}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{record.no_of_labour}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{record.amount}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-[200px] truncate" title={record.work_details}>{record.work_details || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => onEdit(record)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(record.id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {history.length > 0 && (
                  <tfoot className="bg-gray-50/80 dark:bg-gray-800/80 border-t-2 border-gray-200 dark:border-gray-700">
                    <tr>
                      <td colSpan="2" className="px-6 py-4 font-bold text-gray-900 dark:text-white uppercase text-right">TOTAL</td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                        {history.reduce((sum, h) => sum + (parseFloat(h.no_of_labour) || 0), 0)}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                        {history.reduce((sum, h) => sum + (parseFloat(h.amount) || 0), 0).toFixed(2)}
                      </td>
                      <td colSpan="2"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

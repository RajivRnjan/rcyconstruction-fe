import ConfirmModal from './ConfirmModal';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Trash2 } from 'lucide-react';

export default function SiteInchargeHistoryModal({ isOpen, onClose, inchargeName }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  useEffect(() => {
    if (isOpen && inchargeName) {
      fetchHistory();
    }
  }, [isOpen, inchargeName]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/site-incharges-history/${encodeURIComponent(inchargeName)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setHistory(await response.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const executeDelete = async (id) => {
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/site-incharges/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchHistory();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h2 className="text-xl font-bold dark:text-white">{inchargeName} - History</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          {loading ? <p>Loading...</p> : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-gray-950/50">
                <tr>
                  <th className="px-6 py-4 dark:text-gray-300">Date</th>
                  <th className="px-6 py-4 dark:text-gray-300">Opening Bal</th>
                  <th className="px-6 py-4 dark:text-gray-300">Credit</th>
                  <th className="px-6 py-4 dark:text-gray-300">Account</th>
                  <th className="px-6 py-4 dark:text-gray-300">Remark</th>
                  <th className="px-6 py-4 dark:text-gray-300">Expense</th>
                  <th className="px-6 py-4 dark:text-gray-300">Balance</th>
                  <th className="px-6 py-4 dark:text-gray-300">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {history.map(record => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 dark:text-white">{record.date || '-'}</td>
                    <td className="px-6 py-4 dark:text-gray-300">₹{record.opening_bal}</td>
                    <td className="px-6 py-4 text-green-500">₹{record.credit}</td>
                    <td className="px-6 py-4 dark:text-gray-300">{record.account_name || '-'}</td>
                    <td className="px-6 py-4 dark:text-gray-300 max-w-[150px] truncate" title={record.remark}>{record.remark || '-'}</td>
                    <td className="px-6 py-4 text-red-500">₹{record.exp}</td>
                    <td className="px-6 py-4 text-blue-500">₹{record.balance}</td>
                    <td className="px-6 py-4">
                      {record.is_manual && (<button onClick={() => { setRecordToDelete(record.id); setIsConfirmOpen(true); }} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <ConfirmModal 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={() => executeDelete(recordToDelete)} 
        message="Are you sure you want to delete this specific entry?"
      />
    </div>,
    document.body
  );
}

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calculator } from 'lucide-react';

export default function AccountHistoryModal({ isOpen, onClose, accountDetails, accountId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && accountId) {
      const fetchHistory = async () => {
        setLoading(true);
        const token = localStorage.getItem('admin_token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        try {
          const res = await fetch(`${apiUrl}/accounts/${accountId}/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setHistory(data);
          }
        } catch (e) {
          console.error('Failed to fetch history', e);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [isOpen, accountId]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 transition-colors duration-300" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col relative transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 rounded-t-2xl z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wide">
            {accountDetails} - Ledger History
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No transactions found.</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Date</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Type</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Description</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-right whitespace-nowrap">Receipt (In)</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-right whitespace-nowrap">Payment (Out)</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {history.map(record => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-6 py-4 dark:text-white whitespace-nowrap">{record.date || '-'}</td>
                    <td className="px-6 py-4 dark:text-gray-300 whitespace-nowrap">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">{record.type}</span>
                    </td>
                    <td className="px-6 py-4 dark:text-gray-300 max-w-[200px] truncate" title={record.description}>{record.description || '-'}</td>
                    <td className="px-6 py-4 text-right text-green-500 font-medium">{record.receipt > 0 ? `₹${record.receipt}` : '-'}</td>
                    <td className="px-6 py-4 text-right text-red-500 font-medium">{record.payment > 0 ? `₹${record.payment}` : '-'}</td>
                    <td className="px-6 py-4 text-right text-blue-500 font-bold">₹{record.balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

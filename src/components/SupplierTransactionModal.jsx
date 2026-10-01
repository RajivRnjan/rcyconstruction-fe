import React, { useState, useEffect } from 'react';
import { X, Plus, Calculator } from 'lucide-react';
import ReactDOM from 'react-dom';

export default function SupplierTransactionModal({ isOpen, onClose, supplier }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    invoice_no: '',
    payment: '',
    invoice_amount: ''
  });
  
  const fetchTransactions = async () => {
    if (!supplier) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${apiUrl}/suppliers/${supplier.id}/transactions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTransactions();
    }
  }, [isOpen, supplier]);

  if (!isOpen || !supplier) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateNewBalance = () => {
    const payment = parseFloat(formData.payment || 0);
    const invoiceAmt = parseFloat(formData.invoice_amount || 0);
    const currentOutstanding = parseFloat(supplier.outstanding_amount || 0);
    return currentOutstanding + invoiceAmt - payment;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${apiUrl}/suppliers/${supplier.id}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to save transaction');
      }

      setFormData({
        date: new Date().toISOString().split('T')[0],
        invoice_no: '',
        payment: '',
        invoice_amount: ''
      });
      setShowForm(false);
      
      fetchTransactions();
      supplier.outstanding_amount = calculateNewBalance();
      
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors duration-300" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl relative flex flex-col max-h-[90vh] transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white/90 dark:bg-gray-900/90 rounded-t-2xl sticky top-0 z-10 transition-colors duration-300">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Supplier Ledger: {supplier.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Current Outstanding: <span className={supplier.outstanding_amount > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400 font-medium'}>₹{parseFloat(supplier.outstanding_amount || 0).toFixed(2)}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowForm(!showForm)} 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              {showForm ? 'Cancel Entry' : 'Add Entry'}
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-red-600 dark:text-red-500 text-sm">
              {error}
            </div>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-inner">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-500" />
                New Transaction Entry
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Invoice No (Optional)</label>
                  <input
                    type="text"
                    name="invoice_no"
                    value={formData.invoice_no}
                    onChange={handleChange}
                    placeholder="Enter Invoice No"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Made</label>
                  <input
                    type="number"
                    name="payment"
                    step="0.01"
                    value={formData.payment}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Invoice Amount</label>
                  <input
                    type="number"
                    name="invoice_amount"
                    step="0.01"
                    value={formData.invoice_amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  New Balance: <span className="font-semibold text-gray-900 dark:text-white">₹{calculateNewBalance().toFixed(2)}</span>
                </div>
                <button 
                  type="submit"
                  disabled={loading || (!formData.payment && !formData.invoice_amount)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </form>
          )}

          {loading && !showForm ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <th className="px-6 py-4 font-semibold">Sl. No</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Invoice No</th>
                    <th className="px-6 py-4 font-semibold text-right">Outstanding Bal</th>
                    <th className="px-6 py-4 font-semibold text-right text-green-600 dark:text-green-400">Payment</th>
                    <th className="px-6 py-4 font-semibold text-right text-red-600 dark:text-red-400">Invoice Amount</th>
                    <th className="px-6 py-4 font-semibold text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                        No transactions found for this supplier.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((txn, index) => (
                      <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{transactions.length - index}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{txn.date ? new Date(txn.date).toLocaleDateString('en-IN') : '-'}</td>
                        <td className="px-6 py-4 text-sm font-medium text-blue-600 dark:text-blue-400">{txn.invoice_no || '-'}</td>
                        <td className="px-6 py-4 text-sm text-right text-gray-500 dark:text-gray-400">₹{parseFloat(txn.outstanding_balance).toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm text-right font-medium text-green-600 dark:text-green-400">{txn.payment > 0 ? `₹${parseFloat(txn.payment).toFixed(2)}` : '-'}</td>
                        <td className="px-6 py-4 text-sm text-right font-medium text-red-600 dark:text-red-400">{txn.invoice_amount > 0 ? `₹${parseFloat(txn.invoice_amount).toFixed(2)}` : '-'}</td>
                        <td className="px-6 py-4 text-sm text-right font-bold text-gray-900 dark:text-white">₹{parseFloat(txn.balance).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}

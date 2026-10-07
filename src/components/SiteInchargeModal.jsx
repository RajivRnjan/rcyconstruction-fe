import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calculator } from 'lucide-react';
import SearchableSelect from './SearchableSelect';

export default function SiteInchargeModal({ isOpen, onClose, onSuccess, initialData = null, mode = 'create' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [sites, setSites] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccData, setNewAccData] = useState({
    account_details: '',
    opening_balance: '',
    receipt_amount: '',
    payment_amount: '',
    details: ''
  });

  const handleNewAccChange = (e) => {
    setNewAccData({ ...newAccData, [e.target.name]: e.target.value });
  };

  const submitNewAccount = async () => {
    if (!newAccData.account_details.trim()) return;
    setIsAddingAccount(true);
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const res = await fetch(`${apiUrl}/accounts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(newAccData)
      });
      if (res.ok) {
        const data = await res.json();
        const newAcc = data.data;
        setAccounts(prev => [...prev, newAcc]);
        setFormData(prev => ({ ...prev, account_id: newAcc.id }));
        setIsAccountModalOpen(false);
        setNewAccData({
          account_details: '',
          opening_balance: '',
          receipt_amount: '',
          payment_amount: '',
          details: ''
        });
      } else {
        console.error('Failed to add account');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAddingAccount(false);
    }
  };


  
  
  const [formData, setFormData] = useState({
    date: '',
    
    name: '',
    opening_bal: '',
    credit: '',
    account_id: '', remark: '',
    exp: '',
  });

  // Fetch dropdown data
  useEffect(() => {
    if (isOpen) {
      const fetchDropdownData = async () => {
        const token = localStorage.getItem('admin_token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        
        try {
          const siteRes = await fetch(`${apiUrl}/sites?all=1`, { headers: { 'Authorization': `Bearer ${token}` } });
          const accRes = await fetch(`${apiUrl}/accounts?all=1`, { headers: { 'Authorization': `Bearer ${token}` } });
          if (siteRes.ok) setSites(await siteRes.json());
          if (accRes.ok) setAccounts(await accRes.json());
        } catch (err) {
          console.error("Failed to fetch master data", err);
        }
      };
      fetchDropdownData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialData && (mode === 'edit' || mode === 'view' || mode === 'add_entry')) {
        setFormData({
          date: mode === 'add_entry' ? new Date().toISOString().split('T')[0] : (initialData.date || ''),
          site_id: initialData.site_id || '',
          name: initialData.name || '',
          opening_bal: mode === 'add_entry' ? 0 : (initialData.opening_bal || ''),
          credit: mode === 'add_entry' ? '' : (initialData.credit || ''),
          account_id: mode === 'add_entry' ? '' : (initialData.account_id || ''), remark: mode === 'add_entry' ? '' : (initialData.remark || ''),
          exp: mode === 'add_entry' ? '' : (initialData.exp || ''),
        });
      } else {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          site_id: initialData?.site_id || '',
          name: '',
          opening_bal: '',
          credit: '',
          account_id: '', remark: '',
          exp: '',
        });
      }
      setError('');
    }
  }, [isOpen, initialData, mode]);

  if (!isOpen) return null;

  const isView = mode === 'view';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateBalance = () => {
    const opening = parseFloat(formData.opening_bal) || 0;
    const credit = parseFloat(formData.credit) || 0;
    const exp = parseFloat(formData.exp) || 0;
    return opening + credit - exp;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView) return;
    
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      const url = mode === 'edit' ? `${apiUrl}/site-incharges/${initialData.id}` : `${apiUrl}/site-incharges`;
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save record');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 transition-colors duration-300" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar relative transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur z-10 transition-colors duration-300">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {mode === 'create' && 'Add Site Incharge Record'}
            {mode === 'edit' && 'Edit Site Incharge Record'}
            {mode === 'view' && 'View Site Incharge Record'}
            {mode === 'add_entry' && 'Add Amount Entry'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-red-600 dark:text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
              <input
                type="date"
                name="date"
                disabled={isView}
                value={formData.date}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white ${isView ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
            </div>

            


            <div className="sm:col-span-2">
              <div className="flex justify-between items-center mb-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account</label><button type="button" onClick={() => setIsAccountModalOpen(true)} className="text-blue-600 hover:text-blue-700 text-xs font-medium">+ Add Account</button></div>
              <select
                name="account_id"
                disabled={isView}
                value={formData.account_id}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white ${isView ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <option value="">Select Account</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.account_details || a.name}</option>
                ))}
              </select>
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Remark</label>
              <input
                type="text"
                name="remark"
                disabled={isView}
                value={formData.remark}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white ${isView ? 'opacity-70 cursor-not-allowed' : ''}`}
                placeholder="Enter remark..."
              />
            </div>


{mode !== 'add_entry' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Site Incharge Name *</label>
              <input
                type="text"
                name="name"
                required
                disabled={isView || mode === 'add_entry'}
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white ${isView ? 'opacity-70 cursor-not-allowed' : ''}`}
                placeholder="Enter Name"
              />
            </div>
)}

{mode !== 'add_entry' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Opening Bal</label>
              <input
                type="number"
                name="opening_bal"
                step="0.01"
                disabled={isView || mode === 'add_entry'}
                value={formData.opening_bal}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white ${isView ? 'opacity-70 cursor-not-allowed' : ''}`}
                placeholder="0.00"
              />
            </div>
)}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{mode === 'add_entry' ? 'Amount Given' : 'Credit'}</label>
              <input
                type="number"
                name="credit"
                step="0.01"
                disabled={isView}
                value={formData.credit}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white ${isView ? 'opacity-70 cursor-not-allowed' : ''}`}
                placeholder="0.00"
              />
            </div>


{mode !== 'add_entry' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Exp (Expense)</label>
              <input
                type="number"
                name="exp"
                step="0.01"
                disabled={isView}
                value={formData.exp}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white ${isView ? 'opacity-70 cursor-not-allowed' : ''}`}
                placeholder="0.00"
              />
            </div>
)}
          </div>

          {/* Auto-calculated Balance */}
          {mode !== 'add_entry' && (<div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-800/50 p-2 rounded-lg">
                <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Calculated Balance</p>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">Opening + Credit - Expense</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                ₹{calculateBalance().toFixed(2)}
              </span>
            </div>
          </div>)}

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
            >
              {isView ? 'Close' : 'Cancel'}
            </button>
            {!isView && (
              <button 
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Record'}
              </button>
            )}
          </div>
        </form>

      


      {isAccountModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Account Record</h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Details *</label>
                <input 
                  type="text" name="account_details" autoFocus
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="e.g. 123, 456, CASH"
                  value={newAccData.account_details}
                  onChange={handleNewAccChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Opening Balance</label>
                <input 
                  type="number" name="opening_balance"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={newAccData.opening_balance} onChange={handleNewAccChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Receipt Amount</label>
                <input 
                  type="number" name="receipt_amount"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={newAccData.receipt_amount} onChange={handleNewAccChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Amount</label>
                <input 
                  type="number" name="payment_amount"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={newAccData.payment_amount} onChange={handleNewAccChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Balance (Auto-Calculated)</label>
                <div className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-green-500 font-medium">
                  ₹{ (parseFloat(newAccData.opening_balance||0) + parseFloat(newAccData.receipt_amount||0) - parseFloat(newAccData.payment_amount||0)).toFixed(2) }
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Details</label>
                <textarea 
                  name="details" rows="3"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={newAccData.details} onChange={handleNewAccChange}
                ></textarea>
              </div>

            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setIsAccountModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                disabled={isAddingAccount}
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={submitNewAccount}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                disabled={isAddingAccount || !newAccData.account_details.trim()}
              >
                {isAddingAccount ? 'Saving...' : 'Save Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>,
    document.body
  );
}

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import SearchableSelect from './SearchableSelect';

export default function HeadOfficeIncomeModal({ isOpen, onClose, onSuccess, initialData = null, mode = 'create' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [projects, setProjects] = useState([]);
  const [accounts, setAccounts] = useState([]);
  
  const paymentModes = [
    { value: 'Cash', label: 'Cash' },
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'Cheque', label: 'Cheque' },
    { value: 'UPI', label: 'UPI' },
    { value: 'Other', label: 'Other' }
  ];

  const [formData, setFormData] = useState({
    date: '',
    project_id: '',
    client_name: '',
    mode_of_payment: '',
    account_id: '',
    amount: '',
    remarks: ''
  });

  useEffect(() => {
    if (isOpen) {
      const fetchDropdownData = async () => {
        const token = localStorage.getItem('admin_token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        
        try {
          const [projRes, accRes] = await Promise.all([
            fetch(`${apiUrl}/master-sheets`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${apiUrl}/accounts`, { headers: { 'Authorization': `Bearer ${token}` } })
          ]);
          
          if (projRes.ok) setProjects(await projRes.json());
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
      if (initialData && (mode === 'edit' || mode === 'view')) {
        setFormData({
          date: initialData.date || '',
          project_id: initialData.project_id || '',
          client_name: initialData.client_name || '',
          mode_of_payment: initialData.mode_of_payment || '',
          account_id: initialData.account_id || '',
          amount: initialData.amount || '',
          remarks: initialData.remarks || ''
        });
      } else {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          project_id: '',
          client_name: '',
          mode_of_payment: '',
          account_id: '',
          amount: '',
          remarks: ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView) return;
    
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      const url = mode === 'edit' ? `${apiUrl}/head-office-incomes/${initialData.id}` : `${apiUrl}/head-office-incomes`;
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

  return (
    <div className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-colors duration-300" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar relative transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur z-10 transition-colors duration-300">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {mode === 'create' && 'Add Head Office Income'}
            {mode === 'edit' && 'Edit Head Office Income'}
            {mode === 'view' && 'View Head Office Income'}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Name *</label>
              <SearchableSelect
                name="project_id"
                required={true}
                disabled={isView}
                value={formData.project_id}
                onChange={(val) => setFormData({ ...formData, project_id: val })}
                options={projects.map(p => ({ value: p.id, label: p.project_name }))}
                placeholder="Select Project"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Client Name</label>
              <input
                type="text"
                name="client_name"
                disabled={isView}
                value={formData.client_name}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white ${isView ? 'opacity-70 cursor-not-allowed' : ''}`}
                placeholder="Enter client name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mode of Payment</label>
              <SearchableSelect
                name="mode_of_payment"
                disabled={isView}
                value={formData.mode_of_payment}
                onChange={(val) => setFormData({ ...formData, mode_of_payment: val })}
                options={paymentModes}
                placeholder="Select Mode"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account *</label>
              <SearchableSelect
                name="account_id"
                required={true}
                disabled={isView}
                value={formData.account_id}
                onChange={(val) => setFormData({ ...formData, account_id: val })}
                options={accounts.map(a => ({ value: a.id, label: a.account_details }))}
                placeholder="Select Account"
              />
            </div>

            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount *</label>
              <input
                type="number"
                step="0.01"
                required
                name="amount"
                disabled={isView}
                value={formData.amount}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white font-medium ${isView ? 'opacity-70 cursor-not-allowed' : ''}`}
                placeholder="0.00"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Remarks</label>
              <textarea
                name="remarks"
                disabled={isView}
                value={formData.remarks}
                onChange={handleChange}
                rows={2}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white ${isView ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>

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
      </div>
    </div>
  );
}

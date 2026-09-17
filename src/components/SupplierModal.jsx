import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function SupplierModal({ isOpen, onClose, onSuccess, initialData = null, mode = 'create' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    contact_number: '',
    gst_number: '',
    address: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData && (mode === 'edit' || mode === 'view')) {
        setFormData({
          name: initialData.name || '',
          contact_number: initialData.contact_number || '',
          gst_number: initialData.gst_number || '',
          address: initialData.address || ''
        });
      } else {
        setFormData({
          name: '',
          contact_number: '',
          gst_number: '',
          address: ''
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
      
      const url = mode === 'edit' ? `${apiUrl}/suppliers/${initialData.id}` : `${apiUrl}/suppliers`;
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
        throw new Error(data.message || 'Failed to save supplier');
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
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-lg relative transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center transition-colors duration-300">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {mode === 'create' && 'Add Supplier'}
            {mode === 'edit' && 'Edit Supplier'}
            {mode === 'view' && 'View Supplier'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-red-600 dark:text-red-500 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Supplier Name *</label>
            <input
              type="text"
              name="name"
              required
              disabled={isView}
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white ${isView ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Number</label>
            <input
              type="text"
              name="contact_number"
              disabled={isView}
              value={formData.contact_number}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white ${isView ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">GST Number</label>
            <input
              type="text"
              name="gst_number"
              disabled={isView}
              value={formData.gst_number}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white ${isView ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
            <textarea
              name="address"
              disabled={isView}
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white ${isView ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
          </div>

          <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
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
                {loading ? 'Saving...' : 'Save Supplier'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

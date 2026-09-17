import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

import SearchableSelect from './SearchableSelect';

export default function MaterialInModal({ isOpen, onClose, onSuccess, initialData = null, mode = 'create' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [suppliers, setSuppliers] = useState([]);
  const [materials, setMaterials] = useState([]);
  
  const [formData, setFormData] = useState({
    date: '',
    supplier_id: '',
    material_id: '',
    unit: '',
    qnty: '',
    rate: ''
  });

  // Fetch dropdown data
  useEffect(() => {
    if (isOpen) {
      const fetchDropdownData = async () => {
        const token = localStorage.getItem('admin_token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        
        try {
          const [supRes, matRes] = await Promise.all([
            fetch(`${apiUrl}/suppliers`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${apiUrl}/materials`, { headers: { 'Authorization': `Bearer ${token}` } })
          ]);
          
          if (supRes.ok) setSuppliers(await supRes.json());
          if (matRes.ok) setMaterials(await matRes.json());
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
          supplier_id: initialData.supplier_id || '',
          material_id: initialData.material_id || '',
          unit: initialData.unit || '',
          qnty: initialData.qnty || '',
          rate: initialData.rate || ''
        });
      } else {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          supplier_id: '',
          material_id: '',
          unit: '',
          qnty: '',
          rate: ''
        });
      }
      setError('');
    }
  }, [isOpen, initialData, mode]);

  if (!isOpen) return null;

  const isView = mode === 'view';

  // Get selected material to show its unit if not overridden
  const handleMaterialChange = (val) => {
    const selected = materials.find(m => m.id.toString() === val?.toString());
    setFormData({ 
      ...formData, 
      material_id: val,
      unit: selected ? selected.unit : formData.unit
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateAmount = () => {
    const qnty = parseFloat(formData.qnty) || 0;
    const rate = parseFloat(formData.rate) || 0;
    return qnty * rate;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView) return;
    
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      const url = mode === 'edit' ? `${apiUrl}/material-ins/${initialData.id}` : `${apiUrl}/material-ins`;
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
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl relative transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center transition-colors duration-300">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {mode === 'create' && 'Add Material In'}
            {mode === 'edit' && 'Edit Material In'}
            {mode === 'view' && 'View Material In'}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Supplier *</label>
              <SearchableSelect
                name="supplier_id"
                required={true}
                disabled={isView}
                value={formData.supplier_id}
                onChange={(val) => setFormData({ ...formData, supplier_id: val })}
                options={suppliers.map(s => ({ value: s.id, label: s.name }))}
                placeholder="Select Supplier"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Material *</label>
              <SearchableSelect
                name="material_id"
                required={true}
                disabled={isView}
                value={formData.material_id}
                onChange={handleMaterialChange}
                options={materials.map(m => ({ value: m.id, label: m.name }))}
                placeholder="Select Material"
              />
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  name="qnty"
                  disabled={isView}
                  value={formData.qnty}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white ${isView ? 'opacity-70 cursor-not-allowed' : ''}`}
                />
              </div>
              <div className="w-24">
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">&nbsp;</label>
                 <input
                   type="text"
                   name="unit"
                   disabled={isView}
                   value={formData.unit}
                   onChange={handleChange}
                   placeholder="Unit"
                   className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white uppercase text-center text-sm ${isView ? 'opacity-70 cursor-not-allowed' : ''}`}
                 />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rate</label>
              <input
                type="number"
                step="0.01"
                name="rate"
                disabled={isView}
                value={formData.rate}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white ${isView ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount (Auto)</label>
              <div className="w-full px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-700 dark:text-blue-400 font-mono font-bold flex items-center h-[50px]">
                ₹{calculateAmount().toLocaleString()}
              </div>
            </div>
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
                {loading ? 'Saving...' : 'Save Record'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

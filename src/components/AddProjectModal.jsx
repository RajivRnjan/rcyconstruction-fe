import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2 } from 'lucide-react';

export default function AddProjectModal({ isOpen, onClose, onSuccess, initialData = null, mode = 'create' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    project_name: '',
    boq_name: '',
    site_exp: '',
    np: '',
    agreement_value: '',
    upto_date_bill_value: '',
    balance_work_value: ''
  });

  const [boqItems, setBoqItems] = useState([]);
  const [showBoqPopup, setShowBoqPopup] = useState(false);
  const [editBoqIndex, setEditBoqIndex] = useState(null);
  
  const [currentBoqItem, setCurrentBoqItem] = useState({
    item_name: '',
    est_qnt: '',
    unit: '',
    rate: '',
    work_done_qty: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData && (mode === 'edit' || mode === 'view')) {
        setFormData({
          project_name: initialData.project_name || '',
          boq_name: initialData.boq_name || '',
          site_exp: initialData.site_exp || '',
          np: initialData.np || '',
          agreement_value: initialData.agreement_value || '',
          upto_date_bill_value: initialData.upto_date_bill_value || '',
          balance_work_value: initialData.balance_work_value || ''
        });
        setBoqItems(initialData.boq_items || []);
      } else {
        setFormData({
          project_name: '',
          boq_name: '',
          site_exp: '',
          np: '',
          agreement_value: '',
          upto_date_bill_value: '',
          balance_work_value: ''
        });
        setBoqItems([]);
      }
      setError('');
    }
  }, [isOpen, initialData, mode]);

  if (!isOpen) return null;

  const isView = mode === 'view';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBoqChange = (e) => {
    setCurrentBoqItem({ ...currentBoqItem, [e.target.name]: e.target.value });
  };

  const handleAddBoqClick = () => {
    setCurrentBoqItem({
      item_name: '',
      est_qnt: '',
      unit: '',
      rate: '',
      work_done_qty: ''
    });
    setEditBoqIndex(null);
    setShowBoqPopup(true);
  };

  const handleEditBoqClick = (index) => {
    setCurrentBoqItem(boqItems[index]);
    setEditBoqIndex(index);
    setShowBoqPopup(true);
  };

  const saveBoqItem = () => {
    if (!currentBoqItem.item_name || !currentBoqItem.est_qnt || !currentBoqItem.rate || !currentBoqItem.work_done_qty) {
      alert("Please fill all required BOQ fields (Name, Est Qty, Rate, Work Done Qty)");
      return;
    }
    
    if (editBoqIndex !== null) {
      const newItems = [...boqItems];
      newItems[editBoqIndex] = currentBoqItem;
      setBoqItems(newItems);
    } else {
      setBoqItems([...boqItems, currentBoqItem]);
    }
    
    setCurrentBoqItem({
      item_name: '',
      est_qnt: '',
      unit: '',
      rate: '',
      work_done_qty: ''
    });
    setEditBoqIndex(null);
    setShowBoqPopup(false);
  };

  const removeBoqItem = (index) => {
    const newItems = [...boqItems];
    newItems.splice(index, 1);
    setBoqItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isView) return;
    
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      const payload = {
        ...formData,
        boq_items: boqItems
      };

      const url = mode === 'edit' ? `${apiUrl}/master-sheets/${initialData.id}` : `${apiUrl}/master-sheets`;
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save project');
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
            {mode === 'create' && 'Add New Project (Master Sheet)'}
            {mode === 'edit' && 'Edit Project'}
            {mode === 'view' && 'View Project Details'}
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Name *</label>
              <input
                type="text"
                name="project_name"
                required
                disabled={isView}
                value={formData.project_name}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white ${isView ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">BOQ Name</label>
              <input
                type="text"
                name="boq_name"
                disabled={isView}
                value={formData.boq_name}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white ${isView ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Agreement Value</label>
              <input
                type="number"
                name="agreement_value"
                disabled={isView}
                value={formData.agreement_value}
                onChange={handleChange}
                placeholder="Auto-calculated if BOQ items added"
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 ${isView ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upto Date Bill Value</label>
              <input
                type="number"
                name="upto_date_bill_value"
                disabled={isView}
                value={formData.upto_date_bill_value}
                onChange={handleChange}
                placeholder="Auto-calculated if BOQ items added"
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 ${isView ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Balance Work Value</label>
              <input
                type="number"
                name="balance_work_value"
                disabled={isView}
                value={formData.balance_work_value}
                onChange={handleChange}
                placeholder="Auto-calculated if BOQ items added"
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 ${isView ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Site Exp</label>
              <input
                type="number"
                name="site_exp"
                disabled={isView}
                value={formData.site_exp}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white ${isView ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">NP</label>
              <input
                type="number"
                name="np"
                disabled={isView}
                value={formData.np}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white ${isView ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {formData.boq_name ? `${formData.boq_name} Details` : 'BOQ Details'}
              </h3>
              {!isView && (
                <button 
                  type="button" 
                  onClick={handleAddBoqClick}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white rounded-lg transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" /> Add BOQ Item
                </button>
              )}
            </div>

            {boqItems.length > 0 ? (
              <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Sl No</th>
                      <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Item</th>
                      <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Est Qty</th>
                      <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Unit</th>
                      <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Rate</th>
                      <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Amount (Est)</th>
                      <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Work Done Qty</th>
                      <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {boqItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-3 text-gray-900 dark:text-white">{idx + 1}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">{item.item_name}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">{item.est_qnt}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">{item.unit}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">₹{item.rate}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">₹{item.est_qnt * item.rate}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">{item.work_done_qty}</td>
                        <td className="px-4 py-3">
                          {!isView && (
                            <div className="flex items-center gap-3">
                              <button 
                                type="button"
                                onClick={() => handleEditBoqClick(idx)}
                                className="text-gray-400 hover:text-amber-600 dark:hover:text-yellow-400 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                type="button"
                                onClick={() => removeBoqItem(idx)}
                                className="text-gray-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 dark:border-gray-800 rounded-xl">
                No BOQ items added yet. Click "Add BOQ Item" to add details.
              </div>
            )}
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
                {loading ? 'Saving...' : 'Save Master Sheet'}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Nested BOQ Modal */}
      {showBoqPopup && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 z-[60] flex items-center justify-center p-4 transition-colors duration-300" onClick={() => setShowBoqPopup(false)}>
          <div 
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl w-full max-w-lg transition-colors duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editBoqIndex !== null ? 'Edit BOQ Detail' : 'Add BOQ Detail'}
              </h3>
              <button onClick={() => setShowBoqPopup(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Name *</label>
                <input type="text" name="item_name" value={currentBoqItem.item_name} onChange={handleBoqChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Est Qty *</label>
                  <input type="number" name="est_qnt" value={currentBoqItem.est_qnt} onChange={handleBoqChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
                  <input type="text" name="unit" placeholder="e.g. m3" value={currentBoqItem.unit} onChange={handleBoqChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-400" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rate *</label>
                  <input type="number" name="rate" value={currentBoqItem.rate} onChange={handleBoqChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Work Done Qty *</label>
                  <input type="number" name="work_done_qty" value={currentBoqItem.work_done_qty} onChange={handleBoqChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white" />
                </div>
              </div>

              {/* Calculated Read-Only Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800 mt-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Amount (Est)</label>
                  <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-300 font-mono text-sm">
                    ₹{(parseFloat(currentBoqItem.est_qnt || 0) * parseFloat(currentBoqItem.rate || 0)).toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Amount (Done)</label>
                  <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-300 font-mono text-sm">
                    ₹{(parseFloat(currentBoqItem.work_done_qty || 0) * parseFloat(currentBoqItem.rate || 0)).toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Balance Qty</label>
                  <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-300 font-mono text-sm">
                    {(parseFloat(currentBoqItem.est_qnt || 0) - parseFloat(currentBoqItem.work_done_qty || 0)).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowBoqPopup(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</button>
                <button type="button" onClick={saveBoqItem} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white">
                  {editBoqIndex !== null ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

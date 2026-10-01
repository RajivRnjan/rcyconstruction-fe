import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
// { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function BOQItemModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    item_name: '',
    est_qnt: '',
    unit: '',
    rate: '',
    work_done_qty: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        item_name: '',
        est_qnt: '',
        unit: '',
        rate: '',
        work_done_qty: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const est = parseFloat(formData.est_qnt) || 0;
  const rate = parseFloat(formData.rate) || 0;
  const wd = parseFloat(formData.work_done_qty) || 0;
  
  const amountEst = est * rate;
  const amountDone = wd * rate;
  const balanceQty = est - wd;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 z-[60] flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] transition-colors duration-300">
        
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {initialData ? 'Edit BOQ Detail' : 'Add BOQ Detail'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Name *</label>
            <input 
              type="text" 
              required
              value={formData.item_name} 
              onChange={(e) => setFormData({...formData, item_name: e.target.value})} 
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" 
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Est Qty *</label>
              <input 
                type="number" 
                required
                value={formData.est_qnt} 
                onChange={(e) => setFormData({...formData, est_qnt: e.target.value})} 
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
              <input 
                type="text" 
                value={formData.unit} 
                onChange={(e) => setFormData({...formData, unit: e.target.value})} 
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" 
                placeholder="e.g. m3"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rate *</label>
              <input 
                type="number" 
                required
                value={formData.rate} 
                onChange={(e) => setFormData({...formData, rate: e.target.value})} 
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Work Done Qty *</label>
              <input 
                type="number" 
                required
                value={formData.work_done_qty} 
                onChange={(e) => setFormData({...formData, work_done_qty: e.target.value})} 
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" 
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Amount (Est)</label>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 font-medium">₹{amountEst.toFixed(2)}</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Amount (Done)</label>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 font-medium">₹{amountDone.toFixed(2)}</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Balance Qty</label>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 font-medium">{balanceQty.toFixed(2)}</div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors text-sm font-medium"
            >
              {initialData ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  , document.body);
}

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
// { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function SiteStaffModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    month: '',
    name: '',
    salary: '',
    prv_month_due_adv: '',
    total_working_day: '',
    current_month_salary: '',
    debit_amount: '',
    remark: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        month: '',
        name: '',
        salary: '',
        prv_month_due_adv: '',
        total_working_day: '',
        current_month_salary: '',
        debit_amount: '',
        remark: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

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
            {initialData ? 'Edit Staff Details' : 'Add Staff Details'}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month</label>
              <input type="month" value={formData.month} onChange={(e) => setFormData({...formData, month: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" placeholder="Staff name" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Base Salary *</label>
              <input type="number" required value={formData.salary} onChange={(e) => setFormData({...formData, salary: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prev. Month Due/Adv</label>
              <input type="number" value={formData.prv_month_due_adv} onChange={(e) => setFormData({...formData, prv_month_due_adv: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Working Days</label>
              <input type="number" step="0.5" value={formData.total_working_day} onChange={(e) => setFormData({...formData, total_working_day: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Month Salary</label>
              <input type="number" value={formData.current_month_salary} onChange={(e) => setFormData({...formData, current_month_salary: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Debit Amount</label>
              <input type="number" value={formData.debit_amount} onChange={(e) => setFormData({...formData, debit_amount: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remark</label>
              <input type="text" value={formData.remark} onChange={(e) => setFormData({...formData, remark: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors text-sm font-medium">{initialData ? 'Save Changes' : 'Add Staff'}</button>
          </div>
        </form>
      </div>
    </div>
  , document.body);
}

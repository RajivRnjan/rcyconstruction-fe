import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, Save, Plus, Trash2 } from 'lucide-react';

export default function DailyReport() {
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('id');
  const [sites, setSites] = useState([]);
  const [allSubcontractors, setAllSubcontractors] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffSalary, setNewStaffSalary] = useState('');
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [formData, setFormData] = useState({
    site_id: '',
    date: new Date().toISOString().split('T')[0],
    expenses: [
      { type: 'STAFF PAYMENT', amount: '' },
      { type: 'PARTY PAYMENT', amount: '' },
      { type: 'Site expenses', amount: '' }
    ],
    staff_attendance: [],
    subcontractors: [
      { name: '', no_of_labour: '', work_details: '' }
    ],
    material_in: [
      { supplier: '', material: '', unit: '', qnty: '', rate: '', amount: '' }
    ],
    material_out: [
      { expense_head: '', supplier: '', material: '', unit: '', qnty: '', rate: '', amount: '', paid: '', balance: '', remark: '' }
    ]
  });


  // Load existing report for editing
  useEffect(() => {
    if (reportId) {
      const fetchReport = async () => {
        try {
          const token = localStorage.getItem('admin_token');
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
          const res = await fetch(`${apiUrl}/daily-reports/${reportId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            const r = data.report;
            setFormData({
              site_id: r.site_id || '',
              date: r.date || new Date().toISOString().split('T')[0],
              staff_attendance: r.staff ? r.staff.map(s => ({ staff_id: s.staff_id, name: s.name, status: s.status })) : [],
              expenses: r.expenses && r.expenses.length > 0 ? r.expenses : [{ type: 'STAFF PAYMENT', amount: '' }, { type: 'PARTY PAYMENT', amount: '' }, { type: 'Site expenses', amount: '' }],
              subcontractors: r.subcontractors && r.subcontractors.length > 0 ? r.subcontractors : [{ name: '', no_of_labour: '', work_details: '' }],
              material_in: data.material_in && data.material_in.length > 0 ? data.material_in.map(m => ({
                  supplier: m.supplier_id || '', material: m.material ? m.material.name : '', qnty: m.qnty, rate: m.rate, amount: m.amount, unit: m.unit || ''
              })) : [{ supplier: '', material: '', unit: '', qnty: '', rate: '', amount: '' }],
              material_out: data.material_out && data.material_out.length > 0 ? data.material_out.map(m => ({
                  expense_head: m.expensesHead ? m.expensesHead.name : '', supplier: m.supplier_id || '', material: m.material ? m.material.name : '', qnty: m.qnty, rate: m.rate, amount: m.amount, paid: m.paid, balance: m.balance, remark: m.remark || ''
              })) : [{ expense_head: '', supplier: '', material: '', qnty: '', rate: '', amount: '', paid: '', balance: '', remark: '' }]
            });
          }
        } catch (e) {
          console.error("Failed to fetch report", e);
        }
      };
      fetchReport();
    }
  }, [reportId]);

  useEffect(() => {
    // Fetch sites for dropdown
    const fetchSites = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

        const [projRes, suppRes, matRes] = await Promise.all([
          fetch(`${apiUrl}/sites`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${apiUrl}/suppliers`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${apiUrl}/materials`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        if (projRes.ok) setSites(await projRes.json());
        if (suppRes.ok) setSuppliers(await suppRes.json());
        if (matRes.ok) setMaterialsList(await matRes.json());

      } catch (e) {
        console.error(e);
      }
    };
    fetchSites();
  }, []);


  // Sync staff from selected site to attendance form
  useEffect(() => {
    const site = sites.find(s => s.id.toString() === formData.site_id.toString());
    if (site && site.site_staff && site.site_staff.length > 0) {
      // Check if we already populated this site's staff to avoid overriding user input
      const currentStaffIds = formData.staff_attendance.map(a => a.staff_id);
      const siteStaffIds = site.site_staff.map(s => s.id);
      
      // If mismatch (meaning site changed), reset attendance
      if (currentStaffIds.join(',') !== siteStaffIds.join(',')) {
        setFormData(prev => ({
          ...prev,
          staff_attendance: site.site_staff.map(staff => ({
            staff_id: staff.id,
            name: staff.name,
            status: 'P' // default Present
          }))
        }));
      }
    } else if (formData.staff_attendance.length > 0) {
      setFormData(prev => ({ ...prev, staff_attendance: [] }));
    }

    // Sync subcontractors
    if (site && site.site_subcontractors && site.site_subcontractors.length > 0) {
      const currentSubNames = formData.subcontractors.map(s => s.name).filter(Boolean);
      const siteSubNames = site.site_subcontractors.map(s => s.name);
      
      // If we haven't loaded them yet or site changed
      if (currentSubNames.join(',') !== siteSubNames.join(',')) {
        setFormData(prev => ({
          ...prev,
          subcontractors: site.site_subcontractors.map(sub => ({
            name: sub.name,
            no_of_labour: '',
            work_details: ''
          }))
        }));
      }
    } else if (formData.subcontractors.length > 0 && formData.subcontractors[0].name !== '') {
      setFormData(prev => ({ ...prev, subcontractors: [{ name: '', no_of_labour: '', work_details: '' }] }));
    }
  }, [formData.site_id, sites]);


    // Filter subcontractors by selected site's project
  const currentSite = sites.find(s => s.id === parseInt(formData.site_id));
  const availableSubcontractorNames = Array.from(new Set(
    allSubcontractors
      .filter(s => s.project && currentSite && s.project.id === currentSite.project_id)
      .map(s => s.name)
      .filter(Boolean)
  ));

  const handleAddQuickStaff = () => {
    if (!formData.site_id) {
      alert("Please select a site first.");
      return;
    }
    setNewStaffName('');
    setNewStaffSalary('');
    setIsStaffModalOpen(true);
  };

  const submitNewStaff = async () => {
    const name = newStaffName.trim();
    if (!name) return;
    
    setIsAddingStaff(true);
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const res = await fetch(`${apiUrl}/sites/${formData.site_id}/staff`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ name: name.trim(), salary: newStaffSalary })
      });

      if (res.ok) {
        const newStaff = await res.json();
        // Add to current form data
        setFormData(prev => ({
          ...prev,
          staff_attendance: [...prev.staff_attendance, { staff_id: newStaff.id, name: newStaff.name, status: 'P' }]
        }));
        
        // Also update the sites array so it doesn't reset on re-render
        setSites(prevSites => prevSites.map(s => {
          if (s.id.toString() === formData.site_id.toString()) {
            return {
              ...s,
              site_staff: [...(s.site_staff || []), newStaff]
            };
          }
          return s;
        }));
        setIsStaffModalOpen(false);
      } else {
        alert("Failed to add staff.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred while adding staff.");
    } finally {
      setIsAddingStaff(false);
    }
  };


  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.site_id) {
      alert("Error: Please select a Site before saving!");
      return;
    }
    
    setIsSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      const res = await fetch(`${apiUrl}/daily-reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          site_incharge: siteInchargeName,
          outstanding_balance: siteInchargeBalance // send the computed balance
        })
      });

      if (res.ok) {
        alert("Success! Daily Report saved to database.");
      } else {
        const errorData = await res.json();
        console.error(errorData);
        alert("Failed to save report. Check console for details.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred while saving the report.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDynamicChange = (section, index, field, value) => {
    const newSection = [...formData[section]];
    newSection[index][field] = value;
    
    // Auto-calculate amount for materials
    if ((section === 'material_in' || section === 'material_out') && (field === 'qnty' || field === 'rate')) {
        const qnty = parseFloat(newSection[index].qnty) || 0;
        const rate = parseFloat(newSection[index].rate) || 0;
        newSection[index].amount = qnty * rate;
    }
    
    // Auto-calculate balance for material out
    if (section === 'material_out' && (field === 'qnty' || field === 'rate' || field === 'paid')) {
        const amount = parseFloat(newSection[index].amount) || 0;
        const paid = parseFloat(newSection[index].paid) || 0;
        newSection[index].balance = amount - paid;
    }
    
    setFormData({ ...formData, [section]: newSection });
  };

  const addRow = (section, emptyRow) => {
    setFormData({ ...formData, [section]: [...formData[section], emptyRow] });
  };

  const removeRow = (section, index) => {
    const newSection = formData[section].filter((_, i) => i !== index);
    setFormData({ ...formData, [section]: newSection });
  };


  // Find selected site details
  const selectedSite = sites.find(s => s.id.toString() === formData.site_id.toString());
  const siteInchargeName = selectedSite?.site_incharge?.name || 'Not Assigned';
  
  // Calculate real-time balance
  const initialBalance = parseFloat(selectedSite?.site_incharge?.balance || 0);
  const currentExpenses = formData.expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
  const currentMaterialPaid = formData.material_out.reduce((sum, item) => sum + (parseFloat(item.paid) || 0), 0);
  
  const siteInchargeBalance = initialBalance - currentExpenses - currentMaterialPaid;


  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">DAILY SITE REPORT</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage daily entry for attendance, materials, and expenses.</p>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
          <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Report'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6">
        {/* Header Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Site *</label>
            <select 
              value={formData.site_id} 
              onChange={e => setFormData({...formData, site_id: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
            >
              <option value="">-- Choose Site --</option>
              {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="date" 
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site Incharge</label>
            <input type="text" readOnly value={siteInchargeName} className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Outstanding Balance</label>
            <input type="text" readOnly value={`₹${parseFloat(siteInchargeBalance).toLocaleString()}`} className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl font-mono font-bold text-amber-600 dark:text-amber-500" />
          </div>
        </div>

        
        {/* Staff Attendance */}
        {formData.staff_attendance.length > 0 && (
          <div className="mb-8 border-b border-gray-100 dark:border-gray-800 pb-8">
            <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Staff Attendance</h3>
            <button type="button" onClick={handleAddQuickStaff} className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1 font-medium"><Plus className="w-3 h-3"/> Add Staff</button>
          </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {formData.staff_attendance.map((att, i) => (
                <div key={att.staff_id} className="p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate pr-2">{att.name}</span>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={att.status === 'P'} 
                      onChange={e => handleDynamicChange('staff_attendance', i, 'status', e.target.checked ? 'P' : 'A')}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Present</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expenses & Subcontractors */}
        <div className="flex flex-col gap-8 mb-8 border-b border-gray-100 dark:border-gray-800 pb-8">
          {/* Expenses */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Expenses</h3>
              <button onClick={() => addRow('expenses', {type:'', amount:''})} className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1 font-medium"><Plus className="w-3 h-3"/> Add</button>
            </div>
            <div className="space-y-3">
              {formData.expenses.map((exp, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="w-8 text-sm text-gray-400 font-mono shrink-0">{i + 1}.</div>
                  <input 
                    type="text" 
                    placeholder="Expense Type"
                    value={exp.type} 
                    onChange={e => handleDynamicChange('expenses', i, 'type', e.target.value)} 
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" 
                  />
                  <input 
                    type="number" 
                    placeholder="Amount" 
                    value={exp.amount} 
                    onChange={e => handleDynamicChange('expenses', i, 'amount', e.target.value)} 
                    className="w-32 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" 
                  />
                  <button onClick={() => removeRow('expenses', i)} className="p-2 text-gray-400 hover:text-red-500 shrink-0">
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Subcontract Labour */}
          <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Subcontract Labour</h3>
                <button onClick={() => addRow('subcontractors', {name:'', no_of_labour:'', work_details:''})} className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1 font-medium"><Plus className="w-3 h-3"/> Add</button>
            </div>
            
            <div className="space-y-3">
              {formData.subcontractors.map((sub, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div>
                    <input list={`sub-list-${i}`} placeholder="Name" value={sub.name} onChange={e => handleDynamicChange('subcontractors', i, 'name', e.target.value)} className="w-48 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
                    <datalist id={`sub-list-${i}`}>
                      {availableSubcontractorNames.map(name => <option key={name} value={name} />)}
                    </datalist>
                  </div>
                  <input type="number" placeholder="Labour Count" value={sub.no_of_labour} onChange={e => handleDynamicChange('subcontractors', i, 'no_of_labour', e.target.value)} className="w-32 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
                  <input type="text" placeholder="Work Details" value={sub.work_details} onChange={e => handleDynamicChange('subcontractors', i, 'work_details', e.target.value)} className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
                  <button onClick={() => removeRow('subcontractors', i)} className="p-2 text-gray-400 hover:text-red-500 mt-0.5"><Trash2 className="w-4 h-4"/></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Material In */}
        <div className="mb-8 border-t border-gray-100 dark:border-gray-800 pt-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Material IN</h3>
                <button onClick={() => addRow('material_in', {supplier:'', material:'', unit:'', qnty:'', rate:'', amount:''})} className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1 font-medium"><Plus className="w-3 h-3"/> Add Material In</button>
            </div>
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-gray-500">
                        <tr>
                            <th className="px-4 py-3 font-medium">Sl.no</th>
                            <th className="px-4 py-3 font-medium">Supplier</th>
                            <th className="px-4 py-3 font-medium">Material</th>
                            <th className="px-4 py-3 font-medium">Unit</th>
                            <th className="px-4 py-3 font-medium text-right">Qnty</th>
                            <th className="px-4 py-3 font-medium text-right">Rate</th>
                            <th className="px-4 py-3 font-medium text-right">Amount</th>
                            <th className="px-4 py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {formData.material_in.map((item, i) => (
                            <tr key={i}>
                                <td className="px-4 py-2 text-gray-400">{i+1}</td>
                                <td className="px-4 py-2">
  <select className="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded bg-transparent" value={item.supplier} onChange={e => handleDynamicChange('material_in', i, 'supplier', e.target.value)}>
    <option value="">Select Supplier</option>
    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
  </select>
</td>
                                <td className="px-4 py-2">
  <input list="materials-list" type="text" placeholder="Type or select..." className="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded bg-transparent" value={item.material} onChange={e => handleDynamicChange('material_in', i, 'material', e.target.value)} />
  <datalist id="materials-list">
    {materialsList.map(m => <option key={m.id} value={m.name} />)}
  </datalist>
</td>
                                <td className="px-4 py-2"><input type="text" className="w-20 px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded bg-transparent" value={item.unit} onChange={e => handleDynamicChange('material_in', i, 'unit', e.target.value)} /></td>
                                <td className="px-4 py-2"><input type="number" className="w-24 px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded bg-transparent text-right" value={item.qnty} onChange={e => handleDynamicChange('material_in', i, 'qnty', e.target.value)} /></td>
                                <td className="px-4 py-2"><input type="number" className="w-24 px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded bg-transparent text-right" value={item.rate} onChange={e => handleDynamicChange('material_in', i, 'rate', e.target.value)} /></td>
                                <td className="px-4 py-2 text-right font-mono">{item.amount || 0}</td>
                                <td className="px-4 py-2"><button onClick={() => removeRow('material_in', i)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Material Out */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Material OUT</h3>
                <button onClick={() => addRow('material_out', {expense_head:'', supplier:'', material:'', unit:'', qnty:'', rate:'', amount:'', paid:'', balance:'', remark:''})} className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1 font-medium"><Plus className="w-3 h-3"/> Add Material Out</button>
            </div>
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-gray-500">
                        <tr>
                            <th className="px-4 py-3 font-medium">Sl.no</th>
                            <th className="px-4 py-3 font-medium">Expense Head</th>
                            <th className="px-4 py-3 font-medium">Supplier</th>
                            <th className="px-4 py-3 font-medium">Material</th>
                            <th className="px-4 py-3 font-medium text-right">Qnty</th>
                            <th className="px-4 py-3 font-medium text-right">Rate</th>
                            <th className="px-4 py-3 font-medium text-right">Amount</th>
                            <th className="px-4 py-3 font-medium text-right">Paid</th>
                            <th className="px-4 py-3 font-medium text-right">Balance</th>
                            <th className="px-4 py-3 font-medium">Remark</th>
                            <th className="px-4 py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {formData.material_out.map((item, i) => (
                            <tr key={i}>
                                <td className="px-4 py-2 text-gray-400">{i+1}</td>
                                <td className="px-4 py-2"><input type="text" className="w-24 px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded bg-transparent" value={item.expense_head} onChange={e => handleDynamicChange('material_out', i, 'expense_head', e.target.value)} /></td>
                                <td className="px-4 py-2">
  <select className="w-28 px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded bg-transparent" value={item.supplier} onChange={e => handleDynamicChange('material_out', i, 'supplier', e.target.value)}>
    <option value="">Select Supplier</option>
    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
  </select>
</td>
                                <td className="px-4 py-2">
  <input list="materials-list" type="text" placeholder="Type..." className="w-24 px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded bg-transparent" value={item.material} onChange={e => handleDynamicChange('material_out', i, 'material', e.target.value)} />
</td>
                                <td className="px-4 py-2"><input type="number" className="w-20 px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded bg-transparent text-right" value={item.qnty} onChange={e => handleDynamicChange('material_out', i, 'qnty', e.target.value)} /></td>
                                <td className="px-4 py-2"><input type="number" className="w-20 px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded bg-transparent text-right" value={item.rate} onChange={e => handleDynamicChange('material_out', i, 'rate', e.target.value)} /></td>
                                <td className="px-4 py-2 text-right font-mono">{item.amount || 0}</td>
                                <td className="px-4 py-2"><input type="number" className="w-24 px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded bg-transparent text-right" value={item.paid} onChange={e => handleDynamicChange('material_out', i, 'paid', e.target.value)} /></td>
                                <td className="px-4 py-2 text-right font-mono text-amber-600">{item.balance || 0}</td>
                                <td className="px-4 py-2"><input type="text" className="w-24 px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded bg-transparent" value={item.remark} onChange={e => handleDynamicChange('material_out', i, 'remark', e.target.value)} /></td>
                                <td className="px-4 py-2"><button onClick={() => removeRow('material_out', i)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

      
      {/* Add Staff Modal */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New Staff</h3>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Staff Name</label>
              <input 
                type="text" 
                autoFocus
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="Enter staff name..."
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitNewStaff(); }}
              />

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4">Salary</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="Enter salary..."
                value={newStaffSalary}
                onChange={(e) => setNewStaffSalary(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitNewStaff(); }}
              />

            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
              <button 
                onClick={() => setIsStaffModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                disabled={isAddingStaff}
              >
                Cancel
              </button>
              <button 
                onClick={submitNewStaff}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={isAddingStaff || !newStaffName.trim()}
              >
                {isAddingStaff ? 'Adding...' : 'Add Staff'}
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}

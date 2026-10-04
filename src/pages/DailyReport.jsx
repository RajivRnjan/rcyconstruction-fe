import React, { useState, useEffect } from 'react';
import { toast } from "react-hot-toast";
import { useConfirm } from "../components/ConfirmProvider";
import { useSearchParams } from 'react-router-dom';
import { Calendar, Save, Plus, Trash2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function DailyReport() {
  const confirm = useConfirm();

  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('id');
  const [sites, setSites] = useState([]);
  const [allSubcontractors, setAllSubcontractors] = useState([]);
  const [expenseSuggestions, setExpenseSuggestions] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [siteIncharges, setSiteIncharges] = useState([]);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffSalary, setNewStaffSalary] = useState('');
  const [isAddingStaff, setIsAddingStaff] = useState(false);

  // Quick Add Subcontractor States
  const [isSubcontractorModalOpen, setIsSubcontractorModalOpen] = useState(false);
  const [newSubcontractorName, setNewSubcontractorName] = useState('');
  const [newSubcontractorAmount, setNewSubcontractorAmount] = useState('');
  const [newSubcontractorLabour, setNewSubcontractorLabour] = useState('');
  const [newSubcontractorWork, setNewSubcontractorWork] = useState('');
  const [isAddingSubcontractor, setIsAddingSubcontractor] = useState(false);
  const [addingSubcontractorRowIndex, setAddingSubcontractorRowIndex] = useState(null);
  const [formData, setFormData] = useState({
    site_id: '',
    date: new Date().toISOString().split('T')[0],
    site_incharge: '',
    expenses: [
      { type: 'STAFF PAYMENT', name: '', amount: '' },
      { type: 'SUPPLIER PAYMENT', name: '', amount: '' },
      { type: 'SITE EXPENSE', name: '', amount: '' }
    ],
    staff_attendance: [],
    subcontractors: [
      { name: '', no_of_labour: '', amount: '', work_details: '' }
    ],
    material_in: [
      { supplier: '', material: '', unit: '', qnty: '', rate: '', amount: '' }
    ],
    material_used: [
      { material: '', unit: '', qnty: '', remark: '' }
    ],
    material_transfer: [
      { to_site: '', material: '', unit: '', qnty: '', remark: '' }
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
              site_incharge: r.site_incharge || '',
              staff_attendance: r.staff ? r.staff.map(s => ({ staff_id: s.staff_id, name: s.name, status: s.status })) : [],
              expenses: r.expenses && r.expenses.length > 0 ? r.expenses.map(e => ({
                ...e, 
                type: e.type === 'PARTY PAYMENT' ? 'SUPPLIER PAYMENT' : (e.type === 'Site expenses' ? 'SITE EXPENSE' : e.type)
              })) : [{ type: 'STAFF PAYMENT', name: '', amount: '' }, { type: 'SUPPLIER PAYMENT', name: '', amount: '' }, { type: 'SITE EXPENSE', name: '', amount: '' }],
              subcontractors: r.subcontractors && r.subcontractors.length > 0 ? r.subcontractors : [{ name: '', no_of_labour: '', amount: '', work_details: '' }],
              material_in: data.material_in && data.material_in.length > 0 ? data.material_in.map(m => ({
                  supplier: m.supplier_id || '', material: m.material ? m.material.name : '', qnty: m.qnty, rate: m.rate, amount: m.amount, unit: m.unit || ''
              })) : [{ supplier: '', material: '', unit: '', qnty: '', rate: '', amount: '' }],
              material_used: data.material_used && data.material_used.length > 0 ? data.material_used.map(m => ({
                  material: m.material ? m.material.name : '', unit: m.unit || '', qnty: m.qnty, remark: m.remark || ''
              })) : [{ material: '', unit: '', qnty: '', remark: '' }],
              material_transfer: data.material_transfer && data.material_transfer.length > 0 ? data.material_transfer.map(m => ({
                  to_site: m.to_site_id || '', material: m.material ? m.material.name : '', unit: m.unit || '', qnty: m.qnty, remark: m.remark || ''
              })) : [{ to_site: '', material: '', unit: '', qnty: '', remark: '' }]
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

        const [projRes, suppRes, matRes, inchargeRes, subRes, expSuggRes] = await Promise.all([
          fetch(`${apiUrl}/sites?all=1`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${apiUrl}/suppliers?all=1`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${apiUrl}/materials?all=1`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${apiUrl}/site-incharges?all=1`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${apiUrl}/subcontractors?all=1`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${apiUrl}/daily-reports/expense-suggestions`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        if (projRes.ok) setSites(await projRes.json());
        if (suppRes.ok) setSuppliers(await suppRes.json());
        if (matRes.ok) setMaterialsList(await matRes.json());
        if (inchargeRes.ok) setSiteIncharges(await inchargeRes.json());
        if (subRes.ok) setAllSubcontractors(await subRes.json());
        if (expSuggRes && expSuggRes.ok) setExpenseSuggestions(await expSuggRes.json());

      } catch (e) {
        console.error(e);
      }
    };
    fetchSites();
  }, []);


  // Sync staff from selected site to attendance form
  useEffect(() => {
    const site = sites.find(s => s.id.toString() === formData.site_id.toString());
    
    // Set default site incharge if not already set by editing an existing report
    if (site && site.site_incharge && !reportId) {
      setFormData(prev => ({ ...prev, site_incharge: site.site_incharge.name }));
    }

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
            amount: '',
            work_details: ''
          }))
        }));
      }
    } else if (formData.subcontractors.length > 0 && formData.subcontractors[0].name !== '') {
      setFormData(prev => ({ ...prev, subcontractors: [{ name: '', no_of_labour: '', amount: '', work_details: '' }] }));
    }
  }, [formData.site_id, sites]);


    // Filter subcontractors by selected site
  const availableSubcontractorNames = Array.from(new Set(
    allSubcontractors
      .filter(s => String(s.site_id) === String(formData.site_id))
      .map(s => s.name)
      .filter(Boolean)
  ));

  const handleAddQuickStaff = () => {
    if (!formData.site_id) {
      toast("Please select a site first.");
      return;
    }
    setNewStaffName('');
    setNewStaffSalary('');
    setIsStaffModalOpen(true);
  };


  const handleRemoveStaff = async (staffId, index) => {
    if (!await confirm('Are you sure you want to completely remove this staff from the site?')) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      // If it's a new staff without an ID, just remove from UI
      if (staffId) {
        const res = await fetch(`${apiUrl}/sites/${formData.site_id}/staff/${staffId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete staff from backend');
      }
      
      // Remove from formData
      const newAttendance = formData.staff_attendance.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, staff_attendance: newAttendance }));
      
      // Remove from global sites state to prevent re-syncing
      if (staffId) {
        setSites(prevSites => prevSites.map(s => {
          if (s.id.toString() === formData.site_id.toString()) {
            return {
              ...s,
              site_staff: (s.site_staff || []).filter(st => st.id !== staffId)
            };
          }
          return s;
        }));
      }
      
    } catch (e) {
      console.error(e);
      toast('Error removing staff');
    }
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
        toast("Failed to add staff.");
      }
    } catch (e) {
      console.error(e);
      toast("An error occurred while adding staff.");
    } finally {
      setIsAddingStaff(false);
    }
  };

  const submitNewSubcontractor = async () => {
    if (!newSubcontractorName.trim()) {
      toast("Please enter a subcontractor name");
      return;
    }
    
    setIsAddingSubcontractor(true);
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      
      const res = await fetch(`${apiUrl}/subcontractors?all=1`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          site_id: formData.site_id,
          date: formData.date,
          name: newSubcontractorName,
          amount: newSubcontractorAmount || 0,
          no_of_labour: newSubcontractorLabour || 0,
          work_details: newSubcontractorWork || ''
        })
      });

      if (res.ok) {
        const addedSub = await res.json();
        
        // Add to global list so it shows in dropdown
        setAllSubcontractors(prev => [...prev, addedSub]);

        // Auto-select it in the current row
        if (addingSubcontractorRowIndex !== null) {
          handleDynamicChange('subcontractors', addingSubcontractorRowIndex, 'name', addedSub.name);
          handleDynamicChange('subcontractors', addingSubcontractorRowIndex, 'amount', addedSub.amount);
          handleDynamicChange('subcontractors', addingSubcontractorRowIndex, 'work_details', addedSub.work_details);
        }
        
        setIsSubcontractorModalOpen(false);
        setNewSubcontractorName('');
        setNewSubcontractorAmount('');
        setNewSubcontractorLabour('');
        setNewSubcontractorWork('');
        toast("Subcontractor added successfully!");
      } else {
        toast("Failed to add subcontractor.");
      }
    } catch (e) {
      console.error(e);
      toast("An error occurred");
    } finally {
      setIsAddingSubcontractor(false);
    }
  };


  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.site_id) {
      toast("Error: Please select a Site before saving!");
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
          outstanding_balance: siteInchargeBalance, // send the computed balance
          report_id: reportId || null // send id when editing so BE updates in place
        })
      });

      if (res.ok) {
        
      } else {
        const errorData = await res.json();
        console.error(errorData);
        toast("Failed to save report. Check console for details.");
      }
    } catch (e) {
      console.error(e);
      toast("An error occurred while saving the report.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDynamicChange = (section, index, field, value) => {
    const newSection = [...formData[section]];
    newSection[index][field] = value;
    
    // Auto-calculate amount for materials
    if ((section === 'material_in' || section === 'material_out' || section === 'material_used') && (field === 'qnty' || field === 'rate')) {
        const qnty = parseFloat(newSection[index].qnty) || 0;
        const rate = parseFloat(newSection[index].rate) || 0;
        newSection[index].amount = qnty * rate;
    }
    
    // Auto-calculate balance for material out
    if (false && section === 'material_out' && (field === 'qnty' || field === 'rate' || field === 'paid')) {
        const amount = parseFloat(newSection[index].amount) || 0;
        const paid = parseFloat(newSection[index].paid) || 0;
        newSection[index].balance = amount - paid;
    }
    
    // Auto-fill subcontractor details
    if (section === 'subcontractors' && field === 'name') {
        const subData = allSubcontractors.find(s => s.name === value && String(s.site_id) === String(formData.site_id));
        if (subData) {
            newSection[index].amount = subData.amount || '';
            newSection[index].work_details = subData.work_details || '';
        }
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
  
  // Calculate real-time balance
  const selectedInchargeData = siteIncharges.find(inc => inc.name === formData.site_incharge);
  const initialBalance = parseFloat(selectedInchargeData?.balance || 0);
  const currentExpenses = formData.expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
  const currentMaterialPaid = 0; // material_used/transfer don't track payments here
  
  const siteInchargeBalance = initialBalance - currentExpenses - currentMaterialPaid;


  
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Daily Report - ${formData.date}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Site Incharge: ${formData.site_incharge}`, 14, 25);
    
    // Expenses
    doc.autoTable({
      startY: 35,
      head: [['Expense Type', 'Name', 'Amount']],
      body: formData.expenses.map(e => [e.type, e.name, e.amount]),
      theme: 'grid'
    });
    
    // Staff
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Staff Name', 'Status']],
      body: formData.staff_attendance.map(s => [s.name, s.status]),
      theme: 'grid'
    });

    // Subcontractors
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Subcontractor', 'Labour', 'Work Details', 'Amount']],
      body: formData.subcontractors.map(s => [s.name, s.no_of_labour, s.work_details, s.amount]),
      theme: 'grid'
    });

    // Material In
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Material In', 'Qnty', 'Unit', 'Rate', 'Amount']],
      body: formData.material_in.map(m => [m.material, m.qnty, m.unit, m.rate, m.amount]),
      theme: 'grid'
    });

    doc.save(`Daily_Report_${formData.date}.pdf`);
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    
    const wsExpenses = XLSX.utils.json_to_sheet(formData.expenses);
    XLSX.utils.book_append_sheet(wb, wsExpenses, "Expenses");

    const wsStaff = XLSX.utils.json_to_sheet(formData.staff_attendance);
    XLSX.utils.book_append_sheet(wb, wsStaff, "Staff");

    const wsSub = XLSX.utils.json_to_sheet(formData.subcontractors);
    XLSX.utils.book_append_sheet(wb, wsSub, "Subcontractors");

    const wsMatIn = XLSX.utils.json_to_sheet(formData.material_in);
    XLSX.utils.book_append_sheet(wb, wsMatIn, "Material In");

    XLSX.writeFile(wb, `Daily_Report_${formData.date}.xlsx`);
  };

  console.log('DEBUG formData:', formData);
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {reportId && (
            <>
              <button onClick={handleExportExcel} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors">
                <Download className="w-4 h-4" /> Excel
              </button>
              <button onClick={handleExportPDF} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors">
                <Download className="w-4 h-4" /> PDF
              </button>
            </>
          )}
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
            <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Report'}
          </button>
        </div>
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
            <select 
              value={formData.site_incharge} 
              onChange={e => setFormData({...formData, site_incharge: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
            >
              <option value="">-- Choose Incharge --</option>
              {siteIncharges.map(inc => <option key={inc.id} value={inc.name}>{inc.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Outstanding Balance</label>
            <input type="text" readOnly value={`₹${parseFloat(siteInchargeBalance).toLocaleString()}`} className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl font-mono font-bold text-amber-600 dark:text-amber-500" />
          </div>
        </div>

        
        {/* Staff Attendance */}
        <div className="mb-8 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Staff Attendance</h3>
            <button type="button" onClick={handleAddQuickStaff} className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1 font-medium"><Plus className="w-3 h-3"/> Add Staff</button>
          </div>
          {formData.staff_attendance.length === 0 ? (
            <div className="text-sm text-gray-500 italic mt-2">No staff added yet. Click "Add Staff" to assign staff.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {formData.staff_attendance.map((att, i) => (
                <div key={att.staff_id} className="p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate pr-2">{att.name}</span>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={att.status === 'P'} 
                        onChange={e => handleDynamicChange('staff_attendance', i, 'status', e.target.checked ? 'P' : 'A')}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Present</span>
                    </label>
                    <button onClick={() => handleRemoveStaff(att.staff_id, i)} className="text-gray-400 hover:text-red-500 p-1" title="Remove staff from site">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expenses & Subcontractors */}
        <div className="flex flex-col gap-6 mb-8 border-b border-gray-100 dark:border-gray-800 pb-8">
          {/* STAFF PAYMENT */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">STAFF PAYMENT</h3>
              <button onClick={() => addRow('expenses', {type:'STAFF PAYMENT', name:'', amount:''})} className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1 font-medium"><Plus className="w-3 h-3"/> Add</button>
            </div>
            <div className="space-y-3">
              {formData.expenses.map((exp, i) => exp.type === 'STAFF PAYMENT' && (
                <div key={i} className="flex gap-4 items-center">
                  <select value={exp.name || ''} onChange={e => handleDynamicChange('expenses', i, 'name', e.target.value)} className="w-full max-w-md px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                     <option value="">Select Staff</option>
                     {formData.staff_attendance.map(s => {
                       if (formData.expenses.some((e, idx) => e.type === 'STAFF PAYMENT' && e.name === s.name && idx !== i)) return null;
                       return <option key={s.staff_id} value={s.name}>{s.name}</option>;
                     })}
                  </select>
                  <input type="number" placeholder="Amount" value={exp.amount} onChange={e => handleDynamicChange('expenses', i, 'amount', e.target.value)} className="w-32 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
                  <button onClick={() => removeRow('expenses', i)} className="p-2 text-gray-400 hover:text-red-500 shrink-0"><Trash2 className="w-4 h-4"/></button>
                </div>
              ))}
            </div>
          </div>

          {/* SUPPLIER PAYMENT */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">SUPPLIER PAYMENT</h3>
              <button onClick={() => addRow('expenses', {type:'SUPPLIER PAYMENT', name:'', amount:''})} className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1 font-medium"><Plus className="w-3 h-3"/> Add</button>
            </div>
            <div className="space-y-3">
              {formData.expenses.map((exp, i) => (exp.type === 'SUPPLIER PAYMENT' || exp.type === 'PARTY PAYMENT') && (
                <div key={i} className="flex gap-4 items-center">
                  <select value={exp.name || ''} onChange={e => handleDynamicChange('expenses', i, 'name', e.target.value)} className="w-full max-w-md px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                     <option value="">Select Supplier</option>
                     {suppliers.map(s => {
                       if (formData.expenses.some((e, idx) => (e.type === 'SUPPLIER PAYMENT' || e.type === 'PARTY PAYMENT') && e.name === s.name && idx !== i)) return null;
                       return <option key={s.id} value={s.name}>{s.name}</option>;
                     })}
                  </select>
                  <input type="number" placeholder="Amount" value={exp.amount} onChange={e => handleDynamicChange('expenses', i, 'amount', e.target.value)} className="w-32 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
                  <button onClick={() => removeRow('expenses', i)} className="p-2 text-gray-400 hover:text-red-500 shrink-0"><Trash2 className="w-4 h-4"/></button>
                </div>
              ))}
            </div>
          </div>

          {/* SITE EXPENSES */}
          <div>
            <datalist id="expense-suggestions">
              {expenseSuggestions.map((sugg, i) => <option key={i} value={sugg} />)}
            </datalist>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">SITE EXPENSES</h3>
              <button onClick={() => addRow('expenses', {type:'SITE EXPENSE', name:'', amount:''})} className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1 font-medium"><Plus className="w-3 h-3"/> Add</button>
            </div>
            <div className="space-y-3">
              {formData.expenses.map((exp, i) => (exp.type === 'SITE EXPENSE' || exp.type === 'Site expenses') && (
                <div key={i} className="flex gap-4 items-center">
                  <input type="text" list="expense-suggestions" placeholder="Expense Details" value={exp.name || ''} onChange={e => handleDynamicChange('expenses', i, 'name', e.target.value)} className="w-full max-w-md px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
                  <input type="number" placeholder="Amount" value={exp.amount} onChange={e => handleDynamicChange('expenses', i, 'amount', e.target.value)} className="w-32 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
                  <button onClick={() => removeRow('expenses', i)} className="p-2 text-gray-400 hover:text-red-500 shrink-0"><Trash2 className="w-4 h-4"/></button>
                </div>
              ))}
            </div>
          </div>

          {/* Subcontract Labour */}
          <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Subcontract Labour</h3>
                <button onClick={() => addRow('subcontractors', {name:'', no_of_labour:'', amount:'', work_details:''})} className="text-blue-600 hover:text-blue-700 text-xs flex items-center gap-1 font-medium"><Plus className="w-3 h-3"/> Add</button>
            </div>
            
            <div className="space-y-3">
              {formData.subcontractors.map((sub, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <input type="text" list="subcontractor-suggestions" placeholder="Subcontractor Name" value={sub.name || ''} onChange={e => handleDynamicChange('subcontractors', i, 'name', e.target.value)} className="w-48 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
                  <input type="number" placeholder="Labour Count" value={sub.no_of_labour || ''} onChange={e => handleDynamicChange('subcontractors', i, 'no_of_labour', e.target.value)} className="w-28 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
                  <input type="number" placeholder="Amount" value={sub.amount} onChange={e => handleDynamicChange('subcontractors', i, 'amount', e.target.value)} className="w-32 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm" />
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
      <datalist id="subcontractor-suggestions">
        {availableSubcontractorNames.map((name, i) => <option key={i} value={name} />)}
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

        {/* Material Used */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-8">
            <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Material Used</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Items consumed on site today</p>
                </div>
                <button onClick={() => addRow('material_used', {material:'', unit:'', qnty:'', remark:''})} className="text-orange-600 hover:text-orange-700 text-xs flex items-center gap-1 font-medium bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-lg"><Plus className="w-3 h-3"/> Add Material Used</button>
            </div>
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-orange-50/50 dark:bg-orange-900/10 border-b border-gray-200 dark:border-gray-800 text-gray-500">
                        <tr>
                            <th className="px-4 py-3 font-medium">#</th>
                            <th className="px-4 py-3 font-medium">Material</th>
                            <th className="px-4 py-3 font-medium">Unit</th>
                            <th className="px-4 py-3 font-medium text-right">Qty</th>
                            <th className="px-4 py-3 font-medium">Remark</th>
                            <th className="px-4 py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {(formData.material_used || []).map((item, i) => (
                            <tr key={i}>
                                <td className="px-4 py-2 text-gray-400">{i+1}</td>
                                <td className="px-4 py-2">
                                  <input list="materials-list" type="text" placeholder="Type or select..." className="w-36 px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded bg-transparent" value={item.material} onChange={e => handleDynamicChange('material_used', i, 'material', e.target.value)} />
                                </td>
                                <td className="px-4 py-2"><input type="text" placeholder="Unit" className="w-20 px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded bg-transparent" value={item.unit} onChange={e => handleDynamicChange('material_used', i, 'unit', e.target.value)} /></td>
                                <td className="px-4 py-2 text-right"><input type="number" placeholder="0" className="w-20 px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded bg-transparent text-right" value={item.qnty} onChange={e => handleDynamicChange('material_used', i, 'qnty', e.target.value)} /></td>
                                <td className="px-4 py-2"><input type="text" placeholder="Optional..." className="w-32 px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded bg-transparent" value={item.remark} onChange={e => handleDynamicChange('material_used', i, 'remark', e.target.value)} /></td>
                                <td className="px-4 py-2"><button onClick={() => removeRow('material_used', i)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Material Transfer */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-8">
            <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Material Transfer</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Transfer material to another site — will appear in that site's stock</p>
                </div>
                <button onClick={() => addRow('material_transfer', {to_site:'', material:'', unit:'', qnty:'', remark:''})} className="text-purple-600 hover:text-purple-700 text-xs flex items-center gap-1 font-medium bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-lg"><Plus className="w-3 h-3"/> Add Transfer</button>
            </div>
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-purple-50/50 dark:bg-purple-900/10 border-b border-gray-200 dark:border-gray-800 text-gray-500">
                        <tr>
                            <th className="px-4 py-3 font-medium">#</th>
                            <th className="px-4 py-3 font-medium">To Site</th>
                            <th className="px-4 py-3 font-medium">Material</th>
                            <th className="px-4 py-3 font-medium">Unit</th>
                            <th className="px-4 py-3 font-medium text-right">Qty</th>
                            <th className="px-4 py-3 font-medium">Remark</th>
                            <th className="px-4 py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {(formData.material_transfer || []).map((item, i) => (
                            <tr key={i}>
                                <td className="px-4 py-2 text-gray-400">{i+1}</td>
                                <td className="px-4 py-2">
                                  <select className="w-36 px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded bg-transparent" value={item.to_site} onChange={e => handleDynamicChange('material_transfer', i, 'to_site', e.target.value)}>
                                    <option value="">Select Site</option>
                                    {sites.filter(s => String(s.id) !== String(formData.site_id)).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                  </select>
                                </td>
                                <td className="px-4 py-2">
                                  <input list="materials-list" type="text" placeholder="Type or select..." className="w-36 px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded bg-transparent" value={item.material} onChange={e => handleDynamicChange('material_transfer', i, 'material', e.target.value)} />
                                </td>
                                <td className="px-4 py-2"><input type="text" placeholder="Unit" className="w-20 px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded bg-transparent" value={item.unit} onChange={e => handleDynamicChange('material_transfer', i, 'unit', e.target.value)} /></td>
                                <td className="px-4 py-2 text-right"><input type="number" placeholder="0" className="w-20 px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded bg-transparent text-right" value={item.qnty} onChange={e => handleDynamicChange('material_transfer', i, 'qnty', e.target.value)} /></td>
                                <td className="px-4 py-2"><input type="text" placeholder="Optional..." className="w-32 px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded bg-transparent" value={item.remark} onChange={e => handleDynamicChange('material_transfer', i, 'remark', e.target.value)} /></td>
                                <td className="px-4 py-2"><button onClick={() => removeRow('material_transfer', i)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button></td>
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

      {/* Add Subcontractor Modal */}
      {isSubcontractorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New Subcontractor</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subcontractor Name *</label>
                <input 
                  type="text" 
                  autoFocus
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Enter name..."
                  value={newSubcontractorName}
                  onChange={(e) => setNewSubcontractorName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Labour Count</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Enter labour count..."
                  value={newSubcontractorLabour}
                  onChange={(e) => setNewSubcontractorLabour(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Enter amount..."
                  value={newSubcontractorAmount}
                  onChange={(e) => setNewSubcontractorAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Work Details</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Enter work details..."
                  value={newSubcontractorWork}
                  onChange={(e) => setNewSubcontractorWork(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') submitNewSubcontractor(); }}
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
              <button 
                onClick={() => setIsSubcontractorModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                disabled={isAddingSubcontractor}
              >
                Cancel
              </button>
              <button 
                onClick={submitNewSubcontractor}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={isAddingSubcontractor || !newSubcontractorName.trim()}
              >
                {isAddingSubcontractor ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}

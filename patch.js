const fs = require('fs');

// Patch SiteIncharge.jsx
let incharge = fs.readFileSync('src/pages/SiteIncharge.jsx', 'utf8');

// Add PlusCircle icon import
incharge = incharge.replace(
  "import { Plus, Edit2, Trash2, Eye, Search } from 'lucide-react';",
  "import { Plus, Edit2, Trash2, Eye, Search, PlusCircle } from 'lucide-react';"
);

// Add action button for adding amount
const oldActions = `<button onClick={() => handleOpenModal('view', record)} className="text-gray-400 hover:text-blue-600 transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>`;
const newActions = `<button onClick={() => handleOpenModal('add_entry', record)} className="text-gray-400 hover:text-green-600 transition-colors" title="Add Entry">
                          <PlusCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleOpenModal('view', record)} className="text-gray-400 hover:text-blue-600 transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>`;
incharge = incharge.replace(oldActions, newActions);

fs.writeFileSync('src/pages/SiteIncharge.jsx', incharge);
console.log('SiteIncharge patched');

// Patch SiteInchargeModal.jsx
let modal = fs.readFileSync('src/components/SiteInchargeModal.jsx', 'utf8');

// Update modal title
const oldTitle = `{mode === 'view' && 'View Site Incharge Record'}
          </h2>`;
const newTitle = `{mode === 'view' && 'View Site Incharge Record'}
            {mode === 'add_entry' && 'Add Amount Entry'}
          </h2>`;
modal = modal.replace(oldTitle, newTitle);

// Update fields conditionally: if add_entry, hide certain fields or make them readonly.
// Actually, it's easier to modify the form data on open. We can see how useEffect is setting initialData.
const oldEffect = `useEffect(() => {
    if (initialData && (mode === 'edit' || mode === 'view')) {
      setFormData({`;
const newEffect = `useEffect(() => {
    if (initialData && (mode === 'edit' || mode === 'view')) {
      setFormData({
        date: initialData.date || new Date().toISOString().split('T')[0],
        site_id: initialData.site_id || '',
        name: initialData.name || '',
        opening_bal: initialData.opening_bal || '',
        credit: initialData.credit || '',
        debit_account: initialData.debit_account || '',
        exp: initialData.exp || ''
      });
    } else if (initialData && mode === 'add_entry') {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        site_id: initialData.site_id || '',
        name: initialData.name || '',
        opening_bal: 0,
        credit: '',
        debit_account: initialData.debit_account || '',
        exp: ''
      });
    } else {`;
modal = modal.replace(`useEffect(() => {
    if (initialData && (mode === 'edit' || mode === 'view')) {
      setFormData({`, newEffect.split('\\n      setFormData({')[0]);

// Wait, let's use regex for safer replacement.

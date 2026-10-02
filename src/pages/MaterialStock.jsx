import { useState, useEffect, useMemo } from 'react';
import { Package, Search, Building2, IndianRupee, Layers, ChevronDown, ChevronUp,
         ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const PER_PAGE = 10;

function SitePagination({ total, page, onPageChange }) {
  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));
  if (total <= PER_PAGE) return null;
  const from = (page - 1) * PER_PAGE + 1;
  const to   = Math.min(page * PER_PAGE, total);

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Showing <span className="font-medium">{from}</span>–<span className="font-medium">{to}</span> of <span className="font-medium">{total}</span>
      </p>
      <nav className="inline-flex -space-x-px rounded-md shadow-sm">
        <button onClick={() => onPageChange(1)} disabled={page === 1}
          className="inline-flex items-center px-2 py-1.5 text-gray-400 ring-1 ring-inset ring-gray-200 dark:ring-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 rounded-l-md text-xs">
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
          className="inline-flex items-center px-2 py-1.5 text-gray-400 ring-1 ring-inset ring-gray-200 dark:ring-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 text-xs">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-white ring-1 ring-inset ring-gray-200 dark:ring-gray-700">
          {page} / {lastPage}
        </span>
        <button onClick={() => onPageChange(page + 1)} disabled={page === lastPage}
          className="inline-flex items-center px-2 py-1.5 text-gray-400 ring-1 ring-inset ring-gray-200 dark:ring-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 text-xs">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onPageChange(lastPage)} disabled={page === lastPage}
          className="inline-flex items-center px-2 py-1.5 text-gray-400 ring-1 ring-inset ring-gray-200 dark:ring-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 rounded-r-md text-xs">
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </nav>
    </div>
  );
}

export default function MaterialStock() {
  const [sites, setSites]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchQuery, setSearchQuery]   = useState('');
  const [activeSite, setActiveSite]     = useState('');          // '' = All
  const [expandedSites, setExpandedSites] = useState({});
  const [sitePages, setSitePages]       = useState({});          // { siteId: currentPage }

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const token  = localStorage.getItem('admin_token');

  const fetchStock = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/material-stock`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setSites(data);
        if (data.length > 0) {
          setExpandedSites({ [data[0].site_id]: true });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStock(); }, []);

  const toggleSite = (siteId) =>
    setExpandedSites(prev => ({ ...prev, [siteId]: !prev[siteId] }));

  const setPage = (siteId, page) =>
    setSitePages(prev => ({ ...prev, [siteId]: page }));

  // Filter by site dropdown + search
  const filteredSites = useMemo(() =>
    sites
      .filter(s => activeSite === '' || String(s.site_id) === String(activeSite))
      .map(s => ({
        ...s,
        entries: s.entries.filter(e => {
          if (!searchQuery) return true;
          const q = searchQuery.toLowerCase();
          return (
            (e.material?.name || '').toLowerCase().includes(q) ||
            (e.supplier?.name || '').toLowerCase().includes(q) ||
            (e.date || '').includes(q)
          );
        }),
      }))
      .filter(s => s.entries.length > 0),
  [sites, activeSite, searchQuery]);

  const totalAmount  = sites.reduce((sum, s) => sum + parseFloat(s.total_amount || 0), 0);
  const totalEntries = sites.reduce((sum, s) => sum + s.entries.length, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white uppercase">Material Stock</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">
            All material IN entries from daily reports — site-wise
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search material, supplier..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setSitePages({}); }}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Sites</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{sites.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Layers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Total Entries</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalEntries}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <IndianRupee className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Total Value</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ₹{totalAmount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Site Dropdown Filter */}
      {!loading && sites.length > 0 && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">
            Filter by Site:
          </label>
          <div className="relative">
            <select
              value={activeSite}
              onChange={e => { setActiveSite(e.target.value); setSitePages({}); }}
              className="appearance-none pl-4 pr-10 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm cursor-pointer min-w-[200px]"
            >
              <option value="">All Sites</option>
              {sites.map(s => (
                <option key={s.site_id} value={s.site_id}>{s.site_name}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center text-gray-500">
          Loading material stock...
        </div>
      ) : filteredSites.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No material entries found.</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            Material IN entries added in daily reports will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSites.map(siteGroup => {
            const currentPage = sitePages[siteGroup.site_id] || 1;
            const allEntries  = siteGroup.entries;
            const pageEntries = allEntries.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

            return (
              <div key={siteGroup.site_id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                {/* Accordion Header */}
                <button
                  onClick={() => toggleSite(siteGroup.site_id)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900 dark:text-white">{siteGroup.site_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {allEntries.length} entries &middot; Total:{' '}
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          ₹{parseFloat(siteGroup.total_amount || 0).toLocaleString()}
                        </span>
                      </p>
                    </div>
                  </div>
                  {expandedSites[siteGroup.site_id]
                    ? <ChevronUp className="w-5 h-5 text-gray-400" />
                    : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>

                {/* Table */}
                {expandedSites[siteGroup.site_id] && (
                  <>
                    <div className="overflow-x-auto border-t border-gray-100 dark:border-gray-800">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 dark:bg-gray-950/50">
                          <tr>
                            <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">#</th>
                            <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">Date</th>
                            <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">Material</th>
                            <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">Supplier</th>
                            <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400 text-center">Unit</th>
                            <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400 text-right">Qty</th>
                            <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400 text-right">Rate</th>
                            <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {pageEntries.map((entry, idx) => (
                            <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                              <td className="px-6 py-3 text-gray-400 dark:text-gray-500">
                                {(currentPage - 1) * PER_PAGE + idx + 1}
                              </td>
                              <td className="px-6 py-3 text-gray-700 dark:text-gray-300">
                                {entry.date
                                  ? new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                  : '-'}
                              </td>
                              <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{entry.material?.name || '-'}</td>
                              <td className="px-6 py-3 text-gray-700 dark:text-gray-300">
                                {entry.transferred_from_site_id ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs font-medium border border-purple-200 dark:border-purple-800">
                                    Transferred from {entry.transferred_from_site?.name || 'Unknown Site'}
                                  </span>
                                ) : (
                                  entry.supplier?.name || '-'
                                )}
                              </td>
                              <td className="px-6 py-3 text-center text-gray-600 dark:text-gray-400">{entry.unit || '-'}</td>
                              <td className="px-6 py-3 text-right text-gray-700 dark:text-gray-300">
                                {parseFloat(entry.qnty || 0).toLocaleString()}
                              </td>
                              <td className="px-6 py-3 text-right text-gray-700 dark:text-gray-300">
                                ₹{parseFloat(entry.rate || 0).toLocaleString()}
                              </td>
                              <td className="px-6 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                                ₹{parseFloat(entry.amount || 0).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50 dark:bg-gray-950/50 border-t border-gray-200 dark:border-gray-800">
                          <tr>
                            <td colSpan="7" className="px-6 py-3 font-bold text-gray-700 dark:text-gray-300 text-right">
                              Site Total
                            </td>
                            <td className="px-6 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                              ₹{allEntries.reduce((s, e) => s + parseFloat(e.amount || 0), 0).toLocaleString()}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Pagination */}
                    <SitePagination
                      total={allEntries.length}
                      page={currentPage}
                      onPageChange={p => setPage(siteGroup.site_id, p)}
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

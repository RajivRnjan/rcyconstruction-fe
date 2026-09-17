import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export default function SearchableSelect({ 
  options = [], 
  value, 
  onChange, 
  placeholder = 'Select an option',
  disabled = false,
  required = false,
  name
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  const selectedOption = options.find(opt => opt.value.toString() === value?.toString());

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    String(opt.label || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {/* Hidden select for form submission/validation */}
      <select 
        className="absolute inset-0 w-full h-full opacity-0 pointer-events-none" 
        name={name} 
        value={value} 
        onChange={() => {}} 
        required={required}
        tabIndex={-1}
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      <div 
        className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-between transition-all text-gray-900 dark:text-white ${disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400 dark:hover:border-blue-500'} ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? '' : 'text-gray-500 dark:text-gray-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-[60] w-full mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 bg-gray-50 dark:bg-gray-950/50">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text"
              autoFocus
              className="w-full bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <div
                  key={opt.value}
                  className={`px-4 py-3 cursor-pointer text-sm transition-colors ${
                    opt.value.toString() === value?.toString() 
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch('');
                  }}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

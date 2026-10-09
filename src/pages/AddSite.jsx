import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SiteModal from '../components/SiteModal';

export default function AddSite() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-6 relative">
        <SiteModal 
          isOpen={true} 
          onClose={() => navigate('/sites')}
          onSuccess={() => navigate('/sites')}
          mode="create"
        />
        {/* Style override to make modal act as inline component */}
        <style>{`
          .site-modal-overlay {
            position: relative;
            inset: auto;
            background: transparent;
            z-index: 1;
            padding: 0;
            backdrop-filter: none;
            display: block;
          }
          .site-modal-overlay > div {
            max-width: 100%;
            box-shadow: none;
          }
          /* Hide the duplicate modal header on the AddSite page */
          .site-modal-overlay > div > div:first-child {
            display: none !important;
          }
        `}</style>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddProjectModal from '../components/AddProjectModal';

export default function AddProject() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-6 relative">
        <AddProjectModal 
          isOpen={true} 
          onClose={() => navigate('/')}
          onSuccess={() => navigate('/')}
          mode="create"
        />
        {/* Style override to make modal act as inline component */}
        <style>{`
          .fixed.inset-0.z-50 {
            position: relative;
            inset: auto;
            background: transparent;
            z-index: 1;
            padding: 0;
            backdrop-filter: none;
            display: block;
          }
          .fixed.inset-0.z-50 > div {
            max-width: 100%;
            box-shadow: none;
          }
        `}</style>
      </div>
    </div>
  );
}

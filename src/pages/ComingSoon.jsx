import React from 'react';
import { Construction } from 'lucide-react';

export default function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center animate-in fade-in duration-500">
      <div className="bg-blue-100 dark:bg-blue-900/30 p-6 rounded-full mb-6">
        <Construction className="w-16 h-16 text-blue-600 dark:text-blue-400" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        {title} - Coming Soon
      </h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-lg">
        This module is currently under construction. Please check back later!
      </p>
    </div>
  );
}

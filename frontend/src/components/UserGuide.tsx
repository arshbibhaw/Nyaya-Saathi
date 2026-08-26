import React from 'react';

export default function UserGuide() {
  return (
    <div className="w-full h-[80vh] flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
      <iframe 
        src="/docs/Nyaya_Saathi_User_Guide.pdf" 
        className="w-full h-full border-0"
        title="User Guide"
      />
    </div>
  );
}

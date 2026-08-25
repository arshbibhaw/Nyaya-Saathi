import React from 'react';
import UserGuide from '@/components/UserGuide';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] dark:bg-[#0A1118] pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-8">
          <ArrowLeft className="size-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
            User Guide
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            A comprehensive guide to using the Nyaya Saathi platform effectively.
          </p>
        </div>
        
        <UserGuide />
      </div>
    </main>
  );
}

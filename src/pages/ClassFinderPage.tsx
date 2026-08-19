import React, { useState } from 'react';
import { ExternalLink, RefreshCw, Compass, Users, Sparkles, MapPin } from 'lucide-react';

export const ClassFinderPage: React.FC = () => {
  const websiteUrl = 'https://whichclassisrightnow.vercel.app/';
  const [key, setKey] = useState(0);

  const handleRefresh = () => {
    setKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Top Header Banner & Credits */}
      <div className="rounded-md border-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#121212] p-6 brutal-shadow">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              LIVE TIMETABLE & CLASS LOCATOR
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 dark:text-white font-display tracking-tight flex items-center gap-2">
              Class Finder
            </h1>
            <p className="font-mono text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Find your next class with the help of this website! Locate room numbers, schedules, and active lectures in real time.
            </p>
          </div>

          {/* Credits Box */}
          <div className="p-4 rounded-xs border-2 border-slate-900 dark:border-slate-800 bg-slate-50 dark:bg-[#181818] min-w-[280px]">
            <div className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              DEVELOPED BY 2ND YEAR BTECH STUDENTS
            </div>
            <div className="flex flex-wrap gap-2 font-mono text-xs font-black">
              <span className="px-2 py-1 rounded-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                👤 Vicky
              </span>
              <span className="px-2 py-1 rounded-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                👤 Keshav
              </span>
              <span className="px-2 py-1 rounded-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                👤 Kaif
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="font-mono text-xs text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Connecting to <strong className="text-slate-800 dark:text-slate-200">whichclassisrightnow.vercel.app</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs font-mono text-xs font-bold uppercase border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#181818] text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Reload web view"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload</span>
            </button>

            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xs font-mono text-xs font-black uppercase bg-slate-900 text-white dark:bg-white dark:text-slate-950 brutal-shadow-sm hover:translate-y-px transition-all"
            >
              <span>Open Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Embedded Iframe View */}
      <div className="rounded-md border-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#121212] brutal-shadow overflow-hidden">
        <iframe
          key={key}
          src={websiteUrl}
          title="Class Finder - Which Class Is Right Now"
          className="w-full h-[75vh] min-h-[550px] border-none bg-white dark:bg-slate-950"
          allow="geolocation; microphone; camera"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
        />
      </div>
    </div>
  );
};

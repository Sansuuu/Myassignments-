import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderStyle = 'border-slate-900 dark:border-slate-700 bg-white dark:bg-[#121212] text-slate-900 dark:text-white';
        let icon = <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />;

        if (toast.type === 'success') {
          borderStyle = 'border-emerald-600 dark:border-emerald-500 bg-white dark:bg-[#121212] text-slate-900 dark:text-white';
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
        } else if (toast.type === 'error') {
          borderStyle = 'border-rose-600 dark:border-rose-500 bg-white dark:bg-[#121212] text-slate-900 dark:text-white';
          icon = <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />;
        } else if (toast.type === 'warning') {
          borderStyle = 'border-amber-600 dark:border-amber-500 bg-white dark:bg-[#121212] text-slate-900 dark:text-white';
          icon = <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-md border-2 ${borderStyle} brutal-shadow flex items-start justify-between gap-3 animate-in slide-in-from-bottom-2 duration-200`}
          >
            <div className="flex items-start gap-2.5">
              {icon}
              <div>
                <h4 className="font-mono text-xs font-bold uppercase tracking-wide">
                  {toast.title}
                </h4>
                {toast.message && (
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                    {toast.message}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-900 dark:hover:text-white shrink-0 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

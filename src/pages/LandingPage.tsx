import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CLASS_NAME, CLASS_SUBTITLE } from '../utils/constants';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Calendar,
  Lock,
  Mail,
  KeyRound,
  AlertCircle,
  Terminal,
  Code2,
  Cpu,
  Layers,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const {
    loginAsStudent,
    loginWithGoogleAdmin,
    loginWithEmailAdmin,
    loginWithAdminPasskey,
    loading,
    authError,
    clearAuthError,
  } = useAuth();

  const [nameInput, setNameInput] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminTab, setAdminTab] = useState<'passkey' | 'google' | 'email'>('passkey');
  const [adminPasskey, setAdminPasskey] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    await loginAsStudent(nameInput);
  };

  const handlePasskeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setAdminLoading(true);
    const ok = await loginWithAdminPasskey(adminPasskey);
    if (!ok) {
      setAdminError('Invalid admin key. Please try again.');
    } else {
      setShowAdminModal(false);
    }
    setAdminLoading(false);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setAdminLoading(true);
    try {
      await loginWithEmailAdmin(adminEmail, adminPassword);
      setShowAdminModal(false);
    } catch (err: any) {
      setAdminError(err?.message || 'Invalid credentials');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleGoogleAdmin = async () => {
    setAdminError(null);
    setAdminLoading(true);
    try {
      await loginWithGoogleAdmin();
      setShowAdminModal(false);
    } catch (err: any) {
      setAdminError(err?.message || 'Google sign-in failed');
    } finally {
      setAdminLoading(false);
    }
  };

  const features = [
    {
      num: '01',
      title: '9 CSE Academic Courses',
      desc: 'C Programming, Mathematics-I, Engineering Physics, Basic Electronics, and Engineering Graphics.',
    },
    {
      num: '02',
      title: 'Deadline Synchronization',
      desc: 'Real-time countdowns, automatic urgency prioritization, and timetable calendar.',
    },
    {
      num: '03',
      title: 'Grounded AI Study Tutor',
      desc: 'Integrated AI assistant calibrated to explain C pointer logic, derivations, and lab problems.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F3EE] dark:bg-[#0A0A0A] text-slate-900 dark:text-[#F5F5F0] flex flex-col font-sans selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-900">
      {/* Top Banner Bar */}
      <header className="border-b-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#121212] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xs bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-mono font-black text-xs border border-slate-900 dark:border-white">
              CSE
            </div>
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider">
                CSE CLASS HUB // BTECH 01
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowAdminModal(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-[#181818] font-mono text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all brutal-shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>ADMIN / FACULTY</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 sm:py-20 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Big Editorial Heading */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xs font-mono text-xs font-bold uppercase bg-slate-900 text-white dark:bg-white dark:text-slate-950">
              <span>● BTECH 1ST SEMESTER</span>
              <span>//</span>
              <span>COMPUTER SCIENCE</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter uppercase font-display leading-[0.95]">
              CSE CLASS
              <br />
              HUB & STUDY
              <br />
              ASSISTANT.
            </h1>

            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 max-w-xl font-normal leading-relaxed">
              Track deadlines, organize coursework for all core academic subjects, record your personal progress, and debug code with the integrated CSE AI Tutor.
            </p>

            {/* Feature Numbers Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t-2 border-slate-900 dark:border-slate-800">
              {features.map((f, i) => (
                <div key={i} className="space-y-1">
                  <div className="font-mono text-xs font-black text-blue-600 dark:text-blue-400">
                    {f.num} //
                  </div>
                  <h4 className="font-mono text-xs font-bold uppercase text-slate-900 dark:text-white">
                    {f.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Student Enter Box */}
          <div className="lg:col-span-5">
            <div className="rounded-md border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-[#121212] p-6 sm:p-8 brutal-shadow-lg space-y-6">
              <div className="space-y-1 border-b-2 border-slate-900 dark:border-slate-800 pb-4">
                <span className="font-mono text-[10px] font-bold uppercase text-slate-400">
                  STUDENT ACCESS PORTAL
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                  ENTER YOUR NAME
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Enter your name to start tracking your personal assignment progress and sync your checklist.
                </p>
              </div>

              {authError && (
                <div className="p-3 rounded-xs border-2 border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-xs font-mono text-rose-700 dark:text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span>{authError}</span>
                    <button
                      onClick={clearAuthError}
                      className="block underline font-bold mt-1"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Name / Roll Name
                  </label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Sanskar Garg"
                    className="w-full px-4 py-3 font-mono text-sm rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-slate-50 dark:bg-[#181818] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-600 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !nameInput.trim()}
                  className="w-full py-3.5 px-6 rounded-xs border-2 border-slate-900 dark:border-white bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-mono text-xs sm:text-sm font-black uppercase tracking-wider hover:bg-blue-600 dark:hover:bg-blue-400 transition-all disabled:opacity-40 flex items-center justify-center gap-2 brutal-shadow"
                >
                  <span>ENTER CLASS HUB</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between font-mono text-[11px] text-slate-500">
                <span>Free Student Access</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  ● ACTIVE SEMESTER
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Admin Login Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div
            className="relative w-full max-w-md rounded-md border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-[#121212] brutal-shadow-lg p-6 sm:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-2 border-slate-900 dark:border-slate-800 pb-4">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">
                  RESTRICTED ACCESS
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-display">
                  ADMIN / FACULTY AUTH
                </h3>
              </div>
              <button
                onClick={() => setShowAdminModal(false)}
                className="p-1 rounded-xs border border-slate-900 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Admin Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-[#181818] border border-slate-300 dark:border-slate-800 font-mono text-xs font-bold">
              <button
                type="button"
                onClick={() => setAdminTab('passkey')}
                className={`py-1.5 rounded-xs transition-all ${
                  adminTab === 'passkey'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                PASSKEY
              </button>
              <button
                type="button"
                onClick={() => setAdminTab('google')}
                className={`py-1.5 rounded-xs transition-all ${
                  adminTab === 'google'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                GOOGLE
              </button>
              <button
                type="button"
                onClick={() => setAdminTab('email')}
                className={`py-1.5 rounded-xs transition-all ${
                  adminTab === 'email'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                EMAIL
              </button>
            </div>

            {adminError && (
              <div className="p-3 rounded-xs border border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-xs font-mono text-rose-700 dark:text-rose-300">
                {adminError}
              </div>
            )}

            {adminTab === 'passkey' && (
              <form onSubmit={handlePasskeySubmit} className="space-y-4">
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                    Master Admin Passkey
                  </label>
                  <input
                    type="password"
                    required
                    value={adminPasskey}
                    onChange={(e) => setAdminPasskey(e.target.value)}
                    placeholder="Enter admin passkey..."
                    className="w-full px-4 py-2.5 font-mono text-xs rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-slate-50 dark:bg-[#181818] text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={adminLoading || !adminPasskey}
                  className="w-full py-3 rounded-xs border-2 border-slate-900 dark:border-white bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-mono text-xs font-bold uppercase tracking-wider hover:bg-blue-600 dark:hover:bg-blue-400 transition-all disabled:opacity-40"
                >
                  {adminLoading ? 'AUTHENTICATING...' : 'AUTHENTICATE →'}
                </button>
              </form>
            )}

            {adminTab === 'google' && (
              <div className="space-y-4 text-center">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                  Sign in with registered Administrator Google Account (e.g. sanskargarg462@gmail.com).
                </p>
                <button
                  type="button"
                  onClick={handleGoogleAdmin}
                  disabled={adminLoading}
                  className="w-full py-3 rounded-xs border-2 border-slate-900 dark:border-white bg-white dark:bg-[#181818] font-mono text-xs font-bold text-slate-900 dark:text-white uppercase hover:bg-slate-100 dark:hover:bg-slate-800 transition-all brutal-shadow-sm"
                >
                  {adminLoading ? 'CONNECTING...' : 'CONTINUE WITH GOOGLE'}
                </button>
              </div>
            )}

            {adminTab === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@college.edu"
                    className="w-full px-3 py-2 font-mono text-xs rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-slate-50 dark:bg-[#181818] text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 font-mono text-xs rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-slate-50 dark:bg-[#181818] text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={adminLoading}
                  className="w-full py-3 rounded-xs border-2 border-slate-900 dark:border-white bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-mono text-xs font-bold uppercase tracking-wider hover:bg-blue-600 dark:hover:bg-blue-400 transition-all disabled:opacity-40"
                >
                  {adminLoading ? 'SIGNING IN...' : 'SIGN IN AS ADMIN'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

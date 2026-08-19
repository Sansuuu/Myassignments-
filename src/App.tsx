/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { AssignmentModal } from './components/AssignmentModal';
import { CalendarView } from './components/CalendarView';
import { ToastContainer } from './components/ToastContainer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { TodayPage } from './pages/TodayPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { CompletedPage } from './pages/CompletedPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { AILaunchPage } from './pages/AILaunchPage';

const MainLayout: React.FC = () => {
  const { currentUser, studentName, isAdmin, loading } = useAuth();
  const {
    activeTab,
    selectedAssignment,
    setSelectedAssignment,
    markStatus,
  } = useApp();

  // If loading auth state, render brutalist terminal loader
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] dark:bg-[#0A0A0A] text-slate-900 dark:text-[#F5F5F0] flex flex-col items-center justify-center p-4 font-mono">
        <div className="p-6 rounded-md bg-white dark:bg-[#121212] border-2 border-slate-900 dark:border-white brutal-shadow text-center max-w-sm w-full">
          <div className="w-12 h-12 rounded-xs bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-xl flex items-center justify-center mx-auto mb-3">
            CSE
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            [BOOTING SYSTEM]
          </div>
          <div className="text-sm font-black uppercase text-slate-900 dark:text-white mt-1">
            BTech CSE Class Hub
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 mt-4 rounded-xs overflow-hidden border border-slate-900 dark:border-slate-700">
            <div className="bg-blue-600 dark:bg-blue-400 h-full w-2/3 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // If user is not signed in and has no student name or admin token, show landing page
  if (!currentUser && !studentName) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navigation */}
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar Navigation */}
        <Sidebar />

        {/* Primary Content View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
          {activeTab === 'dashboard' && <DashboardPage />}
          {activeTab === 'today' && <TodayPage />}
          {activeTab === 'subjects' && <SubjectsPage />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'completed' && <CompletedPage />}
          {activeTab === 'profile' && <ProfilePage />}
          {activeTab === 'admin' && (isAdmin ? <AdminPage /> : <DashboardPage />)}
          {activeTab === 'ai-launch' && <AILaunchPage />}
        </main>
      </div>

      {/* Mobile Navigation Bottom Bar */}
      <MobileNav />

      {/* Assignment Detail & Submission Modal */}
      {selectedAssignment && (
        <AssignmentModal
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          onStatusChange={(status) => {
            markStatus(selectedAssignment.id, selectedAssignment.subjectId, status);
          }}
        />
      )}

      {/* Global Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AuthProvider>
  );
}

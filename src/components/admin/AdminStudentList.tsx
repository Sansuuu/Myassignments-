import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile } from '../../types';
import { subscribeToUsers } from '../../services/db';
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';

export const AdminStudentList: React.FC = () => {
  const { assignments, allProgressList } = useApp();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToUsers((fetchedUsers) => {
      setUsers(fetchedUsers);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const totalAssignments = assignments.filter((a) => a.published).length;

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.displayName.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Search and summary header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-md bg-white dark:bg-[#121212] border-2 border-slate-900 dark:border-slate-800 brutal-shadow">
        <div>
          <div className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            ROSTER DIRECTORY
          </div>
          <h3 className="text-lg font-black uppercase text-slate-900 dark:text-[#F5F5F0] tracking-tight font-display mt-0.5 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            CLASS STUDENTS ({users.length})
          </h3>
          <p className="font-mono text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Real-time individual student coursework progress tracking
          </p>
        </div>

        <div className="relative w-full sm:w-72 font-mono text-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xs border-2 border-slate-900 dark:border-slate-700 bg-slate-50 dark:bg-[#181818] text-slate-900 dark:text-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#121212] overflow-hidden brutal-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b-2 border-slate-900 dark:border-slate-800 bg-slate-100 dark:bg-[#181818] text-slate-900 dark:text-slate-200 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">STUDENT</th>
                <th className="py-3 px-4">ROLE</th>
                <th className="py-3 px-4 text-center">COMPLETED</th>
                <th className="py-3 px-4 text-center">IN PROGRESS</th>
                <th className="py-3 px-4 text-center">REMAINING</th>
                <th className="py-3 px-4">CLASS PROGRESS</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const studentRecords = allProgressList.filter((p) => p.userId === u.userId);
                  const completedCount = studentRecords.filter((p) => p.status === 'completed').length;
                  const inProgressCount = studentRecords.filter((p) => p.status === 'in_progress').length;
                  const remainingCount = Math.max(0, totalAssignments - completedCount);
                  const percentage = totalAssignments > 0 ? Math.round((completedCount / totalAssignments) * 100) : 0;

                  return (
                    <tr key={u.userId} className="hover:bg-slate-50/80 dark:hover:bg-[#181818]">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xs border border-slate-900 dark:border-white bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold flex items-center justify-center text-xs">
                            {u.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {u.displayName}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-xs border text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                            : 'border-slate-400 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                        {completedCount}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-amber-600 dark:text-amber-400">
                        {inProgressCount}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-500">
                        {remainingCount}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-xs overflow-hidden border border-slate-900 dark:border-slate-600">
                            <div
                              className="h-full bg-blue-600 dark:bg-blue-400"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white text-xs">
                            {percentage}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

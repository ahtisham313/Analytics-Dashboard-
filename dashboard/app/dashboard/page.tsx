'use client';

import { useEffect, useState } from 'react';
import { analyticsAPI } from '@/lib/api';
import { hasRole } from '@/lib/auth';
import { Analytics } from '@/types';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      let response;
      
      if (hasRole(['admin'])) {
        response = await analyticsAPI.getSystem();
      } else if (hasRole(['moderator'])) {
        response = await analyticsAPI.getModerator();
      } else {
        response = await analyticsAPI.getUser();
      }
      
      setAnalytics(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  const isAdmin = hasRole(['admin']);
  const isModerator = hasRole(['moderator']);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          {isAdmin ? 'System-wide analytics' : isModerator ? 'Project analytics' : 'Your tasks and tickets'}
        </p>
      </div>

      {isAdmin && analytics?.totals && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm font-medium text-gray-500">Total Projects</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{analytics.totals.projects}</div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm font-medium text-gray-500">Total Tasks</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{analytics.totals.tasks}</div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm font-medium text-gray-500">Total Users</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{analytics.totals.users}</div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm font-medium text-gray-500">Total Tickets</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{analytics.totals.tickets}</div>
          </div>
        </div>
      )}

      {analytics?.projectStatus && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.projectStatus}
                dataKey="count"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {analytics.projectStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {analytics?.taskDistribution && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Task Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.taskDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {isAdmin && analytics?.ticketsPerUser && analytics.ticketsPerUser.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tickets Resolved per User</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Tickets Resolved
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {analytics.ticketsPerUser.map((item) => (
                  <tr key={item.userId}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {item.userName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {item.userEmail}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {item.ticketsResolved}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isAdmin && analytics?.moderatorPerformance && analytics.moderatorPerformance.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Moderator Performance</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Moderator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Projects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Total Tasks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Resolved
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {analytics.moderatorPerformance.map((item) => (
                  <tr key={item.moderatorId}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {item.moderatorName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {item.projectsCount}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {item.activeProjects}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {item.completedProjects}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {item.totalTasks}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {item.resolvedTasks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModerator && analytics?.teamProgress && analytics.teamProgress.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Progress</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Total Tasks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Open
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    In Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Resolved
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {analytics.teamProgress.map((item) => (
                  <tr key={item.userId}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {item.userName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {item.totalTasks}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {item.openTasks}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {item.inProgressTasks}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {item.resolvedTasks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isAdmin && !isModerator && analytics && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {analytics.tasks && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">My Tasks</h2>
              <div className="text-3xl font-bold text-gray-900">{analytics.tasks.total}</div>
              {analytics.tasks.status && analytics.tasks.status.length > 0 && (
                <div className="mt-4 space-y-2">
                  {analytics.tasks.status.map((item: { _id: string; count: number }) => (
                    <div key={item._id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item._id}</span>
                      <span className="font-medium text-gray-900">{item.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {analytics.tickets && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">My Tickets</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Resolved</span>
                  <span className="font-medium text-gray-900">{analytics.tickets.resolved || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-medium text-gray-900">{analytics.tickets.pending || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


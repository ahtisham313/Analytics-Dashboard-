'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ticketsAPI, tasksAPI } from '@/lib/api';
import { getAuth, hasRole } from '@/lib/auth';
import { Ticket, Task } from '@/types';
import { format } from 'date-fns';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [formData, setFormData] = useState({
    task: '',
    resolutionNotes: '',
  });
  const [verifyData, setVerifyData] = useState({
    status: 'verified' as 'verified' | 'rejected',
    rejectionReason: '',
  });
  const router = useRouter();
  const canCreateTickets = hasRole(['user']);
  const canVerify = hasRole(['moderator']);

  useEffect(() => {
    fetchTickets();
    if (canCreateTickets) {
      fetchTasksForTicketCreation();
    }
  }, [canCreateTickets]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketsAPI.getAll();
      setTickets(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasksForTicketCreation = async () => {
    try {
      const response = await tasksAPI.getAll();
      const user = getAuth();
      const availableTasks = response.data.filter((task: Task) =>
        task.status !== 'resolved' &&
        task.assignedTo &&
        typeof task.assignedTo === 'object' &&
        task.assignedTo._id === user?._id
      );
      setTasks(availableTasks);
    } catch (err: any) {
      console.error('Failed to load tasks:', err);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ticketsAPI.create(formData);
      setShowCreateModal(false);
      setFormData({
        task: '',
        resolutionNotes: '',
      });
      fetchTickets();
      if (canCreateTickets) {
        fetchTasksForTicketCreation();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create ticket');
    }
  };

  const handleVerifyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    try {
      await ticketsAPI.verify(selectedTicket._id, verifyData);
      setShowVerifyModal(false);
      setSelectedTicket(null);
      setVerifyData({
        status: 'verified',
        rejectionReason: '',
      });
      fetchTickets();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify ticket');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">Loading tickets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tickets</h1>
          <p className="mt-2 text-sm text-gray-600">
            {canVerify
              ? 'Review and verify ticket resolutions'
              : canCreateTickets
                ? 'Resolve your assigned tasks by submitting tickets'
                : 'View ticket history'}
          </p>
        </div>
        {canCreateTickets && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Create Ticket
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="rounded-lg bg-white shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Task
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Resolved By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Resolution Notes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Verified By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {tickets.map((ticket) => (
              <tr key={ticket._id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                  {typeof ticket.task === 'object' ? ticket.task.title : 'N/A'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {typeof ticket.resolvedBy === 'object' ? ticket.resolvedBy.name : 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="max-w-xs truncate">{ticket.resolutionNotes}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {ticket.verifiedBy && typeof ticket.verifiedBy === 'object' ? ticket.verifiedBy.name : 'N/A'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/tickets/${ticket._id}`)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View
                    </button>
                    {canVerify && ticket.status === 'pending' && (
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setShowVerifyModal(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tickets.length === 0 && (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <p className="text-gray-500">No tickets found</p>
        </div>
      )}

      {showCreateModal && canCreateTickets && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Ticket (Resolve Task)</h2>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Task</label>
                <select
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={formData.task}
                  onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                >
                  <option value="">Select a task</option>
                  {tasks.map((task) => (
                    <option key={task._id} value={task._id}>
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Resolution Notes</label>
                <textarea
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  rows={4}
                  value={formData.resolutionNotes}
                  onChange={(e) => setFormData({ ...formData, resolutionNotes: e.target.value })}
                  placeholder="Describe how you resolved this task..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Create Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showVerifyModal && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Verify Ticket</h2>
            <div className="mb-4 rounded-md bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-900">Task: {typeof selectedTicket.task === 'object' ? selectedTicket.task.title : 'N/A'}</p>
              <p className="mt-2 text-sm text-gray-600">{selectedTicket.resolutionNotes}</p>
            </div>
            <form onSubmit={handleVerifyTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={verifyData.status}
                  onChange={(e) => setVerifyData({ ...verifyData, status: e.target.value as 'verified' | 'rejected' })}
                >
                  <option value="verified">Verify</option>
                  <option value="rejected">Reject</option>
                </select>
              </div>
              {verifyData.status === 'rejected' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rejection Reason</label>
                  <textarea
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    rows={3}
                    value={verifyData.rejectionReason}
                    onChange={(e) => setVerifyData({ ...verifyData, rejectionReason: e.target.value })}
                    placeholder="Explain why this ticket is being rejected..."
                  />
                </div>
              )}
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowVerifyModal(false);
                    setSelectedTicket(null);
                  }}
                  className="flex-1 rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


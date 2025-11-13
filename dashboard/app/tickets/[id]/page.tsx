'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ticketsAPI } from '@/lib/api';
import { Ticket } from '@/types';
import { format } from 'date-fns';

export default function TicketDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const ticketId = params?.id;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ticketId) return;

    const loadTicket = async () => {
      try {
        setLoading(true);
        const response = await ticketsAPI.getById(ticketId);
        setTicket(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Unable to load ticket details');
      } finally {
        setLoading(false);
      }
    };

    loadTicket();
  }, [ticketId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">Loading ticket...</div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push('/tickets')}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Back to Tickets
        </button>
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error || 'Ticket not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Ticket for {typeof ticket.task === 'object' ? ticket.task.title : 'Task'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">{ticket.resolutionNotes}</p>
        </div>
        <button
          onClick={() => router.push('/tickets')}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Back to Tickets
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ticket Details</h2>
          <dl className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <dt className="font-medium text-gray-700">Status</dt>
              <dd className="capitalize">{ticket.status}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-gray-700">Resolved By</dt>
              <dd>
                {ticket.resolvedBy && typeof ticket.resolvedBy === 'object'
                  ? ticket.resolvedBy.name
                  : 'Unknown'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-gray-700">Verified By</dt>
              <dd>
                {ticket.verifiedBy && typeof ticket.verifiedBy === 'object'
                  ? ticket.verifiedBy.name
                  : 'Pending'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-gray-700">Verified At</dt>
              <dd>
                {ticket.verifiedAt ? format(new Date(ticket.verifiedAt), 'MMM dd, yyyy') : 'N/A'}
              </dd>
            </div>
            {ticket.rejectionReason && (
              <div className="flex justify-between">
                <dt className="font-medium text-gray-700">Rejection Reason</dt>
                <dd className="text-right text-gray-500">{ticket.rejectionReason}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="font-medium text-gray-700">Created At</dt>
              <dd>{format(new Date(ticket.createdAt), 'MMM dd, yyyy')}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-gray-700">Updated At</dt>
              <dd>{format(new Date(ticket.updatedAt), 'MMM dd, yyyy')}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Task Summary</h2>
          <dl className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <dt className="font-medium text-gray-700">Task</dt>
              <dd>{typeof ticket.task === 'object' ? ticket.task.title : 'N/A'}</dd>
            </div>
            {ticket.task && typeof ticket.task === 'object' && (
              <>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-700">Project</dt>
                  <dd>
                    {ticket.task.project && typeof ticket.task.project === 'object'
                      ? ticket.task.project.name
                      : 'N/A'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-700">Task Status</dt>
                  <dd className="capitalize">{ticket.task.status}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-700">Assigned To</dt>
                  <dd>
                    {ticket.task.assignedTo && typeof ticket.task.assignedTo === 'object'
                      ? ticket.task.assignedTo.name
                      : 'Unassigned'}
                  </dd>
                </div>
              </>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}


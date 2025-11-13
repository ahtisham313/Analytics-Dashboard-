'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { tasksAPI } from '@/lib/api';
import { Task } from '@/types';
import { format } from 'date-fns';

export default function TaskDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const taskId = params?.id;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!taskId) return;

    const loadTask = async () => {
      try {
        setLoading(true);
        const response = await tasksAPI.getById(taskId);
        setTask(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Unable to load task details');
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [taskId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">Loading task...</div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push('/tasks')}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Back to Tasks
        </button>
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error || 'Task not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
          {task.description && (
            <p className="mt-2 text-sm text-gray-600">{task.description}</p>
          )}
        </div>
        <button
          onClick={() => router.push('/tasks')}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Back to Tasks
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Task Details</h2>
          <dl className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <dt className="font-medium text-gray-700">Status</dt>
              <dd className="capitalize">{task.status}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-gray-700">Priority</dt>
              <dd className="capitalize">{task.priority}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-gray-700">Project</dt>
              <dd>
                {typeof task.project === 'object' ? task.project.name : 'N/A'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-gray-700">Assigned To</dt>
              <dd>
                {task.assignedTo && typeof task.assignedTo === 'object'
                  ? task.assignedTo.name
                  : 'Unassigned'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-gray-700">Created By</dt>
              <dd>
                {task.createdBy && typeof task.createdBy === 'object'
                  ? task.createdBy.name
                  : 'Unknown'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-gray-700">Due Date</dt>
              <dd>{task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'N/A'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-gray-700">Created At</dt>
              <dd>{format(new Date(task.createdAt), 'MMM dd, yyyy')}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-gray-700">Updated At</dt>
              <dd>{format(new Date(task.updatedAt), 'MMM dd, yyyy')}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { projectsAPI } from '@/lib/api';
import { Project, Task } from '@/types';
import { format } from 'date-fns';

export default function ProjectDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = params?.id;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!projectId) return;

    const loadProject = async () => {
      try {
        setLoading(true);
        const [projectRes, tasksRes] = await Promise.all([
          projectsAPI.getById(projectId),
          projectsAPI.getTasks(projectId),
        ]);
        setProject(projectRes.data);
        setTasks(tasksRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Unable to load project details');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">Loading project...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push('/projects')}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Back to Projects
        </button>
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error || 'Project not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          <p className="mt-2 text-sm text-gray-600">{project.description || 'No description provided.'}</p>
        </div>
        <button
          onClick={() => router.push('/projects')}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Back to Projects
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Details</h2>
          <dl className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <dt className="font-medium text-gray-700">Status</dt>
              <dd className="capitalize">{project.status}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-gray-700">Moderator</dt>
              <dd>
                {typeof project.moderator === 'object' && project.moderator.role === 'moderator'
                  ? project.moderator.name
                  : 'Unassigned'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-gray-700">Users</dt>
              <dd>{Array.isArray(project.members) ? project.members.length : 0}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-gray-700">Start Date</dt>
              <dd>{project.startDate ? format(new Date(project.startDate), 'MMM dd, yyyy') : 'N/A'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-gray-700">End Date</dt>
              <dd>{project.endDate ? format(new Date(project.endDate), 'MMM dd, yyyy') : 'N/A'}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Members</h2>
          {Array.isArray(project.members) && project.members.length > 0 ? (
            <ul className="space-y-2 text-sm text-gray-600">
              {project.members.map((member) => (
                <li key={member._id} className="flex justify-between">
                  <span>{member.name}</span>
                  <span className="text-gray-500">{member.email}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No users assigned to this project yet.</p>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-white shadow overflow-hidden">
        <div className="px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Project Tasks</h2>
          <p className="mt-1 text-sm text-gray-600">All tasks associated with this project.</p>
        </div>
        {tasks.length === 0 ? (
          <div className="px-6 pb-6 text-sm text-gray-500">No tasks found for this project.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Due Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {tasks.map((task) => (
                <tr key={task._id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{task.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {task.assignedTo && typeof task.assignedTo === 'object' ? task.assignedTo.name : 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 capitalize">{task.status}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}


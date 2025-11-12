'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { projectsAPI } from '@/lib/api';
import { hasRole } from '@/lib/auth';
import { Project } from '@/types';
import { format } from 'date-fns';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: [] as string[],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });
  const router = useRouter();
  const canCreate = hasRole(['admin', 'moderator']);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getAll();
      setProjects(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await projectsAPI.create(formData);
      setShowModal(false);
      setFormData({
        name: '',
        description: '',
        members: [],
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
      });
      fetchProjects();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await projectsAPI.delete(id);
      fetchProjects();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="mt-2 text-sm text-gray-600">Manage your projects</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowModal(true)}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Create Project
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div key={project._id} className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                <p className="mt-1 text-sm text-gray-600">{project.description}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium">Status:</span>
                    <span className={`ml-2 rounded-full px-2 py-1 text-xs ${
                      project.status === 'active' ? 'bg-green-100 text-green-800' :
                      project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Moderator:</span> {typeof project.moderator === 'object' ? project.moderator.name : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Members:</span> {Array.isArray(project.members) ? project.members.length : 0}
                  </div>
                  {project.startDate && (
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Start:</span> {format(new Date(project.startDate), 'MMM dd, yyyy')}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => router.push(`/projects/${project._id}`)}
                className="flex-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                View
              </button>
              {canCreate && (
                <button
                  onClick={() => handleDelete(project._id)}
                  className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <p className="text-gray-500">No projects found</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Project</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date (optional)</label>
                <input
                  type="date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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


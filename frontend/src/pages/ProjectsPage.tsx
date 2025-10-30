import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjects, useCreateProject, useDeleteProject } from '../hooks/useProjects';
import { useCurrentSubscription } from '../hooks/useSubscriptions';

export default function ProjectsPage() {
  const { t } = useTranslation();
  const { data: projects, isLoading } = useProjects();
  const { data: subscription } = useCurrentSubscription();
  const createProjectMutation = useCreateProject();
  const deleteProjectMutation = useDeleteProject();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  const projectsQuota = subscription?.plan?.projectsQuota || 3;
  const projectsCount = projects?.length || 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      await createProjectMutation.mutateAsync({
        name: projectName,
        description: projectDescription || undefined,
      });
      
      setProjectName('');
      setProjectDescription('');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleDelete = async (projectId: number, projectName: string) => {
    if (!window.confirm(`${t('projects.delete')} "${projectName}"?`)) {
      return;
    }
    
    try {
      await deleteProjectMutation.mutateAsync(projectId);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('projects.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('projects.quota', { count: projectsCount, limit: projectsQuota })}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label="Create new project"
        >
          {t('projects.create')}
        </button>
      </div>

      {/* Error Messages */}
      {createProjectMutation.isError && (
        <div
          className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"
          role="alert"
          aria-live="polite"
        >
          {(createProjectMutation.error as any)?.response?.data?.error || t('general.error')}
        </div>
      )}

      {deleteProjectMutation.isError && (
        <div
          className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"
          role="alert"
          aria-live="polite"
        >
          {(deleteProjectMutation.error as any)?.response?.data?.error || t('general.error')}
        </div>
      )}

      {/* Projects List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600" role="status" aria-live="polite">
            {t('general.loading')}
          </div>
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:border-indigo-300 transition-colors"
              role="article"
              aria-label={`Project: ${project.name}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                  {project.description && (
                    <p className="text-gray-600 mt-1">{project.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(project.id, project.name)}
                  disabled={deleteProjectMutation.isPending}
                  className="ml-4 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Delete project ${project.name}`}
                >
                  {t('projects.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('projects.noProjects')}</h3>
          <p className="mt-1 text-sm text-gray-500">{t('projects.createFirst')}</p>
        </div>
      )}

      {/* Create Project Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 id="modal-title" className="text-xl font-bold text-gray-900">
                {t('projects.create')}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                aria-label="Close modal"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('projects.name')}
                </label>
                <input
                  id="project-name"
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={t('projects.name')}
                  aria-required="true"
                />
              </div>

              <div>
                <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('projects.description')}
                </label>
                <textarea
                  id="project-description"
                  rows={3}
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={t('projects.description')}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {t('general.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={createProjectMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createProjectMutation.isPending ? t('general.loading') : t('general.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

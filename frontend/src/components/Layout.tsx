import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link
                to="/"
                className="flex items-center px-2 text-xl font-bold text-indigo-600 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded"
                aria-label="Go to home page"
              >
                Talavera
              </Link>
              {isAuthenticated && (
                <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                  <Link
                    to="/projects"
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    {t('projects.title')}
                  </Link>
                  <Link
                    to="/plans"
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    {t('plans.title')}
                  </Link>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleLanguage}
                className="px-3 py-1 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-label={`Switch to ${i18n.language === 'en' ? 'Spanish' : 'English'}`}
              >
                {i18n.language === 'en' ? 'ES' : 'EN'}
              </button>

              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700" aria-label="Current user">
                    {user?.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    aria-label="Logout from account"
                  >
                    {t('auth.logout')}
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md"
                  >
                    {t('auth.login')}
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    {t('auth.signup')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
        {children}
      </main>
    </div>
  );
}

import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { useAuth } from './contexts/AuthContext';

// Placeholder pages
function HomePage() {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/projects" replace />;
  }
  
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Talavera Subscriptions</h1>
      <p className="text-lg text-gray-600">Manage your projects with subscription-based quotas</p>
    </div>
  );
}

function ProjectsPage() {
  return <div>Projects Page - Coming soon</div>;
}

function PlansPage() {
  return <div>Plans Page - Coming soon</div>;
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/plans"
          element={
            <ProtectedRoute>
              <PlansPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
}

export default App;


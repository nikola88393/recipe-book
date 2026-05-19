import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { RecipeDetail } from './pages/RecipeDetail';
import { RecipeForm } from './pages/RecipeForm';
import { useCurrentUser } from './hooks/useCurrentUser';

/* ── Guards ─────────────────────────────────────────────────────────────────
   ProtectedRoute: redirects to /login if not signed in (waits for auth state)
   PublicOnlyRoute: redirects to /book if already signed in (avoids flash)
─────────────────────────────────────────────────────────────────────────── */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useCurrentUser();
  if (loading) return <AuthSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useCurrentUser();
  if (loading) return <AuthSpinner />;
  if (user) return <Navigate to="/book" replace />;
  return <>{children}</>;
}

function AuthSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-celadon border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  const { user } = useCurrentUser();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <AuthPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <AuthPage />
          </PublicOnlyRoute>
        }
      />

      {/* Protected — requires Firebase auth */}
      <Route
        path="/book"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard currentUser={user} />} />
        <Route path="recipe/new" element={<RecipeForm />} />
        <Route path="recipe/:id" element={<RecipeDetail />} />
        <Route path="recipe/:id/edit" element={<RecipeForm />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

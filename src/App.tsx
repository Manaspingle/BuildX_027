import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import IndividualDashboard from '@/pages/IndividualDashboard';
import OrganPledge from '@/pages/OrganPledge';
import HospitalDashboard from '@/pages/HospitalDashboard';
import CreateRequest from '@/pages/CreateRequest';
import MatchingEngine from '@/pages/MatchingEngine';
import EmergencyDispatch from '@/pages/EmergencyDispatch';
import TransparencyLog from '@/pages/TransparencyLog';
import AIRecommendations from '@/pages/AIRecommendations';
import Reports from '@/pages/Reports';
import NearbyHospitals from '@/pages/NearbyHospitals';
import DonorDirectory from '@/pages/DonorDirectory';
import type { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }
  if (!session) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<ProtectedRoute><IndividualDashboard /></ProtectedRoute>} />
        <Route path="/organ-pledge" element={<ProtectedRoute><OrganPledge /></ProtectedRoute>} />
        <Route path="/hospital-dashboard" element={<ProtectedRoute><HospitalDashboard /></ProtectedRoute>} />
        <Route path="/create-request" element={<ProtectedRoute><CreateRequest /></ProtectedRoute>} />
        <Route path="/matching-engine" element={<ProtectedRoute><MatchingEngine /></ProtectedRoute>} />
        <Route path="/dispatch" element={<ProtectedRoute><EmergencyDispatch /></ProtectedRoute>} />
        <Route path="/transparency" element={<ProtectedRoute><TransparencyLog /></ProtectedRoute>} />
        <Route path="/recommendations" element={<ProtectedRoute><AIRecommendations /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/nearby-hospitals" element={<ProtectedRoute><NearbyHospitals /></ProtectedRoute>} />
        <Route path="/donor-directory" element={<ProtectedRoute><DonorDirectory /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

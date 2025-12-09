import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SettingsPage from './pages/SettingsPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Protected Route Wrapper
const RequireAuth = () => {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex items-center justify-center h-screen bg-slate-900 text-white">Loading...</div>;
  
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <div className="flex h-screen w-screen overflow-hidden bg-lightGray">
      <Sidebar />
      <main className="flex-1 h-full relative">
        <Outlet />
      </main>
  </div>;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route element={<RequireAuth />}>
              <Route path="/" element={<Navigate to="/chat" replace />} />
              <Route path="/chat" element={<ChatInterface />} />
              <Route path="/chat/:sessionId" element={<ChatInterface />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

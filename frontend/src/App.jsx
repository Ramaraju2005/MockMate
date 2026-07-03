import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';

import LoginPage from './components/LoginPage';
import RoomSelectionPage from './components/RoomSelectionPage';
import RoomPage from './components/RoomPage';

// A simple wrapper to protect routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// A wrapper to handle the login page redirection if already logged in
const LoginRoute = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <LoginPage />;
};

function AppContent() {
  const location = useLocation();

  const hideNavbar = location.pathname.startsWith('/room/');

  return (
    <div className="flex flex-col min-h-screen">
      {!hideNavbar && <Navbar />}
      <div className="flex-1 flex flex-col">
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          
          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/room-selection" 
            element={
              <ProtectedRoute>
                <RoomSelectionPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/room/:roomId" 
            element={
              <ProtectedRoute>
                <RoomPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

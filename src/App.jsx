import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import PropTypes from 'prop-types';
import HomePage from './components/HomePage';
import CommunityPage from './components/CommunityPage';
import UserLog from './components/UserLog';
import Register from './components/Register';
import Navbar from './components/Section/Navbar';
import Profile from './components/Profile';
import TicketDetail from './components/TicketDetail';
import AdminPage from './components/AdminPage';
import AdminRoute from './components/AdminRoute';
import TicketPage from './components/TicketPage';
import EventDetail from './components/EventDetail';
import PaymentComplete from './components/PaymentComplete';
import AIAssistantPage from './components/AnnaPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[#EBE3D5] flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

function App() {
  return (
    <Router>
      <div className="relative min-h-screen bg-[#EBE3D5]">
        <Navbar />
        <main>
          <Routes>
            {/* Public routes - accessible without authentication */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<UserLog />} />
            <Route path="/register" element={<Register />} />
            <Route path="/anna" element={<AIAssistantPage />} />
            
            {/* Protected routes - require authentication */}
            <Route path="/community" element={
              <ProtectedRoute>
                <CommunityPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/ticket/:id" element={
              <ProtectedRoute>
                <TicketDetail />
              </ProtectedRoute>
            } />
            <Route path="/tickets" element={
              <ProtectedRoute>
                <TicketPage />
              </ProtectedRoute>
            } />
            <Route path="/event/:id" element={
              <ProtectedRoute>
                <EventDetail />
              </ProtectedRoute>
            } />
            <Route path="/payment-complete" element={
              <ProtectedRoute>
                <PaymentComplete />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            } />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

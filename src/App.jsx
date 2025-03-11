import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
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
import TicketScanner from './components/TicketScanner';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        setIsAdmin(userDoc.data()?.role === "admin");
      }
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5B2600]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

// 404 Not Found Component
const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#EBE3D5] flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-fuzzy text-[#4A3427] font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-[#4A3427] mb-6 text-center">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-[#8B4513] text-white rounded-xl font-fuzzy hover:bg-[#5B2600] transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
};

// Get base URL from environment or default to '/'
const baseUrl = import.meta.env.PUBLIC_URL || '/';

function App() {
  return (
    <Router basename={baseUrl}>
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
            <Route path="/ticket/:ticketId" element={
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
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/scan" element={
              <ProtectedRoute>
                <TicketScanner />
              </ProtectedRoute>
            } />

            {/* 404 route */}
            <Route path="/404" element={<NotFound />} />
            
            {/* Catch all - redirect to 404 */}
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

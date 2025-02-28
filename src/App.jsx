import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <div className="relative min-h-screen bg-[#EBE3D5]">
        <Navbar />
        <main>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<UserLog />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected route example */}
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/ticket/:id" element={<TicketDetail />} />
            <Route path="/tickets" element={<TicketPage />} />
            <Route path="/event/:id" element={<EventDetail />} />
            <Route path="/payment-complete" element={<PaymentComplete />} />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

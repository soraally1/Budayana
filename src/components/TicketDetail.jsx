import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Calendar, Clock, MapPin, Loader2, AlertCircle, Users, ArrowLeft, Ticket } from 'lucide-react';
import { auth } from '../firebase';
import { motion } from 'framer-motion';
import QRCode from 'react-qr-code';
import BudayanaLogo from '../assets/Budayana.png';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTicketDetails = async () => {
      if (!auth.currentUser) {
        setError('You must be logged in to view ticket details.');
        navigate('/login');
        return;
      }

      try {
        const ticketDoc = await getDoc(doc(db, 'tickets', id));
        if (ticketDoc.exists()) {
          const ticketData = { id: ticketDoc.id, ...ticketDoc.data() };
          console.log('Fetched ticket:', ticketData);
          setTicket(ticketData);
        } else {
          setError('Ticket not found');
        }
      } catch (error) {
        console.error('Error fetching ticket details:', error);
        setError('Failed to load ticket details');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
  }, [id, navigate]);

  // Helper function to safely format dates
  const formatDate = (dateValue) => {
    if (!dateValue) return 'TBA';
    try {
      // Handle Firestore Timestamp
      if (dateValue && typeof dateValue.toDate === 'function') {
        dateValue = dateValue.toDate();
      }
      return new Date(dateValue).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'TBA';
    }
  };

  // Helper function to safely format times
  const formatTime = (dateValue) => {
    if (!dateValue) return 'TBA';
    try {
      // Handle Firestore Timestamp
      if (dateValue && typeof dateValue.toDate === 'function') {
        dateValue = dateValue.toDate();
      }
      return new Date(dateValue).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'TBA';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EBE3D5] via-[#FFD384]/10 to-[#EBE3D5] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B4513] mb-4" />
        <p className="text-[#8B4513] font-fuzzy">Loading ticket details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EBE3D5] via-[#FFD384]/10 to-[#EBE3D5] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-fuzzy font-bold text-[#8B4513] mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-[#8B4513] text-white rounded-xl font-fuzzy hover:bg-[#5B2600] transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EBE3D5] via-[#FFD384]/10 to-[#EBE3D5] pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src={BudayanaLogo}
            alt="Budayana Logo"
            className="h-12 mx-auto mb-4"
          />
          <h1 className="text-2xl md:text-3xl font-fuzzy font-bold text-[#8B4513]">
            Ticket Details
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* Ticket Header */}
          <div className="bg-gradient-to-r from-[#8B4513] to-[#5B2600] p-6 rounded-t-2xl">
            <div className="flex items-start justify-between">
              <div className="text-white">
                <h2 className="font-fuzzy font-bold text-2xl mb-2">{ticket.eventName}</h2>
                <p className="text-sm opacity-90">
                  {ticket.ticketNumber || `#order_${ticket.id.slice(0, 8)}`}
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <Ticket className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-6 space-y-6 bg-[#FFF8F0]">
            {/* Event Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#8B4513]" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{formatDate(ticket.eventDate || ticket.purchaseDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#8B4513]" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">{formatTime(ticket.eventDate || ticket.purchaseDate)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-2 md:col-span-1">
                <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-[#8B4513]" />
                    <div>
                      <p className="text-sm text-gray-500">Venue</p>
                      <p className="font-medium">{ticket.venue || 'Jawa Barat'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[#8B4513]" />
                    <div>
                      <p className="text-sm text-gray-500">Quantity</p>
                      <p className="font-medium">{ticket.quantity || 1} Ticket(s)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex flex-col items-center gap-4">
                <div className="bg-[#FFF8F0] p-4 rounded-xl">
                  <QRCode
                    value={`${window.location.origin}/ticket/${ticket.id}`}
                    size={160}
                    level="H"
                    fgColor="#8B4513"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Scan QR Code to verify ticket</p>
                  <p className="text-xs text-gray-400">Ticket ID: {ticket.id}</p>
                </div>
              </div>
            </div>

            {/* Price Information */}
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Price per ticket</p>
                  <p className="font-fuzzy font-bold text-[#8B4513]">
                    Rp {ticket.price.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-fuzzy font-bold text-[#8B4513]">
                    Rp {(ticket.totalPrice || (ticket.price * (ticket.quantity || 1))).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gradient-to-r from-[#8B4513] to-[#5B2600] flex justify-between items-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 bg-white text-[#8B4513] rounded-xl font-fuzzy hover:bg-[#FFF8F0] transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TicketDetail; 

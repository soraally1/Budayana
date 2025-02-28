import { motion } from "framer-motion";
import { Ticket, Calendar, Clock, MapPin, QrCode, Users } from "lucide-react";
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';

const TicketCard = ({ ticket }) => {
  const navigate = useNavigate();
  console.log('Rendering ticket:', ticket); // Debug log

  // Validate ticket data
  const validateTicket = () => {
    const requiredFields = ['id', 'eventName', 'price'];
    const missingFields = requiredFields.filter(field => !ticket[field]);
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return false;
    }
    return true;
  };

  const getQRData = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/ticket/${ticket.id}`;
  };

  // Helper function to safely format dates
  const formatDateSafe = (dateValue) => {
    if (!dateValue) return 'TBA';
    
    try {
      // Handle Firestore Timestamp
      if (dateValue && typeof dateValue.toDate === 'function') {
        return formatDate(dateValue.toDate());
      }
      // Handle string dates
      if (typeof dateValue === 'string') {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return 'TBA';
        return formatDate(date);
      }
      // Handle Date objects
      if (dateValue instanceof Date) {
        return formatDate(dateValue);
      }
      return 'TBA';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'TBA';
    }
  };

  // Helper function to safely format times
  const formatTimeSafe = (dateValue) => {
    if (!dateValue) return 'TBA';
    
    try {
      // Handle Firestore Timestamp
      if (dateValue && typeof dateValue.toDate === 'function') {
        return formatTime(dateValue.toDate());
      }
      // Handle string dates
      if (typeof dateValue === 'string') {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return 'TBA';
        return formatTime(date);
      }
      // Handle Date objects
      if (dateValue instanceof Date) {
        return formatTime(dateValue);
      }
      return 'TBA';
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'TBA';
    }
  };

  if (!validateTicket()) {
    return (
      <div className="bg-red-50 p-4 rounded-xl border border-red-200">
        <p className="text-red-600 text-sm font-fuzzy">
          Ticket data is incomplete. Missing required fields.
          <br />
          <span className="text-xs opacity-75">Debug info: {JSON.stringify(ticket)}</span>
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex flex-col md:flex-row">
        {/* Left Section - Event Info */}
        <div className="flex-1 p-4 sm:p-6 bg-gradient-to-r from-[#8B4513] to-[#5B2600]">
          <div className="text-white">
            <h3 className="font-fuzzy font-bold text-xl sm:text-2xl mb-2">{ticket.eventName}</h3>
            <p className="text-sm opacity-90 mb-4">
              {ticket.ticketNumber || `#order_${ticket.id.slice(0, 8)}`}
            </p>
            
            {/* Event Details Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm bg-white/10 backdrop-blur-sm p-2 sm:p-2.5 rounded-xl">
                <Calendar className="w-4 h-4 text-white" />
                <span className="text-white/90">{formatDateSafe(ticket.eventDate || ticket.purchaseDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm bg-white/10 backdrop-blur-sm p-2 sm:p-2.5 rounded-xl">
                <Clock className="w-4 h-4 text-white" />
                <span className="text-white/90">{formatTimeSafe(ticket.eventDate || ticket.purchaseDate)}</span>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 flex items-center gap-2 text-xs sm:text-sm bg-white/10 backdrop-blur-sm p-2 sm:p-2.5 rounded-xl">
              <MapPin className="w-4 h-4 text-white" />
              <span className="text-white/90 line-clamp-1">{ticket.venue || 'Jawa Barat'}</span>
            </div>

            <div className="mt-3 sm:mt-4 flex items-center gap-2 text-xs sm:text-sm bg-white/10 backdrop-blur-sm p-2 sm:p-2.5 rounded-xl">
              <Users className="w-4 h-4 text-white" />
              <span className="text-white/90">{ticket.quantity || 1} Tiket</span>
            </div>
          </div>
        </div>

        {/* Perforated Line - Hidden on mobile, shown on md and up */}
        <div className="hidden md:flex relative w-8 bg-[#FFF8F0] flex-col justify-between items-center py-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-full bg-[#8B4513]/10" />
          ))}
        </div>

        {/* Horizontal Perforated Line - Shown on mobile only */}
        <div className="md:hidden h-8 bg-[#FFF8F0] flex justify-between items-center px-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-full bg-[#8B4513]/10" />
          ))}
        </div>

        {/* Right Section - QR Code and Price */}
        <div className="w-full md:w-72 bg-[#FFF8F0] p-4 sm:p-6 flex flex-col sm:flex-row md:flex-col justify-between gap-4 sm:gap-6 md:gap-0">
          {/* QR Code */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm">
              <QRCode
                value={getQRData()}
                size={100}
                level="H"
                fgColor="#8B4513"
              />
            </div>
            <div className="text-center mt-2 sm:mt-3">
              <p className="text-xs sm:text-sm text-[#8B4513]/70 mb-1">Scan to verify ticket</p>
              <p className="text-xs text-[#8B4513]/50">ID: {ticket.id.slice(0, 8)}</p>
            </div>
          </div>

          {/* Price and Action */}
          <div className="flex flex-col justify-end">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <div>
                <p className="text-xs text-[#8B4513]/70">Total Price</p>
                <p className="font-fuzzy font-bold text-[#8B4513] text-base sm:text-lg">
                  Rp {(ticket.totalPrice || (ticket.price * (ticket.quantity || 1))).toLocaleString('id-ID')}
                </p>
              </div>
              <div className="bg-[#8B4513]/10 p-2 rounded-lg">
                <Ticket className="w-5 h-5 text-[#8B4513]" />
              </div>
            </div>
            <button 
              onClick={() => navigate(`/ticket/${ticket.id}`)}
              className="w-full py-2 sm:py-2.5 bg-[#8B4513] text-white rounded-xl text-sm font-fuzzy hover:bg-[#5B2600] transition-colors flex items-center justify-center gap-2"
            >
              Lihat Detail
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Helper functions to format date and time
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// PropTypes validation
TicketCard.propTypes = {
  ticket: PropTypes.shape({
    id: PropTypes.string.isRequired,
    eventName: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    eventId: PropTypes.string,
    eventDate: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
      PropTypes.object // For Firestore Timestamp
    ]),
    purchaseDate: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
      PropTypes.object // For Firestore Timestamp
    ]),
    quantity: PropTypes.number,
    totalPrice: PropTypes.number,
    venue: PropTypes.string,
    ticketNumber: PropTypes.string,
    buyerName: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
};

export default TicketCard; 

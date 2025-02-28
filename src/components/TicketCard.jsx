import { motion } from "framer-motion";
import { Ticket, Calendar, Clock, MapPin } from "lucide-react";
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const TicketCard = ({ ticket }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md p-4 space-y-3"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-fuzzy font-bold text-[#5B2600]">{ticket.eventName}</h3>
          <p className="text-sm text-gray-600">{ticket.ticketType}</p>
        </div>
        <div className="bg-[#FFD384]/20 p-2 rounded-lg">
          <Ticket className="w-5 h-5 text-[#5B2600]" />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(ticket.eventDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{formatTime(ticket.eventDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{ticket.venue}</span>
        </div>
      </div>

      <div className="pt-2 flex justify-between items-center border-t">
        <span className="text-sm font-fuzzy font-bold text-[#5B2600]">
          Rp {ticket.price.toLocaleString('id-ID')}
        </span>
        <button 
          onClick={() => navigate(`/ticket/${ticket.id}`)}
          className="text-sm text-[#5B2600] hover:underline font-fuzzy"
        >
          Lihat Detail
        </button>
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
    ticketType: PropTypes.string.isRequired,
    eventDate: PropTypes.string.isRequired,
    venue: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
};

export default TicketCard; 
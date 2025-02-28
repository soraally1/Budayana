import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { auth } from '../firebase';

const TicketDetail = () => {
  const { id } = useParams(); // Get the ticket ID from the URL
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTicketDetails = async () => {
      // Check if the user is authenticated
      if (!auth.currentUser) {
        setError('You must be logged in to view ticket details.');
        navigate('/login'); // Redirect to login page
        return;
      }

      try {
        const ticketDoc = await getDoc(doc(db, 'tickets', id));
        if (ticketDoc.exists()) {
          setTicket({ id: ticketDoc.id, ...ticketDoc.data() });
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-[#5B2600] mb-4">{ticket.eventName}</h1>
      <div className="flex items-center mb-2">
        <Calendar className="w-5 h-5 text-[#5B2600] mr-2" />
        <span>{ticket.eventDate}</span>
      </div>
      <div className="flex items-center mb-2">
        <Clock className="w-5 h-5 text-[#5B2600] mr-2" />
        <span>{ticket.eventTime}</span>
      </div>
      <div className="flex items-center mb-2">
        <MapPin className="w-5 h-5 text-[#5B2600] mr-2" />
        <span>{ticket.venue}</span>
      </div>
      <p className="text-lg font-bold text-[#5B2600]">Price: Rp {ticket.price.toLocaleString()}</p>
      <p className="mt-4">Quantity: {ticket.quantity}</p>
      <button 
        onClick={() => navigate(-1)} 
        className="mt-6 px-4 py-2 bg-[#5B2600] text-white rounded-lg hover:bg-[#4A3427] transition-colors"
      >
        Back
      </button>
    </div>
  );
};

export default TicketDetail; 
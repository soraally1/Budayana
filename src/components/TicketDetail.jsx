import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Calendar, Clock, MapPin, Loader2, AlertCircle, Users, ArrowLeft, Ticket, Copy, CheckCircle2, XCircle, Download, Share2 } from 'lucide-react';
import { auth } from '../firebase';
import { motion } from 'framer-motion';
import QRCode from 'react-qr-code';
import BudayanaLogo from '../assets/Budayana.png';

const TicketDetail = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Validate ticket data
  const validateTicket = (ticketData) => {
    const requiredFields = ['id', 'userId', 'eventName', 'price'];
    const missingFields = requiredFields.filter(field => !ticketData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    return true;
  };

  useEffect(() => {
    const fetchTicketDetails = async () => {
      console.log('Fetching ticket details for ID:', ticketId);
      console.log('Current auth state:', auth.currentUser);

      if (!auth.currentUser) {
        console.log('No user logged in, redirecting to login');
        setError('You must be logged in to view ticket details.');
        navigate('/login');
        return;
      }

      try {
        console.log('Fetching ticket document from Firestore');
        const ticketDoc = await getDoc(doc(db, 'tickets', ticketId));
        
        if (ticketDoc.exists()) {
          const ticketData = { id: ticketDoc.id, ...ticketDoc.data() };
          console.log('Fetched ticket data:', ticketData);
          
          // Validate ticket data
          try {
            validateTicket(ticketData);
          } catch (validationError) {
            console.error('Ticket validation failed:', validationError);
            setError('Invalid ticket data. Please contact support.');
            return;
          }
          
          // Check if the ticket belongs to the current user
          if (ticketData.userId !== auth.currentUser.uid) {
            console.log('Ticket does not belong to current user');
            setError('You do not have permission to view this ticket.');
            navigate('/tickets');
            return;
          }

          // Fetch event details
          if (ticketData.eventId) {
            const eventDoc = await getDoc(doc(db, 'events', ticketData.eventId));
            if (eventDoc.exists()) {
              const eventData = eventDoc.data();
              setEvent({ 
                id: eventDoc.id, 
                ...eventData,
                // Ensure all required event fields have fallback values
                name: eventData.name || ticketData.eventName || 'Unknown Event',
                date: eventData.date || ticketData.eventDate,
                time: eventData.time || ticketData.eventTime,
                venue: eventData.venue || ticketData.venue || 'Venue TBA',
                description: eventData.description || 'No description available',
                category: eventData.category || 'Cultural Event',
                maxTickets: eventData.maxTickets || 0,
                ticketsSold: eventData.ticketsSold || 0
              });
            }
          }
          
          setTicket(ticketData);
        } else {
          console.log('Ticket not found in Firestore');
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
  }, [ticketId, navigate]);

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
  const formatTime = (timeValue) => {
    if (!timeValue) return 'TBA';
    try {
      // If it's already a time string (HH:mm format), return it directly
      if (typeof timeValue === 'string' && timeValue.includes(':')) {
        return timeValue;
      }

      // If it's a date object or timestamp, format it
      if (timeValue instanceof Date || (timeValue && typeof timeValue.toDate === 'function')) {
        const date = timeValue instanceof Date ? timeValue : timeValue.toDate();
        return date.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      // If it's a string that can be parsed as a date
      const parsedDate = new Date(timeValue);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      return 'TBA';
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'TBA';
    }
  };

  // Generate QR code data with validation
  const getQRData = () => {
    if (!ticket) return '';
    
    const baseUrl = window.location.origin;
    const ticketUrl = `${baseUrl}/ticket/${ticket.id}`;
    const qrData = {
      url: ticketUrl,
      ticketId: ticket.id,
      eventName: event?.name || ticket.eventName || 'Unknown Event',
      eventDate: event?.date || ticket.eventDate,
      eventTime: event?.time || ticket.eventTime,
      venue: event?.venue || ticket.venue || 'Venue TBA',
      buyerName: ticket.userName || 'Anonymous',
      quantity: ticket.quantity || 1,
      totalPrice: ticket.totalPrice || (ticket.price * (ticket.quantity || 1)),
      status: ticket.status || 'valid',
      purchaseDate: ticket.purchaseDate,
      eventId: ticket.eventId,
      userId: ticket.userId
    };
    return JSON.stringify(qrData);
  };

  const copyTicketId = () => {
    if (!ticket?.id) return;
    navigator.clipboard.writeText(ticket.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code');
    if (!canvas) return;
    
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `ticket-${ticket.id}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const shareTicket = async () => {
    if (!navigator.share || !ticket) return;
    
    try {
      await navigator.share({
        title: event?.name || ticket.eventName || 'My Ticket',
        text: `Check out my ticket for ${event?.name || ticket.eventName}`,
        url: window.location.href,
      });
    } catch (error) {
      console.error('Error sharing:', error);
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
                <h2 className="font-fuzzy font-bold text-2xl mb-2">{event?.name || ticket.eventName}</h2>
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
                      <p className="font-medium">{formatDate(event?.date || ticket.eventDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#8B4513]" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">{formatTime(event?.time || ticket.eventTime)}</p>
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
                      <p className="font-medium">{event?.venue || ticket.venue || 'Venue TBA'}</p>
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

            {/* Event Description */}
            {event?.description && (
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h3 className="font-fuzzy font-bold text-[#8B4513] mb-2">Event Description</h3>
                <p className="text-gray-600">{event.description}</p>
              </div>
            )}

            {/* QR Code Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex flex-col items-center gap-4">
                <div id="qr-code" className="bg-white p-4 rounded-xl border-2 border-[#8B4513]/10">
                  <QRCode
                    value={getQRData()}
                    size={250}
                    level="H"
                    fgColor="#8B4513"
                    bgColor="#ffffff"
                    includeMargin={true}
                    marginSize={2}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Scan QR Code to verify ticket</p>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-xs text-gray-400">Ticket ID: {ticket.id}</p>
                    <button
                      onClick={copyTicketId}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={downloadQRCode}
                    className="px-4 py-2 bg-[#8B4513] text-white rounded-lg hover:bg-[#5B2600] transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download QR
                  </button>
                  <button
                    onClick={shareTicket}
                    className="px-4 py-2 bg-[#8B4513] text-white rounded-lg hover:bg-[#5B2600] transition-colors flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
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

            {/* Ticket Status */}
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {ticket.status === 'valid' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium capitalize">{ticket.status || 'valid'}</p>
                  </div>
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

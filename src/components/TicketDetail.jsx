import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Calendar, Clock, MapPin, Loader2, AlertCircle, Users, ArrowLeft, Ticket, Copy, CheckCircle2, XCircle, Download, Share2, Printer, AlertTriangle } from 'lucide-react';
import { auth } from '../firebase';
import { motion } from 'framer-motion';
import QRCode from 'react-qr-code';
import BudayanaLogo from '../assets/Budayana.png';

const TicketDetail = () => {
  const params = useParams();
  const { id } = params;
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [timeUntilEvent, setTimeUntilEvent] = useState(null);

  // Calculate time until event
  useEffect(() => {
    if (event?.date && event?.time) {
      const calculateTimeUntilEvent = () => {
        const eventDateTime = new Date(`${event.date} ${event.time}`);
        const now = new Date();
        const diff = eventDateTime - now;

        if (diff <= 0) {
          setTimeUntilEvent('Event has passed');
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        setTimeUntilEvent(`${days}d ${hours}h ${minutes}m`);
      };

      calculateTimeUntilEvent();
      const interval = setInterval(calculateTimeUntilEvent, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [event?.date, event?.time]);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        if (!id || id === 'undefined' || id === 'null') {
          setError('Invalid ticket ID. Please check the URL.');
          setLoading(false);
          return;
        }

        const currentUser = auth.currentUser;
        if (!currentUser) {
          setError('You must be logged in to view ticket details.');
          navigate('/login', { state: { from: `/ticket/${id}` } });
          setLoading(false);
          return;
        }

        const ticketRef = doc(db, 'tickets', id);
        const ticketDoc = await getDoc(ticketRef);
        
        if (!ticketDoc.exists()) {
          setError('Ticket not found');
          setLoading(false);
          return;
        }

        const rawData = ticketDoc.data();
        const ticketData = {
          id: ticketDoc.id,
          ...rawData,
          price: Number(rawData.price || 0),
          totalPrice: Number(rawData.totalPrice || 0),
          quantity: Number(rawData.quantity || 1)
        };

        if (ticketData.userId !== currentUser.uid) {
          setError('You do not have permission to view this ticket.');
          navigate('/tickets');
          setLoading(false);
          return;
        }

        setTicket(ticketData);

        if (ticketData.eventId) {
          try {
            const eventDoc = await getDoc(doc(db, 'events', ticketData.eventId));
            
            if (eventDoc.exists()) {
              const eventData = eventDoc.data();
              setEvent({
                id: eventDoc.id,
                ...eventData,
                name: eventData.name || ticketData.eventName || 'Unknown Event',
                date: eventData.date || formatDate(ticketData.purchaseDate) || 'TBA',
                time: eventData.time || formatTime(ticketData.purchaseDate) || 'TBA',
                venue: eventData.venue || 'Venue TBA',
                description: eventData.description || 'No description available',
                category: eventData.category || 'Cultural Event',
                maxTickets: Number(eventData.maxTickets || 0),
                ticketsSold: Number(eventData.ticketsSold || 0)
              });
            } else {
              setEvent({
                id: ticketData.eventId,
                name: ticketData.eventName || 'Unknown Event',
                date: formatDate(ticketData.purchaseDate) || 'TBA',
                time: formatTime(ticketData.purchaseDate) || 'TBA',
                venue: 'Venue TBA',
                description: 'Event details not available',
                category: 'Cultural Event',
                maxTickets: 0,
                ticketsSold: 0
              });
            }
          } catch (eventError) {
            console.error('Error fetching event:', eventError);
            setEvent({
              id: ticketData.eventId,
              name: ticketData.eventName || 'Unknown Event',
              date: formatDate(ticketData.purchaseDate) || 'TBA',
              time: formatTime(ticketData.purchaseDate) || 'TBA',
              venue: 'Venue TBA',
              description: 'Event details not available',
              category: 'Cultural Event',
              maxTickets: 0,
              ticketsSold: 0
            });
          }
        }
      } catch (error) {
        console.error('Error fetching ticket details:', error);
        setError('Failed to load ticket details: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
  }, [id, navigate]);

  const formatDate = (dateValue) => {
    if (!dateValue) return 'TBA';
    try {
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

  const formatTime = (timeValue) => {
    if (!timeValue) return 'TBA';
    try {
      if (typeof timeValue === 'string' && timeValue.includes(':')) {
        return timeValue;
      }

      if (timeValue instanceof Date || (timeValue && typeof timeValue.toDate === 'function')) {
        const date = timeValue instanceof Date ? timeValue : timeValue.toDate();
        return date.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit'
        });
      }

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

  const printTicket = () => {
    window.print();
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
                  {timeUntilEvent && (
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-[#8B4513]" />
                      <div>
                        <p className="text-sm text-gray-500">Time Until Event</p>
                        <p className="font-medium text-[#8B4513]">{timeUntilEvent}</p>
                      </div>
                    </div>
                  )}
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
                <div className="flex flex-wrap gap-2 justify-center">
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
                  <button
                    onClick={printTicket}
                    className="px-4 py-2 bg-[#8B4513] text-white rounded-lg hover:bg-[#5B2600] transition-colors flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Print
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

      {/* Print Styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .ticket-print, .ticket-print * {
              visibility: visible;
            }
            .ticket-print {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}
      </style>
    </div>
  );
};

export default TicketDetail;
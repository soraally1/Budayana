import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, collection, getDocs, query, where, addDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  Calendar,
  Clock,
  MapPin,
  Ticket as TicketIcon,
  AlertTriangle,
  Users,
  Loader2,
  Info,
  Share2,
  X as XIcon
} from 'lucide-react';
import { Dialog } from '@headlessui/react';

const ticketStyles = `
  .event-ticket {
    position: relative;
    background: linear-gradient(135deg, #FBF7F4 0%, #FFFFFF 100%);
    border-radius: 32px;
    border: 1px solid #E8DED5;
    overflow: visible;
    transition: all 0.3s ease;
  }

  .event-ticket::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 34px;
    padding: 2px;
    background: linear-gradient(135deg, #5B2600 0%, #8B4513 100%);
    opacity: 0.1;
    pointer-events: none;
  }

  .ticket-header {
    position: relative;
    padding: 2rem;
    background: linear-gradient(135deg, #5B2600 0%, #8B4513 100%);
    border-radius: 30px 30px 0 0;
    overflow: hidden;
  }

  .ticket-header::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url('/path-to-pattern.svg');
    opacity: 0.1;
    mix-blend-mode: soft-light;
  }

  .ticket-body {
    position: relative;
    padding: 2rem;
  }

  .ticket-divider {
    position: relative;
    margin: 0 -2rem;
    padding: 2rem;
  }

  .ticket-divider::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background-image: 
      linear-gradient(90deg, transparent 50%, #E8DED5 50%),
      linear-gradient(90deg, #5B2600 0%, #8B4513 100%);
    background-size: 16px 2px, 100% 2px;
    opacity: 0.2;
  }
    
  .ticket-pattern {
    position: absolute;
    inset: 0;
    background-image: 
      radial-gradient(#5B2600 0.5px, transparent 0.5px),
      radial-gradient(#5B2600 0.5px, transparent 0.5px);
    background-size: 24px 24px;
    background-position: 0 0, 12px 12px;
    opacity: 0.02;
    pointer-events: none;
  }

  .progress-bar {
    position: relative;
    height: 6px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 999px;
    overflow: hidden;
  }

  .progress-bar-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: linear-gradient(90deg, #FFD700, #FFA500);
    border-radius: 999px;
    transition: width 0.3s ease;
  }

  .ticket-info {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    padding: 1.5rem;
    background: rgba(91, 38, 0, 0.03);
    border-radius: 16px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .info-label {
    font-size: 0.875rem;
    color: #8B4513;
  }

  .info-value {
    font-weight: 600;
    color: #5B2600;
  }

  .event-image-container {
    position: relative;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 20px 40px -12px rgba(91, 38, 0, 0.1);
  }

  .event-image-container::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 60%, rgba(91, 38, 0, 0.8));
    z-index: 1;
  }

  .event-info-card {
    position: relative;
    background: linear-gradient(135deg, #FBF7F4 0%, #FFFFFF 100%);
    border-radius: 24px;
    overflow: hidden;
  }

  .event-info-card::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 25px;
    padding: 1px;
    background: linear-gradient(135deg, #5B2600 0%, #8B4513 100%);
    opacity: 0.1;
    pointer-events: none;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .info-box {
    background: rgba(91, 38, 0, 0.03);
    border-radius: 16px;
    padding: 1.25rem;
    transition: all 0.2s ease;
  }

  .info-box:hover {
    background: rgba(91, 38, 0, 0.05);
    transform: translateY(-2px);
  }

  .description-container {
    position: relative;
    padding: 2rem;
    background: rgba(91, 38, 0, 0.02);
    border-radius: 16px;
    margin-top: 2rem;
  }

  .description-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 2rem;
    right: 2rem;
    height: 1px;
    background: linear-gradient(90deg, transparent, #E8DED5 50%, transparent);
  }
`;

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({
    name: '',
    email: '',
    phone: '',
    identityNumber: '',
  });
  const [ticketCount, setTicketCount] = useState(0);

  // Add Midtrans client script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventDoc = await getDoc(doc(db, 'events', id));
        if (eventDoc.exists()) {
          setEvent({ id: eventDoc.id, ...eventDoc.data() });
        } else {
          setError('Event tidak ditemukan');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        setError('Terjadi kesalahan saat memuat event');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  useEffect(() => {
    const fetchTicketCount = async () => {
      if (event) {
        const ticketsRef = collection(db, 'tickets');
        const q = query(ticketsRef, where('eventId', '==', event.id));
        const ticketDocs = await getDocs(q);
        const totalTickets = ticketDocs.docs.reduce((sum, doc) => {
          const ticketData = doc.data();
          return sum + (Number(ticketData.quantity) || 1);
        }, 0);
        setTicketCount(totalTickets);
      }
    };

    fetchTicketCount();
  }, [event]);

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: `/event/${id}` } });
      return;
    }

    if (isPopupOpen) {
      setError('Pembayaran sedang diproses. Silakan tunggu sebentar.');
      return;
    }

    setIsProcessing(true);
    setIsPopupOpen(true);
    setError('');

    try {
      const availableTickets = event.maxTickets - ticketCount;
      if (ticketQuantity > availableTickets) {
        setError('Jumlah tiket yang diminta melebihi ketersediaan');
        return;
      }

      const orderId = `order_${Date.now()}`;
      const totalPrice = Number(event.price) * Number(ticketQuantity);

      // Log the request data
      console.log('Sending payment request:', {
        orderId,
        amount: totalPrice,
        customerName: purchaseForm.name,
        customerEmail: purchaseForm.email,
        customerPhone: purchaseForm.phone,
        itemDetails: [{
          id: event.id,
          price: event.price,
          quantity: ticketQuantity,
          name: event.name
        }]
      });

      // Create payment token through our server
      const response = await fetch('https://server-two-psi-53.vercel.app/api/create-payment-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({
          orderId,
          amount: totalPrice,
          customerName: purchaseForm.name,
          customerEmail: purchaseForm.email,
          customerPhone: purchaseForm.phone,
          itemDetails: [{
            id: event.id,
            price: event.price,
            quantity: ticketQuantity,
            name: event.name
          }]
        })
      });

      // Log the full response for debugging
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          headers: Object.fromEntries(response.headers.entries())
        });
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Server response:', result);

      if (!result.success) {
        console.error('Payment creation failed:', result);
        throw new Error(result.message || 'Failed to create payment token');
      }

      if (!result.data) {
        console.error('Invalid server response:', result);
        throw new Error('Invalid response from payment server: missing data');
      }

      if (!result.data.token) {
        console.error('Missing payment token:', result.data);
        throw new Error('Invalid response from payment server: missing token');
      }

      const ticketData = {
        eventId: event.id,
        eventName: event.name,
        userId: user.uid,
        quantity: Number(ticketQuantity),
        price: Number(event.price),
        totalPrice: totalPrice,
        purchaseDate: new Date(),
        status: 'pending',
        buyerName: purchaseForm.name,
        buyerEmail: purchaseForm.email,
        buyerPhone: purchaseForm.phone,
        ticketNumber: orderId,
        eventDate: event.date,
        eventTime: event.time,
        venue: event.venue,
        paymentToken: result.data.token,
        paymentDetails: {
          orderId,
          amount: totalPrice,
          paymentMethod: 'gopay',
          transactionId: result.data.transaction_id,
          statusCode: result.data.status_code,
          statusMessage: result.data.status_message
        }
      };

      console.log('Storing ticket data:', ticketData);

      // Store ticket data in localStorage for access after payment
      localStorage.setItem('current_ticket_data', JSON.stringify(ticketData));

      // Initialize Snap for seamless popup
      window.snap.pay(result.data.token, {
        onSuccess: async function(result) {
          console.log('Payment success:', result);
          localStorage.setItem('midtrans_success', JSON.stringify(result));
          
          try {
            // Save ticket data to Firestore
            await addDoc(collection(db, 'tickets'), {
              ...ticketData,
              paymentStatus: 'success',
              paymentDetails: result,
              purchaseDate: new Date()
            });

            // Update event's ticket count
            await updateDoc(doc(db, 'events', event.id), {
              ticketsSold: (event.ticketsSold || 0) + Number(ticketQuantity)
            });

            // Update ticket status to success
            ticketData.status = 'success';
            localStorage.setItem('current_ticket_data', JSON.stringify(ticketData));
            window.location.href = '/payment-complete';
          } catch (error) {
            console.error('Error saving ticket:', error);
            setError('Terjadi kesalahan saat menyimpan data tiket. Silakan hubungi support.');
          }
        },
        onPending: function(result) {
          console.log('Payment pending:', result);
          localStorage.setItem('midtrans_pending', JSON.stringify(result));
          // Update ticket status to pending
          ticketData.status = 'pending';
          localStorage.setItem('current_ticket_data', JSON.stringify(ticketData));
          window.location.href = '/payment-pending';
        },
        onError: function(result) {
          console.error('Payment error:', result);
          localStorage.setItem('midtrans_error', JSON.stringify(result));
          // Update ticket status to failed
          ticketData.status = 'failed';
          localStorage.setItem('current_ticket_data', JSON.stringify(ticketData));
          window.location.href = '/payment-error';
        },
        onClose: function() {
          console.log('Payment closed');
          // Update ticket status to cancelled
          ticketData.status = 'cancelled';
          localStorage.setItem('current_ticket_data', JSON.stringify(ticketData));
          localStorage.removeItem('midtrans_success');
          localStorage.removeItem('midtrans_pending');
          localStorage.removeItem('midtrans_error');
          setIsPopupOpen(false);
          setError('Pembayaran dibatalkan. Silakan coba lagi jika Anda ingin melanjutkan pembelian.');
        }
      });

    } catch (error) {
      console.error('Error processing payment:', error);
      setIsPopupOpen(false);
      
      // Handle specific error cases
      if (error.message.includes('401')) {
        setError('Terjadi kesalahan autentikasi. Silakan hubungi administrator.');
      } else if (error.message.includes('Missing required fields')) {
        setError('Data pembelian tidak lengkap. Silakan coba lagi.');
      } else if (error.message.includes('Invalid GoPay response')) {
        setError('Terjadi kesalahan saat memproses pembayaran GoPay. Silakan coba lagi.');
      } else if (error.message.includes('missing token')) {
        setError('Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.');
      } else {
        setError(`Terjadi kesalahan saat memproses pembayaran: ${error.message}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Add cleanup function for payment popup
  useEffect(() => {
    return () => {
      // Cleanup payment data when component unmounts
      localStorage.removeItem('midtrans_success');
      localStorage.removeItem('midtrans_pending');
      localStorage.removeItem('midtrans_error');
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EBE3D5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#5B2600]" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#EBE3D5] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#5B2600] mb-2">
            {error || 'Event tidak ditemukan'}
          </h2>
          <button
            onClick={() => navigate('/tickets')}
            className="text-[#5B2600] hover:underline"
          >
            Kembali ke Daftar Event
          </button>
        </div>
      </div>
    );
  }

  const availableTickets = event.maxTickets - ticketCount;

  return (
    <div className="min-h-screen bg-[#EBE3D5] pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Image */}
            <div className="event-image-container rounded-lg overflow-hidden shadow-lg">
              <img
                src={event.imageUrl || '/default-event.jpg'}
                alt={event.name}
                className="w-full h-[400px] object-cover transition-transform duration-300 transform hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-10 bg-gradient-to-t from-brown to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-white" />
                    <span className="text-white/90 font-semibold text-lg">{event.date}</span>
                  </div>
                  <button 
                    className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                    onClick={() => {/* Add share functionality */}}
                  >
                    <Share2 className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Event Info */}
            <div className="event-info-card shadow-lg rounded-lg overflow-hidden">
              <div className="p-8 bg-white">
                <h1 className="text-4xl font-bold text-[#5B2600] mb-4">{event.name}</h1>
                <div className="info-grid">
                  <div className="info-box">
                    <div className="p-2 rounded-lg bg-[#5B2600] text-white shadow-sm w-fit mb-3">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Tanggal</p>
                    <p className="font-medium text-[#5B2600]">{event.date}</p>
                  </div>

                  <div className="info-box">
                    <div className="p-2 rounded-lg bg-[#5B2600] text-white shadow-sm w-fit mb-3">
                      <Clock className="w-5 h-5" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Waktu</p>
                    <p className="font-medium text-[#5B2600]">{event.time}</p>
                  </div>

                  <div className="info-box">
                    <div className="p-2 rounded-lg bg-[#5B2600] text-white shadow-sm w-fit mb-3">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Lokasi</p>
                    <p className="font-medium text-[#5B2600]">{event.venue}</p>
                  </div>
                </div>

                <div className="description-container mt-6">
                  <h2 className="text-xl font-bold text-[#5B2600] mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Tentang Event
                  </h2>
                  <div className="prose prose-brown max-w-none">
                    <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Ticket Purchase */}
          <div className="lg:sticky lg:top-28 space-y-4 h-fit">
            <div className="event-ticket shadow-xl rounded-lg overflow-hidden">
              <div className="ticket-header bg-[#5B2600] p-6 text-white">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Detail Pembelian</h3>
                  <TicketIcon className="w-6 h-6" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-baseline">
                    <p className="text-white/80">Harga Tiket</p>
                    <p className="text-3xl font-bold">Rp {event.price.toLocaleString()}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-white/80">
                      <span>Tersedia</span>
                      <span>{availableTickets} dari {event.maxTickets} tiket</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-fill"
                        style={{ 
                          width: `${(availableTickets / event.maxTickets) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Body */}
              <div className="ticket-body p-6 bg-white">
                <div className="ticket-info mb-6">
                  <div className="info-item">
                    <span className="info-label">Tanggal Event</span>
                    <span className="info-value">{event.date}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Waktu</span>
                    <span className="info-value">{event.time}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Lokasi</span>
                    <span className="info-value">{event.venue}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Status</span>
                    <span className={`text-sm font-medium px-3 py-1 rounded-full inline-flex ${
                      availableTickets === 0
                        ? 'bg-red-100 text-red-700'
                        : availableTickets < event.maxTickets * 0.2
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {availableTickets === 0 
                        ? 'Sold Out' 
                        : availableTickets < event.maxTickets * 0.2
                        ? 'Hampir Habis'
                        : 'Tersedia'}
                    </span>
                  </div>
                </div>

                {availableTickets > 0 && (
                  <>
                    <div className="space-y-4 mb-6">
                      <label className="block">
                        <span className="text-sm font-medium text-gray-700">Jumlah Tiket</span>
                        <select
                          value={ticketQuantity}
                          onChange={(e) => setTicketQuantity(Number(e.target.value))}
                          className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B2600] bg-white"
                        >
                          {[...Array(Math.min(availableTickets, 10))].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1} tiket
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="ticket-divider">
                      <div className="space-y-4 py-4">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Harga per tiket</span>
                          <span>Rp {event.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Jumlah tiket</span>
                          <span>× {ticketQuantity}</span>
                        </div>
                        <div className="pt-4 border-t border-dashed border-[#E8DED5]">
                          <div className="flex justify-between items-baseline">
                            <span className="font-medium text-[#5B2600]">Total Pembayaran</span>
                            <span className="text-2xl font-bold text-[#5B2600]">
                              Rp {(event.price * ticketQuantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="mt-6 text-red-600 text-sm bg-red-50 p-4 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                      </div>
                    )}

                    <button
                      onClick={() => setShowPurchaseForm(true)}
                      disabled={isProcessing || availableTickets === 0}
                      className={`mt-6 w-full py-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                        availableTickets === 0
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-[#5B2600] hover:bg-[#4A3427]'
                      } text-white`}
                    >
                      <TicketIcon className="w-5 h-5" />
                      <span>
                        {availableTickets === 0 
                          ? 'Tiket Habis' 
                          : 'Beli Tiket Sekarang'}
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Event Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 text-gray-600">
                <Users className="w-5 h-5 text-[#5B2600]" />
                <span>{availableTickets} tiket tersedia</span>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-[#5B2600]/5 rounded-2xl p-6">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-[#5B2600] flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  Tiket yang sudah dibeli tidak dapat dikembalikan atau ditukar. Pastikan detail pembelian Anda sudah benar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={showPurchaseForm}
        onClose={() => setShowPurchaseForm(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl bg-white rounded-2xl shadow-xl">
            <div className="relative p-6">
              <button
                onClick={() => setShowPurchaseForm(false)}
                className="absolute right-6 top-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <XIcon className="w-5 h-5 text-gray-500" />
              </button>

              <div className="mb-6">
                <Dialog.Title className="text-2xl font-bold text-[#5B2600]">
                  Form Pembelian Tiket
                </Dialog.Title>
                <p className="text-gray-600">
                  Silakan lengkapi data diri Anda untuk pembelian tiket
                </p>
              </div>

              <form onSubmit={handlePurchase} className="space-y-6">
                {/* Order Summary */}
                <div className="bg-[#5B2600]/5 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Event</span>
                    <span className="font-medium text-[#5B2600]">{event.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Jumlah Tiket</span>
                    <span className="font-medium text-[#5B2600]">{ticketQuantity} tiket</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-dashed border-[#E8DED5]">
                    <span className="text-sm font-medium text-[#5B2600]">Total Pembayaran</span>
                    <span className="font-bold text-lg text-[#5B2600]">
                      Rp {(event.price * ticketQuantity).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      required
                      value={purchaseForm.name}
                      onChange={(e) => setPurchaseForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B2600]"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={purchaseForm.email}
                      onChange={(e) => setPurchaseForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B2600]"
                      placeholder="Masukkan email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      required
                      value={purchaseForm.phone}
                      onChange={(e) => setPurchaseForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B2600]"
                      placeholder="Masukkan nomor telepon"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor Identitas (KTP/SIM/Passport)
                    </label>
                    <input
                      type="text"
                      required
                      value={purchaseForm.identityNumber}
                      onChange={(e) => setPurchaseForm(prev => ({ ...prev, identityNumber: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B2600]"
                      placeholder="Masukkan nomor identitas"
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-4 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-[#5B2600] text-white rounded-xl font-medium hover:bg-[#4A3427] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <TicketIcon className="w-5 h-5" />
                      <span>Lanjutkan ke Pembayaran</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      <style>{ticketStyles}</style>
    </div>
  );
};

export default EventDetail; 
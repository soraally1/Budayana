import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, getDocs, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  AlertTriangle, 
  Loader2, 
  TicketIcon,
  PlusCircle,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Image as ImageIcon,
  Upload,
  Trash2,
  Edit,
  MoreVertical
} from 'lucide-react';
import PropTypes from 'prop-types';

const AdminPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: '',
    date: '',
    time: '',
    venue: '',
    price: '',
    description: '',
    maxTickets: '',
    isActive: true,
    imageUrl: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null); // For debugging
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(null);

  // Fetch events and tickets
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data...');
        console.log('User is authenticated:', isAdmin); // Check if user is authenticated

        // Fetch events
        const eventsSnapshot = await getDocs(collection(db, 'events'));
        const eventsData = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEvents(eventsData);

        // Fetch tickets
        const ticketsSnapshot = await getDocs(collection(db, 'tickets'));
        const ticketsData = ticketsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTickets(ticketsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    console.log('User is authenticated:', isAdmin);
    console.log('User is admin:', isAdmin);

    if (isAdmin) {
      fetchData();
    } else {
      console.error('User does not have admin privileges.');
    }
  }, [isAdmin]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          console.log('No user found, redirecting to login');
          navigate('/login');
          return;
        }

        console.log('Checking admin status for user:', user.uid);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        // Debug information
        setDebugInfo({
          exists: userDoc.exists(),
          data: userDoc.data(),
          uid: user.uid,
          isAdmin: userDoc.data()?.isAdmin
        });

        if (!userDoc.exists()) {
          console.log('User document does not exist');
          setError('User document not found');
          return;
        }

        const userData = userDoc.data();
        console.log('User data:', userData);

        if (!userData.isAdmin) {
          console.log('User is not admin');
          setError('Akses ditolak. Anda tidak memiliki izin admin.');
          setTimeout(() => {
            navigate('/');
          }, 3000);
          return;
        }

        console.log('User is admin, granting access');
        setIsAdmin(true);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setError('Terjadi kesalahan saat memverifikasi status admin');
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [navigate]);

  // Debug view (only in development)
  const isDevelopment = import.meta.env.MODE === 'development';
  if (isDevelopment && debugInfo) {
    console.log('Debug Info:', debugInfo);
  }

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        
        // Convert to base64
        const base64 = await convertToBase64(file);
        setSelectedImage(base64);
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const eventData = {
        ...newEvent,
        price: Number(newEvent.price),
        maxTickets: Number(newEvent.maxTickets),
        createdAt: new Date(),
        updatedAt: new Date(),
        ticketsSold: 0,
        imageUrl: selectedImage || '' // Use base64 image directly
      };

      await addDoc(collection(db, 'events'), eventData);
      setShowAddEvent(false);
      setNewEvent({
        name: '',
        date: '',
        time: '',
        venue: '',
        price: '',
        description: '',
        maxTickets: '',
        isActive: true,
        imageUrl: ''
      });
      setSelectedImage(null);
      setImagePreview(null);

      // Refresh events
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsData);
    } catch (error) {
      console.error('Error adding event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = async (e) => {
    e.preventDefault();
    console.log('Attempting to edit event:', editingEvent);
    console.log('User is admin before updating event:', isAdmin);
    if (!isAdmin) {
      console.error('User does not have admin privileges to update events.');
      return;
    }
    setLoading(true);
    try {
      const eventRef = doc(db, 'events', editingEvent.id);
      const eventData = {
        name: editingEvent.name,
        date: editingEvent.date,
        time: editingEvent.time,
        venue: editingEvent.venue,
        price: Number(editingEvent.price),
        maxTickets: Number(editingEvent.maxTickets),
        description: editingEvent.description,
        isActive: editingEvent.isActive,
        updatedAt: new Date(),
        imageUrl: selectedImage || editingEvent.imageUrl
      };

      await updateDoc(eventRef, eventData);
      setShowEditEvent(false);
      setEditingEvent(null);
      setSelectedImage(null);
      setImagePreview(null);

      // Refresh events
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsData);
    } catch (error) {
      console.error('Error updating event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'events', eventId));
      
      // Refresh events
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsData);
      setShowConfirmDelete(false);
      setDeletingEvent(null);
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTicketStats = (eventId) => {
    const eventTickets = tickets.filter(ticket => ticket.eventId === eventId);
    return {
      sold: eventTickets.length,
      revenue: eventTickets.reduce((sum, ticket) => sum + (ticket.price || 0), 0)
    };
  };

  // Add this component for drag and drop
  const ImageDropzone = ({ imagePreview, onImageChange }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDrag = useCallback((e) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

    const handleDragIn = useCallback((e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    }, []);

    const handleDragOut = useCallback((e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        onImageChange({ target: { files: [files[0]] } });
      }
    }, [onImageChange]);

    return (
      <label
        className={`relative block w-full aspect-video rounded-xl overflow-hidden cursor-pointer border-2 border-dashed transition-all ${
          isDragging ? 'border-[#5B2600] bg-[#5B2600]/5' : 'border-gray-300 hover:border-[#5B2600]/50'
        }`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          onChange={onImageChange}
          className="hidden"
        />
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-2">
            <Upload className="w-8 h-8" />
            <div className="text-center">
              <p className="font-medium">Drop image here or click to upload</p>
              <p className="text-sm text-gray-400">Supports: JPG, PNG, WEBP</p>
            </div>
          </div>
        )}
      </label>
    );
  };

  ImageDropzone.propTypes = {
    imagePreview: PropTypes.string,
    onImageChange: PropTypes.func.isRequired
  };

  ImageDropzone.defaultProps = {
    imagePreview: null
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EBE3D5] via-[#FFD384]/10 to-[#EBE3D5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#5B2600]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EBE3D5] via-[#FFD384]/10 to-[#EBE3D5] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-xl max-w-md w-full"
        >
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <p className="font-fuzzy">{error}</p>
          </div>
          <p className="text-sm text-gray-500">Mengalihkan ke halaman utama...</p>
          {/* Debug information in development */}
          {isDevelopment && debugInfo && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs font-mono">
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EBE3D5] via-[#FFD384]/10 to-[#EBE3D5] p-3 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header with Welcome Message */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mt-[80px] sm:mt-[100px] shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-fuzzy font-bold text-[#5B2600] mb-2">
                Dashboard Admin
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Kelola event dan pantau penjualan tiket
              </p>
            </div>
            <button
              onClick={() => setShowAddEvent(true)}
              className="flex items-center gap-2 bg-[#5B2600] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-fuzzy hover:bg-[#4A3427] transition-colors w-full sm:w-auto justify-center shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Buat Event Baru</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <StatsCard
            title="Total Event"
            value={events.length}
            icon={Calendar}
            subtitle={`${events.filter(e => e.isActive).length} event aktif`}
            trend={events.length > 0 ? '+1' : '0'}
            trendUp={events.length > 0}
          />
          <StatsCard
            title="Tiket Terjual"
            value={tickets.length}
            icon={TicketIcon}
            subtitle={`${events.reduce((sum, event) => sum + (event.maxTickets || 0), 0)} total kapasitas`}
            trend={`${Math.round((tickets.length / events.reduce((sum, event) => sum + (event.maxTickets || 0), 0)) * 100)}%`}
            trendUp={true}
          />
          <StatsCard
            title="Total Pendapatan"
            value={`Rp ${tickets.reduce((sum, ticket) => sum + (ticket.price || 0), 0).toLocaleString()}`}
            icon={DollarSign}
            subtitle="Dari semua event"
            trend="+12.5%"
            trendUp={true}
          />
          <StatsCard
            title="Rata-rata Harga"
            value={`Rp ${events.length ? Math.round(events.reduce((sum, event) => sum + event.price, 0) / events.length).toLocaleString() : 0}`}
            icon={TicketIcon}
            subtitle="Per tiket"
            trend="0%"
            trendUp={null}
          />
        </div>

        {/* Events Management Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-fuzzy font-bold text-[#5B2600]">
                  Manajemen Event
                </h2>
                <p className="text-sm text-gray-500">
                  {events.length} total event
                </p>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <select 
                  className="px-3 sm:px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B2600] w-full sm:w-auto bg-white shadow-sm"
                  onChange={(event) => {
                    const value = event.target.value;
                    const sortedEvents = [...events];
                    
                    switch (value) {
                      case 'newest':
                        sortedEvents.sort((a, b) => b.createdAt - a.createdAt);
                        break;
                      case 'oldest':
                        sortedEvents.sort((a, b) => a.createdAt - b.createdAt);
                        break;
                      case 'mostSold':
                        sortedEvents.sort((a, b) => b.ticketsSold - a.ticketsSold);
                        break;
                      case 'leastSold':
                        sortedEvents.sort((a, b) => a.ticketsSold - b.ticketsSold);
                        break;
                      default:
                        break;
                    }
                    
                    setEvents(sortedEvents);
                  }}
                >
                  <option value="newest">Terbaru</option>
                  <option value="oldest">Terlama</option>
                  <option value="mostSold">Penjualan Tertinggi</option>
                  <option value="leastSold">Penjualan Terendah</option>
                </select>
              </div>
            </div>
          </div>

          {/* Event Cards */}
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {events.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  stats={getTicketStats(event.id)}
                  onEdit={(event) => {
                    setEditingEvent(event);
                    setShowEditEvent(true);
                    setImagePreview(event.imageUrl);
                  }}
                  onDelete={(event) => {
                    setDeletingEvent(event);
                    setShowConfirmDelete(true);
                  }}
                />
              ))}
            </div>

            {/* Empty State */}
            {events.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-[#5B2600]/5 flex items-center justify-center">
                  <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-[#5B2600]" />
                </div>
                <h3 className="font-fuzzy font-bold text-[#5B2600] text-lg sm:text-xl mb-2">
                  Belum Ada Event
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm sm:text-base">
                  Mulai dengan membuat event pertama Anda. Anda dapat menambahkan detail, mengatur harga tiket, dan memantau penjualan di satu tempat.
                </p>
                <button
                  onClick={() => setShowAddEvent(true)}
                  className="inline-flex items-center gap-2 bg-[#5B2600] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-fuzzy hover:bg-[#4A3427] transition-colors shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Buat Event Pertama</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Add Event Modal */}
        {showAddEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-fuzzy font-bold text-[#5B2600]">
                    Buat Event Baru
                  </h3>
                  <button
                    onClick={() => setShowAddEvent(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddEvent} className="p-4 sm:p-6 space-y-6">
                <ImageDropzone
                  imagePreview={imagePreview}
                  onImageChange={handleImageChange}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nama Event</label>
                    <input
                      type="text"
                      placeholder="Masukkan nama event"
                      value={newEvent.name}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#5B2600] bg-white text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Venue</label>
                    <input
                      type="text"
                      placeholder="Enter venue"
                      value={newEvent.venue}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, venue: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#5B2600] bg-white text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#5B2600] bg-white text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Time</label>
                    <input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#5B2600] bg-white text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Ticket Price (Rp)</label>
                    <input
                      type="number"
                      placeholder="Enter price"
                      value={newEvent.price}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#5B2600] bg-white text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Maximum Tickets</label>
                    <input
                      type="number"
                      placeholder="Enter max tickets"
                      value={newEvent.maxTickets}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, maxTickets: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#5B2600] bg-white text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    placeholder="Enter event description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#5B2600] bg-white text-sm min-h-[120px]"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 bg-[#5B2600] text-white rounded-xl font-fuzzy hover:bg-[#4A3427] transition-colors disabled:opacity-50 shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      'Buat Event'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddEvent(false)}
                    className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 border-2 border-[#5B2600] text-[#5B2600] rounded-xl font-fuzzy hover:bg-[#5B2600] hover:text-white transition-colors text-sm sm:text-base"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showConfirmDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-fuzzy font-bold text-[#5B2600] mb-4">
                Konfirmasi Hapus
              </h3>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus event &quot;{deletingEvent?.name}&quot;? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => handleDeleteEvent(deletingEvent.id)}
                  disabled={loading}
                  className="flex-1 py-3 px-6 bg-red-600 text-white rounded-xl font-fuzzy hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    'Hapus Event'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowConfirmDelete(false);
                    setDeletingEvent(null);
                  }}
                  className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl font-fuzzy hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Event Modal */}
        {showEditEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-fuzzy font-bold text-[#5B2600]">
                    Edit Event
                  </h3>
                  <button
                    onClick={() => {
                      setShowEditEvent(false);
                      setEditingEvent(null);
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleEditEvent} className="p-6 space-y-6">
                <ImageDropzone
                  imagePreview={imagePreview || editingEvent?.imageUrl}
                  onImageChange={handleImageChange}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nama Event</label>
                    <input
                      type="text"
                      placeholder="Masukkan nama event"
                      value={editingEvent?.name}
                      onChange={(e) => setEditingEvent(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#5B2600] bg-white text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Venue</label>
                    <input
                      type="text"
                      placeholder="Enter venue"
                      value={editingEvent?.venue}
                      onChange={(e) => setEditingEvent(prev => ({ ...prev, venue: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#5B2600] bg-white text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      value={editingEvent?.date}
                      onChange={(e) => setEditingEvent(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#5B2600] bg-white text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Time</label>
                    <input
                      type="time"
                      value={editingEvent?.time}
                      onChange={(e) => setEditingEvent(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#5B2600] bg-white text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Ticket Price (Rp)</label>
                    <input
                      type="number"
                      placeholder="Enter price"
                      value={editingEvent?.price}
                      onChange={(e) => setEditingEvent(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#5B2600] bg-white text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Maximum Tickets</label>
                    <input
                      type="number"
                      placeholder="Enter max tickets"
                      value={editingEvent?.maxTickets}
                      onChange={(e) => setEditingEvent(prev => ({ ...prev, maxTickets: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#5B2600] bg-white text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    placeholder="Enter event description"
                    value={editingEvent?.description}
                    onChange={(e) => setEditingEvent(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#5B2600] bg-white text-sm min-h-[120px]"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 bg-[#5B2600] text-white rounded-xl font-fuzzy hover:bg-[#4A3427] transition-colors disabled:opacity-50 shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      'Simpan Perubahan'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditEvent(false);
                      setEditingEvent(null);
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                    className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 border-2 border-gray-300 text-gray-700 rounded-xl font-fuzzy hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon: Icon, subtitle, trend, trendUp }) => (
  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <div className="p-3 bg-[#5B2600]/5 rounded-lg w-fit group-hover:bg-[#5B2600]/10 transition-colors">
          <Icon className="w-6 h-6 text-[#5B2600]" />
        </div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-[#5B2600]">{value}</p>
      </div>
      {trend && (
        <span className={`px-2.5 py-1.5 rounded-lg text-sm font-medium ${
          trendUp === null ? 'bg-gray-100 text-gray-600' :
          trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {trend}
        </span>
      )}
    </div>
    {subtitle && (
      <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
    )}
  </div>
);

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType.isRequired,
  subtitle: PropTypes.string,
  trend: PropTypes.string,
  trendUp: PropTypes.bool
};

const EventCard = ({ event, stats, onEdit, onDelete }) => (
  <motion.div
    whileHover={{ scale: 1.01 }}
    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-gray-100 group relative"
  >
    {/* Add Options Menu */}
    <div className="absolute top-4 right-4 z-10">
      <div className="relative group">
        <button className="p-2 rounded-lg bg-white/90 hover:bg-white shadow-lg text-gray-600 hover:text-[#5B2600] transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
          <button
            onClick={() => onEdit(event)}
            className="flex items-center gap-2 w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-xl"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Event</span>
          </button>
          <button
            onClick={() => onDelete(event)}
            className="flex items-center gap-2 w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 last:rounded-b-xl"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus Event</span>
          </button>
        </div>
      </div>
    </div>

    {/* Image Section with Overlay */}
    <div className="relative aspect-[16/9] w-full">
      {event.imageUrl ? (
        <img
          src={event.imageUrl}
          alt={event.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-[#5B2600]/5 flex items-center justify-center">
          <ImageIcon className="w-10 h-10 text-[#5B2600]/30" />
        </div>
      )}
      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
          event.maxTickets - stats.sold === 0
            ? 'bg-red-100 text-red-700'
            : (event.maxTickets - stats.sold) < (event.maxTickets * 0.2)
            ? 'bg-amber-100 text-amber-700'
            : 'bg-green-100 text-green-700'
        }`}>
          {event.maxTickets - stats.sold === 0
            ? 'Sold Out'
            : (event.maxTickets - stats.sold) < (event.maxTickets * 0.2)
            ? 'Hampir Habis'
            : 'Tersedia'}
        </span>
      </div>
    </div>

    {/* Content Section */}
    <div className="p-5">
      {/* Event Info */}
      <div className="mb-4">
        <h3 className="font-fuzzy font-bold text-[#5B2600] text-xl mb-2 group-hover:text-[#8B4513] transition-colors">
          {event.name}
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="p-2 bg-[#5B2600]/5 rounded-lg">
              <Calendar className="w-4 h-4 text-[#5B2600]" />
            </div>
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="p-2 bg-[#5B2600]/5 rounded-lg">
              <Clock className="w-4 h-4 text-[#5B2600]" />
            </div>
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="p-2 bg-[#5B2600]/5 rounded-lg">
              <MapPin className="w-4 h-4 text-[#5B2600]" />
            </div>
            <span>{event.venue}</span>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="space-y-4">
        {/* Ticket Sales Progress */}
        <div className="bg-[#5B2600]/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#5B2600]">Tiket Terjual</span>
            <span className="text-sm font-bold text-[#5B2600]">
              {stats.sold}/{event.maxTickets}
            </span>
          </div>
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-[#5B2600] transition-all rounded-full"
              style={{ width: `${(stats.sold / event.maxTickets) * 100}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>{Math.round((stats.sold / event.maxTickets) * 100)}% terjual</span>
            <span>{event.maxTickets - stats.sold} tersisa</span>
          </div>
        </div>

        {/* Price and Revenue */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#5B2600]/5 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Harga Tiket</p>
            <p className="font-bold text-[#5B2600] text-lg">
              Rp {event.price.toLocaleString()}
            </p>
          </div>
          <div className="bg-[#5B2600]/5 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Total Pendapatan</p>
            <p className="font-bold text-[#5B2600] text-lg">
              Rp {stats.revenue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Warning Messages */}
        {(event.maxTickets - stats.sold) < (event.maxTickets * 0.2) && (event.maxTickets - stats.sold) > 0 && (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-3 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
            <p className="text-sm font-medium">
              Hanya tersisa {event.maxTickets - stats.sold} tiket!
            </p>
          </div>
        )}
        {(event.maxTickets - stats.sold) === 0 && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
            <p className="text-sm font-medium">
              Tiket sudah habis terjual
            </p>
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

EventCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
    name: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    venue: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    maxTickets: PropTypes.number.isRequired
  }).isRequired,
  stats: PropTypes.shape({
    sold: PropTypes.number.isRequired,
    revenue: PropTypes.number.isRequired
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default AdminPage; 
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { auth, db, storage } from '../firebase';
import { 
  doc, 
  collection, 
  addDoc, 
  deleteDoc, 
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
  MoreVertical,
  QrCode,
  Search
} from 'lucide-react';
import PropTypes from 'prop-types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Add categories array outside components
const categories = [
  { id: 'dance', name: 'Tari Tradisional', icon: '💃' },
  { id: 'music', name: 'Musik Tradisional', icon: '🎵' },
  { id: 'drama', name: 'Drama Tradisional', icon: '🎭' },
  { id: 'ceremony', name: 'Upacara Adat', icon: '🏮' },
  { id: 'festival', name: 'Festival Budaya', icon: '🎪' },
  { id: 'workshop', name: 'Workshop Budaya', icon: '👥' }
];

// LocationPicker Component
const LocationPicker = ({ onLocationSelect, initialLocation }) => {
  const [location, setLocation] = useState(initialLocation || { address: '', lat: -6.2088, lng: 106.8456 });
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapInstanceRef.current) {
      // Initialize map
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [location.lat, location.lng],
        13
      );

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      // Add marker
      markerRef.current = L.marker([location.lat, location.lng], {
        draggable: true
      }).addTo(mapInstanceRef.current);

      // Handle marker drag
      markerRef.current.on('dragend', (event) => {
        const { lat, lng } = event.target.getLatLng();
        const newLocation = {
          ...location,
          lat,
          lng
        };
        setLocation(newLocation);
        onLocationSelect(newLocation);
      });

      // Handle map click
      mapInstanceRef.current.on('click', (event) => {
        const { lat, lng } = event.latlng;
        markerRef.current.setLatLng([lat, lng]);
        const newLocation = {
          ...location,
          lat,
          lng
        };
        setLocation(newLocation);
        onLocationSelect(newLocation);
      });
    }

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    const searchInput = e.target.value;
    if (!searchInput) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput)}`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newLocation = {
          address: display_name,
          lat: parseFloat(lat),
          lng: parseFloat(lon)
        };
        
        mapInstanceRef.current.setView([newLocation.lat, newLocation.lng], 13);
        markerRef.current.setLatLng([newLocation.lat, newLocation.lng]);
        setLocation(newLocation);
        onLocationSelect(newLocation);
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search for a location"
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#5B2600] bg-white text-sm"
        />
      </div>
      <div ref={mapRef} className="w-full h-[300px] rounded-xl overflow-hidden border border-gray-200" />
      {location.address && (
        <p className="text-sm text-gray-600">{location.address}</p>
      )}
    </div>
  );
};

LocationPicker.propTypes = {
  onLocationSelect: PropTypes.func.isRequired,
  initialLocation: PropTypes.shape({
    address: PropTypes.string,
    lat: PropTypes.number,
    lng: PropTypes.number
  })
};

// ImageDropzone Component
const ImageDropzone = ({ imagePreview, onImageChange }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onImageChange({ target: { files: [files[0]] } });
    }
  };

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

// Add a new component for the header section
const AdminHeader = ({ onAddEvent }) => (
  <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6 mt-10 mb-8">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-fuzzy font-bold text-[#5B2600] mb-2">
          Dashboard Admin
        </h1>
        <p className="text-sm text-gray-600">
          Kelola event dan pantau penjualan tiket Anda
        </p>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Link
          to="/admin/scan"
          className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-[#5B2600] text-[#5B2600] rounded-xl hover:bg-[#5B2600] hover:text-white transition-all shadow-sm hover:shadow-md"
        >
          <QrCode className="w-5 h-5" />
          <span>Scan Tiket</span>
        </Link>
        <button
          onClick={onAddEvent}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5B2600] text-white rounded-xl hover:bg-[#4A3427] transition-all shadow-md hover:shadow-lg"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Event Baru</span>
        </button>
      </div>
    </div>
  </div>
);

AdminHeader.propTypes = {
  onAddEvent: PropTypes.func.isRequired
};

// Enhance the StatsCard component
const StatsCard = ({ title, value, icon: Icon, subtitle, trend, trendUp }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-[#5B2600]/5 hover:shadow-xl transition-all group relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-[#5B2600]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="relative">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="p-3.5 bg-gradient-to-br from-[#5B2600]/10 to-[#5B2600]/20 rounded-xl w-fit group-hover:scale-110 transition-all">
            <Icon className="w-6 h-6 text-[#5B2600]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#5B2600]/70">{title}</p>
            <p className="text-2xl font-bold text-[#5B2600] mt-1">{value}</p>
          </div>
        </div>
        {trend && (
          <span className={`px-3 py-1.5 rounded-xl text-sm font-medium ${
            trendUp === null ? 'bg-gray-100 text-gray-600' :
            trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          } group-hover:scale-105 transition-transform`}>
            {trend}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-[#5B2600]/60 mt-3">{subtitle}</p>
      )}
    </div>
  </motion.div>
);

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType.isRequired,
  subtitle: PropTypes.string,
  trend: PropTypes.string,
  trendUp: PropTypes.bool
};

// Enhance the EventCard component
const EventCard = ({ event, stats, onEdit, onDelete }) => {
  const category = categories.find(c => c.id === event.category) || categories[0];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-[#5B2600]/5 relative">
        {/* Image Section */}
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.name}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#5B2600]/5 to-[#5B2600]/10 flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-[#5B2600]/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Status Badge and Category */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-xl text-xs font-medium backdrop-blur-md ${
                event.maxTickets - stats.sold === 0
                  ? 'bg-red-500/80 text-white'
                  : (event.maxTickets - stats.sold) < (event.maxTickets * 0.2)
                  ? 'bg-amber-500/80 text-white'
                  : 'bg-green-500/80 text-white'
              }`}>
                {event.maxTickets - stats.sold === 0
                  ? 'Sold Out'
                  : (event.maxTickets - stats.sold) < (event.maxTickets * 0.2)
                  ? 'Hampir Habis'
                  : 'Tersedia'}
              </span>
              <span className="px-3 py-1.5 rounded-xl text-xs font-medium backdrop-blur-md bg-white/80 text-[#5B2600]">
                {category.icon} {category.name}
              </span>
            </div>
            
            {/* Actions Menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl bg-white/90 hover:bg-white shadow-lg text-[#5B2600] hover:text-[#8B4513] transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </motion.button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 border border-gray-100">
                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => onEdit(event)}
                  className="flex items-center gap-2 w-full px-4 py-3 text-left text-sm text-[#5B2600] hover:bg-[#5B2600]/5 first:rounded-t-xl"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Event</span>
                </motion.button>
                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => onDelete(event)}
                  className="flex items-center gap-2 w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 last:rounded-b-xl"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus Event</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {/* Event Info */}
          <div className="mb-6">
            <h3 className="font-fuzzy font-bold text-[#5B2600] text-xl mb-3 group-hover:text-[#8B4513] transition-colors line-clamp-2">
              {event.name}
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-sm text-[#5B2600]/70">
                <div className="p-2 bg-gradient-to-br from-[#5B2600]/5 to-[#5B2600]/10 rounded-lg">
                  <Calendar className="w-4 h-4 text-[#5B2600]" />
                </div>
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#5B2600]/70">
                <div className="p-2 bg-gradient-to-br from-[#5B2600]/5 to-[#5B2600]/10 rounded-lg">
                  <Clock className="w-4 h-4 text-[#5B2600]" />
                </div>
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#5B2600]/70">
                <div className="p-2 bg-gradient-to-br from-[#5B2600]/5 to-[#5B2600]/10 rounded-lg">
                  <MapPin className="w-4 h-4 text-[#5B2600]" />
                </div>
                <span className="line-clamp-1">{event.venue}</span>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="space-y-5">
            {/* Ticket Sales Progress */}
            <div className="bg-gradient-to-br from-[#5B2600]/5 to-[#5B2600]/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#5B2600]">Tiket Terjual</span>
                <span className="text-sm font-bold text-[#5B2600]">
                  {stats.sold}/{event.maxTickets}
                </span>
              </div>
              <div className="relative h-2 bg-[#5B2600]/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.sold / event.maxTickets) * 100}%` }}
                  transition={{ duration: 1, type: "spring" }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#5B2600] to-[#8B4513] rounded-full"
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-[#5B2600]/60">
                <span>{Math.round((stats.sold / event.maxTickets) * 100)}% terjual</span>
                <span>{event.maxTickets - stats.sold} tersisa</span>
              </div>
            </div>

            {/* Price and Revenue */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-[#5B2600]/5 to-[#5B2600]/10 rounded-xl p-4">
                <p className="text-sm text-[#5B2600]/70 mb-1">Harga Tiket</p>
                <p className="font-bold text-[#5B2600] text-lg">
                  Rp {event.price.toLocaleString()}
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#5B2600]/5 to-[#5B2600]/10 rounded-xl p-4">
                <p className="text-sm text-[#5B2600]/70 mb-1">Total Pendapatan</p>
                <p className="font-bold text-[#5B2600] text-lg">
                  Rp {stats.revenue.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Warning Messages */}
            {(event.maxTickets - stats.sold) < (event.maxTickets * 0.2) && (event.maxTickets - stats.sold) > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-3 rounded-xl border border-amber-200"
              >
                <AlertTriangle className="w-5 h-5" />
                <p className="text-sm font-medium">
                  Hanya tersisa {event.maxTickets - stats.sold} tiket!
                </p>
              </motion.div>
            )}
            {(event.maxTickets - stats.sold) === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-200"
              >
                <AlertTriangle className="w-5 h-5" />
                <p className="text-sm font-medium">
                  Tiket sudah habis terjual
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

EventCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
    name: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    venue: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    maxTickets: PropTypes.number.isRequired,
    category: PropTypes.string.isRequired
  }).isRequired,
  stats: PropTypes.shape({
    sold: PropTypes.number.isRequired,
    revenue: PropTypes.number.isRequired
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

const AdminPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    name: '',
    date: '',
    time: '',
    venue: '',
    price: '',
    description: '',
    maxTickets: '',
    isActive: true,
    imageUrl: '',
    category: 'dance',
    location: {
      address: '',
      lat: 0,
      lng: 0
    }
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');

  // Check admin status and fetch data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          navigate('/login');
          return;
        }

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists() || !userDoc.data().isAdmin) {
          setError('Akses ditolak. Anda tidak memiliki izin admin.');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        setIsAdmin(true);
        await fetchData();
      } catch (error) {
        console.error('Error checking admin status:', error);
        setError('Terjadi kesalahan saat memverifikasi status admin');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch events and tickets data
  const fetchData = async () => {
    try {
      // Set up real-time listeners for events and tickets
      const eventsQuery = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
      const unsubscribeEvents = onSnapshot(eventsQuery, (snapshot) => {
        const eventsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          ticketsSold: doc.data().ticketsSold || 0,
          price: Number(doc.data().price) || 0
        }));
        setEvents(eventsData);
      });

      const ticketsQuery = query(collection(db, 'tickets'), orderBy('purchaseDate', 'desc'));
      const unsubscribeTickets = onSnapshot(ticketsQuery, (snapshot) => {
        const ticketsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            quantity: Number(data.quantity) || 1,
            price: Number(data.price) || 0,
            totalPrice: Number(data.totalPrice) || 0,
            purchaseDate: data.purchaseDate?.toDate() || new Date()
          };
        });
        setTickets(ticketsData);
      });

      return () => {
        unsubscribeEvents();
        unsubscribeTickets();
      };
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Terjadi kesalahan saat mengambil data');
    }
  };

  // Handle image upload
  const handleImageUpload = async (file) => {
    if (!file) return null;
    const storageRef = ref(storage, `events/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  // Handle image change
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        setSelectedImage(file);
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }
  };

  // Add new event
  const handleAddEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = '';
      if (selectedImage) {
        imageUrl = await handleImageUpload(selectedImage);
      }

      const eventData = {
        ...newEvent,
        price: Number(newEvent.price),
        maxTickets: Number(newEvent.maxTickets),
        ticketsSold: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrl,
        location: newEvent.location || {
          address: newEvent.venue,
          lat: 0,
          lng: 0
        }
      };

      await addDoc(collection(db, 'events'), eventData);
      setShowAddEvent(false);
      resetForm();
    } catch (error) {
      console.error('Error adding event:', error);
      setError('Terjadi kesalahan saat menambahkan event');
    } finally {
      setLoading(false);
    }
  };

  // Edit event
  const handleEditEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = editingEvent.imageUrl;
      if (selectedImage && selectedImage !== editingEvent.imageUrl) {
        imageUrl = await handleImageUpload(selectedImage);
      }

      const eventRef = doc(db, 'events', editingEvent.id);
      const eventData = {
        ...editingEvent,
        price: Number(editingEvent.price),
        maxTickets: Number(editingEvent.maxTickets),
        updatedAt: new Date(),
        imageUrl
      };

      await updateDoc(eventRef, eventData);
      setShowEditEvent(false);
      resetForm();
    } catch (error) {
      console.error('Error updating event:', error);
      setError('Terjadi kesalahan saat mengupdate event');
    } finally {
      setLoading(false);
    }
  };

  // Delete event
  const handleDeleteEvent = async (eventId) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'events', eventId));
      setShowConfirmDelete(false);
      setDeletingEvent(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Terjadi kesalahan saat menghapus event');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setNewEvent({
      name: '',
      date: '',
      time: '',
      venue: '',
      price: '',
      description: '',
      maxTickets: '',
      isActive: true,
      imageUrl: '',
      category: 'dance',
      location: {
        address: '',
        lat: 0,
        lng: 0
      }
    });
    setSelectedImage(null);
    setImagePreview(null);
    setEditingEvent(null);
  };

  // Get ticket stats
  const getTicketStats = (eventId) => {
    const eventTickets = tickets.filter(ticket => ticket.eventId === eventId);
    const totalSold = eventTickets.reduce((sum, ticket) => sum + (Number(ticket.quantity) || 1), 0);
    const totalRevenue = eventTickets.reduce((sum, ticket) => sum + (Number(ticket.totalPrice) || 0), 0);
    
    return {
      sold: totalSold,
      revenue: totalRevenue
    };
  };

  // Calculate total revenue from all events
  const calculateTotalRevenue = () => {
    return tickets.reduce((sum, ticket) => sum + (Number(ticket.totalPrice) || 0), 0);
  };

  // Calculate total tickets sold (sum of all quantities)
  const calculateTotalTicketsSold = () => {
    return tickets.reduce((sum, ticket) => sum + (Number(ticket.quantity) || 1), 0);
  };

  // Calculate total transactions (number of unique ticket entries)
  const calculateTotalTransactions = () => {
    const uniqueTransactions = new Set();
    
    tickets.forEach(ticket => {
      // Create a unique key for each transaction
      const transactionKey = `${ticket.userId}-${ticket.eventId}-${ticket.purchaseDate?.toDateString()}`;
      uniqueTransactions.add(transactionKey);
    });
    
    return uniqueTransactions.size;
  };

  // Sort events
  const handleSort = (value) => {
    setSortOrder(value);
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
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EBE3D5] via-[#FFD384]/10 to-[#EBE3D5] pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <AdminHeader onAddEvent={() => setShowAddEvent(true)} />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            value={calculateTotalTicketsSold()}
            icon={TicketIcon}
            subtitle={`${events.reduce((sum, event) => sum + (event.maxTickets || 0), 0)} total kapasitas`}
            trend={`${Math.round((calculateTotalTicketsSold() / events.reduce((sum, event) => sum + (event.maxTickets || 0), 0)) * 100)}%`}
            trendUp={true}
          />
          <StatsCard
            title="Total Pendapatan"
            value={`Rp ${calculateTotalRevenue().toLocaleString()}`}
            icon={DollarSign}
            subtitle={`${calculateTotalTransactions()} transaksi`}
            trend={calculateTotalTransactions() > 0 ? '+' + calculateTotalTransactions() : '0'}
            trendUp={calculateTotalTransactions() > 0}
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
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select 
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B2600] bg-white shadow-sm"
                  value={sortOrder}
                  onChange={(event) => handleSort(event.target.value)}
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <LocationPicker
                      onLocationSelect={(location) => {
                        setNewEvent(prev => ({
                          ...prev,
                          location,
                          venue: location.address
                        }));
                      }}
                      initialLocation={newEvent.location}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Kategori Event</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setNewEvent(prev => ({ ...prev, category: category.id }))}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                            newEvent.category === category.id
                              ? 'border-[#5B2600] bg-[#5B2600]/5 text-[#5B2600]'
                              : 'border-gray-200 hover:border-[#5B2600]/30 hover:bg-[#5B2600]/5'
                          }`}
                        >
                          <span className="text-xl">{category.icon}</span>
                          <span className="text-sm font-medium">{category.name}</span>
                        </button>
                      ))}
                    </div>
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

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Kategori Event</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setEditingEvent(prev => ({ ...prev, category: category.id }))}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                            editingEvent?.category === category.id
                              ? 'border-[#5B2600] bg-[#5B2600]/5 text-[#5B2600]'
                              : 'border-gray-200 hover:border-[#5B2600]/30 hover:bg-[#5B2600]/5'
                          }`}
                        >
                          <span className="text-xl">{category.icon}</span>
                          <span className="text-sm font-medium">{category.name}</span>
                        </button>
                      ))}
                    </div>
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

export default AdminPage; 
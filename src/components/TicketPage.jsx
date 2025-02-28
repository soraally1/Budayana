import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { 
  Calendar,
  MapPin,
  Search,
  Filter,
  ChevronDown,
  Clock,
  Ticket
} from 'lucide-react';

const TicketPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    date: '',
    category: 'all',
    priceRange: [0, 1000000],
    time: 'all'
  });
  const [selectedSort, setSelectedSort] = useState('date');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsRef = collection(db, 'events');
        const eventsSnapshot = await getDocs(eventsRef);
        const eventsData = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredAndSortedEvents = events
    .filter(event => {
      if (filters.location && !event.venue.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.date && event.date !== filters.date) return false;
      if (filters.category !== 'all' && event.category !== filters.category) return false;
      if (filters.time !== 'all') {
        const eventHour = parseInt(event.time.split(':')[0]);
        if (filters.time === 'morning' && eventHour >= 12) return false;
        if (filters.time === 'afternoon' && (eventHour < 12 || eventHour >= 17)) return false;
        if (filters.time === 'evening' && eventHour < 17) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (selectedSort) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'popularity':
          return (b.maxTickets - b.ticketsSold) - (a.maxTickets - a.ticketsSold);
        default:
          return new Date(a.date) - new Date(b.date);
      }
    });

  // Update the ticket styles with smoother design
  const ticketStyles = `
    .ticket-shape {
      position: relative;
      background: #FBF7F4;
      border-radius: 24px;
      border: 1px solid #E8DED5;
      overflow: visible;
      transition: all 0.3s ease;
    }

    /* Gradient border effect */
    .ticket-shape::before {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: 24px;
      padding: 1px;
      background: linear-gradient(to bottom, #E8DED5, rgba(232, 222, 213, 0.5));
      -webkit-mask: 
        linear-gradient(#fff 0 0) content-box, 
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
    }

    /* Dotted separator line with gradient */
    .ticket-shape::after {
      content: '';
      position: absolute;
      top: 24px;
      bottom: 24px;
      left: 35%;
      width: 2px;
      background-image: 
        linear-gradient(to bottom, transparent 50%, #E8DED5 50%),
        linear-gradient(to bottom, #5B2600 0%, #8B4513 100%);
      background-size: 2px 12px, 2px 100%;
      background-position: 0 0, 0 0;
      opacity: 0.2;
    }

    /* Smooth notches */
    .ticket-notch {
      position: absolute;
      left: 35%;
      transform: translateX(-50%);
      width: 48px;
      height: 24px;
      z-index: 10;
    }

    .ticket-notch::before,
    .ticket-notch::after {
      content: '';
      position: absolute;
      width: 24px;
      height: 24px;
      background: #F8F9FA;
      box-shadow: 0 0 0 1px #E8DED5;
    }

    .ticket-notch-top {
      top: -12px;
    }

    .ticket-notch-top::before {
      left: 0;
      border-radius: 0 0 24px 24px;
      transform: translateY(0.5px);
    }

    .ticket-notch-top::after {
      right: 0;
      border-radius: 0 0 24px 24px;
      transform: translateY(0.5px);
    }

    .ticket-notch-bottom {
      bottom: -12px;
    }

    .ticket-notch-bottom::before {
      left: 0;
      border-radius: 24px 24px 0 0;
      transform: translateY(-0.5px);
    }

    .ticket-notch-bottom::after {
      right: 0;
      border-radius: 24px 24px 0 0;
      transform: translateY(-0.5px);
    }

    /* Enhanced hover effect */
    .ticket-shape:hover {
      transform: translateY(-2px) scale(1.005);
      box-shadow: 
        0 20px 30px -8px rgba(91, 38, 0, 0.15),
        0 4px 6px -2px rgba(91, 38, 0, 0.05);
    }

    /* Content sections */
    .ticket-left-section {
      position: relative;
      background: linear-gradient(135deg, rgba(91, 38, 0, 0.03), rgba(91, 38, 0, 0.08));
      border-radius: 23px 0 0 23px;
    }

    .ticket-right-section {
      position: relative;
      background: linear-gradient(135deg, #fff, #FBF7F4);
      border-radius: 0 23px 23px 0;
    }
  `;

  return (
    <div className="min-h-screen bg-[#EBE3D5]">
      {/* Hero Section with Overlay Search */}
      <div className="relative h-[500px] bg-gradient-to-r from-[#5B2600] to-[#8B4513] overflow-hidden">
        <div className="absolute inset-0 bg-[url('/path-to-pattern.svg')] opacity-10" />
        
        {/* Content Container */}
        <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-fuzzy font-bold mb-4">
              Temukan Event Budaya
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              Jelajahi berbagai event budaya menarik di sekitarmu
            </p>
          </motion.div>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-5xl bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4">
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Cari Event
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nama event atau lokasi..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B2600] bg-white/50"
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Tanggal
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B2600] bg-white/50"
                    value={filters.date}
                    onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="md:col-span-3">
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Kategori
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B2600] appearance-none bg-white/50"
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="all">Semua Kategori</option>
                    <option value="dance">Tarian Tradisional</option>
                    <option value="music">Musik Daerah</option>
                    <option value="theater">Teater</option>
                    <option value="exhibition">Pameran Budaya</option>
                    <option value="ceremony">Upacara Adat</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="md:col-span-2">
                <button 
                  onClick={() => setShowFilters(true)}
                  className="w-full py-3 px-4 rounded-xl bg-[#5B2600] text-white font-medium hover:bg-[#4A3427] transition-colors flex items-center justify-center gap-2"
                >
                  <Filter className="w-5 h-5" />
                  <span>Filter</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pt-28 pb-12">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-fuzzy font-bold text-[#5B2600]">
              {filteredAndSortedEvents.length} Event Ditemukan
            </h2>
            <p className="text-gray-600">
              Menampilkan event budaya yang tersedia
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B2600] bg-white text-sm"
            >
              <option value="date">Tanggal: Terdekat</option>
              <option value="price-asc">Harga: Terendah</option>
              <option value="price-desc">Harga: Tertinggi</option>
              <option value="popularity">Popularitas</option>
            </select>
          </div>
        </div>

        {/* Event Cards */}
        <div className="grid grid-cols-1 gap-6">
          {filteredAndSortedEvents.map(event => (
            <Link 
              key={event.id} 
              to={`/event/${event.id}`}
              className="block group"
            >
              <motion.div
                whileHover={{ scale: 1 }}
                className="ticket-shape shadow-lg transition-all"
              >
                <div className="ticket-notch ticket-notch-top" />
                <div className="ticket-notch ticket-notch-bottom" />

                <div className="flex flex-col sm:flex-row">
                  {/* Left Section - Image */}
                  <div className="sm:w-[35%] p-6 ticket-left-section">
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-md">
                      <img
                        src={event.imageUrl || '/default-event.jpg'}
                        alt={event.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Right Section - Event Info */}
                  <div className="flex-1 p-6 ticket-right-section">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-[#5B2600] mb-2">
                        {event.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-[#8B4513]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{event.date}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{event.time}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-4 h-4 text-[#8B4513]" />
                      <span className="text-[#5B2600]">{event.venue}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#8B4513]">Harga Tiket</p>
                        <p className="text-2xl font-bold text-[#5B2600]">
                          Rp {event.price.toLocaleString()}
                        </p>
                      </div>
                      <button className="px-6 py-2 bg-[#5B2600] text-white rounded-lg font-medium hover:bg-[#4A3427] transition-colors">
                        PILIH
                      </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#E8DED5]">
                      <div className="flex items-center justify-between text-sm text-[#8B4513]">
                        <span>Tiket Tersedia</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          event.maxTickets - event.ticketsSold === 0
                            ? 'bg-red-100 text-red-700'
                            : (event.maxTickets - event.ticketsSold) < (event.maxTickets * 0.2)
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {event.maxTickets - event.ticketsSold === 0 
                            ? 'Sold Out' 
                            : `${event.maxTickets - event.ticketsSold} Tersisa`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredAndSortedEvents.length === 0 && (
          <div className="text-center py-12">
            <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-fuzzy font-bold text-gray-900 mb-2">
              Tidak Ada Event
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Tidak ada event yang sesuai dengan filter yang dipilih. 
              Coba ubah filter atau cari dengan kata kunci lain.
            </p>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              {/* Filter content here */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add the styles to your component */}
      <style>{ticketStyles}</style>
    </div>
  );
};

export default TicketPage; 
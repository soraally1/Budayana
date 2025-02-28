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
  Ticket,
  X,
  Loader2,
  ArrowRight
} from 'lucide-react';
import BudayanaLogo from '../assets/Budayana.png';

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
      if (filters.category !== 'all' && event.category !== filters.category.replace('-', '')) return false;
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

  // Update the ticket styles with responsive design
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
      background: linear-gradient(135deg, #E8DED5, rgba(232, 222, 213, 0.5));
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
      display: none;
    }

    @media (min-width: 640px) {
      .ticket-shape::after {
        display: block;
      }
    }

    /* Smooth notches */
    .ticket-notch {
      position: absolute;
      left: 35%;
      transform: translateX(-50%);
      width: 48px;
      height: 24px;
      z-index: 10;
      display: none;
    }

    @media (min-width: 640px) {
      .ticket-notch {
        display: block;
      }
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
      border-radius: 23px;
      transition: all 0.3s ease;
    }

    @media (min-width: 640px) {
      .ticket-left-section {
        border-radius: 23px 0 0 23px;
      }
    }

    .ticket-right-section {
      position: relative;
      background: linear-gradient(135deg, #fff, #FBF7F4);
      border-radius: 23px;
      transition: all 0.3s ease;
    }

    @media (min-width: 640px) {
      .ticket-right-section {
        border-radius: 0 23px 23px 0;
      }
    }

    /* Mobile-specific styles */
    @media (max-width: 639px) {
      .ticket-shape {
        border-radius: 20px;
      }

      .ticket-shape::before {
        border-radius: 20px;
      }

      .ticket-left-section {
        border-radius: 19px 19px 0 0;
      }

      .ticket-right-section {
        border-radius: 0 0 19px 19px;
        border-top: 1px dashed #E8DED5;
      }
    }
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EBE3D5] via-[#FFD384]/10 to-[#EBE3D5]">
      {/* Hero Section */}
      <div className="relative">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#5B2600] to-[#8B4513]">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#5B2600]/80 to-transparent" />
        </div>

        {/* Content Container */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
          {/* Logo and Text Container */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <motion.img
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              src={BudayanaLogo}
              alt="Budayana Logo"
              className="h-14 sm:h-16 md:h-20 mx-auto mb-8 sm:mb-10"
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4 sm:space-y-6"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-fuzzy font-bold text-white">
                Temukan Event Budaya
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                Jelajahi berbagai event budaya menarik di sekitarmu dan dapatkan pengalaman yang tak terlupakan
              </p>
            </motion.div>
          </div>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-5xl mx-auto"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 border border-white/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4">
                {/* Search Input */}
                <div className="lg:col-span-5">
                  <label className="text-xs sm:text-sm font-medium text-[#5B2600] mb-1.5 block">
                    Cari Event
                  </label>
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#8B4513]/60 group-hover:text-[#8B4513] transition-colors" />
                    <input
                      type="text"
                      placeholder="Nama event atau lokasi..."
                      className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm rounded-xl border border-[#8B4513]/20 focus:outline-none focus:ring-2 focus:ring-[#5B2600] bg-white/80 hover:bg-white transition-colors"
                      value={filters.location}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Date Input */}
                <div className="lg:col-span-3">
                  <label className="text-xs sm:text-sm font-medium text-[#5B2600] mb-1.5 block">
                    Tanggal
                  </label>
                  <div className="relative group">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#8B4513]/60 group-hover:text-[#8B4513] transition-colors" />
                    <input
                      type="date"
                      className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm rounded-xl border border-[#8B4513]/20 focus:outline-none focus:ring-2 focus:ring-[#5B2600] bg-white/80 hover:bg-white transition-colors"
                      value={filters.date}
                      onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Category Select */}
                <div className="lg:col-span-2">
                  <label className="text-xs sm:text-sm font-medium text-[#5B2600] mb-1.5 block">
                    Kategori
                  </label>
                  <div className="relative group">
                    <select
                      className="w-full px-4 py-2.5 sm:py-3 text-sm rounded-xl border border-[#8B4513]/20 focus:outline-none focus:ring-2 focus:ring-[#5B2600] appearance-none bg-white/80 hover:bg-white transition-colors"
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="all">Semua</option>
                      <option value="tari-tradisional">Tari Tradisional</option>
                      <option value="musik-tradisional">Musik Tradisional</option>
                      <option value="drama-tradisional">Drama Tradisional</option>
                      <option value="upacara-adat">Upacara Adat</option>
                      <option value="festival-budaya">Festival Budaya</option>
                      <option value="workshop-budaya">Workshop Budaya</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#8B4513]/60 group-hover:text-[#8B4513] pointer-events-none transition-colors" />
                  </div>
                </div>

                {/* Filter Button */}
                <div className="lg:col-span-2">
                  <label className="text-xs sm:text-sm font-medium text-transparent mb-1.5 block">
                    Filter
                  </label>
                  <button 
                    onClick={() => setShowFilters(true)}
                    className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-[#5B2600] text-white text-sm font-medium hover:bg-[#4A3427] transition-colors flex items-center justify-center gap-2 group"
                  >
                    <Filter className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-180 transition-transform duration-300" />
                    <span>Filter</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#5B2600]" />
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-[#8B4513]/10">
              <div>
                <h2 className="text-xl sm:text-2xl font-fuzzy font-bold text-[#5B2600]">
                  {filteredAndSortedEvents.length} Event Ditemukan
                </h2>
                <p className="text-sm text-[#8B4513]/80">
                  Menampilkan event budaya yang tersedia
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="px-3 sm:px-4 py-2 rounded-xl border border-[#8B4513]/20 focus:outline-none focus:ring-2 focus:ring-[#5B2600] bg-white text-sm hover:border-[#8B4513]/40 transition-colors"
                >
                  <option value="date">Tanggal: Terdekat</option>
                  <option value="price-asc">Harga: Terendah</option>
                  <option value="price-desc">Harga: Tertinggi</option>
                  <option value="popularity">Popularitas</option>
                </select>
              </div>
            </div>

            {/* Event Cards */}
            <div className="grid gap-4 sm:gap-6">
              <AnimatePresence>
                {filteredAndSortedEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link 
                      to={`/event/${event.id}`}
                      className="block group"
                    >
                      <div className="ticket-shape shadow-lg transition-all hover:shadow-xl">
                        <div className="ticket-notch ticket-notch-top" />
                        <div className="ticket-notch ticket-notch-bottom" />

                        <div className="flex flex-col sm:flex-row">
                          {/* Left Section - Image */}
                          <div className="sm:w-[35%] p-4 sm:p-6 ticket-left-section">
                            <div className="aspect-[16/9] sm:aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden shadow-md">
                              <img
                                src={event.imageUrl || '/default-event.jpg'}
                                alt={event.name}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                          </div>

                          {/* Right Section - Event Info */}
                          <div className="flex-1 p-4 sm:p-6 ticket-right-section">
                            <div className="mb-3 sm:mb-4">
                              <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#5B2600] mb-2 group-hover:text-[#8B4513] transition-colors line-clamp-2">
                                {event.name}
                              </h3>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs sm:text-sm text-[#8B4513]">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                  <span>{event.date}</span>
                                </div>
                                <span className="text-[#8B4513]/40">•</span>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                  <span>{event.time}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8B4513]" />
                              <span className="text-xs sm:text-sm text-[#5B2600] line-clamp-1">{event.venue}</span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-[10px] sm:text-xs text-[#8B4513]">Harga Tiket</p>
                                <p className="text-base sm:text-lg md:text-2xl font-bold text-[#5B2600]">
                                  Rp {event.price.toLocaleString()}
                                </p>
                              </div>
                              <button className="px-3 sm:px-4 py-2 bg-[#5B2600] text-white text-xs sm:text-sm rounded-lg font-medium hover:bg-[#4A3427] transition-colors group-hover:px-4 sm:group-hover:px-5 flex items-center gap-1.5 sm:gap-2">
                                <span>PILIH</span>
                                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                              </button>
                            </div>

                            <div className="mt-3 pt-3 sm:mt-4 sm:pt-4 border-t border-[#E8DED5]">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-[10px] sm:text-xs text-[#8B4513]">Tiket Tersedia</span>
                                <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
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
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Empty State */}
              {filteredAndSortedEvents.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl border border-[#8B4513]/10"
                >
                  <Ticket className="w-12 h-12 sm:w-16 sm:h-16 text-[#8B4513]/30 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-fuzzy font-bold text-[#5B2600] mb-2">
                    Tidak Ada Event
                  </h3>
                  <p className="text-sm text-[#8B4513]/60 max-w-md mx-auto">
                    Tidak ada event yang sesuai dengan filter yang dipilih. 
                    Coba ubah filter atau cari dengan kata kunci lain.
                  </p>
                </motion.div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowFilters(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-fuzzy font-bold text-[#5B2600]">
                    Filter Event
                  </h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Time of Day */}
                  <div>
                    <label className="text-sm font-medium text-[#5B2600] mb-2 block">
                      Waktu
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['morning', 'afternoon', 'evening'].map((time) => (
                        <button
                          key={time}
                          onClick={() => setFilters(prev => ({ ...prev, time }))}
                          className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                            filters.time === time
                              ? 'bg-[#5B2600] text-white shadow-lg scale-[1.02]'
                              : 'bg-[#8B4513]/10 text-[#5B2600] hover:bg-[#8B4513]/20'
                          }`}
                        >
                          {time === 'morning' ? 'Pagi'
                            : time === 'afternoon' ? 'Siang'
                            : 'Malam'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-medium text-[#5B2600] mb-2 block">
                      Range Harga
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative group">
                        <input
                          type="number"
                          placeholder="Min"
                          className="w-full pl-3 pr-8 py-2 rounded-xl border border-[#8B4513]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B2600] group-hover:border-[#8B4513]/40 transition-colors"
                          value={filters.priceRange[0]}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            priceRange: [parseInt(e.target.value) || 0, prev.priceRange[1]]
                          }))}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8B4513]/60">
                          Rp
                        </span>
                      </div>
                      <div className="relative group">
                        <input
                          type="number"
                          placeholder="Max"
                          className="w-full pl-3 pr-8 py-2 rounded-xl border border-[#8B4513]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B2600] group-hover:border-[#8B4513]/40 transition-colors"
                          value={filters.priceRange[1]}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            priceRange: [prev.priceRange[0], parseInt(e.target.value) || 0]
                          }))}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8B4513]/60">
                          Rp
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setFilters({
                        location: '',
                        date: '',
                        category: 'all',
                        priceRange: [0, 1000000],
                        time: 'all'
                      });
                      setShowFilters(false);
                    }}
                    className="flex-1 py-2.5 border-2 border-[#5B2600] text-[#5B2600] rounded-xl text-sm font-medium hover:bg-[#5B2600] hover:text-white transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 py-2.5 bg-[#5B2600] text-white rounded-xl text-sm font-medium hover:bg-[#4A3427] transition-colors"
                  >
                    Terapkan
                  </button>
                </div>
              </div>
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
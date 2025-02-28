import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { 
  User, Camera, Loader2, CheckCircle2, AlertCircle, Pencil, 
  Calendar, History, Mail, Clock, MapPin, Ticket as TicketIcon,
  Users, ChevronRight
} from 'lucide-react';
import BudayanaLogo from '../assets/Budayana.png';
import TicketCard from './TicketCard';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'history'
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    photoURL: '',
    createdAt: null
  });
  const [tickets, setTickets] = useState({
    upcoming: [],
    history: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: '',
    photoURL: ''
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/login');
          return;
        }

        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          const userData = {
            name: data.name || user.displayName || '',
            email: user.email || '',
            photoURL: data.photoURL || user.photoURL || '',
            createdAt: data.createdAt?.toDate() || null
          };
          
          setUserData(userData);
          setEditedData({
            name: userData.name,
            photoURL: userData.photoURL
          });

          // Fetch user's tickets
          const ticketsRef = collection(db, 'tickets');
          const q = query(ticketsRef, where('userId', '==', user.uid));
          const ticketDocs = await getDocs(q);
          const ticketsData = ticketDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          console.log('User ID:', user.uid);
          console.log('Raw Tickets Data:', ticketsData);

          // Get event details for each ticket
          const ticketsWithEventDetails = await Promise.all(
            ticketsData.map(async (ticket) => {
              try {
                if (!ticket.eventId) {
                  console.warn('Ticket missing eventId:', ticket);
                  return ticket;
                }

                const eventDoc = await getDoc(doc(db, 'events', ticket.eventId));
                if (eventDoc.exists()) {
                  const eventData = eventDoc.data();
                  return {
                    ...ticket,
                    venue: eventData.venue,
                    eventDate: eventData.date,
                    eventTime: eventData.time,
                    // Ensure we have eventName from either source
                    eventName: ticket.eventName || eventData.name || 'Unknown Event'
                  };
                }
                console.warn('Event not found for ticket:', ticket);
                return {
                  ...ticket,
                  eventName: ticket.eventName || 'Unknown Event'
                };
              } catch (error) {
                console.error('Error fetching event details:', error);
                return {
                  ...ticket,
                  eventName: ticket.eventName || 'Unknown Event'
                };
              }
            })
          );

          console.log('Tickets with event details:', ticketsWithEventDetails);

          // Separate tickets into upcoming and history based on event date
          const upcoming = ticketsWithEventDetails.filter(ticket => {
            // If no event date, check purchase date
            const dateToCheck = ticket.eventDate || ticket.purchaseDate;
            if (!dateToCheck) return true; // If no dates at all, show in upcoming

            let compareDate;
            try {
              // Handle Firestore Timestamp
              if (dateToCheck && typeof dateToCheck.toDate === 'function') {
                compareDate = dateToCheck.toDate();
              } else {
                compareDate = new Date(dateToCheck);
              }

              // If date is invalid, show in upcoming
              if (isNaN(compareDate.getTime())) return true;

              return compareDate > new Date();
            } catch (error) {
              console.error('Error comparing dates:', error);
              return true; // On error, show in upcoming
            }
          });

          const history = ticketsWithEventDetails.filter(ticket => {
            // If no event date, check purchase date
            const dateToCheck = ticket.eventDate || ticket.purchaseDate;
            if (!dateToCheck) return false; // If no dates at all, don't show in history

            let compareDate;
            try {
              // Handle Firestore Timestamp
              if (dateToCheck && typeof dateToCheck.toDate === 'function') {
                compareDate = dateToCheck.toDate();
              } else {
                compareDate = new Date(dateToCheck);
              }

              // If date is invalid, don't show in history
              if (isNaN(compareDate.getTime())) return false;

              return compareDate <= new Date();
            } catch (error) {
              console.error('Error comparing dates:', error);
              return false; // On error, don't show in history
            }
          });

          console.log('Upcoming tickets:', upcoming);
          console.log('History tickets:', history);

          setTickets({ upcoming, history });
        } else {
          // Create user document if it doesn't exist
          const newUserData = {
            name: user.displayName || '',
            email: user.email,
            photoURL: user.photoURL || '',
            createdAt: new Date(),
            updatedAt: new Date()
          };
          await setDoc(userRef, newUserData);
          setUserData(newUserData);
          setEditedData({
            name: newUserData.name,
            photoURL: newUserData.photoURL
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setMessage({
          type: 'error',
          text: 'Gagal memuat data profil'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setMessage({
        type: 'error',
        text: 'Ukuran foto maksimal 5MB'
      });
      return;
    }

    try {
      // Compress image before converting to base64
      const compressedBase64 = await compressImage(file);
      setEditedData(prev => ({
        ...prev,
        photoURL: compressedBase64
      }));
    } catch (error) {
      console.error('Error processing image:', error);
      setMessage({
        type: 'error',
        text: 'Gagal memproses foto'
      });
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Calculate new dimensions (max 800px)
          const maxWidth = 800;
          const maxHeight = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with reduced quality
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedBase64);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      // First update Firestore with full data including base64 image
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: editedData.name,
        photoURL: editedData.photoURL || null,
        updatedAt: new Date()
      });

      // Update auth profile with only name
      await updateProfile(user, {
        displayName: editedData.name,
        // Don't update photoURL in auth profile
      });

      // Update local state
      setUserData(prev => ({
        ...prev,
        name: editedData.name,
        photoURL: editedData.photoURL
      }));

      setMessage({
        type: 'success',
        text: 'Profil berhasil diperbarui'
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        text: 'Gagal memperbarui profil: ' + error.message
      });
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EBE3D5] via-[#FFD384]/10 to-[#EBE3D5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#5B2600]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EBE3D5] via-[#FFD384]/10 to-[#EBE3D5] pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12 px-3 sm:px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <img 
            src={BudayanaLogo}
            alt="Budayana Logo"
            className="h-10 sm:h-12 md:h-14 mx-auto mb-4 sm:mb-6"
          />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-fuzzy font-bold text-[#8B4513] mb-1 sm:mb-2">
            My Profile
          </h1>
          <p className="text-sm sm:text-base text-[#8B4513]/80 font-fuzzy">
            Manage your profile and view your tickets
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-1 bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden"
          >
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-[#8B4513] to-[#5B2600] p-4 sm:p-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-[#FFD384]/20 flex items-center justify-center overflow-hidden border-4 border-white/30">
                    {(isEditing ? editedData.photoURL : userData.photoURL) ? (
                      <img 
                        src={isEditing ? editedData.photoURL : userData.photoURL}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white" />
                    )}
                  </div>
                  {isEditing && (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 sm:p-2.5 bg-white text-[#8B4513] rounded-full shadow-lg hover:bg-[#FFF8F0] transition-colors"
                      title="Change profile picture"
                    >
                      <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Profile Body */}
            <div className="p-4 sm:p-6">
              {/* Message Display */}
              <AnimatePresence>
                {message.text && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-fuzzy flex items-center gap-2 ${
                      message.type === 'error' 
                        ? 'bg-red-50 text-red-600' 
                        : 'bg-green-50 text-green-600'
                    }`}
                  >
                    {message.type === 'error' ? (
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    )}
                    <p>{message.text}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* User Info Form */}
              <form onSubmit={handleUpdateProfile} className="space-y-4 sm:space-y-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-[#FFF8F0] p-3 sm:p-4 rounded-xl">
                    <label className="block text-xs sm:text-sm font-fuzzy text-[#8B4513] font-bold mb-1.5 sm:mb-2">
                      Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData.name}
                        onChange={(e) => setEditedData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border-2 border-[#8B4513]/20 rounded-xl focus:outline-none focus:border-[#8B4513] font-fuzzy text-[#5B2600] transition-colors bg-white"
                        placeholder="Enter your name"
                      />
                    ) : (
                      <p className="text-[#5B2600] font-fuzzy font-medium text-sm px-3 sm:px-4 py-2 sm:py-2.5">
                        {userData.name || 'Not set'}
                      </p>
                    )}
                  </div>

                  <div className="bg-[#FFF8F0] p-3 sm:p-4 rounded-xl">
                    <label className="block text-xs sm:text-sm font-fuzzy text-[#8B4513] font-bold mb-1.5 sm:mb-2">
                      Email
                    </label>
                    <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#8B4513]" />
                      <p className="text-[#5B2600] font-fuzzy font-medium text-sm">{userData.email}</p>
                    </div>
                  </div>

                  <div className="bg-[#FFF8F0] p-3 sm:p-4 rounded-xl">
                    <label className="block text-xs sm:text-sm font-fuzzy text-[#8B4513] font-bold mb-1.5 sm:mb-2">
                      Member Since
                    </label>
                    <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#8B4513]" />
                      <p className="text-[#5B2600] font-fuzzy font-medium text-sm">
                        {userData.createdAt ? formatDate(userData.createdAt) : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {isEditing ? (
                  <div className="flex gap-2 sm:gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={updating}
                      className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 bg-[#8B4513] text-white rounded-xl font-fuzzy text-xs sm:text-sm hover:bg-[#5B2600] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {updating ? (
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setEditedData({
                          name: userData.name,
                          photoURL: userData.photoURL
                        });
                      }}
                      className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 border-2 border-[#8B4513] text-[#8B4513] rounded-xl font-fuzzy text-xs sm:text-sm hover:bg-[#8B4513] hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-full py-2.5 sm:py-3 px-4 sm:px-6 bg-[#8B4513] text-white rounded-xl font-fuzzy text-xs sm:text-sm hover:bg-[#5B2600] transition-colors flex items-center justify-center gap-2"
                  >
                    <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
                    Edit Profile
                  </button>
                )}
              </form>
            </div>
          </motion.div>

          {/* Tickets Section */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Tabs */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-1.5 sm:p-2 flex gap-1.5 sm:gap-2 shadow-xl">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-fuzzy transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${
                  activeTab === 'upcoming'
                    ? 'bg-[#8B4513] text-white shadow-md transform scale-[1.02]'
                    : 'text-[#8B4513] hover:bg-[#8B4513]/10'
                }`}
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                Upcoming Tickets
                {tickets.upcoming.length > 0 && (
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${
                    activeTab === 'upcoming' ? 'bg-white/20' : 'bg-[#8B4513]/20'
                  }`}>
                    {tickets.upcoming.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-fuzzy transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${
                  activeTab === 'history'
                    ? 'bg-[#8B4513] text-white shadow-md transform scale-[1.02]'
                    : 'text-[#8B4513] hover:bg-[#8B4513]/10'
                }`}
              >
                <History className="w-4 h-4 sm:w-5 sm:h-5" />
                Ticket History
                {tickets.history.length > 0 && (
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${
                    activeTab === 'history' ? 'bg-white/20' : 'bg-[#8B4513]/20'
                  }`}>
                    {tickets.history.length}
                  </span>
                )}
              </button>
            </div>

            {/* Tickets List */}
            <div className="space-y-4 sm:space-y-6">
              <AnimatePresence mode="wait">
                {tickets[activeTab].length > 0 ? (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid gap-4 sm:gap-6"
                  >
                    {tickets[activeTab].map((ticket, index) => (
                      <motion.div
                        key={ticket.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <TicketCard ticket={ticket} />
                      </motion.div>
                    ))}
                    <p className="text-center text-xs sm:text-sm text-[#8B4513]/60 font-fuzzy mt-2 sm:mt-4">
                      {activeTab === 'upcoming' 
                        ? `Showing ${tickets.upcoming.length} upcoming ticket${tickets.upcoming.length !== 1 ? 's' : ''}`
                        : `Showing ${tickets.history.length} past ticket${tickets.history.length !== 1 ? 's' : ''}`
                      }
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`empty-${activeTab}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/95 backdrop-blur-sm rounded-xl p-6 sm:p-8 text-center shadow-xl"
                  >
                    <div className="flex justify-center mb-3 sm:mb-4">
                      {activeTab === 'upcoming' ? (
                        <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-[#8B4513]/30" />
                      ) : (
                        <History className="w-12 h-12 sm:w-16 sm:h-16 text-[#8B4513]/30" />
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-fuzzy font-bold text-[#8B4513] mb-2 sm:mb-3">
                      {activeTab === 'upcoming'
                        ? 'No Upcoming Tickets'
                        : 'No Past Tickets'
                      }
                    </h3>
                    <p className="text-[#8B4513]/60 font-fuzzy text-xs sm:text-sm max-w-md mx-auto">
                      {activeTab === 'upcoming'
                        ? 'Tickets you purchase will appear here. Browse our events to find your next cultural experience!'
                        : 'Your ticket history will appear here after attending events.'
                      }
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 
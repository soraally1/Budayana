import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { User, Camera, Loader2, CheckCircle2, AlertCircle, Pencil } from 'lucide-react';
import BudayanaLogo from '../assets/Budayana.png';
import TicketList from './TicketList';

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
  const [loadingTickets, setLoadingTickets] = useState(false);

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
          setLoadingTickets(true);
          const ticketsRef = collection(db, 'tickets');
          const q = query(ticketsRef, where('userId', '==', user.uid));
          const ticketDocs = await getDocs(q);
          const ticketsData = ticketDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          console.log('User ID:', user.uid); // Log the user ID
          console.log('Fetched Tickets Data:', ticketsData); // Log the fetched tickets data
          // Separate tickets into upcoming and history
          const upcoming = ticketsData.filter(ticket => new Date(ticket.eventDate) > new Date());
          const history = ticketsData.filter(ticket => new Date(ticket.eventDate) <= new Date());

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
        setLoadingTickets(false);
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
    <div className="min-h-screen bg-gradient-to-br from-[#EBE3D5] via-[#FFD384]/10 to-[#EBE3D5] pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src={BudayanaLogo}
            alt="Budayana Logo"
            className="h-12 mx-auto mb-4"
          />
          <h1 className="text-2xl md:text-3xl font-fuzzy font-bold text-[#5B2600]">
            Profil Saya
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-1 bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-6"
          >
            {/* Profile Picture */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-[#FFD384]/20 flex items-center justify-center overflow-hidden">
                  {(isEditing ? editedData.photoURL : userData.photoURL) ? (
                    <img 
                      src={isEditing ? editedData.photoURL : userData.photoURL}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-[#5B2600]" />
                  )}
                </div>
                {isEditing && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-[#5B2600] rounded-full text-white hover:bg-[#4A3427] transition-colors"
                    title="Change profile picture"
                  >
                    <Camera className="w-4 h-4" />
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

            {/* Message Display */}
            <AnimatePresence>
              {message.text && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mb-6 p-4 rounded-lg text-sm font-fuzzy flex items-center gap-2 ${
                    message.type === 'error' 
                      ? 'bg-red-50 text-red-600' 
                      : 'bg-green-50 text-green-600'
                  }`}
                >
                  {message.type === 'error' ? (
                    <AlertCircle className="w-5 h-5 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                  )}
                  <p>{message.text}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* User Info Form */}
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-fuzzy text-[#5B2600] font-bold mb-1">
                  Nama
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.name}
                    onChange={(e) => setEditedData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#5B2600] font-fuzzy text-sm transition-colors"
                  />
                ) : (
                  <p className="text-gray-600 font-fuzzy">{userData.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-fuzzy text-[#5B2600] font-bold mb-1">
                  Email
                </label>
                <p className="text-gray-600 font-fuzzy">{userData.email}</p>
              </div>

              <div>
                <label className="block text-sm font-fuzzy text-[#5B2600] font-bold mb-1">
                  Bergabung Sejak
                </label>
                <p className="text-gray-600 font-fuzzy">
                  {userData.createdAt ? formatDate(userData.createdAt) : '-'}
                </p>
              </div>

              {isEditing ? (
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 py-2 px-4 bg-[#5B2600] text-white rounded-xl font-fuzzy text-sm hover:bg-[#4A3427] transition-colors disabled:opacity-70"
                  >
                    {updating ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      'Simpan'
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
                    className="flex-1 py-2 px-4 border-2 border-[#5B2600] text-[#5B2600] rounded-xl font-fuzzy text-sm hover:bg-[#5B2600] hover:text-white transition-colors"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-full py-2 px-4 bg-[#5B2600] text-white rounded-xl font-fuzzy text-sm hover:bg-[#4A3427] transition-colors flex items-center justify-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Profil
                </button>
              )}
            </form>
          </motion.div>

          {/* Tickets Section */}
          <div className="md:col-span-2 space-y-6">
            <TicketList tickets={tickets} activeTab={activeTab} setActiveTab={setActiveTab} loadingTickets={loadingTickets} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import BudayanaLogo from '../assets/Budayana.png';
import AnnaMascot from '../assets/AnnaMascot.png';

const UserLog = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await signInWithPopup(auth, provider);
      
      // Check if user exists in Firestore, if not create profile
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      // Navigate to homepage after successful login
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Google Sign In Error:', error);
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          setError('Login dibatalkan.');
          break;
        case 'auth/popup-blocked':
          setError('Pop-up diblokir oleh browser. Mohon izinkan pop-up untuk login.');
          break;
        case 'auth/account-exists-with-different-credential':
          setError('Email sudah terdaftar dengan metode login lain.');
          break;
        default:
          setError('Gagal masuk dengan Google. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate input
    if (!formData.email || !formData.password) {
      setError('Email dan password harus diisi.');
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      // Navigate to homepage after successful login
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Login Error:', error);
      switch (error.code) {
        case 'auth/invalid-email':
          setError('Format email tidak valid.');
          break;
        case 'auth/user-disabled':
          setError('Akun ini telah dinonaktifkan.');
          break;
        case 'auth/user-not-found':
          setError('Email tidak terdaftar.');
          break;
        case 'auth/wrong-password':
          setError('Password salah.');
          break;
        default:
          setError('Terjadi kesalahan saat masuk. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EBE3D5] via-[#FFD384]/10 to-[#EBE3D5] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-[1100px] grid md:grid-cols-2 gap-6 md:gap-8 items-center">
        {/* Left Side - Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden w-full max-w-[450px] mx-auto md:max-w-none order-2 md:order-1"
        >
          {/* Logo and Badge */}
          <div className="pt-6 md:pt-8 px-6 md:px-8 flex flex-col items-center">
            <img 
              src={BudayanaLogo} 
              alt="Budayana Logo" 
              className="h-12 md:h-16 w-auto object-contain"
            />
            <div className="mt-3 md:mt-4 inline-flex items-center gap-2 bg-[#5B2600] px-3 md:px-4 py-1.5 rounded-full">
              <Ticket className="w-3.5 md:w-4 h-3.5 md:h-4 text-[#FFD384]" />
              <span className="text-[11px] md:text-xs font-fuzzy text-[#FFD384]">E-Ticketing Platform</span>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="px-6 md:px-8 pt-6 md:pt-8 text-center">
            <h2 className="text-2xl md:text-3xl font-fuzzy text-[#5B2600] font-bold">
              Selamat Datang Kembali!
            </h2>
            <p className="text-[#5B2600]/70 mt-2 font-fuzzy text-sm">
              Masuk dan pesan tiket pertunjukan favoritmu
            </p>
          </div>

          {/* Form */}
          <div className="p-6 md:p-8">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-600 rounded-r-lg text-sm font-fuzzy"
                >
                  <p className="font-bold">Gagal masuk</p>
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              {/* Email field */}
              <div className="space-y-1.5">
                <label className="block text-sm font-fuzzy text-[#5B2600] font-bold">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#5B2600] transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="nama@email.com"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#5B2600] font-fuzzy text-sm transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-fuzzy text-[#5B2600] font-bold">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-sm text-[#5B2600] hover:underline font-fuzzy"
                  >
                    Lupa Password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#5B2600] transition-colors" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Masukkan password"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#5B2600] font-fuzzy text-sm transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#5B2600] text-white rounded-xl font-fuzzy flex items-center justify-center gap-2 hover:bg-[#4A3427] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span className="font-bold">Masuk Sekarang</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-fuzzy">
                  atau
                </span>
              </div>
            </div>

            {/* Google Sign In */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 md:py-3 px-4 bg-white border-2 border-gray-200 rounded-xl font-fuzzy flex items-center justify-center gap-3 hover:bg-gray-50 transition-all disabled:opacity-70"
            >
              <img 
                src="https://www.google.com/favicon.ico" 
                alt="Google" 
                className="w-4 md:w-5 h-4 md:h-5"
              />
              <span className="text-gray-700 font-medium text-sm md:text-base">Lanjutkan dengan Google</span>
            </motion.button>

            {/* Register Link */}
            <div className="mt-5 md:mt-6 text-center">
              <p className="text-gray-600 font-fuzzy text-sm">
                Belum punya akun?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="text-[#5B2600] hover:underline font-fuzzy font-bold"
                >
                  Daftar
                </button>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Illustration */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative order-1 md:order-2 min-h-[300px] md:min-h-[500px] flex items-center"
        >
          <div className="w-full h-full relative">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFD384]/40 to-[#5B2600]/10 rounded-full transform rotate-12 blur-2xl" />
            <div className="absolute inset-0 bg-gradient-to-tl from-[#5B2600]/5 to-transparent rounded-full transform -rotate-12 blur-xl" />
            
            {/* Anna Mascot Container */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <motion.div
                animate={{
                  y: [-10, 10, -10],
                  rotate: [-5, 5, -5]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-full max-w-[280px] sm:max-w-[340px] md:max-w-[420px] lg:max-w-[460px]"
              >
                <img 
                  src={AnnaMascot} 
                  alt="Anna Mascot" 
                  className="w-full h-auto drop-shadow-2xl transform -rotate-12"
                />
              </motion.div>
            </div>

            {/* Feature Cards */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-3 md:gap-4 w-full max-w-[90%] justify-center">
              {[
                { icon: '🎭', label: 'Pertunjukan' },
                { icon: '🎟️', label: 'E-Ticket' },
                { icon: '📱', label: 'Mudah' }
              ].map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-white/90 backdrop-blur-sm rounded-xl md:rounded-2xl p-2 md:p-3 shadow-lg border border-white/20 flex-1 max-w-[120px]"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 md:w-12 md:h-12 bg-[#FFD384]/30 rounded-lg md:rounded-xl flex items-center justify-center mb-1 md:mb-2">
                      <span className="text-base md:text-xl">{feature.icon}</span>
                    </div>
                    <p className="text-xs md:text-sm font-fuzzy text-[#5B2600] font-bold text-center">{feature.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserLog; 
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import BudayanaLogo from '../assets/Budayana.png';
import AnnaMascot from '../assets/AnnaMascot.png';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Semua field harus diisi');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password harus minimal 6 karakter');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      // Store additional user data in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: formData.name,
        email: formData.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Navigate to homepage after successful registration
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Register Error:', error);
      
      // Handle specific error codes
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('Email sudah terdaftar. Silakan gunakan email lain.');
          break;
        case 'auth/invalid-email':
          setError('Format email tidak valid.');
          break;
        case 'auth/operation-not-allowed':
          setError('Registrasi dengan email dan password belum diaktifkan di Firebase Console.');
          break;
        case 'auth/weak-password':
          setError('Password terlalu lemah. Gunakan minimal 6 karakter.');
          break;
        case 'auth/network-request-failed':
          setError('Koneksi gagal. Periksa koneksi internet Anda.');
          break;
        case 'auth/configuration-not-found':
          setError('Konfigurasi Firebase belum lengkap. Hubungi administrator.');
          break;
        default:
          setError(`Terjadi kesalahan saat mendaftar: ${error.message}`);
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
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EBE3D5] via-[#FFD384]/10 to-[#EBE3D5] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-[1100px] grid md:grid-cols-2 gap-6 md:gap-8 items-center">
        {/* Left Side - Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden w-full max-w-[450px] mx-auto md:max-w-none"
        >
          {/* Logo and Badge */}
          <div className="pt-6 md:pt-8 px-6 md:px-8 flex flex-col items-center">
            <img 
              src={BudayanaLogo} 
              alt="Budayana Logo" 
              className="h-12 md:h-16"
            />
            <div className="mt-3 md:mt-4 inline-flex items-center gap-2 bg-[#5B2600] px-3 md:px-4 py-1.5 rounded-full">
              <Ticket className="w-3.5 md:w-4 h-3.5 md:h-4 text-[#FFD384]" />
              <span className="text-[11px] md:text-xs font-fuzzy text-[#FFD384]">E-Ticketing Platform</span>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="px-6 md:px-8 pt-6 md:pt-8 text-center">
            <h2 className="text-2xl md:text-3xl font-fuzzy text-[#5B2600] font-bold">
              Bergabung dengan Budayana!
            </h2>
            <p className="text-[#5B2600]/70 mt-2 font-fuzzy text-sm">
              Daftar dan jelajahi pertunjukan budaya Nusantara
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
                  <p className="font-bold">Gagal mendaftar</p>
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              {/* Name field */}
              <div className="space-y-1.5">
                <label className="block text-sm font-fuzzy text-[#5B2600] font-bold">
                  Nama Lengkap
                </label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#5B2600] transition-colors" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Masukkan nama lengkap"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#5B2600] font-fuzzy text-sm transition-colors"
                    required
                  />
                </div>
              </div>

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

              {/* Password fields in a grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-fuzzy text-[#5B2600] font-bold">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#5B2600] transition-colors" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Min. 8 karakter"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#5B2600] font-fuzzy text-sm transition-colors"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-fuzzy text-[#5B2600] font-bold">
                    Konfirmasi Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#5B2600] transition-colors" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Ulangi password"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#5B2600] font-fuzzy text-sm transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#5B2600] text-white rounded-xl font-fuzzy flex items-center justify-center gap-2 hover:bg-[#4A3427] transition-colors mt-8 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span className="font-bold">Daftar Sekarang</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 font-fuzzy">
                Sudah punya akun?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-[#5B2600] hover:underline font-fuzzy font-bold"
                >
                  Masuk
                </button>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Illustration */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:block order-1 md:order-2"
        >
          <div className="relative">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFD384]/40 to-[#5B2600]/10 rounded-full transform -rotate-12 blur-2xl" />
            
            {/* Anna Mascot */}
            <motion.div
              animate={{
                y: [-10, 10, -10],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative z-10"
            >
              <img 
                src={AnnaMascot} 
                alt="Anna Mascot" 
                className="w-full max-w-[420px] mx-auto drop-shadow-2xl"
              />
            </motion.div>

            {/* Feature Cards */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-4">
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
                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-white/20"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-[#FFD384]/30 rounded-xl flex items-center justify-center mb-2">
                      <span className="text-xl">{feature.icon}</span>
                    </div>
                    <p className="text-sm font-fuzzy text-[#5B2600] font-bold">{feature.label}</p>
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

export default Register; 
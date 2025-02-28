import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Anna1 from "../../assets/Anna 1.png";
import { TicketCheckIcon, User2, UsersIcon, LogIn, Home, LogOut, ChevronDown, Settings } from "lucide-react";
import { auth, db } from '../../firebase';
import { signOut } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Navbar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserProfile(userData);
            setIsAdmin(userData.isAdmin === true);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => {
      window.removeEventListener('resize', checkMobile);
      unsubscribe();
    };
  }, []);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar when scrolling up or at top
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true);
      } 
      // Hide navbar when scrolling down and not at top
      else if (currentScrollY > 50 && currentScrollY > lastScrollY) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await signOut(auth);
      // Navigate to homepage after logout
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Public routes available to all users
  const publicNavItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: TicketCheckIcon, label: "Tickets", href: "/tickets" },
  ];

  // Protected routes only for logged-in users
  const protectedNavItems = [
    { icon: UsersIcon, label: "Community", href: "/community" },
  ];

  // Add admin nav item
  const adminNavItems = isAdmin ? [
    { 
      icon: Settings, 
      label: "Admin", 
      href: "/admin",
      className: "text-[#FFD384]" // Make admin icon stand out
    }
  ] : [];

  // Combine nav items based on auth state - removed profile icon
  const navItems = [
    ...publicNavItems,
    ...(currentUser ? protectedNavItems : []),
    ...adminNavItems, // Add admin items if user is admin
    ...(!currentUser ? [{ icon: LogIn, label: "Login", href: "/login" }] : []),
  ];

  const renderAuthButtons = () => {
    if (isLoading) return null;

    if (currentUser) {
      return (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 bg-white/10 px-3 py-2 rounded-full transition-all hover:bg-white/15"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#FFD384]/30">
              {userProfile?.photoURL ? (
                <img 
                  src={userProfile.photoURL}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#FFD384]/20 flex items-center justify-center">
                  <User2 className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <span className="text-sm font-fuzzy text-white/90 truncate max-w-[120px]">
              {userProfile?.name || currentUser.displayName || currentUser.email?.split('@')[0]}
            </span>
            <ChevronDown className={`w-4 h-4 text-white/70 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-xl shadow-xl"
              >
                <Link
                  to="/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User2 className="w-4 h-4" />
                  <span>Profil Saya</span>
                </Link>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleLogout();
                  }}
                  disabled={isLoading}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return null;
  };

  const navbarContent = (
    <>
      <Link to="/">
        <motion.span className="w-12 lg:w-16 shrink-0">
          <img 
            src={Anna1} 
            alt="Budayana Logo" 
            className="rounded-md w-full h-full object-cover" 
          />
        </motion.span>
      </Link>

      <div className="flex items-center gap-4 lg:gap-6">
        {navItems.map((item) => (
          <Link 
            key={item.label}
            to={item.href}
            className="relative group"
          >
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <item.icon 
                className={`w-6 h-6 lg:w-7 lg:h-7 ${
                  location.pathname === item.href ? 'text-[#FFD384]' : 'text-white'
                } transition-colors ${item.className || ''}`}
              />
              <span className="hidden group-hover:block absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-white whitespace-nowrap bg-[#5B2600] px-2 py-1 rounded">
                {item.label}
              </span>
            </motion.div>
          </Link>
        ))}
      </div>

      {renderAuthButtons()}
    </>
  );

  const mobileContent = (
    <div className="flex items-center justify-between w-full px-4">
      {/* Left Side Navigation */}
      <div className="flex items-center gap-12">
        <Link to="/">
          <motion.div whileTap={{ scale: 0.95 }}>
            <Home className={`w-6 h-6 ${
              location.pathname === '/' ? 'text-[#FFD384]' : 'text-white'
            }`} />
          </motion.div>
        </Link>
        <Link to="/tickets">
          <motion.div whileTap={{ scale: 0.95 }}>
            <TicketCheckIcon className={`w-6 h-6 ${
              location.pathname === '/tickets' ? 'text-[#FFD384]' : 'text-white'
            }`} />
          </motion.div>
        </Link>
      </div>

      {/* Center Logo */}
      <div className="absolute left-1/2 -translate-x-1/2 -translate-y-8">
        <motion.div
          whileTap={{ scale: 0.95 }}
          className="bg-[#5B2600] p-4 rounded-full shadow-lg"
        >
          <img 
            src={Anna1} 
            alt="Budayana Logo" 
            className="h-10 w-10 object-contain" 
          />
        </motion.div>
      </div>

      {/* Right Side Navigation */}
      <div className="flex items-center gap-12">
        {currentUser && (
          <Link to="/community">
            <motion.div whileTap={{ scale: 0.95 }}>
              <UsersIcon className={`w-6 h-6 ${
                location.pathname === '/community' ? 'text-[#FFD384]' : 'text-white'
              }`} />
            </motion.div>
          </Link>
        )}
        <div className="relative">
          <button
            onClick={() => currentUser ? setIsDropdownOpen(!isDropdownOpen) : navigate('/login')}
            className="relative"
          >
            {currentUser ? (
              <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-[#FFD384]/30">
                {userProfile?.photoURL ? (
                  <img 
                    src={userProfile.photoURL}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#FFD384]/20 flex items-center justify-center">
                    <User2 className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ) : (
              <LogIn className={`w-6 h-6 ${
                location.pathname === '/login' ? 'text-[#FFD384]' : 'text-white'
              }`} />
            )}
          </button>

          <AnimatePresence>
            {isDropdownOpen && currentUser && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="fixed left-4 right-4 bottom-24 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
              >
                {/* User Info */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#FFD384]/30">
                      {userProfile?.photoURL ? (
                        <img 
                          src={userProfile.photoURL}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#FFD384]/20 flex items-center justify-center">
                          <User2 className="w-5 h-5 text-[#5B2600]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-fuzzy text-[#5B2600] font-bold truncate">
                        {userProfile?.name || currentUser.displayName || currentUser.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <Link
                    to="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                  >
                    <User2 className="w-5 h-5" />
                    <span className="font-fuzzy">Profil Saya</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleLogout();
                    }}
                    disabled={isLoading}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-red-600 hover:bg-red-50 active:bg-red-100 disabled:opacity-50"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-fuzzy">Keluar</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <motion.div
        initial={false}
        animate={{
          y: isVisible ? 0 : 100
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut"
        }}
        className="fixed bottom-0 left-0 right-0 z-50"
      >
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#EFE6D9] to-transparent pointer-events-none" />
        <motion.nav
          className="relative mx-4 mb-4 flex items-center bg-[#5B2600] backdrop-blur-sm py-4 rounded-2xl text-white shadow-lg"
          whileTap={{ scale: 0.98 }}
        >
          {mobileContent}
        </motion.nav>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={false}
      animate={{
        y: isVisible ? 0 : -100
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut"
      }}
      className="fixed top-0 right-0 p-4 lg:p-5 z-50"
    >
      <motion.nav
        className="flex items-center gap-6 bg-[#5B2600]/95 backdrop-blur-sm px-6 lg:px-8 py-3 lg:py-4 rounded-full text-white shadow-lg"
        whileTap={{ scale: 0.98 }}
      >
        {navbarContent}
      </motion.nav>
    </motion.div>
  );
};

export default Navbar;

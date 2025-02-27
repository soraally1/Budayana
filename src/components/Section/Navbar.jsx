import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Anna1 from "../../assets/Anna 1.png";
import { TicketCheckIcon, User2, UsersIcon } from "lucide-react";

const navItems = [
  { icon: TicketCheckIcon, label: "Tickets", href: "/tickets" },
  { icon: UsersIcon, label: "Community", href: "/community" },
  { icon: User2, label: "Profile", href: "/profile" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const desktopNavbarVariants = {
    closed: {
      width: "auto",
      transition: { 
        duration: 0.4,
        ease: "easeInOut"
      },
    },
    open: {
      width: "280px",
      transition: { 
        duration: 0.4,
        ease: "easeInOut"
      },
    },
  };

  const mobileNavbarVariants = {
    closed: {
      height: "60px",
      borderRadius: "999px",
      width: "clamp(300px, 85%, 400px)",
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
    open: {
      height: "auto",
      borderRadius: "24px",
      width: "clamp(320px, 90%, 420px)",
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: i => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3
      }
    })
  };

  const handleNavItemClick = (index) => {
    setActiveItem(index);
    // Add navigation logic here if needed
  };

  const desktopNavbarContent = (
    <>
      <motion.div
        className="w-12 lg:w-16 shrink-0 relative overflow-hidden rounded-md"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <img 
          src={Anna1} 
          alt="User profile" 
          className="w-full h-full object-cover" 
        />
        <motion.div 
          className="absolute inset-0 bg-black/20"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />
      </motion.div>

      <div className="flex items-center justify-between gap-4 lg:gap-6 flex-1">
        {navItems.map((item, index) => (
          <motion.div 
            key={item.label}
            className={`relative flex items-center gap-3 ${isOpen ? 'justify-start w-full' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNavItemClick(index)}
          >
            <div className={`relative ${activeItem === index ? 'text-white' : 'text-white/80'}`}>
              <item.icon className="w-6 h-6 lg:w-7 lg:h-7" />
              {activeItem === index && (
                <motion.div 
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                  layoutId="activeIndicator"
                />
              )}
            </div>
            
            {isOpen && (
              <motion.span 
                className="text-white font-medium"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {item.label}
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>
    </>
  );

  const mobileNavbarContent = (
    <>
      <div className="flex items-center justify-between w-full px-6 sm:px-8">
        <motion.div 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <TicketCheckIcon className="w-6 h-6 sm:w-7 sm:h-7" />
        </motion.div>
        
        <motion.div 
          className="absolute top-1 left-1/2 -translate-x-1/2 bg-[#5B2600] p-1"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <img 
            src={Anna1} 
            alt="User profile" 
            className="h-10 w-32 sm:h-12 sm:w-40 rounded-full object-cover border-2 border-white/30" 
          />
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <User2 className="w-6 h-6 sm:w-7 sm:h-7" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="w-full mt-6 flex flex-col gap-4 px-6 pb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {navItems.map((item, i) => (
              <motion.div
                key={item.label}
                className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-lg transition-colors"
                custom={i}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                whileTap={{ scale: 0.97 }}
                onClick={() => handleNavItemClick(i)}
              >
                <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="font-medium">{item.label}</span>
                
                {activeItem === i && (
                  <motion.div 
                    className="ml-auto w-2 h-2 bg-white rounded-full"
                    layoutId="mobileActiveIndicator"
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 flex justify-center p-4 sm:p-5 z-50">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#EFE6D9] to-transparent" />
        <motion.nav
          className="relative flex flex-col items-center justify-center bg-[#5B2600]/95 backdrop-blur-sm py-3 sm:py-4 rounded-full text-white shadow-lg overflow-hidden"
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          variants={mobileNavbarVariants}
          onClick={() => !isOpen && setIsOpen(true)}
        >
          {mobileNavbarContent}
        </motion.nav>
      </div>
    );
  }

  return (
    <div className="fixed top-0 right-0 p-4 lg:p-5 z-50">
      <motion.nav
        className="flex items-center gap-6 bg-[#5B2600]/95 backdrop-blur-sm px-6 lg:px-8 py-3 lg:py-4 rounded-full text-white shadow-lg"
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={desktopNavbarVariants}
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.98 }}
      >
        {desktopNavbarContent}
      </motion.nav>
    </div>
  );
};

export default Navbar;
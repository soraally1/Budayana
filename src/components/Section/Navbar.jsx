import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
      y: "0%",
      borderRadius: "999px",
      width: "clamp(300px, 85%, 400px)",
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
    open: {
      y: "0%",
      borderRadius: "24px",
      width: "clamp(320px, 90%, 420px)",
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
  };

  const navbarContent = (
    <>
      <motion.span
        className="w-12 lg:w-16 shrink-0"
        whileTap={{ scale: 0.95 }}
      >
        <img 
          src={Anna1} 
          alt="User profile" 
          className="rounded-md w-full h-full object-cover" 
        />
      </motion.span>

      <div className="flex items-center gap-4 lg:gap-6">
        {navItems.map((item) => (
          <div 
            key={item.label}
            className="relative"
          >
            <motion.div
              className="relative"
              whileTap={{ scale: 0.95 }}
            >
              <item.icon className="w-6 h-6 lg:w-7 lg:h-7" />
            </motion.div>
          </div>
        ))}
      </div>
    </>
  );

  const mobileContent = (
    <>
      <div className="flex items-center justify-between w-full px-6 sm:px-8">
        <motion.div whileTap={{ scale: 0.95 }}>
          <TicketCheckIcon className="w-6 h-6 sm:w-7 sm:h-7" />
        </motion.div>
        <motion.div whileTap={{ scale: 0.95 }}>
          <User2 className="w-6 h-6 sm:w-7 sm:h-7" />
        </motion.div>
      </div>
      <motion.div 
        className="absolute -top-2 left-1/2 -translate-x-1/2"
      >
        <img 
          src={Anna1} 
          alt="User profile" 
          className="h-[50px] w-[130px] sm:h-[60px] sm:w-[150px]" 
        />
      </motion.div>
    </>
  );

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 flex justify-center p-4 sm:p-5 z-50">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#EFE6D9] to-transparent" />
        <motion.nav
          className="relative flex items-center justify-center gap-6 bg-[#5B2600]/95 backdrop-blur-sm py-3 sm:py-4 rounded-full text-white cursor-pointer shadow-lg"
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          variants={mobileNavbarVariants}
          onClick={() => setIsOpen(!isOpen)}
          whileTap={{ scale: 0.98 }}
        >
          {mobileContent}
        </motion.nav>
      </div>
    );
  }

  return (
    <div className="fixed top-0 right-0 p-4 lg:p-5 z-50">
      <motion.nav
        className="flex items-center gap-6 bg-[#5B2600]/95 backdrop-blur-sm px-6 lg:px-8 py-3 lg:py-4 rounded-full text-white cursor-pointer shadow-lg"
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={desktopNavbarVariants}
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.98 }}
      >
        {navbarContent}
      </motion.nav>
    </div>
  );
};

export default Navbar;

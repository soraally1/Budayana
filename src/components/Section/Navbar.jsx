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
  const [activeItem, setActiveItem] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const iconVariants = {
    hover: {
      scale: 1.1,
      transition: { duration: 0.2 },
    },
  };

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
      width: "auto",
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
    open: {
      y: "0%",
      borderRadius: "24px",
      width: "90%",
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
  };

  const navbarContent = (
    <>
      <motion.span
        className="w-12 md:w-16 shrink-0"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <img 
          src={Anna1} 
          alt="User profile" 
          className="rounded-md w-full h-full object-cover" 
        />
      </motion.span>

      <div className="flex items-center gap-4 md:gap-6">
        {navItems.map((item, index) => (
          <div 
            key={item.label}
            className="relative"
            onMouseEnter={() => setActiveItem(index)}
            onMouseLeave={() => setActiveItem(null)}
          >
            <motion.div
              variants={iconVariants}
              whileHover="hover"
              className="relative"
            >
              <item.icon className="w-6 h-6 md:w-7 md:h-7" />
              {activeItem === index && (
                <motion.div
                  initial={{ opacity: 0, y: isMobile ? -20 : 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`absolute ${isMobile ? 'bottom-full mb-2' : 'top-full mt-2'} left-1/2 -translate-x-1/2 px-2 py-1 bg-white text-[#5B2600] text-sm rounded whitespace-nowrap shadow-lg`}
                >
                  {item.label}
                </motion.div>
              )}
            </motion.div>
          </div>
        ))}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 flex justify-center p-5 bg-gradient-to-t from-[#EFE6D9] pb-6">
        <motion.nav
          className="flex items-center justify-center gap-6 bg-[#5B2600] px-6 py-3 rounded-full text-white cursor-pointer shadow-lg"
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          variants={mobileNavbarVariants}
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {navbarContent}
        </motion.nav>
      </div>
    );
  }

  return (
    <div className="flex justify-end p-5">
      <motion.nav
        className="flex items-center gap-6 bg-[#5B2600] px-8 py-4 rounded-full text-white cursor-pointer shadow-lg"
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={desktopNavbarVariants}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {navbarContent}
      </motion.nav>
    </div>
  );
};

export default Navbar;

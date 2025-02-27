// import React from 'react';
import { motion } from "framer-motion";
import Cloud from "../../assets/Cloud.png";
import Community1 from "../../assets/Community.png";
// import Awan1 from "../../assets/Awan1.png";

const Community = () => {
  // Animation variants for the clouds
  const floatingSlow = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const floatingMedium = {
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const floatingFast = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#EBE3D5] px-4 py-20 overflow-hidden">
      <div className="container mx-auto text-center flex flex-col items-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-fuzzy font-bold text-4xl md:text-6xl text-[#6F4E37] mb-6"
        >
          Ikuti Komunitas Kami!
        </motion.h1>
        <div className="relative w-full max-w-4xl flex flex-col items-center justify-between mx-auto">
          {/* Left cloud decoration */}
          <motion.div 
            variants={floatingSlow}
            initial="initial"
            animate="animate"
            className="absolute -left-10 xs:-left-16 sm:-left-24 ipad-mini:-left-32 ipad-air:-left-40 lg:-left-60 bottom-0 rotate-12 block"
          >
            <img 
              src={Cloud} 
              alt="cloud" 
              className="w-[100px] xs:w-[150px] sm:w-[180px] ipad-mini:w-[220px] ipad-air:w-[280px] lg:w-[350px]" 
            />
          </motion.div>

          {/* Right cloud decoration */}
          <motion.div 
            variants={floatingMedium}
            initial="initial"
            animate="animate"
            className="absolute -right-10 xs:-right-16 sm:-right-24 ipad-mini:-right-32 ipad-air:-right-40 lg:-right-60 -top-10 block"
          >
            <img 
              src={Cloud} 
              alt="cloud" 
              className="w-[100px] xs:w-[150px] sm:w-[180px] ipad-mini:w-[220px] ipad-air:w-[280px] lg:w-[350px]" 
            />
          </motion.div>

          {/* Main image */}
          <motion.img
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            src={Community1}
            alt="Community"
            className="rounded-2xl w-full"
          />
          
          {/* Bottom clouds */}
          <motion.div 
            variants={floatingFast}
            initial="initial"
            animate="animate"
            className="absolute -left-10 xs:-left-16 sm:-left-20 ipad-mini:-left-28 ipad-air:-left-32 lg:-left-40 -bottom-5 rotate-12 block"
          >
            <img 
              src={Cloud} 
              alt="cloud" 
              className="w-[80px] xs:w-[120px] sm:w-[140px] ipad-mini:w-[180px] ipad-air:w-[200px] lg:w-[250px]" 
            />
          </motion.div>
          <motion.div 
            variants={floatingMedium}
            initial="initial"
            animate="animate"
            className="absolute -right-10 xs:-right-16 sm:-right-20 ipad-mini:-right-28 ipad-air:-right-40 lg:-right-64 top-5 block"
          >
            <img 
              src={Cloud} 
              alt="cloud" 
              className="w-[80px] xs:w-[120px] sm:w-[140px] ipad-mini:w-[180px] ipad-air:w-[200px] lg:w-[250px]" 
            />
          </motion.div>
        </div>
        <motion.button 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-[#6F4E37] z-10 px-8 py-4 rounded-full text-white mt-6 text-xl md:text-2xl font-fuzzy font-bold shadow-lg hover:bg-[#5D4130] transition-colors"
        >
          Ikuti Komunitas
        </motion.button>
      </div>
    </div>
  );
};

export default Community;

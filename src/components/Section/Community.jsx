import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Cloud from "../../assets/Cloud.png";
import Community1 from "../../assets/Community.png";

const Community = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Memantau posisi scroll untuk animasi parallax
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animasi untuk awan
  const floatingSlow = {
    animate: {
      y: [0, -20, 0],
      x: [0, 10, 0],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const floatingMedium = {
    animate: {
      y: [0, -15, 0],
      x: [0, -5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const floatingFast = {
    animate: {
      y: [0, -10, 0],
      x: [0, 8, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Animasi hover untuk gambar utama
  const imageHover = {
    rest: { 
      scale: 1,
      boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
      transition: { duration: 0.5, ease: "easeOut" }
    },
    hover: { 
      scale: 1.02,
      boxShadow: "0px 10px 30px rgba(0,0,0,0.2)",
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  // Animasi untuk tombol
  const buttonVariants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.05,
      backgroundColor: "#5D4130",
      boxShadow: "0px 5px 15px rgba(111, 78, 55, 0.4)"
    },
    tap: { scale: 0.95 }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#EBE3D5] to-[#F5F0E8] px-4 py-20 overflow-hidden mt-20 relative">
      {/* Elemen dekoratif partikel kopi */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#6F4E37] opacity-10"
            initial={{ 
              x: Math.random() * 100 - 50 + "%", 
              y: Math.random() * 100 + "%", 
              scale: Math.random() * 0.3 + 0.1 
            }}
            animate={{
              y: [null, "-100%"],
              x: [null, `${Math.sin(i) * 10}%`]
            }}
            transition={{
              duration: Math.random() * 20 + 20,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
            style={{
              width: `${Math.random() * 30 + 10}px`,
              height: `${Math.random() * 30 + 10}px`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto text-center flex flex-col items-center relative z-10">
        {/* Judul dengan efek parallax */}
        <motion.h1 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          style={{ y: scrollY * -0.2 }}
          className="font-fuzzy font-bold text-5xl md:text-6xl xl:text-7xl text-[#6F4E37] mb-8 drop-shadow-sm"
        >
          <span className="relative inline-block">
            Ikuti
            <motion.span 
              className="absolute -bottom-1 left-0 w-full h-1 bg-[#6F4E37] opacity-70 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </span>{" "}
          <span className="relative inline-block">
            Komunitas
            <motion.span 
              className="absolute -bottom-1 left-0 w-full h-1 bg-[#6F4E37] opacity-70 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.7, duration: 0.8 }}
            />
          </span>{" "}
          <span className="relative inline-block text-[#A67C52]">
            Kami!
            <motion.span 
              className="absolute -bottom-1 left-0 w-full h-1 bg-[#A67C52] opacity-70 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.9, duration: 0.8 }}
            />
          </span>
        </motion.h1>

        <div className="relative w-full max-w-5xl flex flex-col items-center justify-center mx-auto mt-4">
          {/* Awan kiri */}
          <motion.div 
            variants={floatingSlow}
            initial="initial"
            animate="animate"
            className="absolute -left-6 xs:-left-12 sm:-left-20 md:-left-32 lg:-left-40 xl:-left-60 -bottom-2 rotate-12 block z-0"
            style={{ y: scrollY * 0.1 }}
          >
            <motion.img 
              src={Cloud} 
              alt="cloud" 
              className="w-[100px] xs:w-[140px] sm:w-[180px] md:w-[220px] lg:w-[280px] xl:w-[350px] opacity-80 m "
              whileHover={{ rotate: 5, scale: 1.05 }}
            />
          </motion.div>

          {/* Awan kanan atas */}
          <motion.div 
            variants={floatingMedium}
            initial="initial"
            animate="animate"
            className="absolute -right-6 xs:-right-12 sm:-right-20 md:-right-28 lg:-right-36 xl:-right-60 -top-12 block z-0"
            style={{ y: scrollY * 0.15 }}
          >
            <motion.img 
              src={Cloud} 
              alt="cloud" 
              className="w-[100px] xs:w-[140px] sm:w-[180px] md:w-[220px] lg:w-[280px] xl:w-[350px] opacity-80"
              whileHover={{ rotate: -5, scale: 1.05 }}
            />
          </motion.div>

          {/* Gambar utama dengan efek hover */}
          <motion.div
            className="rounded-3xl overflow-hidden w-full shadow-xl relative z-10 mt-72"
            variants={imageHover}
            initial="rest"
            whileHover="hover"
            animate={isHovered ? "hover" : "rest"}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ y: scrollY * -0.08 }}
          >
            <motion.img
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              src={Community1}
              alt="Community"
              className="w-full rounded-3xl transform transition-transform duration-700"
            />
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-gradient-to-t from-[#6F4E37]/40 to-transparent rounded-3xl flex items-end justify-center pb-8"
            >
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                className="text-white text-xl md:text-2xl font-semibold px-4 text-center"
              >
                Bergabunglah dengan kami untuk berbagi pengalaman dan resep kopi favorit
              </motion.p>
            </motion.div>
          </motion.div>
          
          {/* Awan bawah kiri */}
          <motion.div 
            variants={floatingFast}
            initial="initial"
            animate="animate"
            className="absolute -left-8 xs:-left-14 sm:-left-18 md:-left-24 lg:-left-32 xl:-left-40 -bottom-4 rotate-6 block z-20"
            style={{ y: scrollY * 0.2 }}
          >
            <motion.img 
              src={Cloud} 
              alt="cloud" 
              className="w-[80px] xs:w-[110px] sm:w-[140px] md:w-[170px] lg:w-[200px] xl:w-[250px] opacity-85"
              whileHover={{ rotate: 12, scale: 1.1 }}
            />
          </motion.div>

          {/* Awan kanan tengah */}
          <motion.div 
            variants={floatingMedium}
            initial="initial"
            animate="animate"
            className="absolute -right-8 xs:-right-14 sm:-right-18 md:-right-28 lg:-right-40 xl:-right-64 top-16 md:top-24 block z-0"
            style={{ y: scrollY * 0.12 }}
          >
            <motion.img 
              src={Cloud} 
              alt="cloud" 
              className="w-[90px] xs:w-[110px] sm:w-[140px] md:w-[170px] lg:w-[200px] xl:w-[250px] opacity-85"
              whileHover={{ rotate: -8, scale: 1.1 }}
            />
          </motion.div>
        </div>

        {/* Tombol dengan efek hover dan animasi */}
        <motion.button 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, type: "spring" }}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          className="bg-[#6F4E37] z-20 px-10 py-4 rounded-full text-white text-xl md:text-2xl font-fuzzy font-bold shadow-lg transition-all duration-300 relative overflow-hidden group"
          style={{ y: scrollY * -0.1 }}
        >
          <span className="relative z-10">Ikuti Komunitas</span>
          <motion.span 
            className="absolute inset-0 bg-[#5D4130] rounded-full z-0"
            initial={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          />
          <motion.span 
            className="absolute -inset-1 bg-gradient-to-r from-[#A67C52] to-[#8B5A2B] rounded-full z-0 opacity-0 group-hover:opacity-50 blur-md"
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0, 0.15, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          />
        </motion.button>

    
      </div>
    </div>
  );
};

export default Community;
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import AnnaMascot from "../../assets/AnnaMascot.png";
import AnnaLogo from "../../assets/Anna.png";
import { Link } from "react-router-dom";

const Anna = () => {
  const [typedText, setTypedText] = useState("");
  const [isHovering, setIsHovering] = useState(false);
  const fullText = "Bingung mau ikut event budaya apa minggu ini, Biarkan aku, Anna, membantumu! Cukup tanyakan event yang kamu suka, dan aku akan mencarikan yang terbaik buatmu! Klik di sini dan mulai petualangan budayamu! 🌏";
  
  // Efek mengetik untuk bubble chat
  useEffect(() => {
    if (typedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.substring(0, typedText.length + 1));
      }, 30);
      
      return () => clearTimeout(timeout);
    }
  }, [typedText, fullText]);
  
  // Reset efek mengetik saat komponen dimuat
  useEffect(() => {
    setTypedText("");
    
    // Delay sebentar sebelum memulai efek mengetik
    const timeout = setTimeout(() => {
      setTypedText(fullText.substring(0, 1));
    }, 500);
    
    return () => clearTimeout(timeout);
  }, []);
  
  return (
    <div className="relative w-full mt-16 sm:mt-20 md:mt-24">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-16">
        {/* Background Element dengan paralaks */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0"
        >
          <motion.div 
            animate={{ 
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear"
            }}
            className="w-full h-full bg-[url('../../assets/pattern-bg.png')] opacity-20" 
          />
        </motion.div>

        {/* Title dengan animasi yang lebih dinamis */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative z-10 mb-12"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-[#5B2600] font-fuzzy font-bold text-3xl sm:text-4xl md:text-5xl text-center"
            whileHover={{ 
              scale: 1.05,
              textShadow: "0px 0px 8px rgba(91, 38, 0, 0.3)",
              transition: { duration: 0.3 }
            }}
          >
            Kenalan Dengan Anna
          </motion.h1>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "200px" }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="h-1 bg-[#5B2600] mx-auto mt-4 rounded-full"
            whileHover={{ 
              width: "300px", 
              height: "3px",
              transition: { duration: 0.3 }
            }}
          />
        </motion.div>

        <div className="relative flex flex-col-reverse md:flex-row items-center gap-8 md:gap-0 z-10">
          {/* Left Side - Chat Bubble and Button */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative flex flex-col items-center md:items-start w-full md:w-1/2 lg:pr-8"
          >
            {/* Small decorative elements dengan animasi */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 10, 0],
              }}

              className="absolute -top-12 -left-4 w-12 h-12 rounded-full bg-[#FFD384] hidden md:block"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.8 }}
              animate={{ 
                x: [0, 10, 0],
                y: [0, 5, 0],
              }}
              
              className="absolute bottom-16 -left-8 w-6 h-6 rounded-full bg-[#5B2600] hidden md:block"
            />

            {/* Chat bubble dengan efek mengetik dan hover */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 8px 32px rgba(91, 38, 0, 0.2)"
              }}
              className="relative bg-gradient-to-br from-[#5B2600] to-[#8B4513] rounded-[2.5rem] p-6 sm:p-8 max-w-xl w-full border border-[#FFD384]/20 backdrop-blur-sm"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {/* Chat bubble pointer dengan animasi */}
              <motion.div 
                animate={{ 
                  x: isHovering ? [0, -3, 0] : 0,
                }}
                transition={{
                  duration: 0.8,
                  repeat: isHovering ? Infinity : 0,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              />
              
              <p className="text-white/90 font-fuzzy text-base sm:text-lg leading-relaxed drop-shadow-sm">
                {/* Efek mengetik di dalam bubble chat */}
                &quot;{typedText}&quot;
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                  className="inline-block w-2 h-4 bg-white ml-1"
                  style={{ display: typedText.length < fullText.length ? 'inline-block' : 'none' }}
                />
              </p>
            </motion.div>

            {/* Enhanced button dengan interaksi lebih menarik */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: 0.2 }}
              className="mt-8 relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FFD384] via-[#8B4513] to-[#5B2600] rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition duration-500"></div>
              <Link to="/anna" className="relative block">
                <motion.button
                  whileHover={{ 
                    scale: 1.02,
                    textShadow: "0 0 8px rgba(255,255,255,0.5)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-gradient-to-r from-[#5B2600] to-[#8B4513] text-white font-fuzzy px-8 py-3.5 rounded-xl text-lg transition-all shadow-lg border border-[#FFD384]/20 backdrop-blur-sm"
                >
                  Coba Anna
                </motion.button>
              </Link>
            </motion.div>

            {/* Add decorative elements */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0.4, 0.8, 0.4],
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="absolute -left-12 top-1/2 w-24 h-24 rounded-full bg-gradient-to-r from-[#FFD384] to-[#5B2600] blur-2xl opacity-40 mix-blend-overlay"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1],
                rotate: [360, 180, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="absolute -right-8 bottom-0 w-16 h-16 rounded-full bg-gradient-to-r from-[#8B4513] to-[#FFD384] blur-xl opacity-30 mix-blend-overlay"
            />

          </motion.div>

          {/* Right Side - Anna Character with Logo */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative w-full md:w-1/2 flex justify-center md:justify-end"
          >
            <div className="relative">
              {/* Floating animation for the mascot dengan efek hover interaktif */}
              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                  filter: ["drop-shadow(0 10px 15px rgba(91, 38, 0, 0.2))", "drop-shadow(0 20px 25px rgba(91, 38, 0, 0.3))", "drop-shadow(0 10px 15px rgba(91, 38, 0, 0.2))"]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
                whileHover={{ 
                  scale: 1.05,
                  filter: "drop-shadow(0 25px 30px rgba(91, 38, 0, 0.4))",
                  transition: { duration: 0.3 }
                }}
                className="relative cursor-pointer"
              >
                <img 
                  src={AnnaMascot} 
                  alt="Anna Mascot" 
                  className="w-[280px] sm:w-[340px] md:w-[400px] lg:w-[500px] h-auto scale-x-[-1]"
                />
                
                {/* Rotating animation for the logo dengan efek interaktif */}
                <motion.div
                  animate={{ 
                    rotate: [-5, 5, -5],
                    scale: [1, 1.05, 1],
                    filter: ["drop-shadow(0 4px 8px rgba(91, 38, 0, 0.2))", "drop-shadow(0 8px 16px rgba(91, 38, 0, 0.3))", "drop-shadow(0 4px 8px rgba(91, 38, 0, 0.2))"]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                  whileHover={{ 
                    scale: 1.2,
                    rotate: 10,
                    filter: "drop-shadow(0 12px 20px rgba(91, 38, 0, 0.4))",
                    transition: { duration: 0.3 }
                  }}
                  className="absolute bottom-1/4 md:bottom-1/3 right-5 md:right-10 cursor-pointer"
                >
                  <img 
                    src={AnnaLogo} 
                    alt="Anna Logo" 
                    className="h-[70px] sm:h-[80px] md:h-[90px] w-auto"
                  />
                </motion.div>
              </motion.div>
            </div>
            
            {/* Decorative elements dengan animasi lebih dinamis */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.7 }}
              animate={{ 
                x: [0, 15, 0],
                y: [0, -10, 0],
                scale: [1, 1.1, 1]
              }}
      
              className="absolute top-12 right-0 w-16 h-16 rounded-full bg-[#FFD384] opacity-40 hidden md:block"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.9 }}
              animate={{ 
                x: [0, -10, 0],
                y: [0, 10, 0],
                scale: [1, 1.2, 1]
              }}

              className="absolute bottom-0 right-1/4 w-8 h-8 rounded-full bg-[#5B2600] opacity-30 hidden md:block"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Anna;
import { motion } from "framer-motion";
import AnnaMascot from "../../assets/AnnaMascot.png";
import AnnaLogo from "../../assets/Anna.png";

const Anna = () => {
  return (
    <div className="relative w-full px-4 sm:px-6 md:px-8 lg:px-16 mt-16 sm:mt-20 md:mt-24">
      <div className="max-w-[1400px] mx-auto">
        {/* Background Element */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0 overflow-hidden"
        >
          <div className="w-full h-full bg-[url('../../assets/pattern-bg.png')] opacity-20" />
        </motion.div>

        {/* Title with enhanced animation */}
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
          >
            Kenalan Dengan Anna
          </motion.h1>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "200px" }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="h-1 bg-[#5B2600] mx-auto mt-4 rounded-full"
          />
        </motion.div>

        <div className="relative flex flex-col-reverse md:flex-row items-center justify-between gap-8 md:gap-0 z-10">
          {/* Left Side - Chat Bubble and Button */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative flex flex-col items-center md:items-start w-full md:w-1/2 lg:pr-8"
          >
            {/* Small decorative elements */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="absolute -top-12 -left-4 w-12 h-12 rounded-full bg-[#FFD384] hidden md:block"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="absolute bottom-16 -left-8 w-6 h-6 rounded-full bg-[#5B2600] hidden md:block"
            />

            {/* Chat bubble with improved design */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative bg-[#5B2600] rounded-3xl p-6 sm:p-8 max-w-xl w-full"
            >
              {/* Chat bubble pointer */}
              <div className="absolute -right-3 top-1/2 transform rotate-45 w-6 h-6 bg-[#5B2600] hidden md:block" />
              
              <p className="text-white font-fuzzy text-base sm:text-lg leading-relaxed">
                &quot;Bingung mau ikut event budaya apa minggu ini, Biarkan aku, Anna, membantumu! 
                Cukup tanyakan event yang kamu suka, dan aku akan mencarikan yang terbaik buatmu! 
                Klik di sini dan mulai petualangan budayamu! 🌏&quot;
              </p>
            </motion.div>

            {/* Enhanced button with better animation */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 25px rgba(91, 38, 0, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              className="mt-8 bg-[#5B2600] text-white font-fuzzy px-8 py-3 rounded-2xl text-lg hover:bg-[#4A3427] transition-all shadow-lg"
            >
              Coba Anna
            </motion.button>
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
              {/* Floating animation for the mascot */}
              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
                className="relative"
              >
                <img 
                  src={AnnaMascot} 
                  alt="Anna Mascot" 
                  className="w-[280px] sm:w-[340px] md:w-[400px] lg:w-[500px] h-auto scale-x-[-1]"
                />
                
                {/* Rotating animation for the logo */}
                <motion.div
                  animate={{ 
                    rotate: [-5, 5, -5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                  className="absolute bottom-1/4 md:bottom-1/3 right-5 md:right-10"
                >
                  <img 
                    src={AnnaLogo} 
                    alt="Anna Logo" 
                    className="h-[70px] sm:h-[80px] md:h-[90px] w-auto"
                  />
                </motion.div>
              </motion.div>
            </div>
            
            {/* Decorative elements */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="absolute top-12 right-0 w-16 h-16 rounded-full bg-[#FFD384] opacity-40 hidden md:block"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="absolute bottom-0 right-1/4 w-8 h-8 rounded-full bg-[#5B2600] opacity-30 hidden md:block"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Anna;
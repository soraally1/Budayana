import { motion } from "framer-motion";
import AnnaMascot from "../../assets/AnnaMascot.png";
import AnnaLogo from "../../assets/Anna.png";

const Anna = () => {
  return (
    <div className="relative w-full px-4 sm:px-6 md:px-8 lg:px-16 mt-16 sm:mt-20 md:mt-24">
      <div className="max-w-[1400px] mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-[#5B2600] font-fuzzy font-bold text-3xl sm:text-4xl md:text-5xl text-center mb-12"
        >
          Kenalan Dengan Anna
        </motion.h1>

        <div className="relative flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
          {/* Left Side - Chat Bubble and Button */}
          <div className="relative flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[#5B2600] rounded-3xl p-6 sm:p-8 max-w-xl w-full md:w-[1000px]"
            >
            <p className="text-white font-fuzzy text-base sm:text-lg leading-relaxed">
                  &quot;Bingung mau ikut event budaya apa minggu ini, Biarkan aku, Anna, membantumu! 
                  Cukup tanyakan event yang kamu suka, dan aku akan mencarikan yang terbaik buatmu! 
                  Klik di sini dan mulai petualangan budayamu! 🌏&quot;
            </p>  
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-8 bg-[#5B2600] text-white font-fuzzy px-8 py-3 rounded-2xl text-lg hover:bg-[#4A3427] transition-colors"
            >
              Coba Anna
            </motion.button>
          </div>

          {/* Right Side - Anna Character with Logo */}
          <div className="relative flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative"
            >
              <img 
                src={AnnaMascot} 
                alt="Anna Mascot" 
                className="w-[280px] sm:w-[320px] md:w-[700px] h-auto scale-x-[-1]"
              />
              <img 
                src={AnnaLogo} 
                alt="Anna Logo" 
                className="absolute bottom-56 right-10 -rotate-12 h-[100px] sm:h-[100px] w-auto"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Anna; 
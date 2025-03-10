import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import NariImg from "../../assets/nari.jpeg";
import DramaImg from "../../assets/drama.jpeg";
import MusikImg from "../../assets/musik.jpeg";
import TariTraditional from "../../assets/TariTraditional.png";
import Drama from "../../assets/drama.png";
import MusikTraditional from "../../assets/musiktraditional.png";

const Event = () => {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    hover: {
      y: -10,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="relative w-full mt-12 xs:mt-16 sm:mt-20 md:mt-24">
      <div className="max-w-[1400px] mx-auto px-3 xs:px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        {/* Title */}
        <motion.h1
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{
            duration: 0.8,
            type: "spring",
            stiffness: 100,
          }}
          className="font-fuzzy text-[#4A3427] text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center font-bold mb-6 xs:mb-8 sm:mb-10 lg:mb-16"
        >
          Jelajahi Event Budaya!
        </motion.h1>

        {/* Cards Container */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col xs:flex-row flex-wrap gap-8 xs:gap-3 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 justify-center items-center xs:items-stretch mt-2 xs:mt-4 sm:mt-6 md:mt-8"
        >
          {/* Traditional Dance Card */}
          <Link 
            to="/tickets?category=tari-tradisional" 
            className="w-full xs:w-auto group"
          >
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="relative w-[280px] xs:w-[225px] xs:pt-14 sm:w-[240px] md:w-[260px] lg:w-[280px] xl:w-[300px] mx-auto"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative aspect-[3/5] rounded-[24px] xs:rounded-[28px] sm:rounded-[32px] overflow-hidden bg-[#F5F5F5] shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={NariImg}
                  alt="Traditional Dance"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 xs:top-4 right-3 xs:right-4">
                  <div className="bg-[#4A3427] rounded-full px-2.5 xs:px-3 py-1 xs:py-1.5 transform group-hover:scale-105 transition-transform duration-300">
                    <span className="text-white text-xs xs:text-sm font-fuzzy">
                      Cek Event!
                    </span>
                  </div>
                </div>
              </motion.div>
              <motion.div
                className="absolute -bottom-3 xs:-bottom-4 sm:-bottom-5 right-12 xs:right-10 sm:right-12 md:right-14 lg:right-16 pr-3 xs:pr-4 sm:pr-5"
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img
                  src={TariTraditional}
                  alt="Tari Traditional"
                  className="w-[130%] xs:w-[140%] sm:w-[145%] md:w-[150%] lg:w-[155%] xl:w-[160%] max-w-[500px] mx-auto transform group-hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
            </motion.div>
          </Link>

          {/* Drama Card - Larger */}
          <Link 
            to="/tickets?category=drama-tradisional" 
            className="w-full xs:w-auto group"
          >
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="relative w-[280px] xs:w-[245px] sm:w-[260px] md:w-[280px] lg:w-[320px] xl:w-[380px] mx-auto xs:-mb-4 sm:-mb-6"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative aspect-[3/5] rounded-[24px] xs:rounded-[28px] sm:rounded-[32px] overflow-hidden bg-[#F5F5F5] shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={DramaImg}
                  alt="Drama"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 xs:top-4 right-3 xs:right-4">
                  <div className="bg-[#4A3427] rounded-full px-2.5 xs:px-3 py-1 xs:py-1.5 transform group-hover:scale-105 transition-transform duration-300">
                    <span className="text-white text-xs xs:text-sm font-fuzzy">
                      Cek Event!
                    </span>
                  </div>
                </div>
              </motion.div>
              <motion.div
                className="absolute -bottom-4 xs:-bottom-6 sm:-bottom-8 left-0 right-0"
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img
                  src={Drama}
                  alt="Drama"
                  className="w-[80%] xs:w-[85%] sm:w-[87%] md:w-[90%] lg:w-[92%] xl:w-[95%] max-w-[320px] mx-auto transform group-hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
            </motion.div>
          </Link>

          {/* Traditional Music Card */}
          <Link 
            to="/tickets?category=musik-tradisional" 
            className="w-full xs:w-auto group"
          >
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="relative w-[280px] xs:w-[225px] xs:pt-14 sm:w-[240px] md:w-[260px] lg:w-[280px] xl:w-[300px] mx-auto"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative aspect-[3/5] rounded-[24px] xs:rounded-[28px] sm:rounded-[32px] overflow-hidden bg-[#F5F5F5] shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={MusikImg}
                  alt="Traditional Music"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 xs:top-4 right-3 xs:right-4">
                  <div className="bg-[#4A3427] rounded-full px-2.5 xs:px-3 py-1 xs:py-1.5 transform group-hover:scale-105 transition-transform duration-300">
                    <span className="text-white text-xs xs:text-sm font-fuzzy">
                      Cek Event!
                    </span>
                  </div>
                </div>
              </motion.div>
              <motion.div
                className="absolute -bottom-4 xs:-bottom-6 sm:-bottom-8 right-8 xs:right-10 sm:right-12 md:right-14 lg:right-16 pr-3 xs:pr-4 sm:pr-5"
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img
                  src={MusikTraditional}
                  alt="Musik Traditional"
                  className="w-[130%] xs:w-[140%] sm:w-[145%] md:w-[150%] lg:w-[155%] xl:w-[160%] max-w-[400px] mx-auto transform group-hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Description */}
        <motion.p
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{
            duration: 0.8,
            delay: 0.8,
            type: "spring",
            stiffness: 100,
          }}
          className="font-fuzzy text-[#4A3427] text-sm xs:text-base sm:text-lg md:text-xl text-center max-w-[800px] mx-auto mt-12 xs:mt-16 sm:mt-20 md:mt-24"
        >
          Di Indonesia, ada ratusan event budaya menarik yang sayang untuk
          dilewatkan!
        </motion.p>
      </div>
    </div>
  );
};

export default Event; 
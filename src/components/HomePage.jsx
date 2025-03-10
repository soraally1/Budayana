import { motion } from "framer-motion";
import BannerHero from "../assets/BannerHero.png";
import CloudBanner from "../assets/CloudBanner.jpeg";
import BudayanaLogo from "../assets/Budayana.png";
import Cloud from "../assets/Cloud.png";
import Community from "./Section/Community";
import Footer from "./Section/Footer";
import Anna from "./Section/Anna";
import Event from './Section/Event';
import { Link } from "react-router-dom";

const HomePage = () => {
  // Animation variants for cloud movements
  const floatingCloud = {
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const floatingCloudSlow = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const floatingCloudFast = {
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <>
      {/* Banner Section */}
      <div className="relative h-[400px] sm:h-[500px] ipad-mini:h-[550px] ipad-air:h-[580px] lg:h-[600px] pt-20">
        {/* Cloud Background */}
        <div className="absolute inset-0 p-4 sm:p-8 ipad-mini:p-12 ipad-air:p-14 lg:p-16">
          <img
            src={CloudBanner}
            alt="Cloud Background"
            className="w-full h-[300px] sm:h-[350px] ipad-mini:h-[380px] ipad-air:h-[400px] rounded-3xl object-cover"
          />
        </div>

        {/* Content Container */}
        <div className="relative z-10 h-full flex flex-col lg:flex-row items-center justify-between p-10 sm:p-8 ipad-mini:p-12 ipad-air:p-14 lg:p-16">
          {/* Left Side - Character */}
          <div
            className="w-[280px] sm:w-[400px] ipad-mini:w-[420px] ipad-air:w-[480px] lg:w-[580px] 
                         -mt-8 sm:mt-0"
          >
            <img src={BannerHero} alt="Character" className="w-full h-auto" />
          </div>

          {/* Right Side - Logo and Text */}
          <div
            className="flex flex-col items-center lg:items-end 
                         lg:pr-16 
                         gap-2 sm:gap-3 lg:gap-4 
                         max-w-[300px] sm:max-w-[450px] ipad-mini:max-w-[480px] lg:max-w-[600px] 
                         mt-4 lg:mt-0"
          >
            <img
              src={BudayanaLogo}
              alt="Budayana Logo"
              className="w-full h-auto"
            />
            <p
              className="font-fuzzy text-white text-base sm:text-lg ipad-mini:text-xl
                         font-bold text-stroke-thick text-center lg:text-right"
            >
              Temukan event budaya kamu, Di Budayana!
            </p>
            <button
              className="font-fuzzy bg-brown-800 text-white 
             px-6 sm:px-8 
             py-2 sm:py-2.5 
             rounded-full hover:bg-brown-900 transition-all 
             text-xs sm:text-sm ipad-mini:text-base 
             font-medium text-stroke-thick
             hover:scale-105 transform duration-200
             hover:shadow-lg
             flex items-center justify-center space-x-2"
            >
              <Link to="/tickets" className="flex items-center">
                <span>Cari Tiket!</span>
                <svg
                  className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  ></path>
                </svg>
              </Link>
            </button>
          </div>
        </div>
      </div>

      {/* Cloud Gate Group */}
      <div className="relative w-full overflow-hidden px-4 sm:px-8 ipad-mini:px-12 ipad-air:px-14 lg:px-16 mt-20 sm:mt-24 lg:mt-32">
        <div className="flex justify-between items-center max-w-[2400px] h-[450px] mx-auto">
          {/* Left Cloud Group */}
          <div className="relative w-[160px] xs:w-[180px] sm:w-[240px] lg:w-[400px]">
            {/* Main left cloud */}
            <motion.img
              variants={floatingCloud}
              initial="initial"
              animate="animate"
              src={Cloud}
              alt="Left Cloud Main"
              className="w-full h-auto transform -scale-x-100"
            />
            {/* Additional left clouds */}
            <motion.img
              variants={floatingCloudSlow}
              initial="initial"
              animate="animate"
              src={Cloud}
              alt="Left Cloud Top"
              className="absolute -top-8 sm:-top-12 
                         -left-20 xs:-left-24 sm:-left-32 lg:-left-40 
                         w-[80%] sm:w-[90%] h-auto 
                         transform -scale-x-100"
            />
            <motion.img
              variants={floatingCloudFast}
              initial="initial"
              animate="animate"
              src={Cloud}
              alt="Left Cloud Bottom"
              className="absolute -bottom-6 sm:-bottom-10 
                         -right-8 sm:-right-16 
                         w-[60%] sm:w-[70%] h-auto 
                         transform -scale-x-100"
            />
            <motion.img
              variants={floatingCloud}
              initial="initial"
              animate="animate"
              src={Cloud}
              alt="Left Cloud Back"
              className="absolute top-1/4 
                         -left-16 xs:-left-20 sm:-left-28 lg:-left-32 
                         w-[85%] sm:w-[95%] h-auto 
                         transform -scale-x-100"
            />
          </div>

          {/* Right Cloud Group */}
          <div className="relative w-[160px] xs:w-[180px] sm:w-[240px] lg:w-[400px]">
            {/* Main right cloud */}
            <motion.img
              variants={floatingCloud}
              initial="initial"
              animate="animate"
              src={Cloud}
              alt="Right Cloud Main"
              className="w-full h-auto"
            />
            {/* Additional right clouds */}
            <motion.img
              variants={floatingCloudSlow}
              initial="initial"
              animate="animate"
              src={Cloud}
              alt="Right Cloud Top"
              className="absolute -top-8 sm:-top-12 
                         -right-20 xs:-right-24 sm:-right-32 lg:-right-40 
                         w-[80%] sm:w-[90%] h-auto"
            />
            <motion.img
              variants={floatingCloudFast}
              initial="initial"
              animate="animate"
              src={Cloud}
              alt="Right Cloud Bottom"
              className="absolute -bottom-6 sm:-bottom-10 
                         -left-8 sm:-left-16 
                         w-[60%] sm:w-[70%] h-auto"
            />
            <motion.img
              variants={floatingCloud}
              initial="initial"
              animate="animate"
              src={Cloud}
              alt="Right Cloud Back"
              className="absolute top-1/4 
                         -right-16 xs:-right-20 sm:-right-28 lg:-right-32 
                         w-[85%] sm:w-[95%] h-auto"
            />
          </div>
        </div>
      </div>

      {/* Event Section */}
      <Event />

      {/* Anna Section */}
      <div className="relative py-24 overflow-clip">
        <Anna />
      </div>

      {/* Community Section */}
      <div className="relative ">
        <Community />
      </div>

      {/* Footer Section */}
      <div className="relative">
        <Footer />
      </div>
    </>
  );
};

export default HomePage;

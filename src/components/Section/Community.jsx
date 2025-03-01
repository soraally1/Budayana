// import React from 'react';
import { motion } from "framer-motion";
import Cloud from "../../assets/Cloud.png";
import Community1 from "../../assets/Community.png";
import { Link } from "react-router-dom";

const Community = () => {
  const floating = (duration, distance) => ({
    animate: {
      y: [0, -distance, 0],
      transition: { duration, repeat: Infinity, ease: "easeInOut" },
    },
  });

  return (
    <div className="min-h-screen w-full bg-[#EBE3D5] px-6 py-20 flex flex-col items-center text-center overflow-hidden">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="font-fuzzy font-bold text-4xl md:text-6xl text-[#6F4E37] mb-8"
      >
        Ikuti Komunitas Kami!
      </motion.h1>

      <div className="relative w-full max-w-3xl flex flex-col items-center">
        <motion.img
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          src={Community1}
          alt="Community"
          className="rounded-2xl w-full shadow-lg"
        />

        <motion.div
          variants={floating(4, 20)}
          initial="initial"
          animate="animate"
          className="absolute -left-10 sm:-left-24 bottom-5 rotate-12"
        >
          <img src={Cloud} alt="cloud" className="w-28 sm:w-40  lg:w-44" />
        </motion.div>
        <motion.div
          variants={floating(3, 15)}
          initial="initial"
          animate="animate"
          className="absolute -right-10 sm:-right-24 top-5"
        >
          <img src={Cloud} alt="cloud" className="w-28 sm:w-40 lg:w-44" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-10 max-w-xl text-[#6F4E37] font-fuzzy"
      >
        <h2 className="font-fuzzy font-semibold text-2xl md:text-3xl mb-4">
          Upload Foto Budaya Mu Disini!
        </h2>
        <p className="text-sm md:text-base leading-relaxed">
          Komunitas kami adalah tempat berbagi foto budaya dari seluruh
          Indonesia. Bergabunglah dan nikmati keindahan tradisi yang ada di
          negeri ini.
        </p>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-6 bg-[#5B2600] text-white px-8 py-4 rounded-full hover:bg-[#5a3d2e] transition-all shadow-lg flex items-center space-x-2 font-fuzzy"
      >
        <Link to="/community">
          <span>Jelajahi Komunitas</span>
        </Link>
        <svg
          className="w-4 h-4"
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
      </motion.button>
    </div>
  );
};

export default Community;

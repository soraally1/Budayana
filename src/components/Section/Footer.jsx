import { motion } from "framer-motion";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { IoIosArrowUp } from "react-icons/io";
import Budayana from "../../assets/Budayana.png";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#EAD9C5] via-[#571F02] to-[#602402] p-4 md:p-6 text-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4 md:gap-6 justify-between">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#EBE3D5] bg-opacity-20 rounded-xl p-3 md:p-4 text-2xl md:text-3xl font-bold text-brown-800 shadow-lg w-full md:w-1/3 flex items-center justify-center"
        >
          <img src={Budayana} alt="Logo" className="max-w-[170px] md:max-w-[450px]" />
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#EBE3D5] rounded-xl p-3 md:p-4 text-lg md:text-xl shadow-lg bg-opacity-40 w-full md:w-1/3 text-start"
        >
          <ul className="text-[#5A2D0C] space-y-1 md:space-y-2 font-fuzzy font-semibold">
            <li className="hover:scale-105 transition duration-200">About Us</li>
            <li className="hover:scale-105 transition duration-200">Blog</li>
            <li className="hover:scale-105 transition duration-200">Event</li>
            <li className="hover:scale-105 transition duration-200">Program</li>
          </ul>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#EBE3D5] rounded-xl p-3 md:p-4 shadow-lg text-[#5A2D0C] bg-opacity-50 w-full md:w-1/3 flex flex-col items-start md:items-start text-lg md:text-xl font-fuzzy"
        >
          <p className="font-semibold">Kirim Pesan!</p>
          <input
            type="text"
            placeholder="Tulis pesanmu..."
            className="w-full mt-2 p-2 bg-[#571F02] bg-opacity-60 text-white rounded-md text-sm md:text-base"
          />
          <button className="mt-2 bg-[#5A2D0C] text-white px-3 py-2 rounded-md hover:scale-105 font-bold transition duration-300 text-sm md:text-base">
            Kirim
          </button>
        </motion.div>
      </div>

      {/* Footer Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-4 md:mt-6 flex flex-col md:flex-row justify-between items-center border-t border-white/20 pt-3 md:pt-4 text-center md:text-left"
      >
        <p className="text-xs md:text-sm">&copy; 2025 Dibuat Penuh Sigma</p>
        <div className="flex gap-3 md:gap-4 mt-2 md:mt-0">
          <FaFacebook className="text-lg md:text-xl cursor-pointer hover:text-gray-300 transition duration-200" />
          <FaInstagram className="text-lg md:text-xl cursor-pointer hover:text-gray-300 transition duration-200" />
          <motion.div whileHover={{ y: -5 }} className="cursor-pointer">
            <IoIosArrowUp className="text-lg md:text-xl" />
          </motion.div>
        </div>
      </motion.div>
    </footer>
  );
}

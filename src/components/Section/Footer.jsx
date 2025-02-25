import { motion } from "framer-motion";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { IoIosArrowUp } from "react-icons/io";
import Budayana from "../../assets/Budayana.png";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#EAD9C5] via-[#571F02] to-[#602402] p-6 text-white">
      <div className="max-w-8xl flex flex-col md:flex-row items-center gap-6 justify-between">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#EBE3D5] bg-opacity-20 rounded-xl p-4 text-3xl font-bold text-brown-800 shadow-lg w-1/3 h-1/3 flex items-center justify-center"
        >
          <img src={Budayana} alt="" />
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#EBE3D5] rounded-xl p-4 py-2 text-xl shadow-lg bg-opacity-40 w-1/3 h-1/3 flex items-center justify-start text-start"
        >
          <ul className="text-[#5A2D0C] space-y-1 font-fuzzy font-semibold">
            <li className="hover:scale-125 transition duration-200">
              About Us
            </li>
            <li className="hover:scale-125 transition duration-200">Blog</li>
            <li className="hover:scale-125 transition duration-200">Event</li>
            <li className="hover:scale-125 transition duration-200">Program</li>
          </ul>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#EBE3D5] rounded-xl p-4 shadow-lg text-[#5A2D0C]  bg-opacity-50 w-1/3 h-1/3 flex flex-col items-start justify-center text-xl font-fuzzy"
        >
          <p className="font-semibold">Kirim Pesan!</p>
          <input
            type="text"
            placeholder=""
            className="w-full mt-2 p-2 bg-[#571F02] bg-opacity-60 text-white rounded-md "
          />
          <button className="mt-2 bg-[#5A2D0C] text-white px-4 py-2 rounded-md bg-opacity-6 hover:scale-110 font-bold transition duration-2000">
            Kirim
          </button>
        </motion.div>
      </div>

      {/* Footer Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 flex justify-between items-center border-t border-white/20 pt-4"
      >
        <p className="text-sm">@2025 Dibuat Penuh Sigma</p>
        <div className="flex gap-4">
          <FaFacebook className="text-xl cursor-pointer" />
          <FaInstagram className="text-xl cursor-pointer" />
          <motion.div whileHover={{ y: -5 }} className="cursor-pointer">
            <IoIosArrowUp className="text-xl" />
          </motion.div>
        </div>
      </motion.div>
    </footer>
  );
}

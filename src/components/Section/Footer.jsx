import { motion } from "framer-motion";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { IoIosArrowUp } from "react-icons/io";
import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import emailjs from '@emailjs/browser';
import Budayana from "../../assets/Budayana.png";

export default function Footer() {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });
  const form = useRef();

  // Fungsi untuk scroll ke atas
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Navigation links
  const navLinks = [
    { name: "About Us", path: "/about" },
    { name: "Blog", path: "/blog" },
    { name: "Event", path: "/tickets" },
    { name: "Program", path: "/program" },
  ];

  // Social media links
  const socialLinks = {
    facebook: "https://facebook.com/budayana",
    instagram: "https://instagram.com/budayana",
  };

  // Handle message submission
  const handleSubmitMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setSubmitStatus({
        type: "error",
        message: "Pesan tidak boleh kosong"
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: "", message: "" });

    try {
      const result = await emailjs.sendForm(
        'service_ph2xgdk', // Replace with your EmailJS service ID
        'template_ad3s6jl', // Replace with your EmailJS template ID
        form.current,
        'QyO7GQzOv77xHFXLD' // Replace with your EmailJS public key
      );

      if (result.text === 'OK') {
        setSubmitStatus({
          type: "success",
          message: "Pesan berhasil terkirim!"
        });
        setMessage("");
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setSubmitStatus({
        type: "error",
        message: "Gagal mengirim pesan. Silakan coba lagi."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-gradient-to-b from-[#EAD9C5] via-[#571F02] to-[#602402] p-4 md:p-6 text-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4 md:gap-6 justify-between">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#EBE3D5] bg-opacity-20 rounded-xl p-3 md:p-4 text-2xl md:text-3xl font-bold text-brown-800 shadow-lg w-full md:w-1/3 flex items-center justify-center"
        >
          <Link to="/" className="hover:opacity-90 transition-opacity">
            <img src={Budayana} alt="Logo" className="max-w-[170px] md:max-w-[450px]" />
          </Link>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#EBE3D5] rounded-xl p-3 md:p-4 text-lg md:text-xl shadow-lg bg-opacity-40 w-full md:w-1/3 text-start"
        >
          <ul className="text-[#5A2D0C] space-y-1 md:space-y-2 font-fuzzy font-semibold">
            {navLinks.map((link) => (
              <li key={link.path} className="hover:scale-105 transition duration-200">
                <Link 
                  to={link.path}
                  className="block w-full hover:text-[#8B4513] transition-colors"
                >
                  {link.name}
                </Link>
              </li>
            ))}
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
          <form ref={form} onSubmit={handleSubmitMessage} className="w-full">
            <input
              type="text"
              name="message"
              placeholder="Tulis pesanmu..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full mt-2 p-2 bg-[#571F02] bg-opacity-60 text-white rounded-md text-sm md:text-base placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
            />
            {submitStatus.message && (
              <p className={`text-sm mt-1 ${
                submitStatus.type === "error" ? "text-red-500" : "text-white"
              }`}>
                {submitStatus.message}
              </p>
            )}
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`mt-2 bg-[#5A2D0C] text-white px-3 py-2 rounded-md hover:scale-105 font-bold transition duration-300 text-sm md:text-base disabled:opacity-50 disabled:hover:scale-100 ${
                isSubmitting ? "cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {isSubmitting ? "Mengirim..." : "Kirim"}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Footer Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-4 md:mt-6 flex flex-col md:flex-row justify-between items-center border-t border-white/20 pt-3 md:pt-4 text-center md:text-left"
      >
        <p className="text-xs md:text-sm">&copy; {new Date().getFullYear()} Dibuat Penuh Cinta</p>
        <div className="flex gap-3 md:gap-4 mt-2 md:mt-0">
          <a 
            href={socialLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform"
          >
            <FaFacebook className="text-lg md:text-xl cursor-pointer hover:text-gray-300 transition duration-200" />
          </a>
          <a 
            href={socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform"
          >
            <FaInstagram className="text-lg md:text-xl cursor-pointer hover:text-gray-300 transition duration-200" />
          </a>
          <motion.div
            whileHover={{ y: -5 }}
            className="cursor-pointer"
            onClick={scrollToTop}
            aria-label="Scroll to top"
          >
            <IoIosArrowUp className="text-lg md:text-xl" />
          </motion.div>
        </div>
      </motion.div>
    </footer>
  );
}
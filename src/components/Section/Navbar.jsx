import { useState } from "react";
import { motion } from "framer-motion";
import Anna1 from "../../assets/Anna 1.png";
import { TicketCheckIcon, User2, UsersIcon } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const iconVariants = {
    hover: {
      scale: 1.2,
      rotate: 5,
      transition: { duration: 0.2 },
    },
  };

  const navbarVariants = {
    closed: {
      width: "auto",
      transition: { duration: 0.5 },
    },
    open: {
      width: "350px",
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="flex justify-end p-4 bg-[#EFE6D9]">
      <motion.div
        className="flex items-center gap-4 bg-[#5B2600] px-8 py-4 rounded-full text-white cursor-pointer"
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={navbarVariants}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          className="w-16"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <img src={Anna1} alt="User profile" className="rounded-md" />
        </motion.span>

        <motion.div variants={iconVariants} whileHover="hover">
          <TicketCheckIcon className="w-8 h-8 rounded" />
        </motion.div>

        <motion.div variants={iconVariants} whileHover="hover">
          <UsersIcon className="w-8 h-8" />
        </motion.div>

        <motion.div variants={iconVariants} whileHover="hover">
          <User2 className="w-8 h-8" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Navbar;

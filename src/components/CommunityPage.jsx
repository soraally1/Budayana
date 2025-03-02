/* eslint-disable react/prop-types */
import { useState } from "react";
import { Search, Heart, Bookmark, Plus, X, Upload, Type } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Budayana from "../assets/Budayana.png";

const NusantaraPinterestStyle = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("semua");
  const [selectedPost, setSelectedPost] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    category: "Tarian",
    hashtags: "",
    image: null,
    imagePreview: null,
  });

  // Sample data untuk kebutuhan demo
  const [budayaPosts, setBudayaPosts] = useState([
    {
      id: 1,
      image: "/api/placeholder/300/400",
      title: "Tari Pendet dari Bali",
      description:
        "Tarian tradisional dari Bali yang menggambarkan penyambutan para dewata.",
      category: "Tarian",
      hashtags: ["TariTradisional", "Bali", "Pendet"],
      likes: 240,
      author: "Putu Ayu",
      avatar: "/api/placeholder/40/40",
    },
    {
      id: 2,
      image: "/api/placeholder/300/300",
      title: "Batik Parang Rusak Solo",
      description:
        "Motif batik klasik dari Solo yang memiliki makna filosofis mendalam.",
      category: "Kain",
      hashtags: ["Batik", "Solo", "KainTradisional"],
      likes: 189,
      author: "Raden Wijaya",
      avatar: "/api/placeholder/40/40",
    },
    {
      id: 3,
      image: "/api/placeholder/300/500",
      title: "Rendang Padang",
      description:
        "Kuliner khas Minangkabau yang telah diakui UNESCO sebagai warisan budaya.",
      category: "Kuliner",
      hashtags: ["Rendang", "Padang", "KulinerNusantara"],
      likes: 315,
      author: "Minang Sejati",
      avatar: "/api/placeholder/40/40",
    },
    {
      id: 4,
      image: "/api/placeholder/300/450",
      title: "Keris Jawa Kuno",
      description:
        "Senjata pusaka tradisional Jawa dengan ukiran dan pamor yang khas.",
      category: "Artefak",
      hashtags: ["Keris", "Jawa", "SenjataTradisional"],
      likes: 175,
      author: "Empu Gandring",
      avatar: "/api/placeholder/40/40",
    },
    {
      id: 5,
      image: "/api/placeholder/300/400",
      title: "Rumah Gadang",
      description:
        "Rumah adat Minangkabau dengan atap yang menyerupai tanduk kerbau.",
      category: "Arsitektur",
      hashtags: ["RumahAdat", "Minangkabau", "Sumatra"],
      likes: 202,
      author: "Budaya Sumatra",
      avatar: "/api/placeholder/40/40",
    },
    {
      id: 6,
      image: "/api/placeholder/300/280",
      title: "Gamelan Jawa",
      description:
        "Alat musik tradisional Jawa yang terdiri dari berbagai instrumen perkusi.",
      category: "Musik",
      hashtags: ["Gamelan", "Jawa", "MusikTradisional"],
      likes: 167,
      author: "Nyai Laras",
      avatar: "/api/placeholder/40/40",
    },
    {
      id: 7,
      image: "/api/placeholder/300/420",
      title: "Wayang Kulit",
      description:
        "Seni pertunjukan bayangan dengan figur dari kulit yang dipahat.",
      category: "Seni Pertunjukan",
      hashtags: ["Wayang", "Jawa", "SeniTradisional"],
      likes: 223,
      author: "Dalang Anom",
      avatar: "/api/placeholder/40/40",
    },
    {
      id: 8,
      image: "/api/placeholder/300/360",
      title: "Ulos Batak",
      description:
        "Kain tenun tradisional dari Sumatera Utara dengan motif khas.",
      category: "Kain",
      hashtags: ["Ulos", "Batak", "TenunTradisional"],
      likes: 157,
      author: "Toba Heritage",
      avatar: "/api/placeholder/40/40",
    },
  ]);

  // Filter kategori
  const categories = [
    "Semua",
    "Tarian",
    "Kain",
    "Kuliner",
    "Artefak",
    "Arsitektur",
    "Musik",
    "Seni Pertunjukan",
    "Maritim",
  ];

  // Filter posts berdasarkan pencarian dan kategori
  const filteredPosts = budayaPosts.filter((post) => {
    const matchQuery =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.hashtags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchCategory =
      activeFilter.toLowerCase() === "semua" ||
      post.category.toLowerCase() === activeFilter.toLowerCase();

    return matchQuery && matchCategory;
  });

  // Handler untuk melihat gambar yang diperbesar
  const handleImageClick = (post) => {
    setSelectedPost(post);
  };

  // Handler untuk menutup gambar yang diperbesar
  const closeImagePreview = () => {
    setSelectedPost(null);
  };

  // Handler untuk modal upload
  const openUploadModal = () => {
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setNewPost({
      title: "",
      description: "",
      category: "Tarian",
      hashtags: "",
      image: null,
      imagePreview: null,
    });
  };

  // Handle file input
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // For this demo, we'll create a placeholder URL
      // In a real app, you'd use FileReader to preview the image
      setNewPost({
        ...newPost,
        image: file,
        imagePreview: "/api/placeholder/300/400",
      });
    }
  };

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost({
      ...newPost,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Create a new post object
    const newPostObject = {
      id: budayaPosts.length + 1,
      image: newPost.imagePreview || "/api/placeholder/300/400",
      title: newPost.title,
      description: newPost.description,
      category: newPost.category,
      hashtags: newPost.hashtags.split(",").map((tag) => tag.trim()),
      likes: 0,
      author: "Pengguna", // In a real app, this would be the logged-in user
      avatar: "/api/placeholder/40/40",
    };

    // Add the new post to the array
    setBudayaPosts([newPostObject, ...budayaPosts]);

    // Close the modal
    closeUploadModal();
  };

  return (
    <div className="bg-[#EBE3D5] min-h-screen font-fuzzy">
      {/* Header with Search and Actions */}
      <div className="sticky top-0 z-20 bg-[#5B2600] shadow-lg">
        <Link to="/">
          <img src={Budayana} alt="" className="w-1/6 mx-auto pt-8" />
        </Link>

        <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-xl">
            <input
              type="text"
              placeholder="Cari budaya Nusantara..."
              className="w-full p-3 pl-11 rounded-full bg-white/20 focus:bg-white/30 focus:outline-none border border-[#F1DFC9] text-white placeholder-[#F1DFC9]/70 font-fuzzy"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#F1DFC9]" />
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-[#58290e] px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveFilter(category.toLowerCase())}
                  className={`px-4 py-1.5 rounded-full text-sm font-fuzzy whitespace-nowrap transition-colors ${
                    activeFilter.toLowerCase() === category.toLowerCase()
                      ? "bg-[#FFD384] text-[#5B2600]"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Masonry Grid */}
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
          {filteredPosts.map((post) => (
            <div key={post.id} className="mb-4 break-inside-avoid">
              <PinterestCard post={post} onImageClick={handleImageClick} />
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openUploadModal}
            className="bg-[#FFD384] text-[#5B2600] fixed right-4 bottom-24 md:bottom-24 lg:bottom-8 px-4 py-2 rounded-full font-fuzzy flex items-center gap-2 shadow-lg hover:bg-[#FFE1A9] transition-colors"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Unggah</span>
          </motion.button>
        </div>
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 p-4 overflow-y-auto"
            onClick={closeImagePreview}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative max-w-4xl mx-auto bg-white rounded-2xl overflow-hidden mt-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-4 right-4 z-10">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeImagePreview}
                  className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                >
                  <X size={20} />
                </motion.button>
              </div>

              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="md:w-2/3 bg-black">
                  <img
                    src={selectedPost.image}
                    alt={selectedPost.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Content */}
                <div className="md:w-1/3 p-6 flex flex-col h-full">
                  <h2 className="text-2xl font-bold text-[#5B2600] mb-2">
                    {selectedPost.title}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {selectedPost.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedPost.hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-[#F1DFC9] text-[#5B2600] px-3 py-1 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Author and Actions */}
                  <div className="mt-auto border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedPost.avatar}
                          alt={selectedPost.author}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-[#5B2600]">
                            {selectedPost.author}
                          </p>
                          <p className="text-sm text-gray-500">Penulis</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="bg-[#F1DFC9] p-2 rounded-full"
                        >
                          <Heart size={20} className="text-[#5B2600]" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="bg-[#F1DFC9] p-2 rounded-full"
                        >
                          <Bookmark size={20} className="text-[#5B2600]" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={closeUploadModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative max-w-lg w-full bg-white rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-[#602402]">
                    Tambah Konten Budaya
                  </h2>
                  <button
                    className="p-2 rounded-full hover:bg-gray-100"
                    onClick={closeUploadModal}
                  >
                    <X size={20} className="text-[#602402]" />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Image Upload */}
                  <div className="mb-4">
                    <div
                      className={`border-2 border-dashed border-[#602402]/30 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer h-48 ${
                        newPost.imagePreview ? "bg-[#602402]/5" : "bg-white"
                      }`}
                      onClick={() =>
                        document.getElementById("image-upload").click()
                      }
                    >
                      {newPost.imagePreview ? (
                        <div className="relative w-full h-full">
                          <img
                            src={newPost.imagePreview}
                            alt="Preview"
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                            <p className="text-white font-medium">
                              Ganti Gambar
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload
                            size={32}
                            className="text-[#602402]/50 mb-2"
                          />
                          <p className="text-[#602402]/70 text-center">
                            Klik untuk unggah gambar atau seret file ke sini
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            JPG, PNG atau GIF (Maks. 5MB)
                          </p>
                        </>
                      )}
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                    {!newPost.imagePreview && (
                      <p className="text-sm text-red-500 mt-1">
                        * Gambar wajib diunggah
                      </p>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Judul
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="title"
                          value={newPost.title}
                          onChange={handleInputChange}
                          className="w-full p-2 pl-9 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#602402]/50"
                          placeholder="Masukkan judul..."
                          required
                        />
                        <Type className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deskripsi
                      </label>
                      <textarea
                        name="description"
                        value={newPost.description}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#602402]/50"
                        placeholder="Ceritakan tentang budaya ini..."
                        rows="3"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kategori
                      </label>
                      <select
                        name="category"
                        value={newPost.category}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#602402]/50"
                        required
                      >
                        {categories
                          .filter((cat) => cat !== "Semua")
                          .map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hashtag (pisahkan dengan koma)
                      </label>
                      <input
                        type="text"
                        name="hashtags"
                        value={newPost.hashtags}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#602402]/50"
                        placeholder="Contoh: Bali, Tarian, Tradisional"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full py-3 bg-[#602402] text-white font-medium rounded-lg shadow-sm flex items-center justify-center"
                      disabled={!newPost.imagePreview || !newPost.title}
                    >
                      <Upload className="mr-2 h-5 w-5" />
                      Unggah Konten
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Update PinterestCard component
const PinterestCard = ({ post, onImageClick }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);

  const handleLike = (e) => {
    e.stopPropagation();
    if (!isLiked) {
      setLikesCount((prev) => prev + 1);
    } else {
      setLikesCount((prev) => prev - 1);
    }
    setIsLiked(!isLiked);
  };

  return (
    <motion.div
      className="group relative rounded-xl overflow-hidden shadow-md bg-white font-fuzzy"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="cursor-zoom-in" onClick={() => onImageClick(post)}>
        <img
          src={post.image}
          alt={post.title}
          className="w-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="absolute top-2 right-2 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                handleLike(e);
              }}
              className="bg-white p-2 rounded-full shadow-lg"
            >
              <Heart
                size={18}
                className={isLiked ? "text-red-500" : "text-[#5B2600]"}
              />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-2 rounded-full shadow-lg"
            >
              <Bookmark size={18} className="text-[#5B2600]" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-3">
        <h3 className="font-fuzzy text-[#5B2600] mb-1 line-clamp-1">
          {post.title}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={post.avatar}
              alt={post.author}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-gray-600 truncate font-fuzzy">
              {post.author}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Heart
              size={14}
              className={isLiked ? "text-red-500" : "text-gray-400"}
            />
            <span className="text-sm text-gray-500 font-fuzzy">
              {likesCount}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NusantaraPinterestStyle;

/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Search, Heart, Bookmark, Plus, X, Upload, Type, Camera, Share2, AlertCircle, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, updateDoc, doc, deleteDoc, getDoc } from "firebase/firestore";
import Budayana from "../assets/Budayana.png";
import { toast } from "react-hot-toast";

const NusantaraPinterestStyle = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("semua");
  const [selectedPost, setSelectedPost] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [budayaPosts, setBudayaPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [userData, setUserData] = useState(null);
  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    category: "Tarian",
    hashtags: "",
    image: null,
    imagePreview: null,
  });
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/login');
          return;
        }

        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            uid: user.uid,
            name: data.name || user.displayName || '',
            email: user.email || '',
            photoURL: data.photoURL || user.photoURL || '',
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Gagal memuat data pengguna');
      }
    };

    fetchUserData();
  }, [navigate]);

  // Fetch posts from Firestore
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const postsRef = collection(db, "budayaPosts");
        const q = query(postsRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const posts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })
        }));
        setBudayaPosts(posts);
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast.error("Gagal memuat konten. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Filter kategori with icons
  const categories = [
    { id: "semua", name: "Semua", icon: Search },
    { id: "tarian", name: "Tarian", icon: Users },
    { id: "kain", name: "Kain", icon: Type },
    { id: "kuliner", name: "Kuliner", icon: Bookmark },
    { id: "artefak", name: "Artefak", icon: Camera },
    { id: "arsitektur", name: "Arsitektur", icon: Heart },
    { id: "musik", name: "Musik", icon: AlertCircle },
    { id: "seni-pertunjukan", name: "Seni Pertunjukan", icon: Share2 },
    { id: "maritim", name: "Maritim", icon: Plus },
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
      activeFilter === "semua" ||
      post.category.toLowerCase() === activeFilter.toLowerCase();

    return matchQuery && matchCategory;
  });

  // Share functionality
  const handleShare = async (post) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.description,
          url: window.location.href
        });
      } else {
        // Fallback copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link berhasil disalin!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // Delete post functionality
  const handleDeletePost = async (postId) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("Silakan login terlebih dahulu");
        navigate('/login');
        return;
      }

      const postRef = doc(db, "budayaPosts", postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        toast.error("Konten tidak ditemukan");
        return;
      }

      const postData = postDoc.data();
      
      // Check if user is the author of the post
      if (postData.authorId !== user.uid) {
        toast.error("Anda tidak memiliki izin untuk menghapus konten ini");
        return;
      }

      await deleteDoc(postRef);
      setBudayaPosts(posts => posts.filter(post => post.id !== postId));
      setShowDeleteConfirm(false);
      setPostToDelete(null);
      toast.success("Konten berhasil dihapus");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Gagal menghapus konten");
    }
  };

  // Handler untuk melihat gambar yang diperbesar
  const handleImageClick = (post) => {
    setSelectedPost({
      ...post,
      isLiked: false // Add isLiked state for the selected post
    });
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

  // Handle file input and convert to Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File terlalu besar. Maksimal ukuran file adalah 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPost({
          ...newPost,
          image: reader.result,
          imagePreview: reader.result,
        });
      };
      reader.readAsDataURL(file);
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
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userData) {
      toast.error("Silakan login terlebih dahulu");
      navigate('/login');
      return;
    }

    try {
      const postData = {
        image: newPost.image,
        title: newPost.title,
        description: newPost.description,
        category: newPost.category,
        hashtags: newPost.hashtags.split(",").map((tag) => tag.trim()),
        likes: 0,
        comments: [],
        author: userData.name,
        authorId: userData.uid,
        avatar: userData.photoURL || "https://source.unsplash.com/100x100/?person",
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "budayaPosts"), postData);

      setBudayaPosts([
        {
          id: docRef.id,
          ...postData,
          createdAt: new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
        },
        ...budayaPosts,
      ]);

      closeUploadModal();
      toast.success("Konten berhasil diunggah!");
    } catch (error) {
      console.error("Error adding post:", error);
      toast.error("Gagal mengunggah konten. Silakan coba lagi.");
    }
  };

  return (
    <div className="min-h-screen bg-white font-fuzzy">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-[#5B2600] to-[#8B4513] shadow-sm">
        <div className="max-w-[1800px] mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="relative z-10">
            <motion.img 
              src={Budayana} 
              alt="Budayana Logo" 
              className="h-8 w-auto"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            />
          </Link>

          {/* Mobile Search Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMobileSearch(prev => !prev)}
            className="lg:hidden p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <Search className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {showMobileSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden px-4 pb-4 overflow-hidden"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari budaya Nusantara..."
                  className="w-full p-3 pl-11 rounded-xl bg-white/10 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-[#FFD384] text-white placeholder-white/70 border border-white/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Categories and Search */}
          <div className="w-full lg:w-64 lg:flex-shrink-0">
            {/* Desktop Search Bar */}
            <div className="relative mb-6 hidden lg:block">
              <input
                type="text"
                placeholder="Cari budaya Nusantara..."
                className="w-full p-3 pl-11 rounded-xl bg-[#EBE3D5]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD384] text-[#5B2600] placeholder-[#8B4513]/50 border border-[#FFD384]/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B4513]/70" />
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[#5B2600] mb-4">Kategori</h3>
              {/* Mobile Categories Horizontal Scroll */}
              <div className="flex flex-col lg:hidden">
                <div className="overflow-x-auto pb-4 gap-2 scrollbar-hide">
                  <div className="flex gap-2">
                    {categories.map((category) => (
                      <motion.button
                        key={category.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveFilter(category.id)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${
                          activeFilter === category.id
                            ? "bg-gradient-to-r from-[#5B2600] to-[#8B4513] text-white"
                            : "bg-[#EBE3D5]/50 text-[#5B2600] hover:bg-[#FFD384]/20"
                        }`}
                      >
                        <category.icon className={`w-4 h-4 ${
                          activeFilter === category.id
                            ? "text-[#FFD384]"
                            : "text-[#8B4513]"
                        }`} />
                        <span>{category.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
                {/* Mobile Upload Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openUploadModal}
                  className="w-full mt-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#5B2600] to-[#8B4513] text-white font-medium shadow-sm hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Plus size={20} className="text-[#FFD384]" />
                  <span>Tambah Konten Budaya</span>
                </motion.button>
              </div>

              {/* Desktop Categories Vertical List */}
              <div className="hidden lg:flex lg:flex-col lg:gap-2">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveFilter(category.id)}
                    className={`w-full px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 flex items-center gap-3 ${
                      activeFilter === category.id
                        ? "bg-gradient-to-r from-[#5B2600] to-[#8B4513] text-white"
                        : "bg-[#EBE3D5]/50 text-[#5B2600] hover:bg-[#FFD384]/20"
                    }`}
                  >
                    <category.icon className={`w-5 h-5 ${
                      activeFilter === category.id
                        ? "text-[#FFD384]"
                        : "text-[#8B4513]"
                    }`} />
                    <span>{category.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Pinterest Grid */}
          <div className="flex-1">
            {loading ? (
              <motion.div 
                className="flex flex-col items-center justify-center min-h-[60vh]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  animate={{
                    rotate: 360,
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-12 h-12 border-4 border-[#EBE3D5] border-t-[#5B2600] rounded-full"
                />
                <p className="mt-4 text-[#5B2600] font-medium">Memuat konten...</p>
              </motion.div>
            ) : filteredPosts.length === 0 ? (
              <motion.div 
                className="flex flex-col items-center justify-center min-h-[60vh]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-[#8B4513]/50" />
                  <h3 className="text-xl font-bold mb-2 text-[#5B2600]">Tidak ada konten</h3>
                  <p className="text-[#8B4513]">
                    Belum ada konten budaya yang diunggah.
                    <br />
                    Jadilah yang pertama berbagi!
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={openUploadModal}
                    className="mt-6 px-6 py-2 bg-gradient-to-r from-[#5B2600] to-[#8B4513] text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Unggah Sekarang
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                className="columns-1 xs:columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4 [column-fill:_balance] w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {filteredPosts.map((post, index) => (
                  <motion.div 
                    key={post.id} 
                    className="mb-4 break-inside-avoid"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <PinterestCard 
                      post={post} 
                      onImageClick={handleImageClick} 
                      onShare={() => handleShare(post)}
                      onDelete={() => {
                        setPostToDelete(post);
                        setShowDeleteConfirm(true);
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Upload Button - Pinterest Style */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={openUploadModal}
        className="fixed right-4 sm:right-6 bottom-4 sm:bottom-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg bg-gradient-to-r from-[#5B2600] to-[#8B4513] text-white hover:shadow-xl transition-all duration-300 items-center justify-center z-50 hidden lg:flex"
      >
        <Plus size={20} className="text-[#FFD384] sm:w-6 sm:h-6" />
      </motion.button>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-3 sm:p-6 w-[calc(100%-2rem)] max-w-[280px] sm:max-w-sm mx-auto"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-base sm:text-lg font-bold text-[#5B2600] mb-2">Konfirmasi Hapus</h3>
              <p className="text-sm sm:text-base text-[#8B4513] mb-3 sm:mb-4">
                Apakah Anda yakin ingin menghapus konten ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 sm:py-2 rounded-lg text-[#5B2600] hover:bg-gray-100 transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDeletePost(postToDelete.id)}
                  className="px-3 py-1.5 sm:py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors text-sm"
                >
                  Hapus
                </button>
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
            className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center p-2 overflow-y-auto"
            onClick={closeUploadModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-[300px] xs:max-w-[320px] sm:max-w-lg my-2 sm:my-4 bg-gradient-to-br from-[#EBE3D5] to-white rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-2 sm:p-6">
                <div className="flex justify-between items-center mb-2 sm:mb-6">
                  <h2 className="text-sm sm:text-xl font-bold text-[#5B2600]">
                    Tambah Konten Budaya
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1 rounded-full hover:bg-[#FFD384]/20 transition-colors"
                    onClick={closeUploadModal}
                  >
                    <X size={14} className="sm:w-5 sm:h-5 text-[#5B2600]" />
                  </motion.button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-6">
                  {/* Image Upload */}
                  <div
                    className={`relative border-2 border-dashed border-[#5B2600]/30 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                      newPost.imagePreview ? 'bg-[#5B2600]/5' : 'bg-white'
                    }`}
                    onClick={() => document.getElementById('image-upload').click()}
                  >
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    
                    {newPost.imagePreview ? (
                      <div className="relative aspect-[4/3]">
                        <img
                          src={newPost.imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                          <p className="text-white text-xs sm:text-base font-medium flex items-center gap-2">
                            <Camera size={16} className="sm:w-5 sm:h-5" />
                            Ganti Gambar
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-[4/3] flex flex-col items-center justify-center p-4">
                        <Upload size={24} className="sm:w-8 sm:h-8 text-[#5B2600]/50 mb-2" />
                        <p className="text-xs sm:text-sm text-[#5B2600]/70 text-center">
                          Klik untuk unggah gambar
                        </p>
                        <p className="text-[10px] sm:text-xs text-[#8B4513] mt-1">
                          JPG, PNG atau GIF (Maks. 5MB)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#5B2600] mb-1">
                        Judul
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="title"
                          value={newPost.title}
                          onChange={handleInputChange}
                          className="w-full p-1.5 sm:p-2 pl-7 sm:pl-9 border border-[#FFD384]/50 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#5B2600]/20 text-[#5B2600] placeholder-[#8B4513]/40 text-xs sm:text-sm"
                          placeholder="Masukkan judul..."
                          required
                        />
                        <Type className="absolute left-2 sm:left-3 top-2 w-3 h-3 sm:w-4 sm:h-4 text-[#8B4513]" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#5B2600] mb-1">
                        Deskripsi
                      </label>
                      <textarea
                        name="description"
                        value={newPost.description}
                        onChange={handleInputChange}
                        className="w-full p-1.5 sm:p-2 border border-[#FFD384]/50 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#5B2600]/20 text-[#5B2600] placeholder-[#8B4513]/40 resize-none text-xs sm:text-sm"
                        placeholder="Ceritakan tentang budaya ini..."
                        rows="2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#5B2600] mb-1">
                        Kategori
                      </label>
                      <select
                        name="category"
                        value={newPost.category}
                        onChange={handleInputChange}
                        className="w-full p-1.5 sm:p-2 border border-[#FFD384]/50 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#5B2600]/20 text-[#5B2600] text-xs sm:text-sm"
                        required
                      >
                        {categories
                          .filter((cat) => cat.id !== "semua")
                          .map((category) => (
                            <option key={category.id} value={category.name}>
                              {category.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#5B2600] mb-1">
                        Hashtag
                      </label>
                      <input
                        type="text"
                        name="hashtags"
                        value={newPost.hashtags}
                        onChange={handleInputChange}
                        className="w-full p-1.5 sm:p-2 border border-[#FFD384]/50 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#5B2600]/20 text-[#5B2600] placeholder-[#8B4513]/40 text-xs sm:text-sm"
                        placeholder="Contoh: Bali, Tarian, Tradisional"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-2 sm:py-3 bg-gradient-to-r from-[#5B2600] to-[#8B4513] text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!newPost.imagePreview || !newPost.title}
                  >
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                    Unggah Konten
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2"
            onClick={closeImagePreview}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-[calc(100%-1rem)] sm:w-[calc(100%-4rem)] max-w-[280px] sm:max-w-2xl mx-auto bg-white rounded-lg overflow-hidden my-2 sm:my-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-2 right-2 z-10">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeImagePreview}
                  className="bg-black/50 text-white p-1 sm:p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <X size={14} className="sm:w-5 sm:h-5" />
                </motion.button>
              </div>

              <div className="flex flex-col sm:flex-row">
                {/* Image */}
                <div className="bg-black sm:w-2/3">
                  <img
                    src={selectedPost.image}
                    alt={selectedPost.title}
                    className="w-full h-full object-contain max-h-[30vh] sm:max-h-[70vh]"
                  />
                </div>

                {/* Content */}
                <div className="p-3 sm:p-6 flex flex-col bg-gradient-to-br from-[#EBE3D5]/50 to-white sm:w-1/3">
                  <h2 className="text-sm sm:text-lg font-bold text-[#5B2600] mb-1 sm:mb-3">
                    {selectedPost.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#8B4513] mb-2 sm:mb-4">
                    {selectedPost.description}
                  </p>

                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-4">
                    {selectedPost.hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-[#FFD384]/20 text-[#5B2600] px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Author and Actions */}
                  <div className="mt-auto border-t border-[#FFD384]/30 pt-2 sm:pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <img
                          src={selectedPost.avatar}
                          alt={selectedPost.author}
                          className="w-5 h-5 sm:w-8 sm:h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-[#5B2600] text-xs sm:text-sm">
                            {selectedPost.author}
                          </p>
                          <p className="text-[10px] sm:text-xs text-[#8B4513]">Penulis</p>
                        </div>
                      </div>
                      <div className="flex gap-1 sm:gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="bg-[#FFD384]/20 p-1 sm:p-2 rounded-full hover:bg-[#FFD384]/30 transition-colors"
                        >
                          <Heart
                            size={12}
                            className={`sm:w-4 sm:h-4 ${selectedPost.isLiked ? "text-red-500" : "text-[#5B2600]"}`}
                            fill={selectedPost.isLiked ? "currentColor" : "none"}
                          />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="bg-[#FFD384]/20 p-1 sm:p-2 rounded-full hover:bg-[#FFD384]/30 transition-colors"
                        >
                          <Bookmark size={12} className="sm:w-4 sm:h-4 text-[#5B2600]" />
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
    </div>
  );
};

// Enhanced PinterestCard component
const PinterestCard = ({ post, onImageClick, onShare, onDelete }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showActions, setShowActions] = useState(false);
  const user = auth.currentUser;

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const postRef = doc(db, "budayaPosts", post.id);
      const newLikes = isLiked ? likesCount - 1 : likesCount + 1;
      await updateDoc(postRef, {
        likes: newLikes
      });
      
      setLikesCount(newLikes);
      setIsLiked(!isLiked);
      
      toast.success(isLiked ? "Batal menyukai" : "Disukai!");
    } catch (error) {
      console.error("Error updating likes:", error);
      toast.error("Gagal memperbarui suka");
    }
  };

  return (
    <motion.div
      className="group relative rounded-xl overflow-hidden bg-gradient-to-br from-[#EBE3D5] to-white shadow-sm hover:shadow-xl transition-shadow duration-300 border border-[#FFD384]/20"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setShowActions(true)}
      onHoverEnd={() => setShowActions(false)}
    >
      <div 
        className="cursor-zoom-in relative aspect-auto" 
        onClick={() => onImageClick(post)}
      >
        <motion.img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.3 }}
        />

        {/* Overlay with Actions */}
        <AnimatePresence>
          {showActions && (
            <motion.div 
              className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute top-2 right-2 flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(e);
                  }}
                  className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                >
                  <Heart
                    size={18}
                    className={isLiked ? "text-red-500" : "text-[#5B2600]"}
                    fill={isLiked ? "currentColor" : "none"}
                  />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare();
                  }}
                  className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                >
                  <Share2 size={18} className="text-[#5B2600]" />
                </motion.button>
                {user && post.authorId === user.uid && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                  >
                    <X size={18} className="text-red-500" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Card Footer */}
      <div className="p-3">
        <h3 className="font-medium text-[#5B2600] line-clamp-1 mb-1">
          {post.title}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={post.avatar}
              alt={post.author}
              className="w-6 h-6 rounded-full object-cover border border-[#FFD384]/30"
            />
            <span className="text-sm text-[#8B4513] truncate">
              {post.author}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Heart
              size={14}
              className={isLiked ? "text-red-500" : "text-[#8B4513]"}
              fill={isLiked ? "currentColor" : "none"}
            />
            <span className="text-sm text-[#8B4513]">
              {likesCount}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NusantaraPinterestStyle;

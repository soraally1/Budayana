/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Search, Heart, Bookmark, Filter, TrendingUp, Plus, X, Upload, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NusantaraPinterestStyle = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState('semua');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    category: 'Tarian',
    hashtags: '',
    image: null,
    imagePreview: null
  });
  
  // Sample data untuk kebutuhan demo
  const [budayaPosts, setBudayaPosts] = useState([
    {
      id: 1,
      image: "/api/placeholder/300/400",
      title: "Tari Pendet dari Bali",
      description: "Tarian tradisional dari Bali yang menggambarkan penyambutan para dewata.",
      category: "Tarian",
      hashtags: ["TariTradisional", "Bali", "Pendet"],
      likes: 240,
      author: "Putu Ayu",
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 2,
      image: "/api/placeholder/300/300",
      title: "Batik Parang Rusak Solo",
      description: "Motif batik klasik dari Solo yang memiliki makna filosofis mendalam.",
      category: "Kain",
      hashtags: ["Batik", "Solo", "KainTradisional"],
      likes: 189,
      author: "Raden Wijaya",
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 3,
      image: "/api/placeholder/300/500",
      title: "Rendang Padang",
      description: "Kuliner khas Minangkabau yang telah diakui UNESCO sebagai warisan budaya.",
      category: "Kuliner",
      hashtags: ["Rendang", "Padang", "KulinerNusantara"],
      likes: 315,
      author: "Minang Sejati",
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 4,
      image: "/api/placeholder/300/450",
      title: "Keris Jawa Kuno",
      description: "Senjata pusaka tradisional Jawa dengan ukiran dan pamor yang khas.",
      category: "Artefak",
      hashtags: ["Keris", "Jawa", "SenjataTradisional"],
      likes: 175,
      author: "Empu Gandring",
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 5,
      image: "/api/placeholder/300/400",
      title: "Rumah Gadang",
      description: "Rumah adat Minangkabau dengan atap yang menyerupai tanduk kerbau.",
      category: "Arsitektur",
      hashtags: ["RumahAdat", "Minangkabau", "Sumatra"],
      likes: 202,
      author: "Budaya Sumatra",
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 6,
      image: "/api/placeholder/300/280",
      title: "Gamelan Jawa",
      description: "Alat musik tradisional Jawa yang terdiri dari berbagai instrumen perkusi.",
      category: "Musik",
      hashtags: ["Gamelan", "Jawa", "MusikTradisional"],
      likes: 167,
      author: "Nyai Laras",
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 7,
      image: "/api/placeholder/300/420",
      title: "Wayang Kulit",
      description: "Seni pertunjukan bayangan dengan figur dari kulit yang dipahat.",
      category: "Seni Pertunjukan",
      hashtags: ["Wayang", "Jawa", "SeniTradisional"],
      likes: 223,
      author: "Dalang Anom",
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 8,
      image: "/api/placeholder/300/360",
      title: "Ulos Batak",
      description: "Kain tenun tradisional dari Sumatera Utara dengan motif khas.",
      category: "Kain",
      hashtags: ["Ulos", "Batak", "TenunTradisional"],
      likes: 157,
      author: "Toba Heritage",
      avatar: "/api/placeholder/40/40"
    },
  ]);

  // Trending hashtags
  const trendingHashtags = [
    { tag: "BudayaNusantara", count: 4582 },
    { tag: "TariTradisional", count: 3241 },
    { tag: "Batik", count: 2876 },
    { tag: "KulinerNusantara", count: 2345 },
    { tag: "WarisanBudaya", count: 1982 }
  ];

  // Filter kategori
  const categories = ['Semua', 'Tarian', 'Kain', 'Kuliner', 'Artefak', 'Arsitektur', 'Musik', 'Seni Pertunjukan', 'Maritim'];
  
  // Filter posts berdasarkan pencarian dan kategori
  const filteredPosts = budayaPosts.filter(post => {
    const matchQuery = searchQuery === '' || 
                      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      post.hashtags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchCategory = activeFilter.toLowerCase() === 'semua' || 
                          post.category.toLowerCase() === activeFilter.toLowerCase();
    
    return matchQuery && matchCategory;
  });

  // Pinterest-style masonry layout columns
  const getPostsForColumn = (columnIndex, columnCount) => {
    return filteredPosts.filter((_, index) => index % columnCount === columnIndex);
  };

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
      title: '',
      description: '',
      category: 'Tarian',
      hashtags: '',
      image: null,
      imagePreview: null
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
        imagePreview: "/api/placeholder/300/400"
      });
    }
  };

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost({
      ...newPost,
      [name]: value
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
      hashtags: newPost.hashtags.split(',').map(tag => tag.trim()),
      likes: 0,
      author: "Pengguna", // In a real app, this would be the logged-in user
      avatar: "/api/placeholder/40/40"
    };
    
    // Add the new post to the array
    setBudayaPosts([newPostObject, ...budayaPosts]);
    
    // Close the modal
    closeUploadModal();
  };

  return (
    <div className="bg-[#F1DFC9] min-h-screen">
      {/* Search Bar Only (Removed navbar but kept search) */}
      <div className="bg-[#5B2600] p-6 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-start">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Cari budaya Nusantara..."
              className="w-full p-2 pl-10 rounded-full bg-white/20 focus:bg-white/30 focus:outline-none border border-[#F1DFC9]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2 w-5 h-5 text-[#F1DFC9]" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4">
        {/* Filter Bar */}
        <div className="flex justify-between items-center mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 bg-white p-2 px-4 rounded-full shadow-sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} className="text-[#602402]" />
            <span className="text-[#602402] font-medium">Filter</span>
          </motion.button>
          
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#602402] text-white p-2 px-4 rounded-full shadow-sm flex items-center space-x-2"
            >
              <TrendingUp size={16} />
              <span className="hidden sm:inline">Trending</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-[#602402] p-2 px-4 rounded-full shadow-sm border border-[#602402]/20"
            >
              Terbaru
            </motion.button>
          </div>
        </div>
        
        {/* Filters */}
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-wrap gap-2 mb-6 bg-white p-3 rounded-lg shadow-sm"
          >
            {categories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activeFilter.toLowerCase() === category.toLowerCase() 
                    ? 'bg-[#602402] text-white' 
                    : 'bg-[#F1DFC9] text-[#602402]'
                }`}
                onClick={() => setActiveFilter(category.toLowerCase())}
              >
                {category}
              </motion.button>
            ))}
          </motion.div>
        )}
        
        {/* Trending Hashtags Horizontal Scroll */}
        <div className="overflow-x-auto mb-6 pb-2">
          <div className="flex space-x-2">
            {trendingHashtags.map((item) => (
              <motion.button
                key={item.tag}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-1 bg-white px-3 py-1 rounded-full shadow-sm whitespace-nowrap"
              >
                <span className="text-sm font-medium text-[#602402]">#{item.tag}</span>
                <span className="text-xs text-gray-500">{item.count}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Pinterest-style Masonry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Column 1 */}
          <div className="flex flex-col space-y-3">
            {getPostsForColumn(0, 4).map((post) => (
              <PinterestCard key={post.id} post={post} onImageClick={handleImageClick} />
            ))}
          </div>
          
          {/* Column 2 */}
          <div className="flex flex-col space-y-3">
            {getPostsForColumn(1, 4).map((post) => (
              <PinterestCard key={post.id} post={post} onImageClick={handleImageClick} />
            ))}
          </div>
          
          {/* Column 3 */}
          <div className="hidden md:flex flex-col space-y-3">
            {getPostsForColumn(2, 4).map((post) => (
              <PinterestCard key={post.id} post={post} onImageClick={handleImageClick} />
            ))}
          </div>
          
          {/* Column 4 */}
          <div className="hidden lg:flex flex-col space-y-3">
            {getPostsForColumn(3, 4).map((post) => (
              <PinterestCard key={post.id} post={post} onImageClick={handleImageClick} />
            ))}
          </div>
        </div>
      </main>

      {/* Upload Button (Mobile) */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 bg-[#602402] text-white p-4 rounded-full shadow-lg z-50"
        onClick={openUploadModal}
      >
        <Plus size={24} />
      </motion.button>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 md:p-8"
            onClick={closeImagePreview}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative max-w-4xl w-full bg-white rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="absolute top-3 right-3 z-10 bg-white/80 p-2 rounded-full"
                onClick={closeImagePreview}
              >
                <X size={20} className="text-[#602402]" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="bg-gray-100 flex items-center justify-center">
                  <img 
                    src={selectedPost.image} 
                    alt={selectedPost.title}
                    className="w-full h-full object-contain max-h-screen"
                  />
                </div>
                
                <div className="p-6 flex flex-col">
                  <h2 className="text-xl font-bold text-[#602402] mb-2">{selectedPost.title}</h2>
                  <p className="text-gray-700 mb-4">{selectedPost.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedPost.hashtags.map((tag) => (
                      <span key={tag} className="text-sm bg-[#F1DFC9] text-[#602402] px-3 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-2">
                    <span className="font-medium">Kategori:</span> {selectedPost.category}
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <img src={selectedPost.avatar} alt={selectedPost.author} className="w-8 h-8 rounded-full" />
                      <span className="font-medium">{selectedPost.author}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="bg-[#F1DFC9] p-2 rounded-full"
                      >
                        <Heart size={20} className="text-[#602402]" />
                      </motion.button>
                      <span>{selectedPost.likes}</span>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="bg-[#F1DFC9] p-2 rounded-full ml-2"
                      >
                        <Bookmark size={20} className="text-[#602402]" />
                      </motion.button>
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
                  <h2 className="text-xl font-bold text-[#602402]">Tambah Konten Budaya</h2>
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
                        newPost.imagePreview ? 'bg-[#602402]/5' : 'bg-white'
                      }`}
                      onClick={() => document.getElementById('image-upload').click()}
                    >
                      {newPost.imagePreview ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={newPost.imagePreview} 
                            alt="Preview" 
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                            <p className="text-white font-medium">Ganti Gambar</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload size={32} className="text-[#602402]/50 mb-2" />
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
                      <p className="text-sm text-red-500 mt-1">* Gambar wajib diunggah</p>
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
                        {categories.filter(cat => cat !== 'Semua').map((category) => (
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

// Pinterest-style Card Component
// eslint-disable-next-line react/prop-types
const PinterestCard = ({ post, onImageClick }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  
  const handleLike = (e) => {
    e.stopPropagation();
    if (!isLiked) {
      setLikesCount(prev => prev + 1);
    } else {
      setLikesCount(prev => prev - 1);
    }
    setIsLiked(!isLiked);
  };
  
  return (
    <motion.div
      className="bg-white rounded-lg overflow-hidden shadow-md relative group"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div 
        className="relative cursor-pointer"
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
        onClick={() => onImageClick(post)}
      >
        <img 
          src={post.image} 
          alt={post.title} 
          className="w-full object-cover" 
        />
        
        {/* Overlay on hover */}
        <div 
          className={`absolute inset-0 bg-black/40 flex flex-col justify-between p-3 transition-opacity duration-200 ${
            showDetails ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex justify-end space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-white p-2 rounded-full"
              onClick={handleLike}
            >
              <Heart size={16} className={isLiked ? "text-red-500" : "text-[#602402]"} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-white p-2 rounded-full"
            >
              <Bookmark size={16} className="text-[#602402]" />
            </motion.button>
          </div>
          
          <div>
            <h3 className="text-white font-bold">{post.title}</h3>
            <p className="text-white/90 text-sm line-clamp-2">{post.description}</p>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {post.hashtags.map((tag) => (
                <span key={tag} className="text-xs bg-white/30 text-white px-2 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Info bar (visible always) */}
      <div className="p-2 flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <img src={post.avatar} alt={post.author} className="w-5 h-5 rounded-full" />
          <span className="text-xs text-gray-700 truncate">{post.author}</span>
        </div>
        
        <div className="flex items-center space-x-1.5">
          <Heart 
            size={14} 
            className={isLiked ? "text-red-500" : "text-gray-500"} 
            onClick={handleLike}
          />
          <span className="text-xs text-gray-500">{likesCount}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default NusantaraPinterestStyle;
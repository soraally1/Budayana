import { motion } from "framer-motion";
import { Search, Filter, Calendar, Clock, User } from "lucide-react";
import { useState } from "react";

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "Semua" },
    { id: "culture", name: "Budaya" },
    { id: "art", name: "Seni" },
    { id: "tradition", name: "Tradisi" },
    { id: "technology", name: "Teknologi" },
    { id: "event", name: "Event" },
  ];

  const blogPosts = [
    {
      id: 1,
      title: "Transformasi Digital dalam Pelestarian Budaya Indonesia",
      excerpt: "Bagaimana teknologi digital dapat membantu melestarikan dan mempromosikan warisan budaya Indonesia kepada generasi muda.",
      category: "technology",
      author: "Daffa Kumara",
      date: "2024-03-15",
      readTime: "5 min",
      image: "/blog/digital-culture.jpg",
      featured: true
    },
    {
      id: 2,
      title: "Inovasi Platform Event Budaya di Era Digital",
      excerpt: "Melihat bagaimana Budayana menghadirkan pengalaman baru dalam mengapresiasi event budaya melalui platform digital.",
      category: "technology",
      author: "Erlangga Tresnamada",
      date: "2024-03-10",
      readTime: "8 min",
      image: "/blog/platform-innovation.jpg",
      featured: true
    },
    {
      id: 3,
      title: "Mengenal Ragam Tari Tradisional Indonesia",
      excerpt: "Eksplorasi keindahan dan makna di balik tarian-tarian tradisional dari berbagai daerah di Indonesia.",
      category: "art",
      author: "Tim Budayana",
      date: "2024-03-05",
      readTime: "6 min",
      image: "/blog/traditional-dance.jpg"
    },
    {
      id: 4,
      title: "Festival Budaya Virtual: Pengalaman Baru Apresiasi Seni",
      excerpt: "Bagaimana teknologi virtual reality membawa pengalaman festival budaya ke level yang baru.",
      category: "event",
      author: "Tim Budayana",
      date: "2024-03-01",
      readTime: "7 min",
      image: "/blog/virtual-festival.jpg"
    },
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EBE3D5] via-[#FFD384]/10 to-[#EBE3D5] pt-20">
      {/* Hero Section */}
      <div className="relative bg-[#5B2600] text-white py-20">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Blog Budayana
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto"
          >
            Eksplorasi artikel menarik tentang budaya, seni, dan inovasi digital
          </motion.p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 -mt-12 relative z-10">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari artikel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B2600]"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? "bg-[#5B2600] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-[#5B2600] mb-8">Artikel Unggulan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-w-16 aspect-h-9 rounded-xl overflow-hidden mb-4">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/800x450?text=Featured+Article';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block px-3 py-1 bg-white/90 rounded-full text-sm font-medium text-[#5B2600] mb-2">
                      {categories.find(c => c.id === post.category)?.name}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-2">{post.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-white/80">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(post.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      )}

      {/* Regular Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-[#5B2600] mb-8">Artikel Terbaru</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularPosts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all group cursor-pointer"
            >
              <div className="aspect-w-16 aspect-h-9 relative">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x450?text=Blog+Image';
                  }}
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-[#5B2600]">
                    {categories.find(c => c.id === post.category)?.name}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#5B2600] mb-2 line-clamp-2 group-hover:text-[#8B4513] transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#5B2600] mb-2">
              Tidak ada artikel ditemukan
            </h3>
            <p className="text-gray-600">
              Coba ubah filter atau kata kunci pencarian Anda
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
} 
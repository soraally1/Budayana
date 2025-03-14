import { motion } from "framer-motion";
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  Palette,
  Camera,
  ChevronRight,
  Target,
  Star,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Program() {
  const programs = [
    {
      id: 1,
      title: "Workshop Digitalisasi Budaya",
      description: "Pelajari teknik dan strategi untuk mendokumentasikan dan mempromosikan budaya Indonesia melalui media digital.",
      category: "Workshop",
      duration: "4 minggu",
      schedule: "Setiap Sabtu",
      location: "Studio Budayana",
      price: "Rp 2.500.000",
      icon: <Camera className="w-6 h-6" />,
      image: "/program/digital-culture.jpg",
      instructor: "Daffa Kumara"
    },
    {
      id: 2,
      title: "Kelas Pengembangan Platform Budaya",
      description: "Belajar mengembangkan platform digital untuk melestarikan dan mempromosikan budaya Indonesia.",
      category: "Kelas",
      duration: "12 minggu",
      schedule: "Setiap Minggu",
      location: "Online",
      price: "Rp 3.500.000",
      icon: <Palette className="w-6 h-6" />,
      image: "/program/platform-dev.jpg",
      instructor: "Erlangga Tresnamada"
    },
    {
      id: 3,
      title: "Kursus Content Creation Budaya",
      description: "Pelajari cara membuat konten digital yang menarik tentang budaya Indonesia.",
      category: "Kursus",
      duration: "8 minggu",
      schedule: "Setiap Jumat",
      location: "Studio Budayana",
      price: "Rp 2.800.000",
      icon: <Camera className="w-6 h-6" />,
      image: "/program/content-creation.jpg",
      instructor: "Tim Budayana"
    },
    {
      id: 4,
      title: "Workshop Event Management Budaya",
      description: "Pelajari cara mengelola dan mengorganisir event budaya yang sukses.",
      category: "Workshop",
      duration: "6 minggu",
      schedule: "Setiap Rabu",
      location: "Studio Budayana",
      price: "Rp 2.200.000",
      icon: <Users className="w-6 h-6" />,
      image: "/program/event-management.jpg",
      instructor: "Tim Budayana"
    },
  ];

  const features = [
    {
      icon: <Target className="w-8 h-8 text-[#5B2600]" />,
      title: "Pembelajaran Terstruktur",
      description: "Kurikulum yang dirancang khusus untuk memaksimalkan pemahaman dan keterampilan"
    },
    {
      icon: <Star className="w-8 h-8 text-[#5B2600]" />,
      title: "Instruktur Berpengalaman",
      description: "Dibimbing langsung oleh para ahli di bidangnya"
    },
    {
      icon: <Sparkles className="w-8 h-8 text-[#5B2600]" />,
      title: "Proyek Praktis",
      description: "Implementasi langsung melalui proyek-proyek nyata"
    },
  ];

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
            Program Budayana
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto"
          >
            Tingkatkan keahlian Anda dalam pelestarian dan promosi budaya melalui teknologi digital
          </motion.p>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 -mt-16 relative z-10">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="bg-[#EBE3D5] w-16 h-16 rounded-full flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-[#5B2600] mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Programs Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {programs.map((program, index) => (
            <motion.div
              key={program.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all group"
            >
              <div className="aspect-w-16 aspect-h-9 relative">
                <img
                  src={program.image}
                  alt={program.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x450?text=Program+Image';
                  }}
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-[#5B2600]">
                    {program.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-[#EBE3D5] p-2 rounded-lg">
                    {program.icon}
                  </div>
                  <h2 className="text-xl font-bold text-[#5B2600]">
                    {program.title}
                  </h2>
                </div>
                <p className="text-gray-600 mb-4">
                  {program.description}
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{program.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{program.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{program.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{program.instructor}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-[#5B2600]">{program.price}</span>
                  <Link
                    to={`/program/${program.id}`}
                    className="inline-flex items-center gap-2 text-[#5B2600] font-medium hover:text-[#8B4513] transition-colors group"
                  >
                    <span>Lihat Detail</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-[#5B2600] rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Mulai Perjalanan Digital Budaya Anda
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Bergabunglah dengan program kami dan jadilah bagian dari gerakan pelestarian budaya Indonesia melalui teknologi digital
            </p>
            <Link
              to="/contact"
              className="inline-block bg-white text-[#5B2600] px-8 py-3 rounded-xl font-medium hover:bg-[#EBE3D5] transition-colors"
            >
              Hubungi Kami
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
import { motion } from "framer-motion";
import { Users, Award, Heart, Globe, BookOpen, Sparkles, Target, Rocket } from "lucide-react";

export default function About() {
  const teamMembers = [
    {
      name: "Daffa Kumara Seta Rahmasina",
      role: "FullStack Developer",
      image: "/team/daffa.jpg", // Add actual image path
    },
    {
      name: "Erlangga Tresnamada Muliawan",
      role: "FrontEnd Developer",
      image: "/team/erlangga.jpg", // Add actual image path
    }
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8 text-[#5B2600]" />,
      title: "Pelestarian Budaya",
      description: "Dedikasi penuh untuk melestarikan dan memperkenalkan kekayaan budaya Indonesia kepada generasi muda."
    },
    {
      icon: <Users className="w-8 h-8 text-[#5B2600]" />,
      title: "Komunitas Inklusif",
      description: "Membangun komunitas yang inklusif dan kolaboratif untuk pertukaran pengetahuan budaya."
    },
    {
      icon: <Award className="w-8 h-8 text-[#5B2600]" />,
      title: "Kualitas Premium",
      description: "Menyajikan event dan program berkualitas tinggi dengan standar internasional."
    },
    {
      icon: <Globe className="w-8 h-8 text-[#5B2600]" />,
      title: "Jangkauan Global",
      description: "Membawa kebudayaan Indonesia ke panggung internasional melalui platform digital."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EBE3D5] via-[#FFD384]/10 to-[#EBE3D5] pt-20">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative bg-[#5B2600] text-white py-20"
      >
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Tentang Budayana
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto"
          >
            Platform inovatif yang menghubungkan generasi muda dengan kekayaan budaya Indonesia
          </motion.p>
        </div>
      </motion.div>

      {/* Vision & Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-8 shadow-xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-[#5B2600]/10 rounded-xl">
                <Target className="w-8 h-8 text-[#5B2600]" />
              </div>
              <h2 className="text-2xl font-bold text-[#5B2600]">Visi Kami</h2>
            </div>
            <p className="text-gray-600 text-lg">
              Menjadi platform terdepan dalam pelestarian dan pengembangan budaya Indonesia 
              melalui teknologi digital, menghubungkan generasi muda dengan warisan budaya bangsa.
            </p>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-8 shadow-xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-[#5B2600]/10 rounded-xl">
                <Rocket className="w-8 h-8 text-[#5B2600]" />
              </div>
              <h2 className="text-2xl font-bold text-[#5B2600]">Misi Kami</h2>
            </div>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-[#5B2600] flex-shrink-0 mt-1" />
                <span>Menghadirkan event budaya berkualitas yang menghibur dan edukatif</span>
              </li>
              <li className="flex items-start gap-2">
                <BookOpen className="w-5 h-5 text-[#5B2600] flex-shrink-0 mt-1" />
                <span>Memfasilitasi pembelajaran dan apresiasi budaya Indonesia</span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="w-5 h-5 text-[#5B2600] flex-shrink-0 mt-1" />
                <span>Membangun komunitas pecinta budaya yang aktif dan inklusif</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Values Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-[#5B2600]/5 rounded-3xl">
        <h2 className="text-3xl font-bold text-[#5B2600] mb-12 text-center">Nilai-Nilai Kami</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="bg-[#EBE3D5] w-16 h-16 rounded-full flex items-center justify-center mb-4">
                {value.icon}
              </div>
              <h3 className="text-xl font-bold text-[#5B2600] mb-2">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-[#5B2600] mb-12 text-center">Tim Pendiri</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group"
            >
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=Founder';
                  }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#5B2600] mb-1">{member.name}</h3>
                <p className="text-[#8B4513] font-medium mb-3">{member.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
} 
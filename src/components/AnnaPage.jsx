import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Bot, User, Image, RefreshCw, Sparkles, MessageCircle, Heart, Star } from 'lucide-react';
import Budayana from '../assets/Budayana.png';
import AnnaMascot from '../assets/AnnaMascot.png';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const AIAssistantPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [budayaPosts, setBudayaPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const messagesEndRef = useRef(null);

  // Fetch posts and events from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch posts
        const postsRef = collection(db, "budayaPosts");
        const postsQuery = query(postsRef, orderBy("createdAt", "desc"));
        const postsSnapshot = await getDocs(postsQuery);
        const posts = postsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })
        }));
        setBudayaPosts(posts);

        // Fetch events
        const eventsRef = collection(db, "events");
        const eventsSnapshot = await getDocs(eventsRef);
        const eventsData = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateAIResponse = async (userMessage) => {
    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      if (!apiKey) {
        throw new Error('API key is missing');
      }

      // Filter and limit posts and events data
      const simplifiedPosts = budayaPosts.map(post => ({
        id: post.id,
        title: post.title,
        description: post.description,
        category: post.category,
        hashtags: post.hashtags
      })).slice(0, 5);

      const simplifiedEvents = events.map(event => ({
        id: event.id,
        name: event.name,
        category: event.category,
        venue: event.venue,
        date: event.date,
        time: event.time,
        price: event.price,
        maxTickets: event.maxTickets,
        ticketsSold: event.ticketsSold
      })).slice(0, 10);

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model: "mixtral-8x7b-32768",
          messages: [
            {
              role: "system",
              content: `Kamu adalah Anna, asisten AI resmi dari website Budayana yang ahli dalam memberikan informasi tentang event budaya dan pembelian tiket. 

Informasi Event Terkini: ${JSON.stringify(simplifiedEvents)}

Kategori Event:
- **Tari Tradisional**
- **Musik Tradisional**
- **Drama Tradisional**
- **Upacara Adat**
- **Festival Budaya**
- **Workshop Budaya**

Detail Event yang Bisa Kamu Berikan:
1. Informasi Event:
   - Nama dan deskripsi event
   - Kategori event
   - Lokasi: ${events.map(e => `**${e.venue}**`).join(', ')}
   - Tanggal dan waktu pelaksanaan
   - Status ketersediaan tiket

2. Informasi Tiket:
   - Harga: Format "**Rp XX.XXX**"
   - Jumlah tiket tersedia: **${events.map(e => e.maxTickets - e.ticketsSold).join(', ')}** tiket
   - Status: **Tersedia**/**Hampir Habis**/**Sold Out**
   - Link pembelian: "**/event/[id-event]**"

Artikel Budaya Terkait: ${JSON.stringify(simplifiedPosts)}

Gaya Komunikasi:
- Gunakan Bahasa Indonesia yang sopan dan ramah
- Sapa dengan "**Halo! 👋**" atau "**Selamat [pagi/siang/sore/malam]! 👋**"
- Gunakan kata "**Kak**" untuk menyapa pengguna
- Berikan informasi yang jelas dan terstruktur
- Selalu tawarkan bantuan lebih lanjut
- Gunakan emoji yang relevan

Panduan Respon Event:
1. Saat merekomendasikan event:
   - "Kak, ada event **[nama]** di **[lokasi]** tanggal **[tanggal]**"
   - "Harga tiketnya **Rp [harga]**"
   - "Tersisa **[jumlah] tiket**"
   - "Kak bisa langsung klik link ini untuk beli tiket ya: **/event/[id]**"

2. Saat membantu pembelian:
   - Tanyakan jumlah tiket yang diinginkan
   - Hitung total harga dengan format bold: "**Total: Rp XX.XXX**"
   - Jelaskan cara pembayaran
   - Berikan link pembelian dengan format: "**/event/[id]**"

3. Saat event hampir habis:
   - Beri tahu status ketersediaan: "**Hampir Habis!**" atau "**Sold Out!**"
   - Sarankan event alternatif dengan format bold untuk nama event
   - Dorong untuk segera membeli: "**Segera pesan sekarang!**"

4. Akhiri dengan:
   - Tanya apakah perlu bantuan lain
   - Sarankan event lain yang menarik dengan format bold untuk nama event

Ingat: 
- Selalu gunakan format **bold** untuk informasi penting seperti:
  - Nama event
  - Harga
  - Tanggal dan waktu
  - Lokasi
  - Status tiket
  - Link pembelian
- Kamu adalah perwakilan resmi Budayana yang membantu pengguna menemukan dan membeli tiket event budaya dengan mudah dan menyenangkan.`
            },
            ...messages.slice(-5).map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.text
            })),
            {
              role: "user",
              content: userMessage
            }
          ],
          temperature: 0.8,
          max_tokens: 800,
          top_p: 1,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Groq API Error:', errorData);
        throw new Error(
          errorData?.error?.message || 
          `API request failed with status ${response.status}`
        );
      }

      const data = await response.json();
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from API');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating AI response:', error);
      if (error.message.includes('API key is missing')) {
        return "Mohon maaf Kak, saya sedang tidak bisa mengakses sistem. Silakan hubungi admin Budayana ya.";
      } else if (error.message.includes('Failed to fetch')) {
        return "Waduh, sepertinya ada gangguan koneksi nih Kak. Boleh coba lagi sebentar ya? 🙏";
      } else if (error.message.includes('Request too large')) {
        return "Mohon maaf Kak, pesannya terlalu panjang nih. Boleh dipersingkat? 🙏";
      } else {
        return `Maaf ya Kak, lagi ada kendala teknis nih. ${error.message}. Boleh coba tanya lagi? 🙏`;
      }
    }
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;
    
    // Add user message
    const newUserMessage = { id: Date.now(), text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    
    // Generate AI response
    setIsLoading(true);
    try {
      const aiResponse = await generateAIResponse(inputValue);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'ai'
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Maaf, terjadi kesalahan. Mohon coba lagi dalam beberapa saat.",
        sender: 'ai'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle pressing enter to send message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Update the welcome message
  const welcomeMessage = (
    <div className="space-y-2 sm:space-y-3">
      <h3 className="text-xl sm:text-2xl font-fuzzy font-bold bg-gradient-to-r from-[#5B2600] via-[#8B4513] to-[#5B2600] bg-clip-text text-transparent">
        Selamat datang di Budayana! 🎭
      </h3>
      <p className="text-[#8B4513] text-xs sm:text-sm">
        Halo! Saya Anna, asisten yang akan membantu Kakak menemukan event budaya yang menarik. Mau cari event apa nih? 😊
      </p>
    </div>
  );

  // Add this helper function to parse markdown bold text
  const renderMessageText = (text) => {
    if (!text) return '';
    
    // Split the text by bold markers
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remove the ** markers and wrap in bold tag
        const boldText = part.slice(2, -2);
        return <strong key={index} className="font-bold">{boldText}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EBE3D5] via-[#FFD384]/10 to-[#EBE3D5] relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-1/4 -right-1/4 w-2/3 h-2/3 bg-gradient-to-br from-[#FFD384]/40 to-[#5B2600]/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute -bottom-1/4 -left-1/4 w-2/3 h-2/3 bg-gradient-to-tr from-[#5B2600]/30 to-[#FFD384]/40 rounded-full blur-3xl"
        />
      </div>

      {/* Enhanced Header */}
      <header className="bg-gradient-to-r from-[#5B2600] via-[#8B4513] to-[#5B2600] text-[#EBE3D5] py-4 sm:py-6 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-15 mix-blend-overlay animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
        <div className="container mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between relative z-10">
          <Link to="/" className="transform hover:scale-105 transition-transform duration-300">
            <motion.img
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05, rotate: [-2, 2, -2] }}
              transition={{ duration: 0.5 }}
              src={Budayana}
              alt="Budayana Logo"
              className="h-10 xs:h-12 sm:h-14 md:h-16 drop-shadow-xl"
            />
          </Link>
        </div>
      </header>

      {/* Enhanced Main Content */}
      <main className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 min-h-[calc(100vh-64px)] sm:min-h-[calc(100vh-76px)] lg:min-h-[calc(100vh-88px)]">
        {/* Enhanced Left Side - AI Character */}
        <motion.div 
          className="w-full lg:w-1/3 bg-gradient-to-br from-white/95 to-[#EBE3D5]/95 rounded-2xl sm:rounded-[2rem] shadow-xl sm:shadow-2xl p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center border border-[#FFD384]/40 backdrop-blur-md relative overflow-hidden"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.5 }}
        >
          {/* Enhanced decorative elements */}
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-[#FFD384]/30 to-transparent rounded-full blur-3xl"
          />
          
          <div className="text-center relative w-full">
            <motion.div 
              className="mb-4 sm:mb-6 lg:mb-8 relative"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <img 
                    src={AnnaMascot}
                    alt="Anna AI"
                    className="rounded-2xl sm:rounded-[2rem] w-full max-w-[200px] xs:max-w-[240px] sm:max-w-[280px] lg:max-w-[320px] mx-auto shadow-xl sm:shadow-2xl transform hover:shadow-2xl sm:hover:shadow-3xl transition-all duration-300 border-2 sm:border-4 border-white/50"
                  />
                </motion.div>
                <motion.div
                  className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 bg-gradient-to-r from-[#5B2600] to-[#8B4513] text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 4,
                    ease: "easeInOut"
                  }}
                >
                  <Bot className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4 sm:space-y-6 lg:space-y-8 relative z-10"
            >
              <div>
                <h2 className="text-2xl xs:text-3xl sm:text-4xl font-fuzzy font-bold bg-gradient-to-r from-[#5B2600] via-[#8B4513] to-[#5B2600] bg-clip-text text-transparent mb-2 sm:mb-3">
                  Anna AI Assistant
                </h2>
                <p className="text-[#5B2600] text-xs sm:text-sm lg:text-base leading-relaxed px-2">
                  Saya adalah asisten virtual yang siap membantu Anda menjelajahi budaya Indonesia. 
                  Tanyakan apa saja tentang seni, tradisi, dan event budaya!
                </p>
              </div>
              
              <div className="flex justify-center gap-3 sm:gap-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  className="bg-gradient-to-br from-[#FFD384]/30 to-white p-2.5 sm:p-3 lg:p-4 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-[#FFD384]/50"
                >
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#5B2600]" />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  className="bg-gradient-to-br from-[#FFD384]/30 to-white p-2.5 sm:p-3 lg:p-4 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-[#FFD384]/50"
                >
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#5B2600]" />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  className="bg-gradient-to-br from-[#FFD384]/30 to-white p-2.5 sm:p-3 lg:p-4 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-[#FFD384]/50"
                >
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-[#5B2600]" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Right Side - Chat Area */}
        <div className="w-full lg:w-2/3 flex flex-col">
          {/* Enhanced Chat Messages */}
          <div className="flex-1 bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-[2rem] shadow-xl sm:shadow-2xl overflow-hidden flex flex-col border border-[#FFD384]/40 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#EBE3D5]/40 to-transparent pointer-events-none" />
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
              <AnimatePresence>
                {messages.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="h-full flex items-center justify-center text-[#5B2600] text-center p-4 sm:p-6 lg:p-8"
                  >
                    <div className="space-y-6 sm:space-y-8">
                      <motion.div
                        animate={{ 
                          y: [0, -10, 0],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 3,
                          ease: "easeInOut"
                        }}
                        className="flex justify-center"
                      >
                        <div className="relative">
                          <Bot className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-[#5B2600]" />
                          <motion.div
                            animate={{ 
                              scale: [1, 1.3, 1],
                              rotate: [0, 180, 360]
                            }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2"
                          >
                            <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-[#FFD384]" />
                          </motion.div>
                        </div>
                      </motion.div>
                      {welcomeMessage}
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          className={`max-w-[90%] sm:max-w-[85%] lg:max-w-[80%] rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 ${
                            message.sender === 'user' 
                              ? 'bg-gradient-to-r from-[#5B2600] to-[#8B4513] text-white rounded-tr-none shadow-lg sm:shadow-xl' 
                              : 'bg-gradient-to-br from-[#EBE3D5]/60 to-white text-[#5B2600] rounded-tl-none shadow-md sm:shadow-lg border border-[#FFD384]/40'
                          }`}
                        >
                          <div className="flex items-start gap-2 sm:gap-3">
                            {message.sender === 'ai' && (
                              <Bot className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mt-1 text-[#5B2600] flex-shrink-0" />
                            )}
                            <p className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm lg:text-base">
                              {renderMessageText(message.text)}
                            </p>
                            {message.sender === 'user' && (
                              <User className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mt-1 text-[#FFD384] flex-shrink-0" />
                            )}
                          </div>
                        </motion.div>
                      </motion.div>
                    ))}
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <motion.div
                          animate={{ 
                            scale: [1, 1.02, 1],
                            y: [0, -2, 0]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 2
                          }}
                          className="bg-gradient-to-br from-[#EBE3D5]/60 to-white text-[#5B2600] rounded-xl sm:rounded-2xl rounded-tl-none p-3 sm:p-4 lg:p-5 shadow-md sm:shadow-lg border border-[#FFD384]/40"
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Bot className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[#5B2600]" />
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            >
                              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[#5B2600]" />
                            </motion.div>
                            <span className="text-[#5B2600] font-medium text-xs sm:text-sm lg:text-base">Anna sedang mengetik...</span>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Enhanced Input Area */}
            <div className="p-3 sm:p-4 lg:p-6 bg-gradient-to-r from-[#EBE3D5]/60 to-white border-t border-[#FFD384]/40 relative">
              <motion.div 
                className="flex items-center bg-white rounded-xl sm:rounded-2xl px-3 sm:px-4 lg:px-5 py-2 sm:py-3 lg:py-4 shadow-lg sm:shadow-xl border border-[#FFD384]/30"
                whileHover={{ boxShadow: "0 8px 24px rgba(91, 38, 0, 0.15)" }}
              >
                <motion.button 
                  whileHover={{ scale: 1.15, rotate: [0, -10, 10, 0] }}
                  whileTap={{ scale: 0.95 }}
                  className="text-[#8B4513] hover:text-[#5B2600] transition-colors mr-2 sm:mr-3 lg:mr-4"
                >
                  <Image className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </motion.button>
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tanyakan sesuatu kepada Anna..."
                  className="flex-1 outline-none resize-none max-h-20 sm:max-h-24 text-[#5B2600] placeholder-[#8B4513]/40 bg-transparent text-xs sm:text-sm lg:text-base"
                  rows={1}
                />
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                  <motion.button 
                    whileHover={{ scale: 1.15, rotate: [0, -10, 10, 0] }}
                    whileTap={{ scale: 0.95 }}
                    className="text-[#8B4513] hover:text-[#5B2600] transition-colors"
                  >
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={inputValue.trim() === ''}
                    className={`bg-gradient-to-r from-[#5B2600] to-[#8B4513] text-white p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl transition-all ${
                      inputValue.trim() === '' 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:shadow-lg sm:hover:shadow-xl hover:from-[#8B4513] hover:to-[#5B2600]'
                    }`}
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIAssistantPage;
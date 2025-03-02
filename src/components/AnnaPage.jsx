import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, Bot, User, Image, RefreshCw } from 'lucide-react';
import Budayana from '../assets/Budayana.png';
import AnnaMascot from '../assets/AnnaMascot.png';
import { Link } from 'react-router-dom';

const AIAssistantPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle sending a message
  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    
    // Add user message
    const newUserMessage = { id: Date.now(), text: inputValue, sender: 'user' };
    setMessages([...messages, newUserMessage]);
    setInputValue('');
    
    // Simulate AI response
    setIsLoading(true);
    setTimeout(() => {
      const aiResponse = { 
        id: Date.now() + 1, 
        text: `Ini adalah respons dari AI untuk: "${inputValue}"`, 
        sender: 'ai' 
      };
      setMessages(prevMessages => [...prevMessages, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  // Handle pressing enter to send message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-[#5B2600] text-amber-50 py-7 shadow-md">
        <div className="container mx-auto flex items-center">
          <motion.div
            initial={{ rotate: -10, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
         
          </motion.div>
          <Link to="/">
          
          <img src={Budayana} alt=""  className='w-1/6 mx-auto'/>
          </Link>
        </div>
      </header>

      {/* Main Content with Side-by-Side Layout */}
      <main className="container mx-auto p-4 flex flex-col md:flex-row gap-6 h-[calc(100vh-80px)]">
        {/* Left Side - AI Character Display */}
        <motion.div 
          className="md:w-1/3 bg-amber-100 rounded-lg shadow-lg p-6 flex flex-col items-center justify-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <div className="mb-6 relative">
              <img 
                src={AnnaMascot}
                alt="AI Character" 
                className="rounded-lg w-full max-w-xl mx-auto shadow-lg "
              />
              <motion.div
                className="absolute -bottom-4 -right-4 bg-amber-600 text-white p-3 rounded-full shadow-lg"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <Bot size={24} />
              </motion.div>
            </div>
            
            {/* <h2 className="text-2xl font-bold text-amber-800 mt-4">AI Assistant</h2> */}
            <p className="text-amber-700 mt-2">Asisten virtual pintar siap membantu Anda</p>
            
            
          </div>
        </motion.div>

        {/* Right Side - Chat Area */}
        <div className="md:w-2/3 flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 bg-amber-100 rounded-lg shadow-inner overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-amber-700 text-center p-8">
                  <div>
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="flex justify-center mb-4"
                    >
                      <Bot size={48} />
                    </motion.div>
                    <p className="text-lg">Selamat datang! Kirim pesan untuk memulai percakapan dengan AI.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-3/4 rounded-lg p-3 ${
                        message.sender === 'user' 
                          ? 'bg-amber-600 text-white rounded-tr-none' 
                          : 'bg-amber-200 text-amber-900 rounded-tl-none'
                      }`}>
                        <div className="flex items-start">
                          {message.sender === 'ai' && (
                            <Bot size={20} className="mr-2 mt-1 text-amber-700 flex-shrink-0" />
                          )}
                          <p className="whitespace-pre-wrap">{message.text}</p>
                          {message.sender === 'user' && (
                            <User size={20} className="ml-2 mt-1 text-amber-200 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-amber-200 text-amber-900 rounded-lg rounded-tl-none p-3">
                        <div className="flex items-center space-x-2">
                          <Bot size={20} className="text-amber-700" />
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          >
                            <RefreshCw size={18} className="text-amber-700" />
                          </motion.div>
                          <span>Sedang mengetik...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-amber-200 border-t border-amber-300">
              <div className="flex items-center bg-white rounded-lg px-3 py-2 shadow-sm">
                <button className="text-amber-600 hover:text-amber-800 transition-colors mr-2">
                  <Image size={20} />
                </button>
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Kirim pesan ke AI..."
                  className="flex-1 outline-none resize-none max-h-20 text-amber-900"
                  rows={1}
                />
                <div className="flex items-center">
                  <button className="text-amber-600 hover:text-amber-800 transition-colors mr-2">
                    <Mic size={20} />
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={inputValue.trim() === ''}
                    className={`bg-amber-600 text-white p-2 rounded-full transition-colors ${
                      inputValue.trim() === '' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-700'
                    }`}
                  >
                    <Send size={18} />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIAssistantPage;
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Send, Zap, MessageCircle, Lightbulb } from 'lucide-react'; // Added Lightbulb
import './ChatBot.css'; 
import botAvatar from './assets/bot-avatar.png'; 

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true); 
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Hello! I'm SOLIX. Ask me about solar costs, rates, or your roof potential." }
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setShowTooltip(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    const newHistory = [...messages, userMsg];
    
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/chat', {
        message: input,
        history: newHistory
      });
      setMessages([...newHistory, { role: 'bot', content: response.data.reply }]);
    } catch (error) {
      setMessages([...newHistory, { role: 'bot', content: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 999999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      pointerEvents: 'none',
      gap: '8px' // Space between bubble and head
    }}>
      
      {/* --- 1. SPEECH BUBBLE (Matches your reference) --- */}
      {!isOpen && showTooltip && (
        <div 
          className="chat-tooltip-bubble"
          onClick={handleToggle}
          style={{ pointerEvents: 'auto' }}
        >
          {/* Lightbulb Icon */}
          <div className="icon-glow">
             <Lightbulb size={24} color="#fde047" fill="#fde047" /> {/* Yellow filled bulb */}
          </div>
          
          {/* Text Content */}
          <div className="bubble-text">
             <span className="bubble-title">Hi there! How can I</span>
             <span className="bubble-subtitle">help you today?</span>
          </div>

          {/* Close X (Optional, keeping it subtle) */}
          <button className="bubble-close" onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* --- 2. CHAT WINDOW (Open State) --- */}
      {isOpen && (
        <div className="chat-window" style={{ pointerEvents: 'auto', marginBottom: '10px' }}>
           <div className="chat-header">
             <div className="flex items-center gap-2">
               <Zap size={18} fill="currentColor" />
               <span className="font-bold">SOLIX Assistant</span>
             </div>
             <button onClick={handleToggle} className="hover:bg-white/20 p-1 rounded">
               <X size={18} />
             </button>
           </div>

           <div className="chat-messages">
             {messages.map((msg, i) => (
               <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`message-bubble ${msg.role === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                   {msg.content}
                 </div>
               </div>
             ))}
             {loading && <div className="text-xs text-slate-400 p-2">Thinking...</div>}
             <div ref={messagesEndRef} />
           </div>

           <div className="chat-input-area">
             <div className="relative flex items-center">
               <input 
                 className="chat-input-field"
                 placeholder="Type a message..."
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               />
               <button onClick={handleSend} className="chat-send-btn">
                 <Send size={18} />
               </button>
             </div>
           </div>
        </div>
      )}

      {/* --- 3. FLOATING AVATAR (Transparent Button) --- */}
      <button 
        onClick={handleToggle}
        className="floating-avatar-btn" // New CSS Class
        style={{ pointerEvents: 'auto' }}
      >
        {isOpen ? (
           // When open, show a simple round X button
           <div className="close-circle-btn">
             <X size={24} color="white" />
           </div>
        ) : (
           // When closed, show the Floating Robot
           <img 
              src={botAvatar} 
              alt="AI" 
              className="floating-robot-img"
              onError={(e) => {
                  e.target.style.display='none'; 
                  e.target.nextSibling.style.display='flex';
              }}
           />
        )}
        
        {/* Fallback if image fails */}
        <div className="fallback-avatar">
           <MessageCircle size={32} />
        </div>
      </button>

    </div>
  );
};

export default ChatBot;
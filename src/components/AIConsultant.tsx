
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { geminiService } from '@/services/geminiService';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const AIConsultant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Halo! Saya adalah asisten AI Nusantara Industries. Ada yang bisa saya bantu terkait data atau kebijakan hilirisasi nasional hari ini?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const aiResponse = await geminiService.getHilirisasiInsights(userMessage);
    
    setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
          <Bot size={24} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">AI Konsultan Industri</h1>
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Siap menganalisis data hilirisasi
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-6 mb-4">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              msg.role === 'ai' ? 'bg-blue-900 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {msg.role === 'ai' ? <Bot size={20} /> : <User size={20} />}
            </div>
            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
              msg.role === 'ai' 
                ? 'bg-white text-slate-800 border border-slate-100' 
                : 'bg-blue-600 text-white'
            }`}>
              {msg.role === 'ai' && (
                <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-blue-600 mb-1">
                  <Sparkles size={10} />
                  Analisis AI
                </div>
              )}
              <div className="text-sm whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
              <Bot size={20} />
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2">
              <Loader2 className="animate-spin text-blue-600" size={18} />
              <span className="text-sm text-slate-500">Sedang menganalisis data...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="relative">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Tanyakan dampak pelarangan ekspor bijih nikel..."
          className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg text-slate-700"
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-900 text-white rounded-xl flex items-center justify-center hover:bg-blue-800 transition-colors disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
      <p className="text-center text-xs text-slate-400 mt-4">
        Asisten AI mungkin memberikan informasi yang perlu divalidasi dengan data resmi BPS atau ESDM.
      </p>
    </div>
  );
};

export default AIConsultant;

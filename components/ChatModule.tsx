
import React, { useState, useRef, useEffect } from 'react';
import { Chat } from "@google/genai";
import { ChatMessage } from '../types';
import { createChatSession, streamChatResponse } from '../services/geminiService';

const ChatModule: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: '你好呀！我是你的红薯运营助手 👋。\n有什么关于小红书运营、选题、或者涨粉的疑问吗？都可以问我哦！',
      timestamp: Date.now()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatSessionRef.current) {
      chatSessionRef.current = createChatSession();
    }
    scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!inputText.trim() || isTyping || !chatSessionRef.current) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // Create a placeholder for the AI response
      const aiMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: aiMsgId,
        role: 'model',
        text: '',
        timestamp: Date.now()
      }]);

      let fullResponse = '';
      const stream = streamChatResponse(chatSessionRef.current, userMsg.text);
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === aiMsgId ? { ...msg, text: fullResponse } : msg
        ));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-40px)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ff2442] to-[#ff5c7c] flex items-center justify-center text-white text-xs font-bold">
            AI
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">红薯运营助手</h3>
            <p className="text-[10px] text-green-500 flex items-center">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></span>
              在线中
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white
                ${msg.role === 'user' ? 'bg-gray-800' : 'bg-[#ff2442]'}
              `}>
                {msg.role === 'user' ? '我' : 'AI'}
              </div>

              {/* Bubble */}
              <div className={`px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-gray-800 text-white rounded-tr-sm' 
                  : 'bg-white text-gray-700 border border-gray-100 rounded-tl-sm'
                }
              `}>
                {msg.text}
                {msg.role === 'model' && msg.text === '' && (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-end gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:border-[#ff2442] focus-within:ring-1 focus-within:ring-[#ff2442]/20 transition-all">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="问问AI怎么写标题..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 resize-none max-h-32 p-2"
            rows={1}
            style={{ minHeight: '40px' }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isTyping}
            className={`p-2 rounded-lg flex-shrink-0 transition-colors
              ${!inputText.trim() || isTyping 
                ? 'bg-gray-200 text-gray-400' 
                : 'bg-[#ff2442] text-white hover:bg-[#e61e3a]'
              }
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
        <div className="text-center mt-2">
            <p className="text-[10px] text-gray-400">内容由 AI 生成，仅供参考</p>
        </div>
      </div>
    </div>
  );
};

export default ChatModule;

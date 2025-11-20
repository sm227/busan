"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { ArrowLeft, Send, Sparkles, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// 메시지 타입 정의
interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

// 초기 추천 질문 리스트
const SUGGESTED_QUESTIONS = [
  "💰 귀농귀촌 지원금은 얼마나 받을 수 있어?",
  "🚜 초보자가 농사 짓기 좋은 작물 추천해줘",
  "🏠 시골 빈집 구할 때 주의할 점은?",
  "👋 마을 텃세가 걱정되는데 조언해줘"
];

export default function AIConsultationPage() {
  const router = useRouter();
  const { userPreferences } = useApp();

  // 1. 상태 관리
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      content: '안녕하세요! 제 이름은 보리에요.\n시골 생활에 대해 무엇이든 물어보세요 🌱',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 스크롤 제어용 Ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 대화 시작 여부 확인 (기본 인사말 외에 메시지가 추가되면 시작된 것으로 간주)
  const isChatStarted = messages.length > 1;

  // 2. 스크롤 자동 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isChatStarted]);

  // 3. 메시지 전송 함수
  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: Date.now().toString(),
      content: text.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          context: {
            userPreferences,
            currentLocation: "서울", // 추후 실제 위치로 변경 가능
            previousMessages: messages.slice(-5).map(m => `${m.isUser ? '사용자' : 'AI'}: ${m.content}`)
          }
        })
      });

      const data = await response.json();
      
      if (response.ok && data.response) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || '응답 오류');
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '죄송합니다. 잠시 후 다시 시도해주세요.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  // 4. UI 렌더링
  return (
    // 전체 화면 높이 고정 (스크롤 방지)
    <div className="h-screen bg-[#F5F5F0] overflow-hidden font-sans text-stone-800 flex flex-col">
      <div className="max-w-md mx-auto w-full bg-white h-full relative shadow-xl flex flex-col">
        
        {/* 헤더 (고정) */}
        <div className="shrink-0 bg-white/90 backdrop-blur-md border-b border-stone-100 px-4 py-3 flex items-center gap-3 z-10">
          <button
            onClick={() => router.push("/")}
            className="p-2 -ml-2 text-stone-500 hover:bg-stone-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="font-sans font-bold text-lg text-stone-800">AI 상담</span>
        </div>

        {/* 채팅 영역 (스크롤 가능) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide bg-[#FDFBF7]">
          
          {/* A. 초기 가이드 화면 (대화 시작 전까지만 표시) */}
          {!isChatStarted && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* 캐릭터 */}
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 bg-stone-100 rounded-full animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center bg-white rounded-full border border-stone-100 shadow-sm overflow-hidden">
                   <Image src="/logo.png" alt="AI" width={80} height={80} className="object-contain" priority />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white">
                  AI
                </div>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-xl font-serif font-bold text-stone-800 mb-2">
                  무엇이든 물어보세요
                </h2>
                <p className="text-stone-500 text-sm leading-relaxed">
                  시골 생활, 지원 정책, 이사 준비까지<br/>
                  24시간 답변해드립니다.
                </p>
              </div>

              {/* 추천 질문 리스트 */}
              <div className="w-full max-w-xs space-y-2.5">
                 {SUGGESTED_QUESTIONS.map((q, i) => (
                   <button
                     key={i}
                     onClick={() => sendMessage(q)}
                     className="w-full text-left text-xs p-3.5 bg-white border border-stone-200 hover:border-stone-400 text-stone-600 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-between group"
                   >
                     <span>{q}</span>
                     <ChevronRight className="w-3 h-3 text-stone-300 group-hover:text-stone-500" />
                   </button>
                 ))}
              </div>
            </div>
          )}

          {/* B. 실제 대화 내용 (대화 시작 후) */}
          {isChatStarted && (
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start items-end gap-2'}`}
                >
                  {/* AI 프로필 (왼쪽) */}
                  {!message.isUser && (
                    <div className="w-8 h-8 relative shrink-0 mb-4">
                      <div className="absolute inset-0 bg-white rounded-full border border-stone-200 shadow-sm overflow-hidden">
                         <Image src="/logo.png" alt="AI" fill className="object-contain p-1" />
                      </div>
                    </div>
                  )}

                  <div className={`max-w-[80%] space-y-1 ${message.isUser ? 'items-end' : 'items-start'}`}>
                    {/* 말풍선 */}
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                      message.isUser 
                        ? 'bg-stone-800 text-white rounded-br-none' 
                        : 'bg-white text-stone-700 border border-stone-200 rounded-bl-none'
                    }`}>
                      {message.content}
                    </div>
                    
                    {/* 시간 */}
                    <span className={`text-[10px] block px-1 ${
                       message.isUser ? 'text-right text-stone-400' : 'text-left text-stone-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* 로딩 중 표시 */}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-end gap-2">
              <div className="w-8 h-8 relative shrink-0 mb-2">
                 <div className="absolute inset-0 bg-white rounded-full border border-stone-200 shadow-sm overflow-hidden">
                    <Image src="/logo.png" alt="AI" fill className="object-contain p-1" />
                 </div>
              </div>
              <div className="bg-white border border-stone-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 (하단 고정) */}
        <div className="shrink-0 p-4 bg-white border-t border-stone-100 pb-safe">
          <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="메시지를 입력하세요..."
                className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent resize-none max-h-24 min-h-[48px]"
                rows={1}
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2 text-stone-800 hover:text-stone-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
// src/app/page.tsx

'use client';

import { useState, useRef, useEffect } from 'react';

// 채팅 메시지의 타입을 정의합니다.
interface Message {
  // Gemini API의 역할(role)과 맞추는 것이 좋습니다.
  role: 'user' | 'model';
  text: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: userInput };
    const newMessages = [...messages, userMessage];

    setMessages([...newMessages, { role: 'model', text: '' }]);
    setUserInput('');
    setIsLoading(true);

    try {
      // 단일 응답 API('/api/chat/simple')를 호출합니다.
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/simple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ history: newMessages }),
      });

      if (!response.ok) { throw new Error('서버 응답 오류'); }

      const data = await response.json();
      const fullText = data.response; // 완전한 문장

      // 타이핑 효과를 위한 로직
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < fullText.length) {
          setMessages(prev => {
            const updatedMessages = [...prev];
            updatedMessages[updatedMessages.length - 1].text = fullText.substring(0, currentIndex + 1);
            return updatedMessages;
          });
          currentIndex++;
        } else {
          clearInterval(interval);
          setIsLoading(false);
        }
      }, 50); // 50ms 마다 한 글자씩 표시 (속도 조절 가능)

    } catch (error) {
      console.error("API 호출 오류:", error);
      const errorMessage: Message = { role: 'model', text: '죄송해요, 지금은 대화할 수 없어요.' };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
      setIsLoading(false);
    }
  };

  return (
      <main className="flex flex-col h-screen bg-gray-100">
        <header className="bg-white shadow-md p-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800">캐릭터 챗</h1>
        </header>

        {/* 채팅 메시지 표시 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-pink-300 flex items-center justify-center text-lg">🐱</div>}
                <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                    msg.role === 'user'
                        ? 'bg-blue-500 text-white rounded-br-none'
                        // AI가 답변 중일 때(text가 비어있을 때) 로딩 애니메이션을 보여줍니다.
                        : msg.text ? 'bg-white text-gray-800 rounded-bl-none' : 'bg-transparent'
                }`}>
                  {msg.role === 'model' && !msg.text && isLoading ? (
                      <div className="flex space-x-1 p-2">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      </div>
                  ) : (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                  )}
                </div>
              </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* 메시지 입력 폼 */}
        <footer className="bg-white p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="메시지를 입력하세요..."
                className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                disabled={isLoading}
            />
            <button
                type="submit"
                className="px-6 py-3 bg-blue-500 text-white rounded-full disabled:bg-gray-400 hover:bg-blue-600 transition-colors"
                disabled={isLoading}
            >
              전송
            </button>
          </form>
        </footer>
      </main>
  );
}

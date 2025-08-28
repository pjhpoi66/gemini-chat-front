// src/app/page.tsx

'use client';

import { useState, useRef, useEffect } from 'react';

// 채팅 메시지의 타입을 정의합니다.
interface Message {
  sender: 'user' | 'character';
  text: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 채팅창이 길어지면 자동으로 스크롤을 맨 아래로 내립니다.
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 메시지 전송 함수 (스트리밍 로직으로 수정)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: userInput };
    // 사용자 메시지와 캐릭터의 답변을 받을 빈 메시지를 함께 추가합니다.
    setMessages(prev => [...prev, userMessage, { sender: 'character', text: '' }]);
    setUserInput('');
    setIsLoading(true);

    try {
      // 1. 스트리밍을 지원하는 백엔드 API로 요청을 보냅니다.
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userInput }),
      });

      if (!response.ok) {
        throw new Error('서버에서 응답을 받지 못했습니다.');
      }

      // 2. ReadableStream을 통해 데이터 읽기
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('스트림을 읽을 수 없습니다.');
      }

      const decoder = new TextDecoder();

      // 스트림이 끝날 때까지 계속해서 데이터를 읽습니다.
      while (true) {
        const { done, value } = await reader.read();
        if (done) break; // 스트림 종료

        const chunk = decoder.decode(value);
        // 받은 데이터 조각을 마지막 메시지(캐릭터 답변)에 계속 추가합니다.
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          lastMessage.text += chunk;
          return [...prev];
        });
      }

    } catch (error) {
      console.error("API 호출 오류:", error);
      const errorMessage: Message = { sender: 'character', text: '죄송해요, 지금은 대화할 수 없어요... 흥!' };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]); // 기존 빈 메시지를 에러 메시지로 교체
    } finally {
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
              <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'character' && <div className="w-8 h-8 rounded-full bg-pink-300 flex items-center justify-center text-lg">🐱</div>}
                <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                    msg.sender === 'user'
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none'
                }`}>
                  {/* 텍스트에 white-space: pre-wrap을 적용하여 줄바꿈이 올바르게 표시되도록 합니다. */}
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
          ))}
          {/* 로딩 인디케이터는 이제 사용하지 않습니다. */}
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
                className="flex-1 p-3 border rounded-full text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
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

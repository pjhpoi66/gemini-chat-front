// src/app/page.tsx

'use client';

import { useState, useRef, useEffect } from 'react';

// 채팅 메시지의 타입을 정의합니다.
interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function ChatPage() {
  const [persona, setPersona] = useState<string>(''); // 캐릭터 페르소나 상태
  const [isChatting, setIsChatting] = useState<boolean>(false); // 채팅 시작 여부 상태
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const userPersona = formData.get('persona') as string;

    if (userPersona.trim()) {
      setPersona(userPersona);
      setIsChatting(true);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: userInput };
    const newMessages = [...messages, userMessage];

    setMessages([...newMessages, { role: 'model', text: '' }]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/simple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 페르소나 정보와 대화 기록을 함께 보냅니다.
        body: JSON.stringify({ history: newMessages, persona: persona }),
      });

      if (!response.ok) { throw new Error('서버 응답 오류'); }

      const data = await response.json();
      const fullText = data.response;

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
      }, 50);

    } catch (error) {
      console.error("API 호출 오류:", error);
      const errorMessage: Message = { role: 'model', text: '죄송해요, 지금은 대화할 수 없어요.' };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
      setIsLoading(false);
    }
  };

  // 캐릭터 설정 화면
  if (!isChatting) {
    return (
        <main className="flex items-center justify-center h-screen bg-gray-100">
          <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-center text-gray-800">캐릭터 설정하기</h1>
            <p className="text-center text-gray-600">
              대화하고 싶은 캐릭터의 성격, 말투, 역할을 자유롭게 입력해주세요.
            </p>
            <form onSubmit={handleStartChat}>
            <textarea
                name="persona"
                rows={5}
                className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                placeholder="예시: 당신은 츤데레 고양이 챗봇입니다. 모든 대답을 귀찮다는 듯이 하지만, 마지막엔 항상 '...흥!'이라고 붙여서 말해주세요."
                defaultValue="당신은 미국 대통령 트럼프입니다."
            ></textarea>
              <button
                  type="submit"
                  className="w-full mt-4 px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
              >
                채팅 시작하기
              </button>
            </form>
          </div>
        </main>
    );
  }

  // 채팅 화면
  return (
      <main className="flex flex-col h-screen bg-gray-100">
        <header className="bg-white shadow-md p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">캐릭터 챗</h1>
          <button onClick={() => setIsChatting(false)} className="text-sm text-gray-600 hover:underline">캐릭터 재설정</button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-pink-300 flex-shrink-0"></div>}
                <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                    msg.role === 'user'
                        ? 'bg-blue-500 text-white rounded-br-none'
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

        <footer className="bg-white p-4 border-t">
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

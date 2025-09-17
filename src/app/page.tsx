// src/app/page.tsx

'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import axiosInstance from '@/util/axios';

// --- 타입 정의 ---
interface Message {
  role: 'user' | 'model';
  text: string;
}

interface Session {
  id: number;
  persona: string;
  createdAt: string;
}

// --- 메인 페이지 컴포넌트 ---
function ChatPageContent() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  // --- 상태 관리 ---
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentPersona, setCurrentPersona] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isSettingPersona, setIsSettingPersona] = useState(false); // 새 채팅 설정 UI를 위한 상태
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- 데이터 로딩 함수 ---
  const fetchSessions = async () => {
    if (user?.id) {
      try {
        const response = await axiosInstance.get(`/api/history/sessions/user/${user.id}`);
        setSessions(response.data);
        return response.data;
      } catch (error) {
        console.error("세션 목록을 불러오는 데 실패했습니다:", error);
      }
    }
    return [];
  };

  // --- useEffect 훅 ---
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      fetchSessions();
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (activeSessionId) {
        setIsLoading(true);
        try {
          const response = await axiosInstance.get(`/api/history/messages/session/${activeSessionId}`);
          const formattedMessages = response.data.map((msg: any) => ({
            role: msg.role,
            text: msg.text,
          }));
          setMessages(formattedMessages);
        } catch (error) {
          console.error("메시지를 불러오는 데 실패했습니다:", error);
          setMessages([]);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchMessages();
  }, [activeSessionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- 이벤트 핸들러 ---
  const handleSelectSession = (session: Session) => {
    setIsSettingPersona(false); // 새 채팅 설정 모드 해제
    setActiveSessionId(session.id);
    setCurrentPersona(session.persona);
  };

  const handleNewChatClick = () => {
    setIsSettingPersona(true);
    setActiveSessionId(null);
    setMessages([]);
    setCurrentPersona('');
  };

  const handlePersonaSubmit = (newPersona: string) => {
    if (newPersona.trim()) {
      setCurrentPersona(newPersona);
      setIsSettingPersona(false); // 채팅 화면으로 전환
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || (!activeSessionId && !currentPersona)) return;

    const userMessage: Message = { role: 'user', text: userInput };
    const currentHistory = [...messages, userMessage];
    setMessages([...currentHistory, { role: 'model', text: '' }]);
    setUserInput('');
    setIsLoading(true);

    try {
      const requestBody = {
        userId: user?.id,
        sessionId: activeSessionId,
        persona: currentPersona,
        history: currentHistory,
      };

      const response = await axiosInstance.post('/api/chat/simple', requestBody);
      const { sessionId: newSessionId, response: aiResponse } = response.data;

      // 타이핑 효과로 AI 응답 표시
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < aiResponse.length) {
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1].text = aiResponse.substring(0, currentIndex + 1);
            return updated;
          });
          currentIndex++;
        } else {
          clearInterval(interval);
          setIsLoading(false);
          // 새 채팅이었다면, 세션 목록을 새로고침하고 활성 세션으로 설정
          if (!activeSessionId && newSessionId) {
            fetchSessions().then(newSessions => {
              const newSession = newSessions.find(s => s.id === newSessionId);
              if (newSession) handleSelectSession(newSession);
            });
          }
        }
      }, 30);

    } catch (error) {
      console.error("API 호출 오류:", error);
      const errorMessage: Message = { role: 'model', text: '죄송해요, 응답을 생성할 수 없어요.' };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
      setIsLoading(false);
    }
  };

  // --- 렌더링 ---
  if (!isAuthenticated) {
    return <div className="flex h-screen items-center justify-center">인증 상태 확인 중...</div>;
  }

  return (
      <div className="flex h-screen bg-gray-100 font-sans">
        <aside className="w-64 bg-white border-r p-4 flex flex-col shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">대화 목록</h2>
            <button onClick={handleNewChatClick} className="text-sm font-semibold text-blue-600 hover:underline">
              + 새 채팅
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sessions.map((session) => (
                <div
                    key={session.id}
                    onClick={() => handleSelectSession(session)}
                    className={`p-3 rounded-lg cursor-pointer mb-2 ${activeSessionId === session.id ? 'bg-blue-100' : 'hover:bg-gray-50'}`}
                >
                  <p className="font-semibold truncate text-sm">{session.persona}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(session.createdAt).toLocaleString()}</p>
                </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="font-semibold text-gray-800">{user?.username}님</p>
            <button onClick={logout} className="text-sm text-red-600 hover:underline mt-1">로그아웃</button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col">
          {isSettingPersona ? (
              <PersonaSetupView onSubmit={handlePersonaSubmit} />
          ) : (
              <ChatView
                  messages={messages}
                  userInput={userInput}
                  setUserInput={setUserInput}
                  isLoading={isLoading}
                  handleSendMessage={handleSendMessage}
                  chatEndRef={chatEndRef}
                  hasActiveSession={!!activeSessionId || !!currentPersona}
              />
          )}
        </main>
      </div>
  );
}

// --- 하위 컴포넌트들 ---

const PersonaSetupView = ({ onSubmit }: { onSubmit: (persona: string) => void }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newPersona = formData.get('persona') as string;
    onSubmit(newPersona);
  };
  return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-center text-gray-800">새 캐릭터 설정</h1>
          <p className="text-center text-gray-600">대화하고 싶은 캐릭터의 성격, 말투, 역할을 자유롭게 입력해주세요.</p>
          <form onSubmit={handleSubmit}>
                    <textarea
                        name="persona"
                        rows={5}
                        className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="예시: 당신은 츤데레 고양이 챗봇입니다..."
                    ></textarea>
            <button type="submit" className="w-full mt-4 px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600">
              이 캐릭터와 채팅 시작
            </button>
          </form>
        </div>
      </div>
  );
};

const ChatView = ({ messages, userInput, setUserInput, isLoading, handleSendMessage, chatEndRef, hasActiveSession }: any) => {
  if (!hasActiveSession) {
    return (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p>왼쪽에서 대화를 선택하거나 새 채팅을 시작하세요.</p>
        </div>
    );
  }
  return (
      <>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-pink-300 flex-shrink-0 self-start"></div>}
                <div className={`max-w-xs md:max-w-md lg:max-w-2xl p-3 rounded-2xl shadow-sm ${
                    msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : (msg.text ? 'bg-white text-gray-800 rounded-bl-none' : 'bg-transparent shadow-none')
                }`}>
                  {msg.role === 'model' && !msg.text && isLoading && index === messages.length - 1 ? (
                      <div className="flex space-x-1 p-2">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      </div>
                  ) : (
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
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
                className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={isLoading}
            />
            <button type="submit" className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-full disabled:bg-gray-400 hover:bg-blue-600 transition-colors" disabled={isLoading}>
              전송
            </button>
          </form>
        </footer>
      </>
  );
};

export default function ChatPage() {
  return (
      <Suspense>
        <ChatPageContent />
      </Suspense>
  );
}

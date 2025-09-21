'use client';

import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';

interface Message {
  id: number;
  role: 'user' | 'model';
  text: string;
}

interface ChatWindowProps {
  messages: Message[];
  persona: string;
  isLoading: boolean;
  onSendMessage: (text: string) => void;
}

export default function ChatWindow({ messages, persona, isLoading, onSendMessage }: ChatWindowProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 새 메시지가 추가될 때마다 맨 아래로 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  return (
      <div className="flex h-full flex-col bg-white text-black">
        {/* 헤더: 페르소나 표시 */}
        <div className="border-b p-4">
          <h2 className="text-xl font-semibold text-black">{persona.length > 10 ? persona.substring(0,9) : persona || 'Chat'}</h2>
        </div>

        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-gray-500">
                대화를 시작해보세요!
              </div>
          ) : (
              messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
          )}
          {/* 스크롤을 위한 빈 div */}
          <div ref={messagesEndRef} />
        </div>

        {/* 메시지 입력 폼 */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="메시지를 입력하세요..."
                disabled={isLoading}
                className="flex-1 rounded-md border p-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
            />
            <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="rounded-md bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isLoading ? '전송중...' : '전송'}
            </button>
          </form>
        </div>
      </div>
  );
}
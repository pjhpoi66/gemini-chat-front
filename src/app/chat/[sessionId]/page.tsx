'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import ChatWindow from '@/components/ChatWindow';
import useChatStore from '@/stores/chatStore'; // 스토어 import

export default function ChatPage() {
  const params = useParams(); // 훅을 사용해 파라미터를 가져옵니다.
  const sessionId = params.sessionId as string; // sessionId를 추출합니다.

  // 스토어에서 필요한 모든 것을 가져옵니다.
  const {
    currentMessages,
    currentPersona,
    messagesLoading,
    isResponding,
    error,
    fetchMessages,
    sendMessage,
  } = useChatStore();

  useEffect(() => {
    if (sessionId) {
      fetchMessages(sessionId);
    }
  }, [sessionId, fetchMessages]);

  const handleSendMessage = async (text: string) => {
    // 스토어의 sendMessage 액션을 호출합니다.
    await sendMessage(sessionId, text);
  };

  if (messagesLoading) {
    return <div className="flex h-full items-center justify-center">Loading chat...</div>;
  }

  if (error) {
    return <div className="flex h-full items-center justify-center text-red-500">{error}</div>;
  }

  return (
      <ChatWindow
          messages={currentMessages}
          persona={currentPersona || ''}
          isLoading={isResponding}
          onSendMessage={handleSendMessage}
      />
  );
}
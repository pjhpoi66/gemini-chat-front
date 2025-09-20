import React from 'react';

interface Message {
  id: number;
  role: 'user' | 'model';
  text: string;
}

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
      <div className={`mb-4 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div
            className={`max-w-xl rounded-lg px-4 py-2
          ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`
            }
        >
          <p style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
        </div>
      </div>
  );
}
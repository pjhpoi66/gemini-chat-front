'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function ChatWelcomePage() {
  const { user } = useAuth();

  return (
      <div className="flex h-full flex-col items-center justify-center bg-white text-gray-600">
        <div className="text-center">
          {/* 간단한 아이콘이나 이미지를 추가해도 좋습니다. */}
          <h1 className="text-2xl font-semibold text-gray-800">
            {user ? `${user.username}님, 환영합니다!` : '채팅에 오신 것을 환영합니다!'}
          </h1>
          <p className="mt-2">
            왼쪽 사이드바에서 대화를 선택하거나 새 채팅을 시작해보세요.
          </p>
        </div>
      </div>
  );
}
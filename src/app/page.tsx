'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // AuthContext가 localStorage에서 사용자 정보를 로딩하는 것을 기다립니다.
    if (loading) {
      return;
    }

    if (isAuthenticated) {
      // 인증된 사용자라면 채팅 페이지로 이동합니다.
      router.push('/chat');
    } else {
      // 인증되지 않은 사용자라면 로그인 페이지로 이동합니다.
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  // 리디렉션이 처리되는 동안 보여줄 로딩 화면입니다.
  // 이 화면은 아주 잠깐 나타나거나 보이지 않을 수 있습니다.
  return (
      <main className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </main>
  );
}
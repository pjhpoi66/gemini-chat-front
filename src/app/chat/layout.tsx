'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';

export default function ChatLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // AuthContext의 로딩이 끝나고, 인증되지 않은 상태라면 로그인 페이지로 보냅니다.
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  // 로딩 중이거나 아직 인증 상태가 확정되지 않았을 때 로딩 화면을 보여줍니다.
  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
    );
  }

  // 인증된 사용자에게만 채팅 레이아웃을 보여줍니다.
  if (isAuthenticated) {
    return (
        <main className="flex h-screen w-full bg-gray-100">
          {/* 좌측 사이드바 */}
          <Sidebar />

          {/* 우측 메인 컨텐츠 영역 */}
          <div className="flex-1 flex flex-col">
            {children} {/* 이 부분에 page.tsx 또는 [sessionId]/page.tsx가 렌더링됩니다. */}
          </div>
        </main>
    );
  }

  // 리디렉션이 처리되는 동안 null을 렌더링합니다.
  return null;
}
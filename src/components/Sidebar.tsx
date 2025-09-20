'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import useChatStore from '@/stores/chatStore'; // 스토어 import

export default function Sidebar() {
  // 컴포넌트 내부 상태는 모달 관리를 위한 것만 남깁니다.
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPersona, setNewPersona] = useState('');

  // 스토어에서 상태와 액션을 가져옵니다.
  const { sessions, sessionsLoading, fetchSessions, createChat } = useChatStore();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 컴포넌트가 마운트될 때 세션 목록을 불러옵니다.
    fetchSessions();
  }, [fetchSessions]);

  const handleCreateChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersona.trim()) return;

    // 스토어의 createChat 액션을 호출합니다.
    createChat(newPersona, (newId) => {
      // 성공 후 콜백: 새 채팅방으로 이동
      router.push(`/chat/${newId}`);
    });

    setIsModalOpen(false);
    setNewPersona('');
  };

  return (
      <>
        <div className="flex h-full w-64 flex-col bg-gray-800 text-white">
          <div className="p-4">
            <h1 className="text-xl font-bold">Gemini Chat</h1>
            <p className="text-sm text-gray-400">Welcome, {user?.username || 'Guest'}</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold hover:bg-blue-600"
              >
                + 새 채팅 시작하기
              </button>
            </div>
            <nav className="flex-1 px-2">
              {sessionsLoading ? (
                  <p className="p-2 text-sm text-gray-400">로딩 중...</p>
              ) : (
                  sessions.map((session) => {
                    const isActive = pathname === `/chat/${session.id}`;
                    return (
                        <Link
                            key={session.id}
                            href={`/chat/${session.id}`}
                            className={`block rounded-md px-4 py-2 text-sm
                      ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
                            }
                        >
                          {/* 페르소나가 길 경우 잘라내서 보여줍니다. */}
                          {session.persona.length > 20 ? `${session.persona.substring(0, 20)}...` : session.persona}
                        </Link>
                    );
                  })
              )}
            </nav>
          </div>

          <div className="border-t border-gray-700 p-4">
            <button
                onClick={logout}
                className="w-full rounded-md bg-red-500 px-4 py-2 text-sm font-semibold hover:bg-red-600"
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* 새 채팅방 생성 모달 */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="w-full max-w-md rounded-lg bg-white p-6">
                <h2 className="text-xl font-bold">새로운 캐릭터 설정</h2>
                <p className="mt-2 text-sm text-gray-600">
                  대화하고 싶은 캐릭터의 페르소나(성격, 역할 등)를 입력해주세요.
                </p>
                <form onSubmit={handleCreateChat} className="mt-4">
              <textarea
                  value={newPersona}
                  onChange={(e) => setNewPersona(e.target.value)}
                  placeholder="예: 친절하고 유머러스한 AI 친구"
                  className="w-full rounded-md border p-2 text-gray-800"
                  rows={4}
                  required
              />
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300"
                    >
                      취소
                    </button>
                    <button
                        type="submit"
                        className="rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
                    >
                      채팅 시작
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </>
  );
}
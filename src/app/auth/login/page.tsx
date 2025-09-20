// src/app/auth/login/page.tsx

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

function LoginPageContent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // URL에 reason=session_expired 파라미터가 있으면 에러 메시지를 표시합니다.
    const reason = searchParams.get('reason');
    if (reason === 'session_expired') {
      setError('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        username,
        password,
      });

      const { username: responseUsername, token } = response.data; // 백엔드에서 받은 username
      login({ username: responseUsername, token: token }); // AuthContext의 login 함수도 이에 맞게 수정 필요

      // 로그인 성공 시 메인 페이지로 이동합니다.
      router.push('/chat');

    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          setError('아이디 또는 비밀번호가 올바르지 않습니다.');
        } else {
          setError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
      setIsLoading(false);
    }
  };

  return (
      <main className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-center text-gray-800">로그인</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                  htmlFor="username"
                  className="text-sm font-medium text-gray-700"
              >
                사용자 이름
              </label>
              <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 mt-2 text-base text-gray-700 bg-gray-200 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="아이디를 입력하세요"
              />
            </div>
            <div>
              <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
              >
                비밀번호
              </label>
              <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 mt-2 text-base text-gray-700 bg-gray-200 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="비밀번호를 입력하세요"
              />
            </div>

            {error && <p className="text-sm text-center text-red-500">{error}</p>}

            <div>
              <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-3 font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-400"
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </button>
            </div>
          </form>
          <div className="text-sm text-center text-gray-600">
            계정이 없으신가요?{' '}
            <Link href="/register" className="font-medium text-blue-500 hover:underline">
              회원가입
            </Link>
          </div>
        </div>
      </main>
  );
}

// Suspense로 감싸서 빌드 오류를 방지합니다.
export default function LoginPage() {
  return (
      <Suspense>
        <LoginPageContent />
      </Suspense>
  );
}
// src/app/register/page.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        username,
        password,
      });

      setSuccessMessage('회원가입에 성공했습니다! 잠시 후 로그인 페이지로 이동합니다.');

      // 2초 후 로그인 페이지로 리디렉션
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        // 백엔드에서 보낸 에러 메시지를 표시
        setError(err.response.data || '회원가입 중 오류가 발생했습니다.');
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
      setIsLoading(false);
    }
  };

  return (
      <main className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-center text-gray-800">회원가입</h1>
          <form onSubmit={handleRegister} className="space-y-6">
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
                  placeholder="사용할 아이디를 입력하세요"
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
                  placeholder="사용할 비밀번호를 입력하세요"
              />
            </div>

            {error && <p className="text-sm text-center text-red-500">{error}</p>}
            {successMessage && <p className="text-sm text-center text-green-500">{successMessage}</p>}

            <div>
              <button
                  type="submit"
                  disabled={isLoading || !!successMessage}
                  className="w-full px-4 py-3 font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-400"
              >
                {isLoading ? '가입 처리 중...' : '회원가입'}
              </button>
            </div>
          </form>
          <div className="text-sm text-center text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="font-medium text-blue-500 hover:underline">
              로그인하기
            </Link>
          </div>
        </div>
      </main>
  );
}

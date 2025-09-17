// util/axios.ts

import axios from 'axios';

// 1. Axios 인스턴스 생성
const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_ADDRESS, // .env.local 파일의 API 주소
});

// 2. 요청 인터셉터(Request Interceptor) 추가
axiosInstance.interceptors.request.use(
    (config) => {
      // localStorage에서 토큰을 가져옵니다.
      // 'window' 객체는 브라우저 환경에서만 사용 가능하므로, 서버 사이드 렌더링 시 에러를 방지하기 위해 체크합니다.
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
);

// 3. 응답 인터셉터 (새로 추가)
axiosInstance.interceptors.response.use(
    // (1) 성공적인 응답은 그대로 통과시킵니다.
    (response) => {
      return response;
    },
    // (2) 실패한 응답은 여기서 처리합니다.
    (error) => {
      // 백엔드에서 보낸 에러 응답이 있는지 확인합니다.
      const { response } = error;

      // 401 Unauthorized 에러 처리
      if (response && response.status === 401) {
        // 토큰이 유효하지 않거나 만료된 경우입니다.

        // localStorage에서 토큰을 삭제합니다.
        localStorage.removeItem('authToken');

        // Axios 인스턴스의 기본 헤더에서도 토큰을 제거합니다.
        delete axiosInstance.defaults.headers.common['Authorization'];

        // 로그인 페이지로 리디렉션합니다.
        // alert를 사용하여 사용자에게 상황을 알리고, 확인 후 페이지를 이동시킵니다.
        window.location.href = '/login';
      }

      // 처리된 에러는 그대로 반환하여, 각 컴포넌트의 catch 블록에서도 추가적인 처리를 할 수 있도록 합니다.
      return Promise.reject(error);
    }
);

export default axiosInstance;

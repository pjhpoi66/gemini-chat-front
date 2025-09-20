// src/util/axios.ts

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000,
});


axiosInstance.interceptors.request.use(
    (config) => {
      // localStorage에서 토큰을 가져옵니다.
      const token = localStorage.getItem('jwt_token');
      if (token) {
        // 토큰이 있으면 Authorization 헤더에 추가합니다.
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
);

export default axiosInstance;
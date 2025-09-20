import { create } from 'zustand';
import api from '@/util/axios';
import { useRouter } from 'next/navigation';

// 타입 정의
interface ChatSession {
  id: number;
  persona: string;
  createdAt: string;
}

interface Message {
  id: number;
  role: 'user' | 'model';
  text: string;
  createdAt: string;
}

interface MessageHistoryResponse {
  sessionId: number;
  persona: string;
  messages: Message[];
}

// 1. 스토어의 상태(State) 타입
interface ChatState {
  sessions: ChatSession[];
  currentMessages: Message[];
  currentPersona: string | null;
  sessionsLoading: boolean;
  messagesLoading: boolean;
  isResponding: boolean;
  error: string | null;
}

// 2. 스토어의 액션(Actions) 타입
interface ChatActions {
  fetchSessions: () => Promise<void>;
  fetchMessages: (sessionId: string) => Promise<void>;
  sendMessage: (sessionId: string, text: string) => Promise<void>;
  createChat: (persona: string, callback: (newId: number) => void) => Promise<void>;
}

// 3. Zustand 스토어 생성
const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  // --- 초기 상태 ---
  sessions: [],
  currentMessages: [],
  currentPersona: null,
  sessionsLoading: true,
  messagesLoading: true,
  isResponding: false,
  error: null,

  // --- 액션 구현 ---
  fetchSessions: async () => {
    set({ sessionsLoading: true, error: null });
    try {
      const response = await api.get<ChatSession[]>('/api/chats');
      set({ sessions: response.data, sessionsLoading: false });
    } catch (err) {
      console.error(err);
      set({ error: '채팅 목록 로딩 실패', sessionsLoading: false });
    }
  },

  fetchMessages: async (sessionId) => {
    set({ messagesLoading: true, error: null, currentMessages: [] });
    try {
      const response = await api.get<MessageHistoryResponse>(`/api/chats/${sessionId}/messages`);
      set({
        currentMessages: response.data.messages,
        currentPersona: response.data.persona,
        messagesLoading: false,
      });
    } catch (err) {
      console.error(err);
      set({ error: '메시지 로딩 실패', messagesLoading: false });
    }
  },

  sendMessage: async (sessionId, text) => {
    set({ isResponding: true, error: null });

    // 낙관적 업데이트: 사용자 메시지 바로 추가
    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      text,
      createdAt: new Date().toISOString(),
    };
    set(state => ({ currentMessages: [...state.currentMessages, userMessage] }));

    try {
      const response = await api.post<Message>(`/api/chats/${sessionId}/messages`, { text });
      const modelMessage = response.data;
      // AI 응답 추가
      set(state => ({ currentMessages: [...state.currentMessages, modelMessage] }));
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: 'model',
        text: '메시지 전송에 실패했습니다.',
        createdAt: new Date().toISOString(),
      };
      set(state => ({ currentMessages: [...state.currentMessages, errorMessage] }));
    } finally {
      set({ isResponding: false });
    }
  },

  createChat: async (persona, callback) => {
    try {
      const response = await api.post<ChatSession>('/api/chats', { persona });
      const newSession = response.data;
      // 새 채팅 생성 후 전체 목록을 다시 불러옵니다.
      await get().fetchSessions();
      // 콜백 함수를 실행하여 페이지 이동 등을 처리합니다.
      callback(newSession.id);
    } catch (err) {
      console.error(err);
      set({ error: '채팅방 생성 실패' });
    }
  },
}));

export default useChatStore;
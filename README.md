## Gemini API 캐릭터 채팅 (Frontend)

Google의 Gemini API를 활용하여 사용자가 지정한 페르소나를 가진 AI 캐릭터와 대화할 수 있는 웹 애플리케이션의 프론트엔드 프로젝트입니다.

https://minga666.com

## 주요 기능

JWT 기반 인증: 회원가입 및 로그인 기능을 통해 사용자별 대화 기록을 관리합니다.

AI 채팅방 관리: 새로운 페르소나를 가진 AI 캐릭터 채팅방을 생성하고, 기존 채팅방 목록을 조회할 수 있습니다.

실시간 대화: 사용자가 메시지를 보내면 Gemini API를 통해 실시간으로 AI 캐릭터의 응답을 받아 대화를 이어갈 수 있습니다.

대화 기록: 과거에 나눈 대화 기록을 언제든지 다시 불러와 확인할 수 있습니다.

## 기술 스택

Framework: Next.js 15 (App Router)

Language: TypeScript

Styling: Tailwind CSS

State Management: Zustand

API Client: Axios

##시작하기

Repository 클론:

```bash
git clone https://github.com/pjhpoi66/gemini-chat-front.git
```
의존성 설치:

```bash
npm install
```

환경 변수 설정:
프로젝트 루트에 .env.local 파일을 생성하고 아래 내용을 추가합니다. 이 주소는 로컬에서 실행 중인 백엔드 API 서버를 가리켜야 합니다.

NEXT_PUBLIC_API_URL=http://localhost:8081

개발 서버 실행:

```bash
npm run dev
```

애플리케이션 접속:
브라우저를 열고 http://localhost:3000 주소로 접속합니다.

##환경변수
NEXT_PUBLIC_API_URL: 연동할 백엔드 API 서버의 기본 URL입니다.
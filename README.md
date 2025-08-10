# Banking Helper
AI를 활용한 신한은행 인터넷뱅킹 페이지 내 금융 업무 보조 브라우저 확장 프로그램

## 소개
신한은행 인터넷 뱅킹 웹페이지에서 사용자가 궁금해 할 만한 용어를 쉽게 찾아볼 수 있고, 원하는 메뉴를 자연어로 검색하여 찾을 수 있도록 도와주는 브라우저 익스텐션입니다.

## 설치 및 실행 (Windows)
### 0. Prerequisites
- **Node.js 18+**
- **Python 3.10+**
- **Docker**
- **Google Gemini API Key**
- **pnpm** (`npm install -g pnpm`)

### 1. API Server

```bash
cd backend
docker build -t banking-helper-server .
docker run -p 5000:5000 -e GEMINI_KEY=<your_gemini_api_key> banking-helper-server
```

### 2. Web Browser Extension

```bash
cd frontend
pnpm install
$env:VITE_API_URL = "http://localhost:5000"; pnpm run dev
```
## 기능
### 1. 툴바
<img width="1207" height="169" alt="image" src="https://github.com/user-attachments/assets/dcb516ba-d743-43a5-bee2-4c3346ef5075" />

### 2. 익스텐션 팝업
<img width="311" height="387" alt="image" src="https://github.com/user-attachments/assets/ca6c9cd6-b6f4-433d-b559-7b92c6953499" />



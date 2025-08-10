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
툴바를 통해 용어 알아보기, 메뉴 찾기 등의 기능을 빠르게 실행할 수 있습니다.

<img width="700" height="169" alt="image" src="https://github.com/user-attachments/assets/dcb516ba-d743-43a5-bee2-4c3346ef5075" />

### 2. 익스텐션 팝업
익스텐션 팝업을 통해서도 기능들을 실행할 수 있습니다.

<img width="311" height="387" alt="image" src="https://github.com/user-attachments/assets/ca6c9cd6-b6f4-433d-b559-7b92c6953499" />

### 3. 사용자가 커서를 올려놓았을 때 용어 툴팁
파인튜닝된 BERT 모델을 통해 금융용어로 판별된 단어의 경우 사용자가 커서를 올려놓았을 때 툴팁 모달이 표시됩니다.

<img width="311" height="387" alt="image" src="https://github.com/user-attachments/assets/e2704363-0e49-4639-a763-6bf64f611015" />

### 4. 캡쳐를 통해 용어 알아보기
'용어 알아보기' 버튼을 클릭하였을 때 사용자가 원하는 부분을 캡쳐할 수 있도록 UI가 제공되며, 캡쳐된 이미지는 Gemini API를 통해 분석되어 해당 이미지에 포함된 용어에 대한 설명이 표시됩니다. 

<img width="311" height="387" alt="image" src="https://github.com/user-attachments/assets/524c571d-0655-4d7c-b475-1ef550fa0d99" />

### 5. 자연어로 원하는 메뉴 찾기
사용자가 자연어로 원하는 메뉴에 대해 검색하면, 가장 가까운 메뉴와 후보 메뉴들을 표시하며, 바로 해당 메뉴로 이동할 수도 있습니다.

<img width="311" height="387" alt="image" src="https://github.com/user-attachments/assets/4a114f81-409a-4b89-b25f-df936e33f8a7" />

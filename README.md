# Banking Helper
AI를 활용한 신한은행 인터넷뱅킹 페이지 내 금융 업무 보조 브라우저 확장 프로그램

## 소개
신한은행 인터넷 뱅킹 웹페이지에서 사용자가 궁금해 할 만한 용어를 쉽게 찾아볼 수 있고, 원하는 메뉴를 자연어로 검색하여 찾을 수 있도록 도와주는 브라우저 익스텐션입니다.

## 배경
### 원하는 메뉴 찾기
인터넷 뱅킹 페이지에서는 수많은 메뉴들을 제공하고 있습니다. 사용자 입장에서 바로 원하는 메뉴를 찾기 위해서는 자신이 원하는 서비스의 이름, 혹은 키워드를 대략적으로라도 알고 있어야 검색이 가능합니다. 기존 신한은행 챗봇에서는 Rule Based 기반으로 사용자의 질문을 받아 메뉴를 찾을 수 있지만, 여전히 키워드를 알고 있어야 검색이 가능합니다. 이를 개선해보고자 사용자의 자연어 입력를 LLM이 분석하여 적절한 메뉴를 추천해주는 기능을 구현해보고자 하였습니다.

### 금융 용어 알아보기
인터넷 뱅킹 페이지에서는 많은 금융/은행 용어가 등장합니다. 사용자 입장에서 모르는 용어가 있을 때 웹페이지 내에서 바로 검색을 할 수 있으면 편리성이 개선되지 않을까 하는 생각에서 사용자가 특정 단어에 커서를 올려놓았을 때 자동으로 용어 툴팁을 제공하거나, 사용자가 직접 캡쳐하여 용어를 검색할 수 있는 기능을 구현해보고자 하였습니다.

## 사용된 기술
### Browser Extension
#### WXT (https://wxt.dev/)
브라우저 확장 프로그램 개발을 위한 오픈소스 프레임워크로, 다양한 브라우저에 호환되는 확장 프로그램을 손쉽게 개발할 수 있도록 통일된 API와 프로젝트 구조, manifest 관리 기능을 제공합니다. TypeScript, CSS, HTML 등 웹 기술을 기반으로 개발하였으며, 확장 프로그램의 모달 UI 구현을 위해 React.js를 사용하였습니다.

### AI
#### BERT (HuggingFace Transformers)
트랜스포머 인코딩 기반의 자연어 처리 모델로, HuggingFace Transformers를 통해 사전 학습된 한국어 BERT 모델을 불러와 추가 파인튜닝을 진행하였습니다.
기획재정부 시사 경제 용어 사전을 데이터셋으로 사용하여, 입력된 단어가 금융 용어인지 여부를 분류하는 Classification 모델을 학습시켰습니다.

#### Google Gemini
Google이 제공하는 LLM인 Gemini API를 활용해 금융 용어 설명 및 인터넷뱅킹 메뉴 검색 기능을 구현하였습니다. 이를 위해 LangChain 라이브러리를 적용하여 대화형 질의응답과 기능 호출을 지원하였습니다.

### backend (API Server)
#### Flask
파이썬 기반의 경량 웹 프레임워크로, Transformers와 LangChain 모두 파이썬에서 사용하기 편리한 라이브러리이기에 Flask를 채택했습니다.
금융 용어 여부 판별 API, Gemini API 응답 반환 API 등 AI 기능을 호출하는 엔드포인트를 제공하도록 구현하였습니다.

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


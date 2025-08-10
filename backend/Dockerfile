# Python 3.10 slim 이미지 사용
FROM python:3.10-slim

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 패키지 업데이트 및 필요한 패키지 설치
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    git \
    curl \
    ca-certificates \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# SSL 인증서 디렉토리 생성
RUN mkdir -p /app/certs

# SSL 인증서 생성 스크립트 복사 및 실행
COPY generate_cert.sh /app/
RUN chmod +x /app/generate_cert.sh && sh /app/generate_cert.sh

# Python 의존성 파일 복사
COPY requirements.txt .

# Python 패키지 설치
RUN pip install --no-cache-dir -r requirements.txt

# PyTorch CPU 전용 설치 (requirements.txt 이후에 재설치)
RUN pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# 애플리케이션 코드 복사
COPY . .

# 포트 노출 (Flask 기본 포트)
EXPOSE 5000

# 환경 변수 설정
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV PYTHONPATH=/app

# Fin-BERT 모델 관련 환경변수
ENV MODEL_PATH=PhoenixPlanet/fin_bert
ENV FIN_TERMS_PATH=fin_terms.csv
ENV THRESHOLD=0.42

# LLM 관련 환경변수
ENV LLM_MODEL=gemini-2.5-flash

# SSL 관련 환경변수
ENV USE_SSL=true
ENV SSL_CERT=/app/certs/cert.pem
ENV SSL_KEY=/app/certs/key.pem
ENV HOST=0.0.0.0
ENV PORT=5000

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# 애플리케이션 실행
CMD ["python", "app.py"]

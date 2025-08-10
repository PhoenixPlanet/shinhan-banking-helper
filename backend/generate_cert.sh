#!/bin/bash

# SSL 인증서 생성 스크립트
# 개발/테스트용 자체 서명 인증서 생성

CERT_DIR="/app/certs"
CERT_FILE="$CERT_DIR/cert.pem"
KEY_FILE="$CERT_DIR/key.pem"

# 인증서 디렉토리 생성
mkdir -p $CERT_DIR

# 자체 서명 인증서 생성
openssl req -x509 -newkey rsa:4096 -keyout $KEY_FILE -out $CERT_FILE -days 365 -nodes \
    -subj "/C=KR/ST=Seoul/L=Seoul/O=FinBERT/OU=Development/CN=localhost"

echo "SSL 인증서가 생성되었습니다:"
echo "인증서: $CERT_FILE"
echo "개인키: $KEY_FILE"

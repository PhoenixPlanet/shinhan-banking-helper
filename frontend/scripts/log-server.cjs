const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/log') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const logEntry = JSON.parse(body);
        const timestamp = new Date().toLocaleTimeString();
        
        // 로그 레벨에 따른 색상 설정
        const colors = {
          error: '\x1b[31m', // 빨강
          warn: '\x1b[33m',  // 노랑
          info: '\x1b[32m',  // 초록
          debug: '\x1b[36m'  // 청록
        };
        
        const resetColor = '\x1b[0m';
        const color = colors[logEntry.level] || resetColor;
        
        console.log(
          `${color}[${timestamp}] [${logEntry.level.toUpperCase()}]${resetColor} ${logEntry.message}`
        );
        
        if (logEntry.data !== undefined) {
          console.log(`${color}  Data:${resetColor}`, logEntry.data);
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (error) {
        console.error('로그 파싱 오류:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

const PORT = 5173;

server.listen(PORT, () => {
  console.log(`\x1b[32m[LOG SERVER]\x1b[0m 로그 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`\x1b[36m[INFO]\x1b[0m 익스텐션에서 전송된 로그가 여기에 표시됩니다.`);
  console.log(`\x1b[36m[INFO]\x1b[0m 서버를 중지하려면 Ctrl+C를 누르세요.\n`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\x1b[31m[ERROR]\x1b[0m 포트 ${PORT}가 이미 사용 중입니다.`);
    console.error(`\x1b[33m[WARN]\x1b[0m 다른 포트를 사용하거나 기존 서버를 종료하세요.`);
  } else {
    console.error(`\x1b[31m[ERROR]\x1b[0m 서버 오류:`, error);
  }
}); 
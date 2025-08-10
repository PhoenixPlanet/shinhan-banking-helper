interface LoggerOptions {
  enableConsole?: boolean;
  enableDOM?: boolean;
  enableTerminal?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  maxLogs?: number;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: any;
}

class CustomLogger {
  private options: LoggerOptions;
  private logs: LogEntry[] = [];
  private logContainer: HTMLElement | null = null;

  constructor(options: LoggerOptions = {}) {
    this.options = {
      enableConsole: true,
      enableDOM: false,
      enableTerminal: true,
      logLevel: 'debug',
      maxLogs: 100,
      ...options
    };

    if (this.options.enableDOM) {
      this.createLogContainer();
    }
  }

  private createLogContainer(): void {
    // 기존 로그 컨테이너가 있다면 제거
    const existingContainer = document.getElementById('custom-logger-container');
    if (existingContainer) {
      existingContainer.remove();
    }

    // 새로운 로그 컨테이너 생성
    this.logContainer = document.createElement('div');
    this.logContainer.id = 'custom-logger-container';
    this.logContainer.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 400px;
      max-height: 300px;
      background: rgba(0, 0, 0, 0.9);
      color: #fff;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      padding: 10px;
      border-radius: 5px;
      z-index: 999999;
      overflow-y: auto;
      border: 1px solid #333;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    `;

    // 닫기 버튼 추가
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: 5px;
      right: 5px;
      background: none;
      border: none;
      color: #fff;
      font-size: 16px;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
    `;
    closeButton.onclick = () => this.hideLogContainer();
    this.logContainer.appendChild(closeButton);

    // 로그 영역
    const logArea = document.createElement('div');
    logArea.id = 'custom-logger-area';
    logArea.style.cssText = `
      margin-top: 20px;
      max-height: 250px;
      overflow-y: auto;
    `;
    this.logContainer.appendChild(logArea);

    document.body.appendChild(this.logContainer);
  }

  private hideLogContainer(): void {
    if (this.logContainer) {
      this.logContainer.style.display = 'none';
    }
  }

  private showLogContainer(): void {
    if (this.logContainer) {
      this.logContainer.style.display = 'block';
    }
  }

  private getLogLevelColor(level: string): string {
    switch (level) {
      case 'error': return '#ff4444';
      case 'warn': return '#ffaa00';
      case 'info': return '#44ff44';
      case 'debug': return '#8888ff';
      default: return '#ffffff';
    }
  }

  private addToDOM(entry: LogEntry): void {
    let logArea = document.getElementById('custom-logger-area');
    if (!this.logContainer || !logArea) {
        this.createLogContainer();
        logArea = document.getElementById('custom-logger-area');
        if (!logArea) return;
    }

    const logElement = document.createElement('div');
    logElement.style.cssText = `
      margin-bottom: 5px;
      padding: 3px;
      border-left: 3px solid ${this.getLogLevelColor(entry.level)};
      padding-left: 8px;
    `;

    const timestamp = document.createElement('span');
    timestamp.textContent = `[${entry.timestamp}] `;
    timestamp.style.color = '#888';
    logElement.appendChild(timestamp);

    const level = document.createElement('span');
    level.textContent = `[${entry.level.toUpperCase()}] `;
    level.style.color = this.getLogLevelColor(entry.level);
    level.style.fontWeight = 'bold';
    logElement.appendChild(level);

    const message = document.createElement('span');
    message.textContent = entry.message;
    logElement.appendChild(message);

    if (entry.data !== undefined) {
      const dataElement = document.createElement('div');
      dataElement.style.cssText = `
        margin-left: 20px;
        margin-top: 3px;
        color: #aaa;
        font-size: 11px;
      `;
      dataElement.textContent = JSON.stringify(entry.data, null, 2);
      logElement.appendChild(dataElement);
    }

    logArea.appendChild(logElement);
    logArea.scrollTop = logArea.scrollHeight;

    // 최대 로그 개수 제한
    while (logArea.children.length > this.options.maxLogs!) {
      logArea.removeChild(logArea.firstChild!);
    }
  }

  private addToTerminal(entry: LogEntry): void {
    // 터미널 출력을 위한 fetch 요청 (개발 서버로 전송)
    if (typeof window !== 'undefined' && this.options.enableTerminal) {
      try {
        fetch('http://localhost:5173/api/log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry)
        }).catch(() => {
          // 로컬 서버가 없으면 무시
        });
      } catch (error) {
        // 네트워크 오류 무시
      }
    }
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.options.logLevel!);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private log(level: string, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      data
    };

    this.logs.push(entry);

    // 로그 개수 제한
    if (this.logs.length > this.options.maxLogs!) {
      this.logs.shift();
    }

    // 콘솔 출력
    if (this.options.enableConsole) {
      const consoleMethod = level === 'error' ? 'error' : 
                           level === 'warn' ? 'warn' : 
                           level === 'info' ? 'info' : 'log';
      console[consoleMethod](`[${entry.timestamp}] [${level.toUpperCase()}] ${message}`, data);
    }

    // DOM 출력
    if (this.options.enableDOM) {
      this.addToDOM(entry);
    }

    // 터미널 출력
    if (this.options.enableTerminal) {
      this.addToTerminal(entry);
    }
  }

  // 공개 메서드들
  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: any): void {
    this.log('error', message, data);
  }

  // 로그 컨테이너 토글
  toggleLogContainer(): void {
    if (this.logContainer) {
      if (this.logContainer.style.display === 'none') {
        this.showLogContainer();
      } else {
        this.hideLogContainer();
      }
    }
  }

  // 로그 내보내기
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // 로그 초기화
  clearLogs(): void {
    this.logs = [];
    const logArea = document.getElementById('custom-logger-area');
    if (logArea) {
      logArea.innerHTML = '';
    }
  }

  // 설정 업데이트
  updateOptions(newOptions: Partial<LoggerOptions>): void {
    this.options = { ...this.options, ...newOptions };
    
    if (this.options.enableDOM && !this.logContainer) {
      this.createLogContainer();
    }
  }
}

// 기본 로거 인스턴스 생성
export const logger = new CustomLogger({
  enableConsole: true,
  enableDOM: false,
  enableTerminal: true,
  logLevel: 'debug',
  maxLogs: 100
});

export default CustomLogger; 
import { useState, useEffect } from 'react';
import { sendMessage } from '../messaging';
import './App.css';
import { logger } from '../utils/logger';

function App() {
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);

  useEffect(() => {
    const checkToolbarStatus = async () => {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      sendMessage('GetToolbarStatus', undefined, tab.id).then((status) => {
        setIsToolbarVisible(status.isVisible);
      });
    };
    
    checkToolbarStatus();
  }, []);

  const handleToggleToolbar = async () => {
    logger.info('handleToggleToolbar');
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    await sendMessage('ToggleToolbar', undefined, tab.id);
    const status = await sendMessage('GetToolbarStatus', undefined, tab.id);

    setIsToolbarVisible(status.isVisible);
  };

  const handleStartMenuFinder = async () => {
    logger.info('handleStartMenuFinder');
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

    sendMessage('StartMenuFinder', undefined, tab.id);
  };

  const handleStartCapture = async () => {
    logger.info('handleStartCapture');
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    sendMessage('StartCapture', undefined, tab.id);
  };

  return (
    <>
      <h1>Banking Helper</h1>
      
      <div className="card">
        <div className="toolbar-controls">
          <h3>툴바 제어</h3>
          <button 
            onClick={handleToggleToolbar}
            className={`toggle-btn ${isToolbarVisible ? 'active' : ''}`}
          >
            {isToolbarVisible ? '툴바 숨기기' : '툴바 보이기'}
          </button>
        </div>

        <div className="feature-buttons">
          <h3>기능</h3>
          <button onClick={handleStartMenuFinder} className="feature-btn">
            메뉴 찾기
          </button>
          <button onClick={handleStartCapture} className="feature-btn">
            용어 알아보기
          </button>
        </div>

        <div className="info">
          <p>
            <strong>단축키:</strong> Ctrl + Shift + T (툴바 토글)
          </p>
        </div>
      </div>
    </>
  );
}

export default App;

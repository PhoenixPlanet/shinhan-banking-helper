export function getToolbarStyles(): string {
  return `
    /* Banking Helper Toolbar Styles */
    #banking-helper-toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 50px;
      background: #1e3a8a;
      border-bottom: 1px solid #3b82f6;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      font: 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: white;
    }

    #banking-helper-toolbar button {
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      color: white;
      cursor: pointer;
      font-size: 12px;
      min-width: 80px;
      transition: background 0.2s;
    }

    #banking-helper-toolbar button.tooltip-close-btn {
      min-width: 30px;
    }

    #banking-helper-toolbar button:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    #banking-helper-toolbar .toolbar-section {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    #banking-helper-toolbar .toolbar-title {
      font-weight: bold;
      font-size: 16px;
    }

    body.has-toolbar {
      margin-top: 60px !important;
    }

    body.has-toolbar #header {
      margin-top: 50px !important;
    }
  `;
}

export function injectToolbarStyles(): void {
  if (document.getElementById('banking-helper-toolbar-styles')) {
    return;
  }

  const styleElement = document.createElement('style');
  styleElement.id = 'banking-helper-toolbar-styles';
  styleElement.textContent = getToolbarStyles();

  document.head.appendChild(styleElement);
}

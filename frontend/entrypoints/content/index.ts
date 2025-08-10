import { startProcessTooltip } from "./tooltip";
import { createToolbar } from "./toolbar";

let started = false;

function startObserver() {
  if (started) return;
  started = true;

  startProcessTooltip();
}

export default defineContentScript({
  matches: ['*://*.shinhan.com/*'],
  runAt: 'document_idle',
  main() {
    setTimeout(() => {
      const elements = document.querySelector('#btn_totalMenu em');
      if (elements) {
        (elements as HTMLElement).click();
      }

      const elements2 = document.querySelectorAll('.btnTopClose');
      for (const element of elements2) {
        (element as HTMLElement).click();
      }

      startObserver();
      
      // 툴바 생성
      createToolbar();
    }, 2000); // 2초 뒤 툴바 추가
  },
});

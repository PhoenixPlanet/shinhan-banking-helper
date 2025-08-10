import { logger } from "@/entrypoints/utils/logger";
import { sendMessage, onMessage } from "@/entrypoints/messaging";
import { defineTermFromImage } from "@/entrypoints/content/api";
import { 
    modalStyles, 
    closeButtonStyles, 
    croppedImageStyles, 
    sendButtonStyles, 
    overlayStyles, 
    selectionBoxStyles,
    resultContentStyles,
    loadingButtonStyles,
    createLoadingAnimation,
} from "./style";

let modal: HTMLDivElement | null = null;
let overlay: HTMLDivElement | null = null;

export function startCapture() {
    document.body.addEventListener('mousedown', onCaptureEvent);

    removeDivs();

    overlay = document.createElement('div');
    Object.assign(overlay.style, overlayStyles);
    document.body.appendChild(overlay);
}

function removeDivs() {
    if (overlay) {
        overlay.remove();
    }

    if (modal) {
        modal.remove();
    }
}

function showModal(cropped: string) {
    removeDivs();

    modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'banking-helper-capture-modal';
    Object.assign(modal.style, modalStyles);

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.className = 'close-btn';
    Object.assign(closeBtn.style, closeButtonStyles);
    closeBtn.onclick = () => {
        modal?.remove();
    };

    const croppedImg = new Image();
    croppedImg.src = cropped;
    Object.assign(croppedImg.style, croppedImageStyles);

    const sendBtn = document.createElement('button');
    sendBtn.textContent = '용어 뜻 알아보기';
    Object.assign(sendBtn.style, sendButtonStyles);
    sendBtn.onclick = async () => {
        try {
            const base64Data = cropped.split(',')[1];
            
            sendBtn.textContent = '분석 중';
            sendBtn.className = 'loading';
            Object.assign(sendBtn.style, loadingButtonStyles);
            sendBtn.disabled = true;
            
            const result = await defineTermFromImage(base64Data);
            
            showResultModal(result);
            
        } catch (error) {
            alert('이미지 분석 중 오류가 발생했습니다.');
        } finally {
            sendBtn.textContent = '용어 뜻 알아보기';
            sendBtn.className = '';
            Object.assign(sendBtn.style, sendButtonStyles);
            sendBtn.disabled = false;
        }
    };

    modal.appendChild(closeBtn);
    modal.appendChild(croppedImg);
    modal.appendChild(sendBtn);

    document.body.appendChild(modal);
}

function showResultModal(result: { term: string; definition: string; category: string }) {
    if (!modal) {
        return;
    }

    const existingChildren = Array.from(modal.children);
    existingChildren.forEach(child => {
        if (child.className === 'close-btn') {
            return;
        }
        (child as HTMLElement).style.display = 'none';
    });

    const resultContent = document.createElement('div');
    Object.assign(resultContent.style, resultContentStyles);

    resultContent.innerHTML = `
        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">분석 결과</h3>
        <div style="margin-bottom: 15px;">
            <strong style="color: #007bff;">인식된 용어:</strong> 
            <span style="font-weight: 600; color: #333;">${result.term}</span>
        </div>
        <div style="margin-bottom: 15px;">
            <strong style="color: #007bff;">카테고리:</strong> 
            <span style="color: #666;">${result.category}</span>
        </div>
        <div style="margin-bottom: 15px;">
            <strong style="color: #007bff;">설명:</strong><br>
            <div style="margin-top: 8px; line-height: 1.6; color: #555; background: #f8f9fa; padding: 12px; border-radius: 6px; border-left: 4px solid #007b튼ㅇㅇff;">
                ${result.definition}
            </div>
        </div>
    `;

    modal.appendChild(resultContent);
}

function onCaptureEvent(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startY = event.clientY;

    if (modal) {
        modal.remove();
    }

    const selectionBox = document.createElement('div');
    Object.assign(selectionBox.style, selectionBoxStyles);
    selectionBox.style.left = `${startX}px`;
    selectionBox.style.top = `${startY}px`;
    document.body.appendChild(selectionBox);

    const handleMouseMove = (moveEvent: MouseEvent) => {
        moveEvent.preventDefault();
        moveEvent.stopPropagation();

        const currentX = moveEvent.clientX;
        const currentY = moveEvent.clientY;

        const left = Math.min(startX, currentX);
        const top = Math.min(startY, currentY);
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);

        selectionBox.style.left = `${left}px`;
        selectionBox.style.top = `${top}px`;
        selectionBox.style.width = `${width}px`;
        selectionBox.style.height = `${height}px`;
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
        upEvent.preventDefault();
        upEvent.stopPropagation();

        document.body.removeEventListener('mousemove', handleMouseMove);
        document.body.removeEventListener('mouseup', handleMouseUp);
        document.body.removeEventListener('mousedown', onCaptureEvent);

        const selectionRect = selectionBox.getBoundingClientRect();
        selectionBox.remove();
        overlay?.remove();

        if (selectionRect.width < 10 || selectionRect.height < 10) {
            return;
        }

        window.setTimeout(() => {
            const id = crypto.randomUUID();
            sendMessage('Capture', {
                id: id,
                rect: {
                    x: selectionRect.left,
                    y: selectionRect.top,
                    width: selectionRect.width,
                    height: selectionRect.height
                }
            });
        }, 50);
    };

    document.body.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseup', handleMouseUp);
}

createLoadingAnimation();

onMessage('CaptureDone', ({ data }: { data: any }) => {
    logger.info(`Content message received: ${data}`);
    const captureData = data as { id: string; rect: { x: number; y: number; width: number; height: number }; dataUrl: string };
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = captureData.rect.width;
        canvas.height = captureData.rect.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(img, captureData.rect.x, captureData.rect.y, captureData.rect.width, captureData.rect.height,
                            0, 0, captureData.rect.width, captureData.rect.height);
            const cropped = canvas.toDataURL('image/jpeg');
            
            showModal(cropped);
        }
    };
    img.src = captureData.dataUrl;
});
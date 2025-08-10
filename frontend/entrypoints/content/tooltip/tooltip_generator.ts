import { logger } from '@/entrypoints/utils/logger';
import type { TargetNode } from './types';
import { 
    tooltipBubbleStyles, 
    tooltipCheckButtonStyles,
    tooltipWordStyles,
    createTooltipHTML,
    tooltipResultModalStyles,
    tooltipCloseButtonStyles,
    tooltipResultContentStyles,
    createTooltipStyles
} from './style';
import { defineTermFromText } from '../api';

let tooltipBubble: HTMLElement | null = null;
let currentHoveredNode: HTMLElement | null = null;
let isTooltipBubbleHovered = false;
let targetTerm: string | null = null;
let isLoading = false;

/**
 * 툴팁 버블 생성
 * @returns 툴팁 버블 노드
 */
function loadTooltipBubble() {
    const createTooltipBubble = () => {
        if (tooltipBubble) {
            return tooltipBubble;
        }

        const bubble = document.createElement('span');
        bubble.className = 'tooltip-bubble';
        bubble.id = 'banking-helper-tooltip-bubble';
        bubble.setAttribute('aria-hidden', 'true');
        Object.assign(bubble.style, tooltipBubbleStyles);

        bubble.addEventListener('mouseenter', () => {
            isTooltipBubbleHovered = true;
        });
        
        bubble.addEventListener('mouseleave', () => {
            isTooltipBubbleHovered = false;
            if (isLoading) {
                return;
            }
            setTimeout(() => {
                if (!isTooltipBubbleHovered && !currentHoveredNode) {
                    hideTooltipBubble();
                }
            }, 300);
        });

        bubble.innerHTML = createTooltipHTML();

        const checkBtn = bubble.querySelector('.tooltip-check-btn') as HTMLButtonElement;
        if (checkBtn) {
            Object.assign(checkBtn.style, tooltipCheckButtonStyles);

            checkBtn.onclick = async (e) => {
                e.stopPropagation();
                if (!targetTerm) {
                    alert('용어가 제대로 인식되지 않았습니다');
                    return;
                }

                try {
                    isLoading = true;
                    checkBtn.textContent = '분석 중';
                    checkBtn.className = 'tooltip-check-btn loading';
                    checkBtn.disabled = true;
                    
                    const result = await defineTermFromText(targetTerm);
                    showResultModal(result);
                } catch (error) {
                    alert('용어 분석 중 오류가 발생했습니다.');
                } finally {
                    isLoading = false;
                    hideTooltipBubble();
                    checkBtn.textContent = '용어 확인하기';
                    checkBtn.className = 'tooltip-check-btn';
                    checkBtn.disabled = false;
                }
            };
        }
        return bubble;
    }

    if (!tooltipBubble || tooltipBubble.parentElement !== document.body) {
        tooltipBubble = createTooltipBubble();
        document.body.appendChild(tooltipBubble);
    }

    return tooltipBubble;
}

/**
 * 툴팁 버블 표시
 * @param targetNode 대상 노드
 */
function showTooltipBubble(targetNode: HTMLElement, term: string) {
    if (!tooltipBubble) return;

    targetTerm = term;

    const rect = targetNode.getBoundingClientRect();
    const bubble = tooltipBubble;
    
    bubble.style.display = 'block';
    bubble.style.opacity = '0';
    bubble.style.transform = 'scale(1)';
    
    const top = rect.top - bubble.offsetHeight - 8;
    const left = rect.left + (rect.width / 2) - (bubble.offsetWidth / 2);
    
    bubble.style.top = `${top}px`;
    bubble.style.left = `${left}px`;
    
    requestAnimationFrame(() => {
        if (bubble) {
            bubble.style.opacity = '1';
        }
    });
}

/**
 * 툴팁 버블 숨김
 */
function hideTooltipBubble() {
    if (!tooltipBubble) return;
    
    tooltipBubble.style.opacity = '0';
    tooltipBubble.style.transform = 'scale(0)';
    setTimeout(() => {
        if (tooltipBubble) {
            tooltipBubble.style.display = 'none';
        }
    }, 300);
}

/**
 * 툴팁 버블 결과 모달 표시
 * @param result 툴팁 버블 결과
 */
function showResultModal(result: { term: string; definition: string; category: string }) {
    const existingModal = document.querySelector('.tooltip-result-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'tooltip-result-modal';
    modal.id = 'banking-helper-tooltip-result-modal';
    Object.assign(modal.style, tooltipResultModalStyles);

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.className = 'tooltip-close-btn';
    Object.assign(closeBtn.style, tooltipCloseButtonStyles);
    closeBtn.onclick = () => {
        modal.remove();
    };

    const resultContent = document.createElement('div');
    Object.assign(resultContent.style, tooltipResultContentStyles);

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
            <div style="margin-top: 8px; line-height: 1.6; color: #555; background: #f8f9fa; padding: 12px; border-radius: 6px; border-left: 4px solid #007bff;">
                ${result.definition}
            </div>
        </div>
    `;

    modal.appendChild(closeBtn);
    modal.appendChild(resultContent);
    document.body.appendChild(modal);

    const handleOutsideClick = (e: MouseEvent) => {
        if (e.target === modal) {
            modal.remove();
            document.removeEventListener('click', handleOutsideClick);
        }
    };
    
    document.addEventListener('click', handleOutsideClick);
}

/**
 * 툴팁 노드 생성
 * @param text 툴팁 대상 단어(텍스트)
 * @returns 툴팁 노드
 */
function makeTooltipNode(text: string) {
    const span = document.createElement('mark');
    span.textContent = text;
    span.className = 'tooltip-word';
    span.setAttribute('data-tooltipped', '1');
    Object.assign(span.style, tooltipWordStyles);

    const tooltipId = 'tooltip-' + Math.random().toString(36).slice(2);
    span.setAttribute('aria-describedby', tooltipId);

    let hoverTimer: NodeJS.Timeout | null = null
    loadTooltipBubble();

    span.addEventListener('mouseenter', () => {
        currentHoveredNode = span;
        if (isTooltipBubbleHovered) {
            return;
        }

        if (hoverTimer) {
            clearTimeout(hoverTimer);
        }
        
        hoverTimer = setTimeout(() => {
            showTooltipBubble(span, text);
        }, 700);
    });

    span.addEventListener('mouseleave', () => {
        currentHoveredNode = null;

        setTimeout(() => {
            if (isTooltipBubbleHovered) {
                return;
            }

            if (hoverTimer) {
                clearTimeout(hoverTimer);
                hoverTimer = null;
            }
            
            hideTooltipBubble();
        }, 300);
    });

    return span;
}

/**
 * 분석 및 툴팁 생성 완료된 텍스트 노드 처리
 * @param targetNode 대상 텍스트 노드
 */
export function processTooltipNode(targetNode: TargetNode) {
    const parent = targetNode.parent;
    const originalText = targetNode.originalText;

    targetNode.fragments.forEach(f => {
        if (f.isTarget && f.isFinancial) {
            const tooltipNode = makeTooltipNode(f.textnode.textContent || '');
            parent.insertBefore(tooltipNode, originalText);
        } else {
            parent.insertBefore(f.textnode, originalText);
        }
    });

    parent.removeChild(originalText);
}

createTooltipStyles();
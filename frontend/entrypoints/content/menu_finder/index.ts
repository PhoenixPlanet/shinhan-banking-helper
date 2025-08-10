import { logger } from "@/entrypoints/utils/logger";
import { recommendMenu } from "@/entrypoints/content/api";
import {
    modalStyles,
    closeButtonStyles,
    inputStyles,
    sendButtonStyles,
    resultContentStyles,
    loadingButtonStyles,
    createLoadingAnimation,
    moveButtonStyles
} from "./style";

let currentModal: HTMLDivElement | null = null;

export function startMenuFinder() {
    showMenuFinderModal();
}

function removeCurrentModal() {
    if (currentModal) {
        currentModal.remove();
        currentModal = null;
    }
}

function showMenuFinderModal() {
    removeCurrentModal();

    currentModal = document.createElement('div');
    currentModal.className = 'menu-finder-modal';
    currentModal.id = 'banking-helper-menu-finder-modal';
    Object.assign(currentModal.style, modalStyles);

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.className = 'close-btn';
    Object.assign(closeBtn.style, closeButtonStyles);
    closeBtn.onclick = () => {
        removeCurrentModal();
    };

    const title = document.createElement('h3');
    title.textContent = '메뉴 찾기';
    title.style.cssText = 'margin: 0 0 20px 0; color: #333; font-size: 20px; text-align: center;';

    const inputContainer = document.createElement('div');
    inputContainer.style.cssText = 'margin-bottom: 20px;';

    const inputLabel = document.createElement('label');
    inputLabel.textContent = '찾고 싶은 메뉴를 설명해주세요:';
    inputLabel.style.cssText = 'display: block; margin-bottom: 8px; color: #555; font-weight: 500;';

    const input = document.createElement('textarea');
    input.placeholder = '예: 계좌이체를 하고 싶어요';
    Object.assign(input.style, inputStyles);

    const sendBtn = document.createElement('button');
    sendBtn.textContent = '메뉴 찾기';
    Object.assign(sendBtn.style, sendButtonStyles);
    sendBtn.onclick = async () => {
        const request = input.value.trim();
        if (!request) {
            alert('메뉴 요청을 입력해주세요.');
            return;
        }

        try {
            sendBtn.textContent = '검색 중...';
            sendBtn.className = 'loading';
            Object.assign(sendBtn.style, loadingButtonStyles);
            sendBtn.disabled = true;

            const result = await recommendMenu(request);

            showResultContent(result, request);

        } catch (error) {
            alert('메뉴 검색 중 오류가 발생했습니다.');
            logger.error('메뉴 검색 중 오류', error);
        } finally {
            sendBtn.textContent = '메뉴 찾기';
            sendBtn.className = '';
            Object.assign(sendBtn.style, sendButtonStyles);
            sendBtn.disabled = false;
        }
    };

    inputContainer.appendChild(inputLabel);
    inputContainer.appendChild(input);

    currentModal.appendChild(closeBtn);
    currentModal.appendChild(title);
    currentModal.appendChild(inputContainer);
    currentModal.appendChild(sendBtn);

    document.body.appendChild(currentModal);

    // Enter 키로도 전송 가능하도록
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendBtn.click();
        }
    });

    input.focus();
}

function showResultContent(result: any, originalRequest: string) {
    if (!currentModal) {
        return;
    }

    const existingChildren = Array.from(currentModal.children);
    existingChildren.forEach(child => {
        if (child.className === 'close-btn') {
            return;
        }
        (child as HTMLElement).style.display = 'none';
    });

    const resultContent = document.createElement('div');
    Object.assign(resultContent.style, resultContentStyles);

    if (result && result.success && result.selected_menu) {
        const candidateMenus = document.createElement('div');
        if (result.candidate_menus && result.candidate_menus.length > 0) {
            candidateMenus.style.display = 'flex';
            candidateMenus.style.flexDirection = 'column';
            candidateMenus.style.gap = '8px';

            result.candidate_menus.forEach((menu: string) => {
                const menuItem = document.createElement('a');
                menuItem.textContent = menu;
                menuItem.style.display = 'block';
                menuItem.style.padding = '6px 0';
                menuItem.style.color = '#007bff';
                menuItem.style.textDecoration = 'underline';
                menuItem.style.cursor = 'pointer';
                menuItem.addEventListener('click', (e) => {
                    e.preventDefault();
                    logger.info(`${menu} 메뉴 클릭`);
                    const targetLink = findLinkByText(menu);
                    if (targetLink) {
                        logger.info(`${menu} 메뉴로 이동합니다. 링크: ${targetLink.href}`);
                        targetLink.click();
                    } else {
                        alert('해당 메뉴로 이동할 수 없습니다.');
                    }
                    removeCurrentModal();
                });
                candidateMenus.appendChild(menuItem);
            });
        }

        resultContent.innerHTML = `
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">검색 결과</h3>
            <div style="margin-bottom: 15px;">
                <strong style="color: #007bff;">요청:</strong> 
                <span style="color: #666;">${originalRequest}</span>
            </div>
            <div style="margin-bottom: 15px;">
                <strong style="color: #007bff;">추천 메뉴:</strong> 
                <span style="font-weight: 600; color: #333; font-size: 16px;">${result.selected_menu}</span>
            </div>
            <div style="margin-bottom: 15px;">
                <strong style="color: #007bff;">카테고리:</strong> 
                <span style="color: #666;">${result.category || '분류 없음'}</span>
            </div>
            <div style="margin-bottom: 20px;">
                <strong style="color: #007bff;">설명:</strong><br>
                <div style="margin-top: 8px; line-height: 1.6; color: #555; background: #f8f9fa; padding: 12px; border-radius: 6px; border-left: 4px solid #007bff;">
                    ${result.description || '설명이 없습니다.'}
                </div>
            </div>
            <div style="margin-bottom: 20px;">
                <strong style="color: #007bff;">후보 메뉴:</strong><br>
                <div id="candidate-menus-container" style="margin-top: 8px; line-height: 1.6; color: #555; background: #f8f9fa; padding: 12px; border-radius: 6px; border-left: 4px solid #007bff;">
                </div>
            </div>
        `;

        const candidateMenusContainer = resultContent.querySelector('#candidate-menus-container');
        if (candidateMenusContainer && candidateMenus) {
            candidateMenusContainer.appendChild(candidateMenus);
        }

        const moveButton = document.createElement('button');
        moveButton.textContent = '이 메뉴로 이동하기';
        Object.assign(moveButton.style, moveButtonStyles);
        moveButton.onclick = () => {
            const targetLink = findLinkByText(result.selected_menu);
            if (targetLink) {
                targetLink.click();
            } else {
                alert('해당 메뉴로 이동할 수 없습니다.');
            }
            removeCurrentModal();
        };

        resultContent.appendChild(moveButton);
    } else {
        resultContent.innerHTML = `
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">검색 결과</h3>
            <div style="margin-bottom: 20px;">
                <div style="color: #dc3545; background: #f8d7da; padding: 12px; border-radius: 6px; border-left: 4px solid #dc3545;">
                    <strong>죄송합니다.</strong><br>
                    "${originalRequest}"에 대한 적절한 메뉴를 찾을 수 없습니다.<br>
                    다른 키워드로 다시 검색해보세요.
                </div>
            </div>
        `;
    }

    const newSearchButton = document.createElement('button');
    newSearchButton.textContent = '새로 검색하기';
    newSearchButton.style.cssText = `
        padding: 8px 16px;
        backgroundColor: #6c757d;
        color: white;
        border: none;
        borderRadius: 4px;
        cursor: pointer;
        fontSize: 14px;
        marginLeft: 10px;
    `;
    newSearchButton.onclick = () => {
        showMenuFinderModal();
    };

    resultContent.appendChild(newSearchButton);
    currentModal.appendChild(resultContent);
}

function findLinkByText(text: string): HTMLAnchorElement | null {
    const links = document.querySelectorAll('a');
    for (const link of links) {
        if (link.textContent?.trim() === text) {
            return link as HTMLAnchorElement;
        }
    }
    return null;
}

createLoadingAnimation();

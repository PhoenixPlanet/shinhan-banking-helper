import { logger } from "../../utils/logger";
import { startCapture } from "../capture";
import { startMenuFinder } from "../menu_finder";
import { injectToolbarStyles } from "./style";
import { onMessage } from "../../messaging";

interface ToolbarConfig {
    height: number;
    backgroundColor: string;
    borderColor: string;
}

let toolbar: HTMLElement | null = null;
let config: ToolbarConfig = {
    height: 50,
    backgroundColor: '#1e3a8a',
    borderColor: '#3b82f6'
};

function createButton(text: string, onClick: () => void, className: string = 'auto'): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.onclick = onClick;
    
    button.className = className;

    return button;
}

function createToolbarContent(): void {
    if (!toolbar) return;

    const leftSection = document.createElement('div');
    leftSection.className = 'toolbar-section';

    const title = document.createElement('span');
    title.textContent = 'Banking Helper';
    title.className = 'toolbar-title';

    leftSection.appendChild(title);

    const rightSection = document.createElement('div');
    rightSection.className = 'toolbar-section';

    const captureBtn = createButton('용어 알아보기', () => {
        startCapture();
    }, 'capture-btn');

    const menuFinderBtn = createButton('메뉴 찾기', () => {
        startMenuFinder();
    }, 'menu-finder-btn');

    const closeBtn = createButton('✕', () => {
        removeToolbar();
    }, 'tooltip-close-btn');

    rightSection.appendChild(captureBtn);
    rightSection.appendChild(menuFinderBtn);
    rightSection.appendChild(closeBtn);

    toolbar.appendChild(leftSection);
    toolbar.appendChild(rightSection);
}

export function createToolbar(): HTMLElement {
    removeToolbar();
    injectToolbarStyles();

    toolbar = document.createElement('div');
    toolbar.id = 'banking-helper-toolbar';
    
    Object.assign(toolbar.style, {
        height: `${config.height}px`,
    });

    createToolbarContent();

    document.body.appendChild(toolbar);
    document.body.classList.add('has-toolbar');

    logger.info('Banking toolbar created successfully');
    return toolbar;
}

export function removeToolbar(): void {
    if (toolbar && toolbar.parentNode) {
        toolbar.parentNode.removeChild(toolbar);
        toolbar = null;
        
        document.body.classList.remove('has-toolbar');
        
        logger.info('Banking toolbar removed');
    }
}

export function isToolbarVisible(): boolean {
    return toolbar !== null && toolbar.parentNode !== null;
}

export function toggleToolbar(): void {
    if (isToolbarVisible()) {
        removeToolbar();
    } else {
        createToolbar();
    }
}

onMessage('ToggleToolbar', (data) => {
    logger.info('ToggleToolbar message received');
    toggleToolbar();
});

onMessage('StartMenuFinder', (data) => {
    logger.info('StartMenuFinder message received');
    startMenuFinder();
});

onMessage('StartCapture', (data) => {
    logger.info('StartCapture message received');
    startCapture();
});

onMessage('GetToolbarStatus', (data) => {
    logger.info('GetToolbarStatus message received');
    return { isVisible: isToolbarVisible() };
});

document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.key === 'T') {
        event.preventDefault();
        toggleToolbar();
    }
});

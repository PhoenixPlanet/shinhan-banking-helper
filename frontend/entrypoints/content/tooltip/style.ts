import background from "@/entrypoints/background";

export const tooltipBubbleStyles = {
    pointerEvents: 'auto',
    display: 'none',
    position: 'fixed',
    zIndex: '10000',
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    cursor: 'pointer',
    opacity: '0',
    transition: 'all 0.1s ease',
    minWidth: '200px',
    maxWidth: '280px',
    fontSize: '14px',
    lineHeight: '1.4'
} as const;

export const tooltipHeaderStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px'
} as const;

export const tooltipQuestionIconStyles = {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: '2px solid #007bff',
    background: '#007bff',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
} as const;

export const tooltipTitleStyles = {
    fontWeight: '600',
    color: '#333'
} as const;

export const tooltipCheckButtonStyles = {
    width: '100%',
    padding: '8px 12px',
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
} as const;

export const tooltipWordStyles = {
    position: 'relative',
    color: 'inherit',
    background: 'rgba(0,0,0,0)'
} as const;

export const tooltipResultModalStyles = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    zIndex: '10002',
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'auto',
    minWidth: '400px'
} as const;

export const tooltipCloseButtonStyles = {
    position: 'absolute',
    top: '12px',
    right: '16px',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#999',
    fontWeight: 'bold',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background-color 0.2s ease'
} as const;

export const tooltipResultContentStyles = {
    background: 'white',
    padding: '0',
    borderRadius: '8px',
    maxWidth: '500px',
    margin: '0'
} as const;

export const createTooltipStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        .tooltip-close-btn:hover {
            background-color: #f0f0f0 !important;
            color: #666 !important;
        }
        
        .tooltip-result-modal {
            animation: tooltipModalFadeIn 0.3s ease-out;
        }
        
        @keyframes tooltipModalFadeIn {
            from {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.9);
            }
            to {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
        }

        @keyframes tooltipButtonBlink {
            0% {
                opacity: 1;
            }
            50% {
                opacity: 0.3;
            }
            100% {
                opacity: 1;
            }
        }
        
        .tooltip-check-btn.loading {
            animation: tooltipButtonBlink 1.5s ease-in-out infinite;
            cursor: not-allowed;
        }
        
        .tooltip-check-btn.loading::after {
            content: '...';
        }
    `;
    document.head.appendChild(style);
};

export function createTooltipHTML(): string {
    return `
        <div style="${Object.entries(tooltipHeaderStyles).map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`).join('; ')}">
            <span class="tooltip-question-icon" style="${Object.entries(tooltipQuestionIconStyles).map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`).join('; ')}">?</span>
            <span style="${Object.entries(tooltipTitleStyles).map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`).join('; ')}">금융 용어</span>
        </div>
        <button class="tooltip-check-btn" style="${Object.entries(tooltipCheckButtonStyles).map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`).join('; ')}">용어 확인하기</button>
    `;
}

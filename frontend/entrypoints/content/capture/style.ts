export const modalStyles = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    zIndex: '10001',
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'auto',
    minWidth: '400px'
} as const;

export const closeButtonStyles = {
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

export const croppedImageStyles = {
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
    marginBottom: '15px'
} as const;

export const sendButtonStyles = {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
} as const;

export const overlayStyles = {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: '10000',
    pointerEvents: 'none',
    cursor: 'crosshair'
} as const;

export const selectionBoxStyles = {
    position: 'fixed',
    border: '2px dashed red',
    background: 'rgba(0,0,0,0.1)',
    zIndex: '10000',
    pointerEvents: 'none'
} as const;

export const resultContentStyles = {
    background: 'white',
    padding: '0',
    borderRadius: '8px',
    maxWidth: '500px',
    margin: '0'
} as const;

// 전송 중 애니메이션을 위한 스타일
export const loadingButtonStyles = {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'not-allowed',
    fontSize: '14px',
    fontWeight: 'bold',
    position: 'relative' as const
} as const;

export const createLoadingAnimation = () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes blink {
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
        
        .loading {
            animation: blink 1.5s ease-in-out infinite;
        }
        
        .loading::after {
            content: '...';
        }

        .close-btn:hover {
            background-color: #f0f0f0 !important;
            color: #666 !important;
        }
        
        .modal {
            animation: modalFadeIn 0.3s ease-out;
        }
        
        @keyframes modalFadeIn {
            from {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.9);
            }
            to {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
        }
    `;
    document.head.appendChild(style);
};

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

export const inputStyles = {
    width: '100%',
    minHeight: '80px',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box' as const,
    outline: 'none',
    transition: 'border-color 0.2s ease'
} as const;

export const sendButtonStyles = {
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    width: '100%',
    transition: 'background-color 0.2s ease'
} as const;

export const resultContentStyles = {
    background: 'white',
    padding: '0',
    borderRadius: '8px',
    maxWidth: '500px',
    margin: '0'
} as const;

export const loadingButtonStyles = {
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'not-allowed',
    fontSize: '14px',
    fontWeight: 'bold',
    width: '100%',
    position: 'relative' as const
} as const;

export const moveButtonStyles = {
    padding: '12px 24px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    width: '100%',
    marginBottom: '10px',
    transition: 'background-color 0.2s ease'
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
        
        .menu-finder-modal {
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

        .menu-finder-modal textarea:focus {
            border-color: #007bff !important;
        }

        .menu-finder-modal button:hover:not(:disabled) {
            background-color: #0056b3 !important;
        }

        .menu-finder-modal button[style*="background-color: #28a745"]:hover {
            background-color: #218838 !important;
        }
    `;
    document.head.appendChild(style);
};

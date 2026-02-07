import React from 'react';

const spinnerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999
};

const spinnerInnerStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #43a047',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
};

const LoadingSpinner: React.FC = () => {
    return (
        <div style={spinnerStyle}>
            <div style={spinnerInnerStyle}></div>
            <style>{`@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
        </div>
    );
};

export default React.memo(LoadingSpinner);

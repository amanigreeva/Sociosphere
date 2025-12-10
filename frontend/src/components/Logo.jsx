// frontend/src/components/Logo.jsx
import React from 'react';

const Logo = ({ size = 'medium', showText = true }) => {
    const sizes = {
        small: { fontSize: '1.5rem', infinitySize: '1.2em' },
        medium: { fontSize: '2rem', infinitySize: '1.3em' },
        large: { fontSize: '2.5rem', infinitySize: '1.4em' }
    };

    const currentSize = sizes[size] || sizes.medium;

    return (
        <span
            style={{
                fontFamily: '"Billabong", "Dancing Script", cursive, "Segoe UI", sans-serif',
                fontSize: currentSize.fontSize,
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                cursor: 'pointer',
                userSelect: 'none'
            }}
        >
            <span
                style={{
                    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}
            >
                Soci
            </span>
            <span
                style={{
                    background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888, #833ab4, #5b51d8, #405de6, #5b51d8, #833ab4, #bc1888)',
                    backgroundSize: '200% 200%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'rainbow 3s ease infinite',
                    fontSize: currentSize.infinitySize,
                    fontWeight: 'bold',
                    margin: '0 2px'
                }}
            >
                ∞
            </span>
            <span
                style={{
                    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}
            >
                rbit
            </span>
            <style>
                {`
          @keyframes rainbow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
            </style>
        </span>
    );
};

export default Logo;

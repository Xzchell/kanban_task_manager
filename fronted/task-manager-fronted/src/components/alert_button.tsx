import React from 'react';
import { motion } from 'framer-motion';

export interface IAlertButtonProps {
    text: string;
    onClick: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    status?: 'primary' | 'secondary' | 'danger';
}

const AlertButton: React.FC<IAlertButtonProps> = ({ text, onClick, disabled = false, type = 'button', status = 'primary' }) => {
    const themes = {
        primary: { bg: '#0088ff', text: '#fff', hover: '#0077ee' },
        secondary: { bg: '#d3d2d2', text: '#3f3f3f', hover: '#c5c4c4' },
        danger: { bg: '#f9cbcc', text: '#ff383c', hover: '#f7b9ba' },
        disabled: { bg: '#ccc', text: '#666' }
    };

    const current = disabled ? themes.disabled : themes[status];

    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled}
            tabIndex={0}
            
            // Анимация состояний
            whileHover={!disabled ? { 
                scale: 1.03, 
                backgroundColor: current.bg,
                transition: { duration: 0.2 }
            } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            
            style={{
                padding: '12px 20px',
                width: '100%',
                backgroundColor: current.bg,
                color: current.text,
                border: 'none',
                borderRadius: '100px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                fontFamily: 'var(--font-rounded), sans-serif',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: status === 'danger' && !disabled 
                    ? '0 4px 12px rgba(255, 56, 60, 0.15)' 
                    : 'none'
            }}
        >
            {text}
        </motion.button>
    );
}

export default AlertButton;
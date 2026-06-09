import React from 'react';
import { motion } from 'framer-motion';

export interface IButtonProps {
    text: string;
    onClick: () => void;
    disabled?: boolean;
    fullWidth?: boolean;
    status?: 'primary' | 'secondary' | 'danger';
    icon?: React.ReactNode;
}

const DefaultButton: React.FC<IButtonProps> = ({ text, onClick, fullWidth, disabled = false, status = 'primary', icon}) => {
    const colors = {
        primary: { bg: '#0d6fff', text: '#fff', hover: '#005ae0' },
        secondary: { bg: '#d3d2d2', text: '#3f3f3f', hover: '#c2c1c1' },
        danger: { bg: '#f1bebf', text: '#ff060b', hover: '#eeb0b1' },
        disabled: { bg: '#ccc', text: '#666' }
    };

    const currentTheme = disabled ? colors.disabled : colors[status];

    return (
        <motion.button

            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.96 } : {}}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onClick}
            disabled={disabled}
            style={{
                padding: '12px 24px',
                margin: '5px 0',
                backgroundColor: currentTheme.bg,
                color: currentTheme.text,
                border: 'none',
                borderRadius: '12px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                fontFamily: 'var(--font-rounded), sans-serif',
                width: fullWidth ? '100%' : 'fit-content',
                outline: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',

            }}
        >
            <div style={{display: 'flex', flexDirection: 'row' as const, gap: '5px', justifyItems: 'center', alignItems: 'center'}}>
                {icon}
                {text}
            </div>
        </motion.button>
    );
}

export default DefaultButton;
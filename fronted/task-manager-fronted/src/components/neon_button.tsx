import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface INeonButtonProps {
    text: string;
    onClick: () => void;
    disabled?: boolean;
    fullWidth?: boolean;
    status?: 'primary' | 'secondary' | 'danger';
    icon?: React.ReactNode;
    borderRadius?: string;
    leftIcon?: boolean;
}

const NeonButton: React.FC<INeonButtonProps> = ({ 
    text, 
    onClick, 
    fullWidth, 
    disabled = false, 
    status = 'primary', 
    icon, 
    borderRadius = 'var(--radius)', 
    leftIcon = true 
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const themes = {
        primary: {
            bg: '#4f6ef7', 
            text: '#ffffff',
            shadow: '0 8px 24px rgba(79, 110, 247, 0.35)',
            hoverShadow: '0 12px 32px rgba(79, 110, 247, 0.6), 0 0 20px rgba(79, 110, 247, 0.4)' // Интенсивный неоновый взрыв
        },
        secondary: {
            bg: '#6366f1',
            text: '#ffffff',
            shadow: '0 8px 24px rgba(99, 102, 241, 0.25)',
            hoverShadow: '0 12px 32px rgba(99, 102, 241, 0.5), 0 0 20px rgba(99, 102, 241, 0.3)' // Плотный фиолетовый неон
        },
        danger: {
            bg: '#ef4444',
            text: '#ffffff',
            shadow: '0 8px 24px rgba(239, 68, 68, 0.3)',
            hoverShadow: '0 12px 32px rgba(239, 68, 68, 0.6), 0 0 20px rgba(239, 68, 68, 0.4)'
        },
        disabled: {
            bg: '#cbd5e1',
            text: '#64748b',
            shadow: 'none',
            hoverShadow: 'none'
        }
    };

    const currentTheme = disabled ? themes.disabled : themes[status];

    return (
        <motion.button
            whileHover={!disabled ? { scale: 1.03 } : {}}
            whileTap={!disabled ? { scale: 0.96 } : {}}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onClick}
            disabled={disabled}
            onMouseEnter={() => !disabled && setIsHovered(true)}
            onMouseLeave={() => !disabled && setIsHovered(false)}
            style={{
                ...styles.buttonBase,
                backgroundColor: currentTheme.bg,
                color: currentTheme.text,
                borderRadius: borderRadius,
                cursor: disabled ? 'not-allowed' : 'pointer',
                width: fullWidth ? '100%' : 'fit-content',
                boxShadow: isHovered ? currentTheme.hoverShadow : currentTheme.shadow,
            }}
        >
            {!disabled && (
                <span 
                    style={{
                        ...styles.glowStreak,
                        transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)'
                    }} 
                />
            )}

            <div style={styles.contentLayout}>
                {leftIcon && icon && <span style={styles.iconWrapper}>{icon}</span>}
                <span style={{ position: 'relative', zIndex: 2, color: currentTheme.text }}>{text}</span>
                {!leftIcon && icon && <span style={styles.iconWrapper}>{icon}</span>}
            </div>
        </motion.button>
    );
};

export default NeonButton;

const styles = {
    buttonBase: {
        position: 'relative' as const,
        padding: '16px 40px',
        margin: '5px 0',
        border: 'none',
        fontSize: '16px',
        fontWeight: 'bold',
        fontFamily: "var(--font-rounded), 'Nunito', sans-serif",
        boxSizing: 'border-box' as const,
        outline: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden' as const,
        transition: 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    glowStreak: {
        position: 'absolute' as const,
        inset: 0,
        background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 100%)',
        transition: 'transform 0.6s ease-in-out',
        pointerEvents: 'none' as const,
        zIndex: 1,
    },
    contentLayout: {
        display: 'flex',
        flexDirection: 'row' as const,
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative' as const,
        zIndex: 2,
    },
    iconWrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        padding: '6px',
        borderRadius: '8px',
        position: 'relative' as const,
        zIndex: 2,
    }
};
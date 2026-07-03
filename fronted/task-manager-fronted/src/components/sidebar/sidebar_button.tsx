import React from 'react';
import { motion } from 'framer-motion';

export interface ISidebarButtonProps {
    text: string;
    onClick: () => void;
    icon?: React.ReactNode;
    status?: 'neutral' | 'active' | 'danger'; // Статусы цвета
    size?: 'small' | 'full';                  // Вид: маленькая или широкая на всю строку
    isCollapsed?: boolean;                     // Флаг: свернут ли сайдбар (чтобы прятать текст)
    disabled?: boolean;
}

const SidebarButton: React.FC<ISidebarButtonProps> = ({
    text,
    onClick,
    icon,
    status = 'neutral',
    size = 'full',
    isCollapsed = false,
    disabled = false
}) => {
    // Массив цветовых схем в твоем стиле (без var, чтобы ничего не ломалось)
    const themes = {
        neutral: {
            bg: 'transparent',
            text: '#647080',
            hoverBg: 'rgba(0, 0, 0, 0.04)',
            hoverText: '#1e293b'
        },
        active: {
            bg: 'rgba(79, 110, 247, 0.08)', // Нежный фоновый акцент
            text: '#4f6ef7',                // Фирменный синий
            hoverBg: 'rgba(79, 110, 247, 0.12)',
            hoverText: '#4f6ef7'
        },
        danger: {
            bg: 'transparent',
            text: '#ef4444',                // Насыщенный красный
            hoverBg: 'rgba(239, 68, 68, 0.08)',
            hoverText: '#dc2626'
        }
    };

    const currentTheme = themes[status];

    return (
        <motion.button
            whileHover={!disabled ? { scale: 1.01 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            onClick={onClick}
            disabled={disabled}
            style={{
                ...styles.buttonBase,
                backgroundColor: currentTheme.bg,
                color: currentTheme.text,
                width: size === 'full' ? '100%' : 'fit-content',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                padding: size === 'small' ? '8px 12px' : '12px 14px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
            }}
            // Инлайновые хаки для ховера через JS (без CSS файлов)
            onMouseEnter={(e) => {
                if (!disabled) {
                    e.currentTarget.style.backgroundColor = currentTheme.hoverBg;
                    e.currentTarget.style.color = currentTheme.hoverText;
                }
            }}
            onMouseLeave={(e) => {
                if (!disabled) {
                    e.currentTarget.style.backgroundColor = currentTheme.bg;
                    e.currentTarget.style.color = currentTheme.text;
                }
            }}
        >
            {/* Контейнер иконки */}
            {icon && (
                <div style={{ ...styles.iconWrapper, marginRight: isCollapsed ? '0px' : '12px' }}>
                    {icon}
                </div>
            )}

            {/* Текст кнопки скрывается плавно, если сайдбар свернут */}
            {!isCollapsed && (
                <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    style={styles.textLabel}
                >
                    {text}
                </motion.span>
            )}
        </motion.button>
    );
};

export default SidebarButton;

// ─── ОБЪЕКТ СТИЛЕЙ КНОПКИ ДЛЯ САЙДБАРА ───
const styles = {
    buttonBase: {
        border: 'none',
        outline: 'none',
        borderRadius: '14px', // Мягкое скругление под стиль сайдбара
        display: 'flex',
        alignItems: 'center',
        fontSize: '15px',
        fontWeight: 600,
        fontFamily: "var(--font-rounded), 'Nunito', sans-serif",
        boxSizing: 'border-box' as const,
        transition: 'all 0.2s ease-in-out',
        margin: '2px 0',
    },
    iconWrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '20px',
        height: '20px',
    },
    textLabel: {
        whiteSpace: 'nowrap' as const,
    }
};
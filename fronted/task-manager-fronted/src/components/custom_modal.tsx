import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDesignMode } from '../context/design_context';
import { theme } from '../themes/themes';

export interface ICustomModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    width?: string;
    height?: string;
}

const CustomModal: React.FC<ICustomModalProps> = ({ isOpen, onClose, children, width, height }) => {
    const { mode } = useDesignMode();
    const activeModalTheme = theme.modes[mode].modal;

    const dynamicBackdropStyle = {
        ...styles.backdrop,
        backgroundColor: activeModalTheme.backdropBackground,
        backdropFilter: activeModalTheme.backdropFilter,
        WebkitBackdropFilter: activeModalTheme.WebkitBackdropFilter
    };

    const dynamicCardStyle = {
        ...styles.modalCard,
        backgroundColor: activeModalTheme.cardBackground,
        border: activeModalTheme.border,
        boxShadow: activeModalTheme.boxShadow,
        maxWidth: width || styles.modalCard.maxWidth, 
        height: height || styles.modalCard.height 
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    style={dynamicBackdropStyle}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={onClose}
                >
                    <motion.div 
                        style={dynamicCardStyle}
                        initial={{ opacity: 0, scale: 0.93, x: "-50%", y: "-43%" }} 
                        animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}   
                        exit={{ 
                            opacity: 0, 
                            scale: 0.95, 
                            x: "-50%", 
                            y: "-46%",
                            transition: { duration: 0.15, ease: "easeIn" } 
                        }}    
                        transition={{ 
                            type: "spring", 
                            damping: 25, 
                            stiffness: 260,
                            mass: 0.9
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={styles.content}>
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

const styles = {
    backdrop: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease',
    },
    modalCard: {
        top: '50%',
        left: '50%',
        position: 'fixed' as const,
        transform: 'translate(-50%, -50%)',
        zIndex: 10000,
        width: '100%',
        maxWidth: '60vw',
        maxHeight: '80vh',
        height: '100%',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden' as const,
        transition: 'background-color 0.3s ease, border 0.3s ease, box-shadow 0.3s ease',
    },
    content: {
        padding: '20px',
        flex: 1,
        flexDirection: 'column' as const,
        minHeight: 0,
        overflowY: 'auto' as const,
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 4%, black 96%, transparent)',
        maskImage: 'linear-gradient(to bottom, transparent, black 4%, black 96%, transparent)',
    }
};

export default CustomModal;
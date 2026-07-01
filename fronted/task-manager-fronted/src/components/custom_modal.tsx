import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ICustomModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    width?: string;
    height?: string;
}

const CustomModal: React.FC<ICustomModalProps> = ({ isOpen, onClose, children, width, height }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    style={styles.backdrop}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={onClose}
                >
                    <motion.div 
                        style={{ 
                            ...styles.modalCard, 
                            maxWidth: width || styles.modalCard.maxWidth, 
                            height: height || styles.modalCard.height 
                        }}
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
        </AnimatePresence>
    );
};

export default CustomModal;

const styles = {
    backdrop: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.3)',
        zIndex: 1000,
        backdropFilter: 'blur(8px)', 
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCard: {
        top: '50%',
        left: '50%',
        position: 'fixed' as const,
        transform: 'translate(-50%, -50%)',
        zIndex: 1001,
        width: '100%',
        maxWidth: '60vw',
        maxHeight: '80vh',
        height: '100%',
        backgroundColor: '#fff',
        color: 'var(--foreground)', 
        borderRadius: '24px',
        border: '1px solid var(--border)',
        boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.2), 0 0 50px -10px rgba(79, 110, 247, 0.05)',
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden' as const,
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
import { useState, type FC } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface IStatusContainer {
    status: number;
    taskId?: number;
    onStatusChange?: (taskid : number, newStatus: number) => void;
}

const StatusTaskContainer: FC<IStatusContainer> = ({ status, taskId, onStatusChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const config: { [key: number]: { text: string; color: string; backgroundColor: string } } = {
        1: { text: 'Новая', color: '#155dfc', backgroundColor: '#eff6ff' },
        2: { text: 'В работе', color: '#c138fa', backgroundColor: '#faf5ff' },
        3: { text: 'На проверке', color: '#e98500', backgroundColor: '#fffbeb' },
        4: { text: 'Завершена', color: '#0fa63e', backgroundColor: '#f0fdf4' },
    };

    const current = config[status] || config[1];

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    ...styles.wrapper,
                    backgroundColor: current.backgroundColor,
                    color: current.color,
                    border: `1px solid ${current.color}40`,
                }}
            >
                <div style={styles.contentLeft}>
                    <span style={{ ...styles.dot, backgroundColor: current.color }}></span>
                    <span style={styles.textDisplay}>{current.text}</span>
                </div>
                <span style={{ 
                    ...styles.chevron, 
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    borderTopColor: current.color 
                }}></span>
            </div>
            <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.1, ease: "easeOut" }}
                    //style={styles.dropdown}
                    >
                
                    <div style={styles.overlay} onClick={() => setIsOpen(false)} />
                    
                    <div style={styles.dropdown}>
                        {Object.entries(config).map(([id, info]) => (
                                <div 
                                    key={id} 
                                    onClick={() => {
                                        onStatusChange?.(taskId!, Number(id));
                                        setIsOpen(false);
                                    }} 
                                    style={{
                                        ...styles.option,
                                        backgroundColor: Number(id) === status ? info.backgroundColor : 'transparent',
                                        color: Number(id) === status ? info.color : '#1e293b'
                                    }}
                                >
                                <div style={styles.contentLeft}>
                                    <span style={{ ...styles.dot, backgroundColor: info.color }}></span>
                                    <span style={{...styles.textDisplay, fontSize: '15px'}}>{info.text}</span>
                                </div>
                                {Number(id) === status && (
                                    <span style={{ color: info.color, fontWeight: 'bold' }}>✓</span>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}</AnimatePresence>
        </div>
    );
}

export default StatusTaskContainer;

const styles = {
    wrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '10px',
        padding: '8px 12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        userSelect: 'none' as const,
    },
    contentLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    dot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        flexShrink: 0,
    },
    textDisplay: {
        fontFamily: 'var(--font-rounded)',
        fontWeight: 600,
        fontSize: '16px',
    },
    chevron: {
        width: 0,
        height: 0,
        borderLeft: '5px solid transparent',
        borderRight: '5px solid transparent',
        borderTop: '5px solid',
        transition: 'transform 0.2s ease',
    },
    dropdown: {
        position: 'absolute' as const,
        top: '110%',
        left: 0,
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        padding: '6px',
        zIndex: 100,
        border: '1px solid #e2e8f0',
    },
    option: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background 0.2s',
        fontFamily: 'var(--font-rounded)',
        fontWeight: 500,
    },
    overlay: {
        position: 'fixed' as const,
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 99,
    }
};
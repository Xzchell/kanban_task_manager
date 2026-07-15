import { useState, type FC } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { IColumns } from "../hook/useBoards";

export interface IStatusContainer {
    status: number;
    taskId?: number;
    columns: IColumns[];
    onStatusChange?: (taskId: number, newColumnId: number) => void;
}

const COLUMN_COLORS = [
    { color: '#155dfc', backgroundColor: '#eff6ff' }, 
    { color: '#c138fa', backgroundColor: '#faf5ff' }, 
    { color: '#e98500', backgroundColor: '#fffbeb' }, 
    { color: '#0fa63e', backgroundColor: '#f0fdf4' }, 
    { color: '#ef4444', backgroundColor: '#fef2f2' }, 
    { color: '#06b6d4', backgroundColor: '#ecfeff' }, 
];

const StatusTaskContainer: FC<IStatusContainer> = ({ status, taskId, columns, onStatusChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const sortedColumns = [...columns].sort((a, b) => a.position - b.position);

    const currentColumnIndex = sortedColumns.findIndex(col => col.id === status);
    const currentColumn = sortedColumns[currentColumnIndex >= 0 ? currentColumnIndex : 0];

    if (!currentColumn) return null;

    const currentStyle = COLUMN_COLORS[currentColumnIndex % COLUMN_COLORS.length] || COLUMN_COLORS[0];

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    ...styles.wrapper,
                    backgroundColor: currentStyle.backgroundColor,
                    color: currentStyle.color,
                    border: `1px solid ${currentStyle.color}40`,
                }}
            >
                <div style={styles.contentLeft}>
                    <span style={{ ...styles.dot, backgroundColor: currentStyle.color }}></span>
                    <span style={styles.textDisplay}>{currentColumn.name}</span>
                </div>
                <span style={{ 
                    ...styles.chevron, 
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    borderTopColor: currentStyle.color 
                }}></span>
            </div>

            <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.1, ease: "easeOut" }}
                    style={{ position: 'absolute', width: '100%', zIndex: 100 }}
                >
                    <div style={styles.overlay} onClick={() => setIsOpen(false)} />
                    
                    <div style={styles.dropdown}>
                        {sortedColumns.map((col, idx) => {
                            const isSelected = col.id === status;
                            const colStyle = COLUMN_COLORS[idx % COLUMN_COLORS.length];

                            return (
                                <div 
                                    key={col.id} 
                                    onClick={() => {
                                        if (taskId) onStatusChange?.(taskId, Number(col.id));
                                        setIsOpen(false);
                                    }} 
                                    style={{
                                        ...styles.option,
                                        backgroundColor: isSelected ? colStyle.backgroundColor : 'transparent',
                                        color: isSelected ? colStyle.color : '#1e293b'
                                    }}
                                >
                                    <div style={styles.contentLeft}>
                                        <span style={{ ...styles.dot, backgroundColor: colStyle.color }}></span>
                                        <span style={{...styles.textDisplay, fontSize: '15px'}}>{col.name}</span>
                                    </div>
                                    {isSelected && (
                                        <span style={{ color: colStyle.color, fontWeight: 'bold' }}>✓</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
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
        top: '8px',
        left: 0,
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        padding: '6px',
        border: '1px solid #e2e8f0',
        zIndex: 101,
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
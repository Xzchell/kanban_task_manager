
import { motion } from "framer-motion";
import React from "react";
import type { ISortConfig } from "../hook/useTasks";
import { useDesignMode } from "../context/design_context";
import { ToggleSwitch } from "./switcher";

export interface IFilterDrawer {
    onClose: () => void;
    sortConfig: ISortConfig;
    setSortConfig: (config: ISortConfig) => void;
}

const FilterDrawer: React.FC<IFilterDrawer> = ({ onClose, sortConfig, setSortConfig }) => {
    const { mode } = useDesignMode();
    void mode;

    const setIsMvp = (value : boolean) => {
        setSortConfig({ ...sortConfig, isMvpOnly: value})
    }

    const setIAmExecutor = (value : boolean) => {
        setSortConfig({ ...sortConfig, iAmExecutor: value})
    }

    return (
        <>
            <motion.div 
                style={drawerStyles.backdrop}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div 
                    style={drawerStyles.panel}
                    initial={{ x: "100%" }} 
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div style={drawerStyles.header}>
                        <h2 style={{ margin: 0, fontSize: '22px' }}>Фильтрация</h2>
                        <button onClick={onClose} style={drawerStyles.closeBtn}>✕</button>
                    </div>
                    
                    <div style={drawerStyles.section}>
                                <p style={drawerStyles.sectionTitle}>Сортировка по алфавиту</p>
                                <div style={drawerStyles.optionGroup}>
                                    <button 
                                        style={sortConfig.alphabet === 'asc' ? drawerStyles.activeOpt : drawerStyles.opt}
                                        onClick={() => setSortConfig({ ...sortConfig, alphabet: 'asc' })}
                                    >
                                        А → Я
                                    </button>
                                    <button 
                                        style={sortConfig.alphabet === 'desc' ? drawerStyles.activeOpt : drawerStyles.opt}
                                        onClick={() => setSortConfig({ ...sortConfig, alphabet: 'desc' })}
                                    >
                                        Я → А
                                    </button>
                                    <button 
                                        style={sortConfig.alphabet === 'none' ? drawerStyles.activeOpt : drawerStyles.opt}
                                        onClick={() => setSortConfig({ ...sortConfig, alphabet: 'none' })}
                                    >
                                        ✕
                                    </button>
                                </div>
                            <div style={drawerStyles.section}>
                                <p style={drawerStyles.sectionTitle}>Приоритет</p>
                                <div style={drawerStyles.optionGroup}>
                                    <button 
                                        style={sortConfig.priority === 'asc' ? drawerStyles.activeOpt : drawerStyles.opt}
                                        onClick={() => setSortConfig({ ...sortConfig, priority: 'asc' })}
                                    >
                                        Сначала низкий
                                    </button>
                                    <button 
                                        style={sortConfig.priority === 'desc' ? drawerStyles.activeOpt : drawerStyles.opt}
                                        onClick={() => setSortConfig({ ...sortConfig, priority: 'desc' })}
                                    >
                                        Сначала высокий
                                    </button>
                                    <button 
                                        style={sortConfig.priority === 'none' ? drawerStyles.activeOpt : drawerStyles.opt}
                                        onClick={() => setSortConfig({ ...sortConfig, priority: 'none' })}
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                                <p style={drawerStyles.sectionTitle}>isMvp задача</p>
                                <ToggleSwitch
                                    onChange={setIsMvp}
                                    checked = {sortConfig.isMvpOnly}
                                    label="Фильтр по MVP"
                                />

                                <p style={drawerStyles.sectionTitle}>Я исполнитель</p>
                                <ToggleSwitch
                                    onChange={setIAmExecutor}
                                    checked = {sortConfig.iAmExecutor}
                                    label="Задачи, где я исполнитель"
                                />
                        </div>
                </motion.div>
            </motion.div>
        </>
    );
};

export default FilterDrawer;

const drawerStyles = {
    backdrop: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 2000,
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'flex-end', 
    },
    panel: {
        width: '350px',
        height: '100%',
        backgroundColor: '#fff',
        boxShadow: '-5px 0 25px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column' as const,
        padding: '30px',
        overflowY: 'auto' as const,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        fontFamily: 'var(--font-rounded)',
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        color: '#333',
    },
    content: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '20px',
    },
    section: {
        borderBottom: '1px solid #eee',
        paddingBottom: '20px',
    },
    sectionTitle: {
        fontWeight: 700,
        color: '#888',
        marginBottom: '12px',
        fontSize: '14px',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
    },
    optionGroup: {
        display: 'flex',
        flexWrap: 'wrap' as const,
        gap: '10px',
    },
    opt: {
        padding: '10px 16px',
        borderRadius: '12px',
        border: '1.5px solid #eee',
        backgroundColor: '#f9f9f9',
        cursor: 'pointer',
        fontFamily: 'var(--font-rounded)',
        fontWeight: 600,
        transition: 'all 0.2s ease',
    },
    activeOpt: {
        padding: '10px 16px',
        borderRadius: '12px',
        border: '1.5px solid #000',
        backgroundColor: '#000',
        color: '#fff',
        cursor: 'pointer',
        fontFamily: 'var(--font-rounded)',
        fontWeight: 600,
    }
};
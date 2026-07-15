import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, Users, LogOut, PanelLeftOpen, ChevronLeft, ArrowLeft, LayoutDashboard, Settings } from 'lucide-react';
import SidebarButton from './sidebar_button';
import { useAuth } from '../../context/auth_context';
import { useLocation, useNavigate } from 'react-router-dom';
import { theme } from '../../themes/themes';
import { useDesignMode } from '../../context/design_context';
import { useBoard } from '../../hook/useBoards';

interface MenuItem {
    id: string;
    icon: React.ReactNode;
    label: string;
    path: string;
}

export const FloatingSidebar: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [activeTab, setActiveTab] = useState('boards');

    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const { mode } = useDesignMode();
    
    const { loading, selectedBoard, resetDataBoard } = useBoard();

    const activeDesign = theme.modes[mode];
    const currentTab = location.pathname.split('/')[1] || 'boards';

    useEffect(() => {
        setActiveTab(currentTab);

        const globalPages = ['boards', 'settings'];

        if (globalPages.includes(currentTab) && (selectedBoard !== null || localStorage.getItem("selected_board_id"))) {
            resetDataBoard?.();
        }
    }, [location.pathname, currentTab]);

    const handleTabClick = (tabId: string, path: string) => {
        setActiveTab(tabId);
        navigate(path);
    };

    const handleBackToBoards = () => {
        if (resetDataBoard) {
            resetDataBoard();
        }
        handleTabClick('boards', '/boards');
    };

    const globalMenuItems: MenuItem[] = [
        { id: 'boards', icon: <Folder size={20} />, label: "Мои доски", path: '/boards' },
        { id: 'settings', icon: <Settings size={20} />, label: "Параметры", path: '/settings' },
    ];

    const boardMenuItems: MenuItem[] = [
        { id: 'board-tasks', icon: <LayoutDashboard size={20} />, label: "Задачи доски", path: '/board-tasks' },
        { id: 'board-members', icon: <Users size={20} />, label: "Участники", path: '/board-members' },
        { id: 'board-settings', icon: <Settings size={20} />, label: "Настройки доски", path: '/board-settings' },
    ];

    const hasIdInStorage = Boolean(localStorage.getItem("selected_board_id"));
    const isBoardContextActive = selectedBoard !== null || (loading && hasIdInStorage);

    return (
        <motion.div
            animate={{ width: isCollapsed ? '84px' : '280px' }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            style={{ ...styles.sidebarContainer, ...activeDesign.sidebar }}
        >
            <div style={styles.header}>
                {!isCollapsed && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={styles.logoWrapper}
                    >
                        <img src="src/assets/site_logo.svg" alt="Logo" style={styles.logoImg} />
                        <h2 style={styles.logoTitle}>TaskManager</h2>
                    </motion.div>
                )}
                
                <button onClick={() => setIsCollapsed(!isCollapsed)} style={styles.toggleButton}>
                    {isCollapsed ? <PanelLeftOpen size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            <div style={{ marginBottom: isBoardContextActive && !isCollapsed ? '16px' : '0px', transition: 'margin 0.2s' }}>
                <AnimatePresence mode="wait">
                    {isBoardContextActive && !isCollapsed && (
                        <motion.div
                            key="board-title-container"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.15 }}
                            style={styles.boardTitleContainer}
                        >
                            {selectedBoard ? (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={styles.boardTitleLabel}>Текущая доска:</span>
                                    <span style={styles.boardTitleName}>{selectedBoard.title}</span>
                                </div>
                            ) : (
                                <motion.div
                                    key="board-title-loading"
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                    style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '4px' }}
                                >
                                        <div style={{ width: '80px', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} />
                                        <div style={{ width: '140px', height: '16px', backgroundColor: '#cbd5e1', borderRadius: '4px' }} />
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div style={styles.menuList}>
                <AnimatePresence mode="popLayout" initial={false}>
                    {isBoardContextActive ? (
                        <motion.div
                            key="board-menu"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.15, ease: "easeInOut" }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}
                        >
                            <SidebarButton
                                text="Назад к доскам"
                                icon={<ArrowLeft size={20} />}
                                isCollapsed={isCollapsed}
                                size="full"
                                status="neutral"
                                onClick={handleBackToBoards}
                            />
                            {boardMenuItems.map((item) => (
                                <SidebarButton
                                    key={item.id}
                                    text={item.label}
                                    icon={item.icon}
                                    isCollapsed={isCollapsed}
                                    size="full"
                                    status={activeTab === item.id ? 'active' : 'neutral'}
                                    onClick={() => handleTabClick(item.id, item.path)}
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="global-menu"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.15, ease: "easeInOut" }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}
                        >
                            {globalMenuItems.map((item) => (
                                <SidebarButton
                                    key={item.id}
                                    text={item.label}
                                    icon={item.icon}
                                    isCollapsed={isCollapsed}
                                    size="full"
                                    status={activeTab === item.id ? 'active' : 'neutral'}
                                    onClick={() => handleTabClick(item.id, item.path)}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div style={styles.footerSection}>
                <div 
                    style={{ ...styles.profileCard, justifyContent: isCollapsed ? 'center' : 'flex-start' }} 
                    onClick={() => navigate('/profile')}
                >
                    <div style={styles.avatar}>В</div>
                    {!isCollapsed && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.userInfo}>
                            <span style={styles.userName}>Владислав</span>
                            <span style={styles.userRole}>Разработчик</span>
                        </motion.div>
                    )}
                </div>

                <SidebarButton
                    text="Выйти"
                    icon={<LogOut size={19} />}
                    status="danger"
                    size="full"
                    isCollapsed={isCollapsed}
                    onClick={logout}
                />
            </div>
        </motion.div>
    );
};

export default FloatingSidebar;

const styles = {
    sidebarContainer: {
        position: 'fixed' as const,
        top: '20px',
        left: '20px',
        bottom: '20px',
        borderRadius: theme.borderRadius.xlarge,
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden' as const,
        zIndex: 15,
        padding: '20px 14px',
        boxSizing: 'border-box' as const,
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        padding: '0 8px',
        height: '60px',
        flexShrink: 0,
        overflow: 'hidden' as const,
    },
    logoWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    logoImg: {
        width: '48px',
        height: '48px',
        borderRadius: '12px'
    },
    logoTitle: {
        color: '#000000',
        marginLeft: '4px',
        fontSize: '20px',
        fontFamily: 'var(--font-rounded)'
    },
    toggleButton: {
        background: 'none',
        border: 'none',
        outline: 'none',
        cursor: 'pointer',
        color: '#647080',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px',
        borderRadius: '12px',
    },
    boardTitleContainer: {
        padding: '0 8px',
        display: 'flex',
        flexDirection: 'column' as const,
    },
    boardTitleLabel: {
        fontSize: '11px',
        color: '#647080',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
    },
    boardTitleName: {
        fontSize: '15px',
        fontWeight: 'bold',
        color: '#1e293b',
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    menuList: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '4px',
        flex: 1,
        overflowY: 'auto' as const,
        overflowX: 'hidden' as const,
        padding: '4px 6px',
        margin: '0 -6px',
    },
    footerSection: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '10px',
        borderTop: '1px solid var(--border)',
        paddingTop: '16px',
        flexShrink: 0,
    },
    profileCard: {
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        gap: '12px',
        marginBottom: '4px',
        cursor: 'pointer'
    },
    avatar: {
        width: '36px',
        height: '36px',
        borderRadius: '12px',
        backgroundColor: '#4f7ef7',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        flexShrink: 0,
    },
    userInfo: {
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden',
    },
    userName: {
        fontSize: '14px',
        fontWeight: 'bold',
        whiteSpace: 'nowrap' as const,
    },
    userRole: {
        fontSize: '11px',
        color: '#647080',
    }
};
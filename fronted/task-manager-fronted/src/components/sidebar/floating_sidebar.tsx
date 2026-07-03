import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Folder, Settings, Users, BarChart2, LogOut, PanelLeftOpen, ChevronLeft } from 'lucide-react';
import SidebarButton from './sidebar_button';
import { useAuth } from '../../context/auth_context';
import { useLocation, useNavigate } from 'react-router-dom';

export const FloatingSidebar: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();
    const {logout : authlogout} = useAuth();
    const handleLogout = () => authlogout()

    const currentTab = location.pathname.split('/')[1] || 'boards';
    const [activeTab, setActiveTab] = useState(currentTab); 

    useEffect(() => {
        setActiveTab(currentTab);
    }, [location.pathname]);

    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId);
        navigate(`/${tabId}`);
    };

    const menuItems = [
        //{ id: 'workspace', icon: <LayoutDashboard size={20} />, label: "Рабочее пространство" },
        { id: 'boards', icon: <Folder size={20} />, label: "Мои доски" , onClick: () => {handleTabClick('boards')}},
        { id: 'team', icon: <Users size={20} />, label: "Команда", onClick: () => {handleTabClick('team')} },
        //{ id: 'analytics', icon: <BarChart2 size={20} />, label: "Аналитика" },
        //{ id: 'settings', icon: <Settings size={20} />, label: "Настройки" },
    ];

    return (
        <motion.div
            animate={{ width: isCollapsed ? '84px' : '280px' }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            style={styles.sidebarContainer}
        >
            <div style={styles.header}>
                {!isCollapsed && (
                    <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={styles.logoText}
                    >
                    <div className = "side-bar-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src="src\assets\site_logo.svg" alt="Logo" style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
                        <h2 style={{ color: '#000000', marginLeft: '4px', fontSize: '20px', fontFamily: 'var(--font-rounded)' }}>TaskManager</h2>
                    </div>
                    </motion.span>
                )}
                
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    style={styles.toggleButton}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    {isCollapsed ? <PanelLeftOpen size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            <div style={styles.menuList}>
                {menuItems.map((item) => (
                    <SidebarButton
                        key={item.id}
                        text={item.label}
                        icon={item.icon}
                        isCollapsed={isCollapsed}
                        size="full"
                        status={activeTab === item.id ? 'active' : 'neutral'}
                        onClick={() => item.onClick && item.onClick()}
                    />
                ))}
            </div>

            <div style={styles.footerSection}>
                <div style={{ ...styles.profileCard, justifyContent: isCollapsed ? 'center' : 'flex-start', cursor: 'pointer' }} onClick={() => navigate('/profile')}>
                    <div style={styles.avatar}>U</div>
                    {!isCollapsed && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={styles.userInfo}
                        >
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
                    onClick={handleLogout}
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
        backgroundColor: '#fff',
        color: 'var(--foreground)',
        borderRadius: '24px',
        border: '1px solid var(--border)',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 0 50px -10px rgba(79, 110, 247, 0.02)',
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden' as const,
        zIndex: 90,
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
    logoText: {
        fontWeight: 'extrabold',
        fontSize: '18px',
        fontFamily: 'var(--font-rounded), sans-serif',
        background: 'linear-gradient(135deg, #6366f1 0%, #4f7ef7 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
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
        transition: 'background-color 0.2s',
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
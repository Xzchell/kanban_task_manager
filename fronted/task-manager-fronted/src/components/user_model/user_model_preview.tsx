import type React from "react";
import { User, Mail, Calendar, LayoutGrid, CheckCircle2, Clock, ListTodo } from "lucide-react";
import type { IUser } from "../../context/auth_context";
import { formatedDate } from "../../utils/formatters";


export interface IUserModelPreview {
    user: IUser;
    renderButtons: () => React.ReactNode; 
}

const UserModalPreview: React.FC<IUserModelPreview> = ({ user, renderButtons }) => {
    const initials = `${user.first_name[0] || ''}${user.last_name[0] || ''}`.toUpperCase();
    const stats = {
        count : user.count_tasks,
        inprogress : user.count_tasks,
        todo : 0,
        done : 0
    };

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

            <div className="Header" style={styles.header}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginLeft: '30px', gap: '18px' }}>
                    <div className="avatar" style={styles.avatar}>
                        {initials}
                    </div>
                    <div className="infoTop" style={styles.infoTop}>
                        <h2 style={{ margin: '0 0 8px 0', fontFamily: 'var(--font-rounded)', color: '#0f172a', fontWeight: 700 }}>
                            {user.last_name} {user.first_name} {user.middle_name}
                        </h2>
                        <div style={{
                            fontFamily: 'var(--font-rounded)',
                            padding: '6px 12px', 
                            borderRadius: '8px', 
                            backgroundColor: user.role.background_color || '#e3e3e3', 
                            color: user.role.color || '#333', 
                            width: 'fit-content',
                            fontSize: '12px',
                            fontWeight: 600,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase'
                        }}>
                            {user.role.name}
                        </div>
                    </div>
                </div>
            </div>
            
            <hr style={styles.bottom_line}></hr>

            <div className="content" style={styles.content}>
                <div style={styles.infoGrid}>
                    
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Личные данные</h3>
                        
                        <div style={styles.fieldRow}>
                            <User size={18} style={styles.fieldIcon} />
                            <div>
                                <span style={styles.label}>ФИО участника</span>
                                <p style={styles.value}>{user.last_name} {user.first_name} {user.middle_name || '—'}</p>
                            </div>
                        </div>

                        <div style={styles.fieldRow}>
                            <Mail size={18} style={styles.fieldIcon} />
                            <div>
                                <span style={styles.label}>Электронная почта</span>
                                <p style={styles.value}>{user.email}</p>
                            </div>
                        </div>

                        <div style={styles.fieldRow}>
                            <Calendar size={18} style={styles.fieldIcon} />
                            <div>
                                <span style={styles.label}>Дата рождения</span>
                                <p style={styles.value}>{formatedDate(user.birthday, "long")}</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ ...styles.section, backgroundColor: 'transparent', border: 'none', padding: 0, gap: '12px' }}>
                        <h3 style={styles.sectionTitlePadding}>Эффективность работы</h3>
                        
                        <div style={styles.profileStatsGrid}>
                            
                            <div style={{ ...styles.profileStatCard, ...styles.statTotal }}>
                                <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', width: '100%' }}>
                                    <span style={styles.statLabel}>Всего</span>
                                    <LayoutGrid size={14} color="#94a3b8" style={{marginLeft: 'auto'}} />
                                </div>
                                <div style={{ ...styles.statValue, color: '#4f46e5' }}>{stats.count}</div>
                                <div style={styles.statSub}>задач закреплено</div>
                            </div>

                            <div style={{ ...styles.profileStatCard, ...styles.statProgress }}>
                                <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', width: '100%' }}>
                                    <span style={styles.statLabel}>В работе</span>
                                    <Clock size={14} color="#94a3b8" style={{marginLeft: 'auto'}} />
                                </div>
                                <div style={{ ...styles.statValue, color: '#f59e0b' }}>{stats.inprogress}</div>
                                <div style={styles.statSub}>активные спринты</div>
                            </div>

                            <div style={{ ...styles.profileStatCard, ...styles.statTodo }}>
                                <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', width: '100%' }}>
                                    <span style={styles.statLabel}>Бэклог</span>
                                    <ListTodo size={14} color="#94a3b8" style={{marginLeft: 'auto'}} />
                                </div>
                                <div style={{ ...styles.statValue, color: '#3b82f6' }}>{stats.todo}</div>
                                <div style={styles.statSub}>к выполнению</div>
                            </div>

                            <div style={{ ...styles.profileStatCard, ...styles.statDone }}>
                                <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', width: '100%' }}>
                                    <span style={styles.statLabel}>Релизы</span>
                                    <CheckCircle2 size={14} color="#10b981" style={{marginLeft: 'auto'}} />
                                </div>
                                <div style={{ ...styles.statValue, color: '#10b981' }}>{stats.done}</div>
                                <div style={styles.statSub}>выполнено успешно</div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            <div style={styles.footer}>
                <div style={styles.buttonContainer}>
                    {renderButtons()}
                </div>
            </div>
        </div>
    );
};

export default UserModalPreview;

const styles = {
    header: { display: 'flex', height: '140px', alignItems: 'center', flexShrink: 0, backgroundColor: '#fff' },
    infoTop: { display: 'flex', flexDirection: 'column' as const },
    avatar: { 
        fontFamily: 'var(--font-rounded)',
        width: '72px', 
        height: '72px', 
        borderRadius: '16px', 
        background: 'linear-gradient(to top right, #6366f1, #8b5cf6)', 
        color: '#fff', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: 600,
        boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.2)',
    },
    bottom_line: { borderColor: '#e2e8f0', borderStyle: 'solid', borderWidth: '0.5px', width: '100%', margin: '0px' },
    content: { 
        display: 'flex', 
        flex: 1, 
        overflowY: 'auto' as const, 
        padding: '24px 30px', 
        backgroundColor: 'rgba(248, 250, 252, 0.5)',
        width: '100%',
        boxSizing: 'border-box' as const
    },
    infoGrid: { 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '24px', 
        width: '100%',
        alignItems: 'start', 
    },
    section: { 
        backgroundColor: '#ffffff', 
        padding: '24px', 
        borderRadius: '16px', 
        border: '1px solid rgba(226, 232, 240, 0.8)', 
        display: 'flex', 
        flexDirection: 'column' as const, 
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    },
    sectionTitle: { margin: '0 0 4px 0', fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontFamily: 'var(--font-rounded)' },
    sectionTitlePadding: { margin: '0 0 4px 0', fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontFamily: 'var(--font-rounded)', paddingLeft: '4px' },
    fieldRow: { display: 'flex', flexDirection: 'row' as const, alignItems: 'flex-start', gap: '12px' },
    fieldIcon: { color: '#94a3b8', marginTop: '2px' },
    label: { color: '#94a3b8', fontSize: '12px', fontFamily: 'var(--font-rounded)', fontWeight: 600 },
    value: { fontFamily: 'var(--font-rounded)', margin: 0, fontSize: '15px', color: '#334155', fontWeight: 500 },
    
    profileStatsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '12px',
        width: '100%'
    },
    profileStatCard: {
        backgroundColor: '#fff',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        borderRadius: '14px',
        padding: '14px 16px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
        display: 'flex',
        flexDirection: 'column' as const
    },
    statLabel: {
        fontSize: '11px',
        fontWeight: 600,
        fontFamily:'var(--font-rounded)',
        color: '#94a3b8',
        textTransform: 'uppercase' as const,
    },
    statValue: {
        fontFamily: 'var(--font-rounded)',
        fontSize: '24px',
        fontWeight: 700,
        marginTop: '4px',
    },
    statSub: {
        fontFamily: 'var(--font-rounded)',
        fontSize: '11px',
        color: '#94a3b8',
        marginTop: '2px',
    },
    statTotal: { border: '1px solid rgba(226, 232, 240, 0.8)' },
    statProgress: { border: '1px solid rgba(226, 232, 240, 0.8)' },
    statTodo: { border: '1px solid rgba(226, 232, 240, 0.8)' },
    statDone: { border: '1px solid rgba(226, 232, 240, 0.8)' },

    footer: {
        height: '70px',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 30px',
        backgroundColor: '#fff',
        flexShrink: 0
    },
    buttonContainer: {
        width: '100%',
        display: 'flex',
        boxSizing: 'border-box' as const
    }
};
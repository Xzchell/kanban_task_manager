import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { IUser, IUserRole } from '../context/auth_context';
import RoleSelector from '../components/role_selector';
import DefaultButton from '../components/default_button';

export interface IUserCreateModal {
    onClose: () => void;
    availableRoles: IUserRole[];
    onSave: (userData: Omit<IUser, 'id' | 'count_tasks'>, passwordStr: string) => void;
}

const UserCreateModal: React.FC<IUserCreateModal> = ({ onClose, availableRoles, onSave }) => {
    const [localLastName, setLocalLastName] = useState('');
    const [localFirstName, setLocalFirstName] = useState('');
    const [localMiddleName, setLocalMiddleName] = useState('');
    const [localBirthday, setLocalBirthday] = useState('');
    const [localRole, setLocalRole] = useState<IUserRole | null>(null);

    const [localEmail, setLocalEmail] = useState('');
    const [localUsername, setLocalUsername] = useState('');
    const [localPassword, setLocalPassword] = useState('');

    const isValid = useMemo(() => {
        return (
            localLastName.trim().length > 0 &&
            localFirstName.trim().length > 0 &&
            localEmail.trim().length > 0 &&
            localUsername.trim().length > 0 &&
            localPassword.trim().length >= 4 &&
            localRole !== null
        );
    }, [localLastName, localFirstName, localEmail, localUsername, localPassword, localRole]);

    const handleSubmit = () => {
        if (!isValid || !localRole) return;

        const newUserData = {
            first_name: localFirstName,
            last_name: localLastName,
            middle_name: localMiddleName,
            birthday: localBirthday,
            email: localEmail,
            username: localUsername,
            role: localRole,
            token: ""
        };

        onSave(newUserData, localPassword);
    };

    return (
        <motion.div 
            style={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose} 
        >
            <motion.div 
                style={styles.modal}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 style={styles.title}>Новый пользователь</h2>
                
                <div style={styles.formContainer}>
                    <div style={styles.form}>
                        
                        <div style={styles.rowGrid}>
                            <div>
                                <label style={styles.label}>Фамилия *</label>
                                <input 
                                    style={styles.input} 
                                    value={localLastName}
                                    onChange={(e) => setLocalLastName(e.target.value)}
                                    placeholder="Введите фамилию"
                                />
                            </div>
                            <div>
                                <label style={styles.label}>Имя *</label>
                                <input 
                                    style={styles.input} 
                                    value={localFirstName}
                                    onChange={(e) => setLocalFirstName(e.target.value)}
                                    placeholder="Введите имя"
                                />
                            </div>
                        </div>

                        <div>
                            <label style={styles.label}>Отчество</label>
                            <input 
                                style={styles.input} 
                                value={localMiddleName}
                                onChange={(e) => setLocalMiddleName(e.target.value)}
                                placeholder="Введите отчество"
                            />
                        </div>

                        <div>
                            <label style={styles.label}>Дата рождения</label>
                            <input 
                                type="date"
                                style={styles.dateInput}
                                value={localBirthday}
                                onChange={(e) => setLocalBirthday(e.target.value)}
                            />
                        </div>

                        <div>
                            <label style={styles.label}>Роль на сервере *</label>
                            <RoleSelector
                                availableRoles={availableRoles}
                                selectedRole={localRole}
                                onRoleChange={(role) => setLocalRole(role)}
                            />
                        </div>

                        <hr style={styles.divider} />

                        <div>
                            <label style={styles.label}>Электронная почта (Email) *</label>
                            <input 
                                type="email"
                                style={styles.input} 
                                value={localEmail}
                                onChange={(e) => setLocalEmail(e.target.value)}
                                placeholder="example@team.ru"
                            />
                        </div>
                        <div style={styles.rowGrid}>
                            <div>
                                <label style={styles.label}>Юзернейм *</label>
                                <input 
                                    style={styles.input} 
                                    value={localUsername}
                                    onChange={(e) => setLocalUsername(e.target.value)}
                                    placeholder="username"
                                />
                            </div>
                            <div>
                                <label style={styles.label}>Пароль *</label>
                                <input 
                                    type="password"
                                    style={styles.input} 
                                    value={localPassword}
                                    onChange={(e) => setLocalPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                    </div>
                </div>

                <div style={styles.actions}>
                    <DefaultButton text="Отмена" status="secondary" onClick={onClose} />
                    <DefaultButton 
                        text="Создать пользователя" 
                        disabled={!isValid}
                        onClick={handleSubmit} 
                    />
                </div>
            </motion.div>
        </motion.div>
    );
};

export default UserCreateModal;

const styles = {
    backdrop: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 900,
    },
    modal: {
        backgroundColor: '#fff',
        width: '80vw',
        maxWidth: '650px',
        maxHeight: '90vh',
        padding: '30px 0 25px 0', 
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden',
    },
    title: {
        margin: '0 30px 20px 30px',
        fontFamily: 'var(--font-rounded), sans-serif',
        fontSize: '24px',
        fontWeight: 'bold',
    },
    formContainer: {
        flex: 1,
        overflowY: 'auto' as const,
        padding: '0 30px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '16px',
        paddingBottom: '20px',
    },
    rowGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        width: '100%'
    },
    label: {
        fontSize: '14px',
        fontWeight: 600,
        color: '#666',
        fontFamily: 'var(--font-rounded), sans-serif',
        marginBottom: '4px',
        display: 'block'
    },
    input: {
        width: '100%',
        boxSizing: 'border-box' as const,
        padding: '12px',
        borderRadius: '10px',
        border: '1.5px solid #eee',
        fontSize: '15px',
        outline: 'none',
        fontFamily: 'var(--font-rounded), sans-serif',
    },
    dateInput: {
        width: '100%',
        boxSizing: 'border-box' as const,
        border: '1.5px solid #eee',
        borderRadius: '10px',
        padding: '12px',
        fontSize: '15px',
        fontFamily: 'var(--font-rounded), sans-serif',
        outline: 'none',
        cursor: 'pointer',
    },
    divider: {
        border: 'none',
        borderTop: '1.5px dashed #e3e3e3',
        margin: '10px 0'
    },
    actions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        padding: '20px 30px 0 30px',
        borderTop: '1px solid #f0f0f0',
    }
};
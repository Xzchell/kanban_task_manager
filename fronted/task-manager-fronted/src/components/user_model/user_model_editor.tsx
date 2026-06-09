import React, { useState } from 'react';
import type { IUser, IUserRole } from '../../context/auth_context';
import RoleSelector from '../role_selector';

export interface IUserModalEditor {
    user: IUser;
    availableRoles: IUserRole[];
    renderButtons: (updatedUser: Partial<IUser>) => React.ReactNode; 
}

const UserModalEditor: React.FC<IUserModalEditor> = ({ user, availableRoles, renderButtons }) => {
    const [localFirstName, setLocalFirstName] = useState(user.first_name);
    const [localLastName, setLocalLastName] = useState(user.last_name);
    const [localMiddleName, setLocalMiddleName] = useState(user.middle_name || '');
    const [localBirthday, setLocalBirthday] = useState(user.birthday || '');
    const [localRole, setLocalRole] = useState<IUserRole | null>(user.role || null);

    const updatedUserData: Partial<IUser> = {
        ...user,
        first_name: localFirstName,
        last_name: localLastName,
        middle_name: localMiddleName,
        birthday: localBirthday,
        ...(localRole && { role: localRole })
    };
    
    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={styles.toolbar}>
                <span style={{ fontFamily: 'var(--font-rounded)', fontWeight: 700, color: '#333' }}>
                    Редактирование профиля
                </span>
            </div>

            <div className="content" style={styles.content}>
                <div style={styles.editForm}>
                    <div>
                        <label style={styles.label}>Фамилия</label>
                        <input 
                            value={localLastName}
                            onChange={(e) => setLocalLastName(e.target.value)}
                            style={styles.inputField}
                            placeholder="Введите фамилию"
                        />
                    </div>

                    <div>
                        <label style={styles.label}>Имя</label>
                        <input 
                            value={localFirstName}
                            onChange={(e) => setLocalFirstName(e.target.value)}
                            style={styles.inputField}
                            placeholder="Введите имя"
                        />
                    </div>

                    <div>
                        <label style={styles.label}>Отчество</label>
                        <input 
                            value={localMiddleName}
                            onChange={(e) => setLocalMiddleName(e.target.value)}
                            style={styles.inputField}
                            placeholder="Введите отчество"
                        />
                    </div>

                    <div>
                        <label style={styles.label}>Дата рождения</label>
                        <input 
                            type="date"
                            value={localBirthday}
                            onChange={(e) => setLocalBirthday(e.target.value)}
                            style={styles.dateInput}
                        />
                    </div>

                    <div>
                        <label style={styles.label}>Роль</label>
                        <RoleSelector
                            availableRoles={availableRoles}
                            selectedRole={localRole}
                            onRoleChange={(role) => setLocalRole(role)}
                        />
                    </div>
                </div>
            </div>
            <div style={styles.footer}>
                <div style={styles.buttonContainer}>
                    {renderButtons(updatedUserData)}
                </div>
            </div>
        </div>
    );
};

export default UserModalEditor;

const styles = {
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '50px',
        width: '100%',
        borderBottom: '1.5px solid #e3e3e3',
        flexShrink: 0
    },
    content: {
        display: 'flex',
        flex: 1,
        overflowY: 'auto' as const,
        padding: '20px',
        backgroundColor: '#fafafa',
        alignItems: 'flex-start',
    },
    editForm: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '20px',
        width: '100%',
        boxSizing: 'border-box' as const,
        backgroundColor: '#fff',
        padding: '24px',
        borderRadius: '16px',
        border: '1.5px solid #e3e3e3',
    },
    label: {    
        color: '#8e8e93',
        fontSize: '13px',
        fontFamily: 'var(--font-rounded)',
        fontWeight: 600,
        display: 'block',
        marginBottom: '6px',
    },
    inputField: {
        width: '100%',
        boxSizing: 'border-box' as const,
        padding: '10px 12px',
        fontSize: '15px',
        border: '1.5px solid #e3e3e3',
        borderRadius: '10px',
        outline: 'none',
        fontFamily: 'var(--font-rounded)',
        color: '#333',
    },
    dateInput: {
        width: '100%',
        boxSizing: 'border-box' as const,
        padding: '10px 12px',
        fontSize: '15px',
        border: '1.5px solid #e3e3e3',
        borderRadius: '10px',
        outline: 'none',
        fontFamily: 'var(--font-rounded)',
        cursor: 'pointer',
        color: '#333',
    },
    footer: {
        height: '70px',
        borderTop: '1.5px solid #e3e3e3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 30px',
        backgroundColor: '#fff',
        flexShrink: 0
    },
    buttonContainer: {
        width: '300px',
    }
};
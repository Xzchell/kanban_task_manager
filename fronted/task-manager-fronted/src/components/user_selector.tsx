import React, { useState, useMemo,} from 'react';
import { X, Search, User } from 'lucide-react';
import type { IExecutors } from './task_card';

interface IUserSelectorProps {
    availableUsers: IExecutors[]; 
    selectedUsers: IExecutors[];
    onUsersChange: (users: IExecutors[]) => void;
    small?: boolean;
}

const UserSelector: React.FC<IUserSelectorProps> = ({ availableUsers, selectedUsers, onUsersChange, small }) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filtered = useMemo(() => {
        return availableUsers.filter(user => {
            const isNotSelected = !selectedUsers.some(s => s.id === user.id);
            const matchesQuery = query === '*' || `${user.first_name} ${user.last_name}`.toLowerCase().includes(query.toLowerCase());
            return isNotSelected && matchesQuery;
        });
    }, [availableUsers, selectedUsers, query]);

    const addUser = (user: IExecutors) => {
        onUsersChange([...selectedUsers, user]);
        setQuery('');
    };

    const removeUser = (userId: number) => {
        onUsersChange(selectedUsers.filter(u => u.id !== userId));
    };

    return (
        <div style={userSelectorStyles.container}>
            
            <div style={userSelectorStyles.userList}>
                {selectedUsers.map(user => (
                    <span key={user.id} style={{
                        ...userSelectorStyles.activeUser, 
                        backgroundColor: '#f9f9f9', 
                        color: '#333',
                        border: `1px solid #ccc`,
                    }}>
                        {user.first_name} {user.last_name}
                        <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeUser(user.id)} />
                    </span>
                ))}
            </div>

            <div style={userSelectorStyles.searchWrapper}>
                <div style={userSelectorStyles.inputContainer}>
                    <Search size={16} color="#828282" />
                    <input 
                        style={userSelectorStyles.input}
                        placeholder="Поиск пользователей..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsOpen(true)}
                    />
                </div>

                {isOpen && query && (
                    <div style={userSelectorStyles.dropdown}>
                        {filtered.length > 0 ? filtered.map(user => (
                            <div 
                                key={user.id} 
                                onClick={() => addUser(user)}
                                style={userSelectorStyles.dropdownItem}
                            >
                                {small ? (
                                    <>
                                        <User size={16} color="#828282" />
                                        <span>{user.first_name} {user.last_name} | {user.role?.name || "Пользователь"}</span>
                                    </>
                                ) : (
                                    <>
                                        <User size={16} color="#828282" />
                                        <span>{user.first_name} {user.last_name} {user.middle_name}</span>
                                        <div style={userSelectorStyles.divider} />
                                        <span>{user.role?.name || "Пользователь"}</span>
                                        <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#aaa' }}>{user.email}</div>
                                    </>
                                )}
                            </div>
                        )) : (
                            <div style={userSelectorStyles.noResult}>Пользователи не найдены</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const userSelectorStyles = {
    container: { marginBottom: '20px' },
    label: { display: 'block', fontSize: '14px', fontWeight: 600, color: '#444', marginBottom: '8px' },
    userList: { 
        display: 'flex', 
        flexWrap: 'wrap' as const, 
        gap: '8px', 
        marginBottom: '10px',
        justifyContent: 'flex-start' as const,
        alignItems: 'center' as const,
    },
    activeUser: {
        whiteSpace: 'nowrap',
        borderRadius: '10px',
        paddingRight: '8px', paddingLeft: '8px', paddingBottom: '6px', paddingTop: '6px',
        fontFamily: 'var(--font-rounded)',
        fontWeight: 600,
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    searchWrapper: { position: 'relative' as const },
    inputContainer: {
        display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
        border: '1px solid #e3e3e3', borderRadius: '12px', backgroundColor: '#f9f9f9'
    },
    input: { border: 'none', backgroundColor: 'transparent', outline: 'none', width: '100%', fontSize: '14px' },
    dropdown: {
        position: 'absolute' as const, top: '45px', left: 0, right: 0,
        backgroundColor: '#fff', border: '1px solid #e3e3e3', borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, maxHeight: '200px', overflowY: 'auto' as const
    },
    dropdownItem: {
        padding: '10px 15px', 
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center',
        fontFamily: 'var(--font-rounded)',
        fontWeight: 600,
        gap: '10px',
        fontSize: '14px', 
        transition: 'background 0.2s'
    },
    dot: { width: '8px', height: '8px', borderRadius: '50%' },
    noResult: { 
        padding: '10px 15px', 
        color: '#828282', 
        fontSize: '14px',
        fontFamily: 'var(--font-rounded)',
    },
    divider: {
        width: '2px',
        height: '20px',
        backgroundColor: '#121314',
        alignSelf: 'center',
        borderRadius: '1px',
    }
};

export default UserSelector;
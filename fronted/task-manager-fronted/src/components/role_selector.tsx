import React, { useState, useMemo, useRef, useEffect } from 'react';
import { X, Search, Shield } from 'lucide-react';
import type { IUserRole } from '../context/auth_context'; // Путь подставь свой

interface IRoleSelectorProps {
    availableRoles: IUserRole[]; 
    selectedRole: IUserRole | null;
    onRoleChange: (role: IUserRole | null) => void;
}

const RoleSelector: React.FC<IRoleSelectorProps> = ({ availableRoles, selectedRole, onRoleChange }) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filtered = useMemo(() => {
        return availableRoles.filter(role => {
            const isNotSelected = selectedRole?.id !== role.id;
            const matchesQuery = query === '*' || role.name.toLowerCase().includes(query.toLowerCase());
            return isNotSelected && matchesQuery;
        });
    }, [availableRoles, selectedRole, query]);

    const selectRole = (role: IUserRole) => {
        onRoleChange(role);
        setQuery('');
        setIsOpen(false);
    };

    const removeRole = () => {
        onRoleChange(null);
    };

    return (
        <div ref={containerRef} style={roleSelectorStyles.container}>
            
            <div style={roleSelectorStyles.roleList}>
                {selectedRole && (
                    <span key={selectedRole.id} style={{
                        ...roleSelectorStyles.activeRole, 
                        backgroundColor: selectedRole.background_color || '#f9f9f9', 
                        color: selectedRole.color || '#333',
                        border: selectedRole.background_color ? 'none' : `1px solid #ccc`,
                    }}>
                        {selectedRole.name}
                        <X size={14} style={{ cursor: 'pointer' }} onClick={removeRole} />
                    </span>
                )}
            </div>
            <div style={roleSelectorStyles.searchWrapper}>
                <div style={roleSelectorStyles.inputContainer}>
                    <Search size={16} color="#828282" />
                    <input 
                        style={roleSelectorStyles.input}
                        placeholder={selectedRole ? "Смените роль..." : "Поиск и выбор роли..."}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsOpen(true)}
                    />
                </div>

                {isOpen && query && (
                    <div style={roleSelectorStyles.dropdown}>
                        {filtered.length > 0 ? filtered.map(role => (
                            <div 
                                key={role.id} 
                                onClick={() => selectRole(role)}
                                style={roleSelectorStyles.dropdownItem}
                            >
                                <Shield size={16} color={role.color || "#828282"} />
                                <span style={{ color: role.color }}>{role.name}</span>
                                
                                <div style={roleSelectorStyles.divider} />
                                
                                <span style={{ fontSize: '13px', color: '#666', fontWeight: 400 }}>
                                    {role.description}
                                </span>
                                
                                <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#aaa' }}>
                                    Доступ: {role.permission_level}
                                </div>
                            </div>
                        )) : (
                            <div style={roleSelectorStyles.noResult}>Роли не найдены</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const roleSelectorStyles = {
    container: { marginBottom: '20px' },
    roleList: { 
        display: 'flex', 
        flexWrap: 'wrap' as const, 
        gap: '8px', 
        marginBottom: '10px',
        justifyContent: 'flex-start' as const,
        alignItems: 'center' as const,
    },
    activeRole: {
        whiteSpace: 'nowrap' as const,
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
    noResult: { 
        padding: '10px 15px', 
        color: '#828282', 
        fontSize: '14px',
        fontFamily: 'var(--font-rounded)',
    },
    divider: {
        width: '2px',
        height: '20px',
        backgroundColor: '#e3e3e3',
        alignSelf: 'center',
        borderRadius: '1px',
    }
};

export default RoleSelector;
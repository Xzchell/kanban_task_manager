import type React from "react";
import UserCard from "../components/user_card";
import { useUsers } from "../hook/useUsers";
import { useAuth } from "../context/auth_context";
import { useEffect, useMemo, useState } from "react";
import SearchBar from "../components/search_task_bar";
import { Plus } from "lucide-react";
import UserModel from "../components/user_model/user_model";
import { AnimatePresence } from 'framer-motion';
import UserCreateModal from "./user_modal_create";

const TeamPage: React.FC = () => {
    const user = useAuth().user;
    const {
        allUsers, fetchAllUsers,
        selectedUser, setSelectedUser,
        addNewUser, deleteUser, updateUser,
        availableRoles
    } = useUsers(user?.id, user?.token, user?.role?.permission_level);
    
    const [teamSearch, setTeamSearch] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        fetchAllUsers();
    }, [fetchAllUsers]);
    
    const filteredMembers = useMemo(() => {
        if (!teamSearch.trim()) return allUsers;
        const low = teamSearch.toLowerCase();
        return allUsers.filter(u => 
            u.first_name.toLowerCase().includes(low) || 
            u.last_name.toLowerCase().includes(low) || 
            u.middle_name.toLowerCase().includes(low) || 
            (u.email && u.email.toLowerCase().includes(low))
        );
    }, [allUsers, teamSearch]);


    const userPermissionLevel = user?.role?.permission_level ? Number(user.role.permission_level) : 0;

    console.log('level per ' + user?.role?.permission_level)

    return (
        <div>
            <div style={styles.container}>
                <h1 style={styles.header}>Моя команда</h1>
                <p style={styles.description}>Управление участниками команды ({allUsers.length})</p>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', marginBottom: '24px' }}>
                    <SearchBar value={teamSearch} onChange={setTeamSearch} placeholder="Поиск по имени, фамилии или email" />
                    
                    {userPermissionLevel >= 3 ? (
                        <button style={styles.addUserBtn} onClick={() => setIsCreateModalOpen(true)}>
                            <Plus size={16} />
                            <span>Добавить пользователя</span>
                        </button>
                    ) : null}
                </div>
                
                <div style={styles.teamContainer}>
                    {filteredMembers.map(member => (
                        <UserCard 
                            key={member.id}
                            onSelect={setSelectedUser}
                            member={{ ...member, count_tasks: member.count_tasks || 0 }}
                        />
                    ))}
                </div>
            </div>      

            <AnimatePresence>
                {selectedUser && (
                    <UserModel 
                        user={selectedUser} 
                        onClose={() => setSelectedUser(null)} 
                        onDelete={deleteUser}
                        onUpdate={updateUser}    
                        availableRoles={availableRoles}
                    />
                )} 
            </AnimatePresence>
            <AnimatePresence>
                {isCreateModalOpen && (
                    <UserCreateModal 
                        availableRoles={availableRoles}
                        onClose={() => setIsCreateModalOpen(false)}
                        onSave={async (userData, password) => {
                            await addNewUser({
                                ...userData,
                                id: 0,
                                count_tasks: 0
                            }, password);
                            setIsCreateModalOpen(false);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const styles = {
    container: { padding: '20px', backgroundColor: '#fff', height: '100%', fontFamily: 'sans-serif' },
    header: { fontSize: '24px', marginBottom: '10px', color: '#333' },
    description: { fontSize: '16px', marginBottom: '20px', color: '#666' },
    teamContainer: { display: 'flex', flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: '20px' },
    addUserBtn: {
        display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
        backgroundColor: '#f7f7f7', border: '1.5px solid #e3e3e3', borderRadius: '16px',
        color: 'var(--text-main)', fontFamily: 'var(--font-rounded)', fontWeight: 600,
        fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap' as const,
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        marginBottom: '24px'
    },
};

export default TeamPage;
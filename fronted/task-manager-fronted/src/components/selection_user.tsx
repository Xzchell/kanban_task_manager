import React, { useEffect, useState } from "react";
import { useUsers, type ISearchedUser } from "../hook/useUsers";
import { useAuth } from "../context/auth_context";
import { type IBoardMember } from "../hook/useBoards";
import FormInput from "./form_input";
import { AVAILABLE_ROLES } from "../type/roles";

interface MemberSelectorProps {
    selectedMembers: IBoardMember[];
    onMembersChange: (members: IBoardMember[]) => void;
}

const MemberSelector: React.FC<MemberSelectorProps> = ({ selectedMembers, onMembersChange }) => {
    const [userInput, setUserInput] = useState("");
    const [foundUser, setFoundUser] = useState<ISearchedUser | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchExecuted, setSearchExecuted] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState<number>(2);

    const user = useAuth().user;
    const { searchUser } = useUsers();

    useEffect(() => {
        const exactQuery = userInput.trim();

        if (exactQuery.length < 3) {
            setFoundUser(null);
            setSearchExecuted(false);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setIsSearching(true);
            setSearchExecuted(true);
            try {
                const data = await searchUser(exactQuery);

                if (data && data.length > 0 && data[0].id !== user?.id) {
                    setFoundUser(data[0]);
                } else {
                    setFoundUser(null);
                }
            } catch (e) {
                console.error(e);
                setFoundUser(null);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [userInput, user?.id]);

    const handleAddMember = () => {
        if (!foundUser) return;

        const isAlreadyAdded = selectedMembers.some((m) => m.id === foundUser.id);
        if (isAlreadyAdded) return;
        
        const currentRoleMeta = AVAILABLE_ROLES[selectedRoleId] || AVAILABLE_ROLES[2];

        const newMember: IBoardMember = {
            id: foundUser.id,
            username: foundUser.username,
            email: foundUser.email,
            first_name: foundUser.first_name,
            last_name: foundUser.last_name,
            middle_name: foundUser.middle_name || "",
            avatar_url: null,
            role: {
                id: selectedRoleId,
                name: currentRoleMeta.name,
                displayName: currentRoleMeta.displayName,
                permission_level: currentRoleMeta.permission_level
            }
        };

        onMembersChange([...selectedMembers, newMember]);
        setUserInput("");
        setFoundUser(null);
        setSearchExecuted(false);
        setSelectedRoleId(2); 
    };

    const handleRemoveMember = (id: number) => {
        onMembersChange(selectedMembers.filter(m => m.id !== id));
    };

    return (
        <div style={styles.container}>
            <div style={{ position: "relative", width: "100%" }}>
                <FormInput
                    id="member-search-input"
                    label="Пригласить участника"
                    type="text"
                    value={userInput}
                    onChange={setUserInput}
                    placeholder="Введите точный email, username или ФИО"
                />
                {isSearching && <span style={styles.loader}>Поиск...</span>}
            </div>

            {searchExecuted && !isSearching && (
                foundUser ? (
                    <div style={styles.foundCard}>
                        <div style={styles.userInfo}>
                            <div style={styles.avatarPlaceholder}>
                                {foundUser.first_name.slice(0, 1).toUpperCase()}
                                {foundUser.last_name.slice(0, 1).toUpperCase()}
                            </div>
                            <div style={styles.textBlock}>
                                <span style={styles.userName}>
                                    {foundUser.last_name} {foundUser.first_name} {foundUser.middle_name ?? ""}
                                </span>
                                <span style={styles.userEmail}>@{foundUser.username} • {foundUser.email}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <select 
                                value={selectedRoleId}
                                onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                                style={styles.roleSelect}
                            >
                                <option value={2}>Участник</option>
                                <option value={3}>Наблюдатель</option>
                                <option value={1}>Владелец</option>
                            </select>
                            <button onClick={handleAddMember} style={styles.addButton}>
                                Добавить
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={styles.notFoundText}>Пользователь не найден</div>
                )
            )}

            {selectedMembers.length > 0 && (
                <div style={styles.selectedContainer}>
                    <span style={styles.sectionTitle}>Выбранные пользователи ({selectedMembers.length}):</span>
                    <div style={styles.membersList}>
                        {selectedMembers.map((member) => (
                            <div key={member.id} style={styles.memberRow}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div style={styles.smallAvatar}>
                                        {member.first_name.slice(0, 1).toUpperCase()}
                                        {member.last_name.slice(0, 1).toUpperCase()}
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <span style={styles.memberFullName}>
                                            {member.last_name} {member.first_name}
                                        </span>
                                        <span style={styles.memberRoleBadge}>
                                            {member.role?.displayName || "Участник"}
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleRemoveMember(member.id)} 
                                    style={styles.removeButton}
                                    title="Убрать из списка"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemberSelector;

const styles = {
    container: { display: "flex", flexDirection: "column" as const, gap: "10px", width: "100%" },
    loader: { position: "absolute" as const, right: "16px", top: "40px", fontSize: "13px", color: "#94a3b8", fontWeight: 500 },
    foundCard: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "14px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", marginTop: "2px", width: "100%", boxSizing: "border-box" as const },
    userInfo: { display: "flex", alignItems: "center", gap: "12px" },
    avatarPlaceholder: { width: "38px", height: "38px", borderRadius: "50%", backgroundColor: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "#7177f4", fontFamily: "var(--font-rounded)" },
    textBlock: { display: "flex", flexDirection: "column" as const },
    userName: { fontSize: "14px", fontWeight: 700, color: "#1e293b", fontFamily: "var(--font-rounded), sans-serif" },
    userEmail: { fontSize: "12px", color: "#64748b" },
    addButton: { padding: "8px 16px", borderRadius: "10px", backgroundColor: "#7177f4", color: "#ffffff", border: "none", fontSize: "13px", fontWeight: 700, fontFamily: "var(--font-rounded), sans-serif", cursor: "pointer" },
    notFoundText: { color: 'red', fontFamily: "var(--font-rounded), sans-serif", fontWeight: 600, fontSize: '14px', padding: '10px' },
    roleSelect: { padding: "8px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", fontSize: "13px", fontWeight: 600, fontFamily: "var(--font-rounded), sans-serif", color: "#334155", outline: "none", cursor: "pointer" },
    
    selectedContainer: { marginTop: "14px", display: "flex", flexDirection: "column" as const, gap: "8px", width: "100%" },
    sectionTitle: { fontSize: "13px", fontWeight: 700, color: "#64748b" },
    membersList: { display: "flex", flexDirection: "column" as const, gap: "8px", maxHeight: "200px", overflowY: "auto" as const },
    memberRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: "10px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" },
    smallAvatar: { width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#7177f4",fontFamily: "var(--font-rounded)" },
    memberFullName: { fontSize: "13px", fontWeight: 600, color: "#1e293b" },
    memberRoleBadge: { fontSize: "11px", color: "#64748b" },
    removeButton: { background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "14px", fontWeight: 600, padding: "4px 8px", borderRadius: "6px", transition: "all 0.2s" }
};
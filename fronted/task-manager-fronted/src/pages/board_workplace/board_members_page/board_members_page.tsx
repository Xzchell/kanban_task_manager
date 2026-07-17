import React, { useState, useMemo } from "react";
import { useBoard, type IBoardMember } from "../../../hook/useBoards";
import CustomModal from "../../../components/custom_modal";
import SearchBar from "../../../components/search_task_bar";
import DefaultButton from "../../../components/default_button";
import { AnimatedBackground } from "../../../components/animated_background";
import ModalSelectRole from "./modal_select_role";
import { useAuth } from "../../../context/auth_context";
import { useBoardPermissions } from "../../../hook/useBoardMember";
import ModalAddNewMember from "./modal_add_new_member";
import { useUsers } from "../../../hook/useUsers";
import { useDesignMode } from "../../../context/design_context";
import { theme } from "../../../themes/themes";

const BoardMembersPage: React.FC = () => {
    const { selectedBoard } = useBoard();
    const user = useAuth().user;
    const { addBoardMembersBD } = useUsers();

    const { canInviteMembers } = useBoardPermissions();
    
    const { mode } = useDesignMode();
    const activeTheme = theme.modes[mode];

    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter] = useState<number | "all">("all");
    const [sortOrder] = useState<"asc" | "desc">("asc");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<IBoardMember | null>(null);
    const [selectedMembersToAdd, setSelectedMembersToAdd] = useState<IBoardMember[]>([]);

    const members = useMemo(() => selectedBoard?.users ?? [], [selectedBoard?.users]);


    const filteredAndSortedMembers = useMemo(() => {
        let result = [...members];

        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase().trim();
            result = result.filter(m => 
                `${m.last_name} ${m.first_name} ${m.middle_name ?? ""}`.toLowerCase().includes(query) ||
                m.username.toLowerCase().includes(query) ||
                m.email.toLowerCase().includes(query)
            );
        }

        if (roleFilter !== "all") {
            result = result.filter(m => m.role?.id === roleFilter);
        }

        result.sort((a, b) => {
            const nameA = `${a.last_name} ${a.first_name}`.toLowerCase();
            const nameB = `${b.last_name} ${b.first_name}`.toLowerCase();
            return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        });

        return result;
    }, [members, searchQuery, roleFilter, sortOrder]);

    const handleSaveNewMembers = async () => {
        if (!selectedBoard) return;
        
        const currentUsers = selectedBoard.users ?? [];
        
        const newBoardUsers: IBoardMember[] = selectedMembersToAdd
            .filter(item => !currentUsers.some(u => u.id === item.id))
            .map(item => ({
                id: item.id,
                username: item.username,
                email: item.email, 
                first_name: item.first_name,
                last_name: item.last_name,
                middle_name: item.middle_name,
                role: {
                    id: item.role?.id ?? 2,
                    name: item.role?.id === 1 ? "owner" : item.role?.id === 3 ? "spectator" : "user",
                    displayName: item.role?.id === 1 ? "Владелец" : item.role?.id === 3 ? "Наблюдатель" : "Участник",
                    permission_level: item.role?.id === 1 ? 3 : item.role?.id === 3 ? 1 : 2
                }
        }));

        if (newBoardUsers.length === 0) {
            setIsAddModalOpen(false);
            return;
        }

        addBoardMembersBD(newBoardUsers);
        setIsAddModalOpen(false);
        setSelectedMembersToAdd([]);
    };



    return (
        <div style={{display: 'flex', height: '100vh', width: '100%'}}>
        <div style={styles.backgroundFixedWrapper}>
            <AnimatedBackground />
        </div>
        <div style={styles.pageContainer}>
            <div style={styles.headerRow}>
                <h1 style={styles.title}>Участники проекта</h1>
                <p style={styles.subtitle}>Всего участников на доске: {members.length}</p>
            </div>

            <div style = {{display:"flex", flexDirection: "row", gap: "10px", marginBottom: "20px"}}>
                <SearchBar placeholder="Поиск участника..." onChange={setSearchQuery} value={searchQuery}/>
                {
                    canInviteMembers &&
                    <DefaultButton
                        text="Добавить участника"
                        onClick={() => setIsAddModalOpen(true)}
                    />
                    }
            </div>

            {/* Таблица участников */}
            <div style={{...activeTheme.searchBar, ...styles.tableWrapper, borderRadius: theme.borderRadius.xlarge}}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeadRow}>
                            <th style={styles.th}>Фамилия Имя Отчество</th>
                            <th style={styles.th}>Username</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Роль</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedMembers.length > 0 ? (
                            filteredAndSortedMembers.map((member) => (
                                <tr 
                                    key={member.id} 
                                    style={styles.tableBodyRow} 
                                    onClick={() => setEditingUser(member)}
                                >
                                    <td style={styles.td}>
                                        <div style={styles.userProfileCell}>
                                            <div style={styles.avatar}>
                                                {member.first_name.slice(0, 1).toUpperCase()}
                                                {member.last_name.slice(0, 1).toUpperCase()}
                                            </div>
                                            <span style={styles.fullNameText}>
                                               {member.id === user?.id && "(Я) "} {member.last_name} {member.first_name} {member.middle_name ?? ""}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={styles.usernameText}>@{member.username}</td>
                                    <td style={styles.td}>{member.email}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.badge,
                                            backgroundColor: member.role?.id === 1 ? "#fef2f2" : member.role?.id === 3 ? "#f8fafc" : "#e0e7ff",
                                            color: member.role?.id === 1 ? "#ef4444" : member.role?.id === 3 ? "#64748b" : "#7177f4",
                                            border: member.role?.id === 1 ? "1px solid #fca5a5" : member.role?.id === 3 ? "1px solid #cbd5e1" : "1px solid #c7d2fe",
                                        }}>
                                            {member.role?.displayName || "Участник"}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} style={styles.emptyTableState}>Никто не найден по заданным критериям</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <CustomModal 
                isOpen={!!editingUser} 
                onClose={() => setEditingUser(null)} 
                width="650px" 
                height="auto"
                >
                {editingUser && (
                    <ModalSelectRole
                        setEditingUser={setEditingUser}
                        editingUser={editingUser}
                    />
                )}
            </CustomModal>

            <CustomModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                width="650px" 
                height="auto"
                >
                    <ModalAddNewMember
                        selectedMembers={selectedMembersToAdd}
                        setSelectedMembers={setSelectedMembersToAdd}
                        onSave={handleSaveNewMembers}
                        onClose={() => setIsAddModalOpen(false)}
                    />
            </CustomModal>
        </div>
        </div>
    );
};

export default BoardMembersPage;

const styles = {
    pageContainer: {
        marginTop: "50px",
        marginLeft: "120px",
        marginRight: "20px",
        display: "flex",
        flexDirection: "column" as const,
        flex: 1,
        overflow: "hidden",
        zIndex: 2,
        fontFamily: "var(--font-rounded)"
    },
    backgroundFixedWrapper: {
        position: "fixed" as const,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1,
        pointerEvents: "none" as const,
    },
    headerRow: { marginBottom: "28px" },
    title: { fontSize: "26px", fontWeight: 700, color: "#1e293b", margin: "0 0 6px 0" },
    subtitle: { fontSize: "14px", color: "#64748b", margin: 0 },
    
    tableWrapper: { 
        overflow: "hidden", 
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)" 
    },
    table: { 
        width: "100%", 
        borderCollapse: "collapse" as const, 
        textTransform: "none" as const 
    },
    tableHeadRow: { 
        borderBottom: "1.5px solid #f1f5f9" 
    },
    th: { 
        padding: "14px 20px", 
        fontSize: "13px", 
        fontWeight: 700, 
        color: "#64748b", 
        textAlign: "left" as const, 
        letterSpacing: "0.02em"
    },
    tableBodyRow: { 
        borderBottom: "1px solid #f1f5f9", 
        cursor: "pointer", 
        transition: "all 0.2s ease"
    },
    td: { 
        padding: "14px 20px", 
        fontSize: "14px", 
        color: "#334155", 
        verticalAlign: "middle"
    },
    emptyTableState: { 
        padding: "36px", 
        textAlign: "center" as const, 
        color: "#94a3b8", 
        fontSize: "14px"
    },
    
    userProfileCell: { display: "flex", alignItems: "center", gap: "12px" },
    avatar: { width: "34px", height: "34px", borderRadius: "50%", backgroundColor: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "#7177f4" },
    fullNameText: { fontWeight: 600, color: "#1e293b" },
    usernameText: { padding: "14px 20px", fontSize: "14px", color: "#7177f4", fontWeight: 600 },
    badge: { padding: "4px 10px", borderRadius: "10px", fontSize: "12px", fontWeight: 700, display: "inline-block" },
};
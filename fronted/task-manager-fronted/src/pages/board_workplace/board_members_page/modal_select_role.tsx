import { useState } from "react";
import { Trash2 } from "lucide-react";
import DefaultButton from "../../../components/default_button";
import { useAlert } from "../../../context/alert_context";
import type { IBoardMember } from "../../../hook/useBoards";
import { useUsers } from "../../../hook/useUsers";
import { useBoardPermissions } from "../../../hook/useBoardMember";
import { AVAILABLE_ROLES } from "../../../type/roles";



interface IModalSelectRoleProps {
    setEditingUser : (value : IBoardMember | null) => void;
    editingUser : IBoardMember | null;
}

const ModalSelectRole : React.FC<IModalSelectRoleProps> = ({editingUser, setEditingUser}) => {
    const { showAlert, hideAlert } = useAlert();    
    const { changeUserRole, removeBoardMember, updateMemberRole, removeBoardMemberBD } = useUsers();

    const { canChangeMemberRoleOrRemove } = useBoardPermissions();

    const [selectedRole, setSelectedRole] = useState(() => {
        return editingUser?.role ?? {
            id: 2,
            name: "user",
            displayName: "Участник",
            permission_level: 2,
            description: "Может создавать задачи, двигать их и редактировать свои."
        };
    });

    const handleRemoveMember = (userId: number) => {
        removeBoardMember(userId);
        setEditingUser(null);
        removeBoardMemberBD(userId);
    };

    const handleSaveChanges = () => {
        if (!editingUser) return;

        const updatedUser: IBoardMember = {
            ...editingUser,
            role: {
                id: selectedRole.id,
                name: selectedRole.name,
                displayName: selectedRole.displayName,
                permission_level: selectedRole.permission_level,
                description: selectedRole.description
            }
        };

        changeUserRole(updatedUser);
        setEditingUser(null);

        updateMemberRole(updatedUser, editingUser.id);
    };

    return(
        <div style = {styles.container}>
            <div style={styles.header}>
                <h3 style={{margin: "0px 0px 15px 0px"}}>Параметры участника</h3>
            </div>
            <div style = {styles.content}>
                <div style = {{display: "flex", flexDirection: "row", alignItems: "center", gap: "12px", marginBottom: "20px"}}>
                    <div style={styles.avatar}>
                        {editingUser?.first_name.slice(0, 1).toUpperCase()}
                        {editingUser?.last_name.slice(0, 1).toUpperCase()}
                    </div>
                    <div style = {{display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "3px"}}>
                        <span style={{fontWeight: 700}}>{editingUser?.first_name + " " + editingUser?.last_name + " " + editingUser?.middle_name}</span>
                        <span style={styles.usernameText}>@{editingUser?.username} | {editingUser?.email}</span>
                    </div>
                </div>

                <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
                    <span style={{fontSize: "14px", fontWeight: 700, color: "#64748b"}}>Роль в проекте</span>
                    {AVAILABLE_ROLES.map((role) => {
                        const isSelected = selectedRole.id === role.id;

                        return (
                            <div
                                key={role.id}
                                onClick={() => {
                                    if (editingUser && canChangeMemberRoleOrRemove(editingUser)){
                                        setSelectedRole({
                                            id: role.id,
                                            name: role.name,
                                            displayName: role.displayName,
                                            permission_level: role.permission_level,
                                            description: role.description
                                        });                                        
                                    }
                                }}
                                style={{
                                    ...styles.roleCard,
                                    borderColor: isSelected ? role.activeColor : "#e2e8f0",
                                    backgroundColor: isSelected ? `${role.activeColor}08` : "#ffffff",
                                }}
                            >
                                <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%"}}>
                                    <span style={{
                                        ...styles.roleTitle, 
                                        color: isSelected ? role.activeColor : "#1e293b"
                                    }}>
                                        {role.displayName}
                                    </span>
                                    {isSelected && (
                                        <div style={{
                                            width: "8px", 
                                            height: "8px", 
                                            borderRadius: "50%", 
                                            backgroundColor: role.activeColor
                                        }} />
                                    )}
                                </div>
                                <p style={styles.roleDescription}>{role.description}</p>
                            </div>
                        );
                    })}
                </div>

            </div>
            <div style={styles.modalFooter}>
                {
                    editingUser && canChangeMemberRoleOrRemove(editingUser) ?
                    <>
                        <DefaultButton
                            fullWidth = {true}
                            onClick={handleSaveChanges}
                            status="primary"
                            text="Сохранить"
                        />
                        <DefaultButton
                            fullWidth = {true}
                            status="danger"
                            icon= {<Trash2 size={20} />}
                            text="Исключить"
                            onClick={
                                () => {
                                    showAlert(
                                        "Исключить пользователя",
                                        "Вы уверены, что хотите исключить этого пользователя? Это действие нельзя будет отменить.",
                                        [
                                            { text: "Удалить", status: "danger", onClick: () => { handleRemoveMember(Number(editingUser?.id)); hideAlert(); setEditingUser(null); } },
                                            { text: "Отмена", status: "secondary", onClick: () => { hideAlert(); } },
                                        ],
                                    );
                                }
                            }
                        />
                    </>
                    :
                    <>
                        <DefaultButton
                            fullWidth = {true}
                            onClick={() => setEditingUser(null)}
                            status="secondary"
                            text="Закрыть"
                        />
                    </>
                }
                
            </div>
        </div>  
    );
}
export default ModalSelectRole;

const styles = {
    container: { width: "100%", height: "100%", display: "flex", flexDirection: "column" as const, fontFamily: "var(--font-rounded)" },
    header: { width: "100%", textAlign: "center" as const },
    content : { display: "flex", flex: 1, flexDirection: "column" as const },
    avatar: { width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 700, color: "#7177f4" },
    usernameText: { fontSize: "13px", color: "#7177f4", fontWeight: 600 },
    roleCard: { display: "flex", flexDirection: "column" as const, padding: "12px 16px", borderRadius: "14px", border: "2px solid #e2e8f0", cursor: "pointer", transition: "all 0.2s ease", userSelect: "none" as const },
    roleTitle: { fontSize: "15px", fontWeight: 700 },
    roleDescription: { margin: "4px 0 0 0", fontSize: "13px", color: "#64748b", lineHeight: "1.4" },
    modalFooter: { marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid #f1f5f9", paddingTop: "16px" },
}
import React from "react";
import DefaultButton from "../../../components/default_button";
import MemberSelector from "../../../components/selection_user";
import type { IBoardMember } from "../../../hook/useBoards";

interface IModalAddNewMember {
    onClose: () => void;
    onSave: () => void;
    selectedMembers: IBoardMember[];
    setSelectedMembers : (members : IBoardMember[]) => void;
}

const ModalAddNewMember: React.FC<IModalAddNewMember> = ({ onClose, onSave, selectedMembers, setSelectedMembers }) => {

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h3 style={{ margin: "0px 0px 15px 0px" }}>Добавление участника</h3>
            </div>
            
            <div style={styles.content}>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "12px", width: "100%" }}>
                    <MemberSelector
                        selectedMembers={selectedMembers}
                        onMembersChange={setSelectedMembers}
                    />
                </div>
            </div>

            <div style={styles.modalFooter}>
                <DefaultButton
                    fullWidth={true}
                    onClick={onSave}
                    status="primary"
                    text="Сохранить"
                />
                <DefaultButton
                    fullWidth={true}
                    status="secondary"
                    text="Закрыть"
                    onClick={onClose}
                />
            </div>
        </div>  
    );
};

export default ModalAddNewMember;

const styles = {
    container: { width: "100%", height: "100%", display: "flex", flexDirection: "column" as const, fontFamily: "var(--font-rounded)" },
    header: { width: "100%", textAlign: "center" as const },
    content: { display: "flex", flex: 1, flexDirection: "column" as const, width: "100%" },
    modalFooter: { marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid #f1f5f9", paddingTop: "16px" },
};
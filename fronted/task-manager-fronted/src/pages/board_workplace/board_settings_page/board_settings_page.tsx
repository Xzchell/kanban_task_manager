import { Trash2Icon } from "lucide-react";
import { AnimatedBackground } from "../../../components/animated_background";
import DefaultButton from "../../../components/default_button";
import { useAlert } from "../../../context/alert_context";
import { useBoardPermissions } from "../../../hook/useBoardMember";
import { useBoard, type IBoard } from "../../../hook/useBoards";
import BusinessBoardSettings from "./business_board_settings";
import HakatonBoardSettings from "./hakaton_board_settings";
import { useEffect, useState } from "react";
import { useUsers } from "../../../hook/useUsers";
import { useAuth } from "../../../context/auth_context";
import { useNavigate } from "react-router-dom";

const BoardSettingsPage: React.FC = () => {
    const { selectedBoard, deleteBoardBd, updateBoardDetails, loadingBoard, resetDataBoard } = useBoard();
    const {canManageBoard, isTrueCreator} = useBoardPermissions();
    const { hideAlert, showAlert } = useAlert();
    const [modifiedBoard, setModifiedBoard] = useState<IBoard | null>(null);
    const {removeBoardMember, removeBoardMemberBD} = useUsers();
    const user = useAuth().user;
    const navigate = useNavigate();

    useEffect(() => {
        if (selectedBoard) {
            setModifiedBoard(selectedBoard);
        }
    }, [selectedBoard]);

    if (loadingBoard || !selectedBoard || !modifiedBoard) {
        return;
    }

    const onSave = (value: IBoard) => {
        if(value.columns?.length === 0) {
            showAlert(
                "Ошибка сохранения",
                "В проекте не может быть столбцов в количестве 0. Сохраните или создайте как минимум 1 столб для работы доски",
                    [
                        { text: "OK", status: "primary", onClick: () => { hideAlert(); } },
                    ],
            );
            return;
        }
        updateBoardDetails(value);
    };

    const onDelete = (value: number) => {
        if (canManageBoard) deleteBoardBd(value);
    }

    const hasChanges = (): boolean => {
        if (!selectedBoard || !modifiedBoard) return false;

        const textChanged = selectedBoard.title !== modifiedBoard.title || selectedBoard.description !== modifiedBoard.description;

        const columnsChanged = JSON.stringify(selectedBoard.columns) !== JSON.stringify(modifiedBoard.columns);

        if (selectedBoard.type.name === "hakaton") {
            const deadlineChanged = String(selectedBoard.deadline).split('.')[0].trim() !== modifiedBoard.deadline;
            const pointsChanged = JSON.stringify(selectedBoard.timePoints) !== JSON.stringify(modifiedBoard.timePoints);
            return textChanged || columnsChanged || deadlineChanged || pointsChanged;
        }
        return textChanged || columnsChanged;
        
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
            <div style={styles.backgroundFixedWrapper}>
                <AnimatedBackground />
            </div>
            <div style={styles.pageContainer}>
                <div style={styles.headerRow}>
                    <div>
                        <h1 style={styles.title}>Настройки доски</h1>
                        <p style={styles.subtitle}>
                            {!canManageBoard ? "Просмотр параметров рабочего пространства" : "Управление параметрами рабочего пространства доски"}
                        </p>
                    </div>
                    <div style = {{display: "flex", flexDirection: "row", gap: "10px"}}>
                        {!isTrueCreator && (
                            <DefaultButton
                                text="Покинуть проект"
                                status="danger"
                                onClick={()=> {
                                    showAlert(
                                            "Покинуть проект",
                                            "Вы уверены, что хотите покинуть проект? Это действие нельзя будет отменить.",
                                            [
                                                { text: "Покинуть", status: "danger", onClick: () => { 
                                                    if(selectedBoard && user) {
                                                        removeBoardMember(user?.id);
                                                        removeBoardMemberBD(user?.id);
                                                        hideAlert();
                                                        resetDataBoard();
                                                        navigate('/boards');
                                                    }else{
                                                        hideAlert();
                                                    }
                                                }},
                                                { text: "Отмена", status: "secondary", onClick: () => { hideAlert(); } },
                                            ],
                                    );
                                }}
                            />
                        )}
                        {hasChanges() && canManageBoard && (
                            <DefaultButton
                                text="Сохранить изменения"
                                status="primary"
                                onClick={()=> { if (modifiedBoard) onSave(modifiedBoard); }}
                            />
                        )}
                        {
                            isTrueCreator && 
                            <DefaultButton
                                text="Удалить доску"
                                status="danger"
                                icon= {<Trash2Icon size={20}/>}
                                onClick={()=> {
                                    showAlert(
                                            "Удалить доску",
                                            "Вы уверены, что хотите удалить рабочее пространство? Это действие нельзя будет отменить.",
                                            [
                                                { text: "Удалить", status: "danger", onClick: () => { 
                                                    if(selectedBoard) {
                                                        onDelete(selectedBoard.id); 
                                                        hideAlert();
                                                    }
                                                }},
                                                { text: "Отмена", status: "secondary", onClick: () => { hideAlert(); } },
                                            ],
                                    );
                                }}
                            />
                        }
                    </div>
                </div>
                <div style={styles.scrollContainer}>
                    {selectedBoard?.type.name === "hakaton" ? (
                        <HakatonBoardSettings 
                            onChange={setModifiedBoard} 
                            isReadOnly={!canManageBoard} 
                        />
                    ) : (
                        <BusinessBoardSettings 
                            onChange={setModifiedBoard} 
                            isReadOnly={!canManageBoard}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default BoardSettingsPage;

const styles = {
    backgroundFixedWrapper: {
        position: "fixed" as const,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1,
        pointerEvents: "none" as const,
    },
    pageContainer: {
        display: "flex",
        flexDirection: "column" as const,
        flex: 1,
        overflow: "hidden",
        zIndex: 2,
        fontFamily: "var(--font-rounded)",
    },
    headerRow: { paddingTop: "50px", paddingLeft: "120px", paddingRight: "20px", width: "auto", marginBottom: "10px", display: "flex", flexDirection: "row" as const, justifyContent: 'space-between'},
    title: { fontSize: "26px", fontWeight: 700, color: "#1e293b", margin: "0 0 6px 0" },
    subtitle: { fontSize: "14px", color: "#64748b", margin: 0 },
    scrollContainer: {
        paddingLeft: "120px",
        paddingRight: "20px",
        paddingTop: "15px",
        flex: 1,
        overflowY: "auto" as const,
        WebkitMaskImage: `
            linear-gradient(to bottom, transparent, black 24px, black calc(100% - 24px), transparent)
        `,
        maskImage: `
            linear-gradient(to bottom, transparent, black 24px, black calc(100% - 24px), transparent)
        `,
        WebkitMaskComposite: "source-in" as const,
        maskComposite: "intersect" as const,
    },
    
}
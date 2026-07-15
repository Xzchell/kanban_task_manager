import { useEffect, useState } from "react";
import StatusTaskContainer from "../components/status_task_container";
import type { ITags, ITaskData } from "../components/task_card";
import RichTextEditor from "../components/rich_text_editor";
import PriorityTaskContainer from "../components/priority_task_container";
import TagSelector from "../components/tag_selector";
import { useAuth} from "../context/auth_context";
import UserSelector from "../components/user_selector";
import { useTags } from "../hook/useTags";
import { useBoard } from "../hook/useBoards";
import type { IBoardMember } from "../hook/useBoards";
import { TimePointSelector } from "../components/time_point_selector";
import CustomModal from "../components/custom_modal";
import { DeadlinePicker } from "../components/deadline_picker/deadline_picker";
import DefaultButton from "../components/default_button";
import { ToggleSwitch } from "../components/switcher";
import { formatToSqlTimestamp } from "../utils/formatters";

export interface ITaskModalEditor {
    task : ITaskData,
    renderButtons: (updatedTask: ITaskData) => React.ReactNode, 
    onSwitchStatus: (taskId : number, newStatus : number) => void,
}

const TaskModalEditor: React.FC<ITaskModalEditor> = ({task, renderButtons, onSwitchStatus}) => {
    const user = useAuth().user;
    const { selectedBoard } = useBoard();
    const { allTags, fetchAllTags } = useTags(user?.id);

    const [localTitle, setLocalTitle] = useState(task.title);
    const [localDeadline, setLocalDeadLine] = useState<Date | null>(task.deadline ? new Date(task.deadline) : null);
    const [localDesc, setLocalDesc] = useState(task.full_desc);
    const [localPriority, setLocalPriority] = useState(task.priority);
    const [selectedTags, setSelectedTags] = useState<ITags[]>(task.tags || []);
    const [isMvp, setIsMpv] = useState<boolean>(task.isMvp ?? false);

    const [selectedIdTimePoint, setSelectedIdTimePoint] = useState<number | null>(task.time_point?.id ?? null);
    
    const initialSelectedUsers = (task.executors || []).filter(u => u.id !== task.author.id);

    const [selectedUsers, setSelectedUsers] = useState<IBoardMember[]>(initialSelectedUsers);
    const availableBoardUsers = selectedBoard?.users || [];

    const [isModalOpen, setModalOpen] = useState(false);

    useEffect(() => {fetchAllTags();}, [fetchAllTags]);

    useEffect(() => {
        setLocalTitle(task.title);
        setLocalDeadLine(task.deadline ? new Date(task.deadline) : null);
        setLocalDesc(task.full_desc);
        setLocalPriority(task.priority);
        setSelectedTags(task.tags || []);
        setSelectedUsers((task.executors || []).filter(u => u.id !== task.author.id));
    }, [task]);

    const selectedTimePoint = selectedBoard?.timePoints?.find(
        (tp) => tp.id === selectedIdTimePoint
    );
    
    const updatedTaskData : ITaskData = { 
        ...task, 
        isMvp: isMvp,
        title: localTitle, 
        deadline: formatToSqlTimestamp(localDeadline),
        full_desc: localDesc , 
        priority : localPriority, 
        tags: selectedTags,
        executors: selectedUsers,
        time_point: selectedTimePoint ?? null
    };

    const formatDeadlineFull = (dateInput: Date | string | null) => {
        if (!dateInput) return "Срок не задан";
        
        const date = new Date(dateInput);
        
        if (isNaN(date.getTime())) return "Некорректная дата";

        const datePart = new Intl.DateTimeFormat("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(date);

        const timePart = new Intl.DateTimeFormat("ru-RU", {
            hour: "2-digit",
            minute: "2-digit"
        }).format(date);

        return `${datePart} в ${timePart}`;
    };
    
    return (
        <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflowX: 'auto'}}>
            <div style={styles.toolbar}>
                <input 
                    value={localTitle}
                    onChange={(e) => setLocalTitle(e.target.value)}
                    style={styles.titleInput}
                    placeholder="Введите название задачи..."
                />
            </div>
            <div style={{display: 'flex', flex: 1, minHeight: 0}}>
                <div style={styles.content}>
                    <RichTextEditor 
                        content={localDesc} 
                        onChange={(newHtml) => setLocalDesc(newHtml)} 
                    />
                </div>
                <div style = {styles.sidebar}>
                    <div style = {{flex: 1, display: 'flex', flexDirection: 'column' as const, gap: '5px', flexShrink: 0, overflowY: 'auto' as const, paddingBottom: '30px'}}>
                        <b style={styles.label}>Статус</b>
                        <div style={{margin: '10px 0'}}> 
                            <StatusTaskContainer 
                                status={task.status} 
                                taskId={task.id} 
                                columns={selectedBoard?.columns ?? []}
                                onStatusChange={onSwitchStatus}
                            />
                        </div>
                        <b style={styles.label}>Приоритет</b> 
                        <PriorityTaskContainer priority={localPriority} onPriorityChange={setLocalPriority}/>
                        
                        {
                            selectedBoard?.type.name === "hakaton" ?
                            <div style={{margin: "10px 0px"}}>  
                                <b style={styles.label}>Дедлайн</b>
                                <TimePointSelector
                                    onChange={(id: number | null) => setSelectedIdTimePoint(id)}
                                    selectedId={selectedIdTimePoint ?? 0}
                                    timePoints={selectedBoard?.timePoints ?? []}
                                />
                            </div>
                            :

                            <>
                                <b style={styles.label}>Срок выполнения</b> 
                                <div style={{
                                    ...styles.deadlineBlock,
                                    backgroundColor: !localDeadline ? "#f8fafc" : (new Date(localDeadline).getTime() < Date.now() ? "#fef2f2" : (new Date(localDeadline).getTime() - Date.now() < 86400000 ? "#fffbeb" : "#f0fdf4")),
                                    borderColor: !localDeadline ? "#e2e8f0" : (new Date(localDeadline).getTime() < Date.now() ? "#fca5a5" : (new Date(localDeadline).getTime() - Date.now() < 86400000 ? "#fde047" : "#86efac"))
                                }}>
                                    <div style={styles.deadlineInfo}>
                                        <span style={{
                                            ...styles.deadlineStatusText,
                                            color: !localDeadline ? "#64748b" : (new Date(localDeadline).getTime() < Date.now() ? "#ef4444" : (new Date(localDeadline).getTime() - Date.now() < 86400000 ? "#d97706" : "#10b981"))
                                        }}>
                                            {!localDeadline ? "Срок не задан" : (new Date(localDeadline).getTime() < Date.now() ? "Просрочено" : (new Date(localDeadline).getTime() - Date.now() < 86400000 ? "Горит (меньше суток)" : "В рамках срока"))}
                                        </span>
                                        
                                        <span style={styles.deadlineDateValue}>
                                            {localDeadline ? formatDeadlineFull(localDeadline) : "Установите дату завершения"}
                                        </span>
                                    </div>

                                    <DefaultButton
                                        text="Сменить дедлайн"
                                        onClick={() => setModalOpen(true)}
                                        status="secondary"
                                        fullWidth={true}
                                    />
                                </div>
                            </>
                        }                    
                        <ToggleSwitch 
                            label="Это MVP задача" 
                            checked={isMvp} 
                            onChange={setIsMpv} 
                        />    
                            
                        <div>
                            <b style={styles.label}>Исполнители (* - все пользователи):</b>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                            <UserSelector 
                                availableUsers={availableBoardUsers}
                                selectedUsers={selectedUsers}
                                onUsersChange={(users) => setSelectedUsers(users)}
                                small={true}
                            />
                            </div>
                        </div>
                        
                        <b style={styles.label}>Автор:</b> <label style={{marginBottom: '10px'}}>{task.author.last_name + ' ' + task.author.first_name + ' ' + task.author.middle_name}</label>
                        <b style={styles.label}>Теги (* - все теги)</b>
                        <TagSelector selectedTags={selectedTags} onTagsChange={setSelectedTags} availableTags={allTags}/>
                    </div>
                    {renderButtons(updatedTaskData)}
                </div>
            </div>

            {
                <CustomModal
                    isOpen={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    height="auto"
                    width="700px" 
                >
                    <div style={styles.modalContent}>
                        <h2 style={styles.modalTitle}>Срок выполнения задачи</h2>
                        
                        <div style={styles.pickerContainer}>
                            <DeadlinePicker
                                value={localDeadline} 
                                onChange={setLocalDeadLine} 
                            />
                        </div>

                        <div style={styles.actionsRow}>
                            <DefaultButton
                                text="Готово"
                                onClick={() => setModalOpen(false)}
                                fullWidth={true}
                            />
                        </div>
                    </div>
                </CustomModal>
            }
        </div>
    );
};

export default TaskModalEditor;

const styles = {
    label: {    
        color: '#777777',
    },
    dateInput: {
        border: '1px solid #e3e3e3',
        borderRadius: '8px',
        padding: '8px',
        fontSize: '14px',
        fontFamily: 'var(--font-rounded)',
        marginTop: '5px',
        width: '100%',
        boxSizing: 'border-box' as const,
        outline: 'none',
        cursor: 'pointer',
    },
    titleInput: {
        flex: 1,
        width: '100%',
        fontSize: '19px',
        fontWeight: 700,
        textAlign: 'center' as const,
        border: 'none',
        outline: 'none',
        backgroundColor: 'transparent',
        fontFamily: 'var(--font-rounded)',
        color: '#333',
        transition: 'all 0.2s ease',
        cursor: 'text',
    },
    container: {
        maxWidth: '100%',
        maxHeight: '100%',
        width: '80vw',
        height: '80vh',
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff',
        border: '1px solid #e3e3e3',
        borderRadius: '18px',
        boxShadow: '0 10px 40px 20px rgba(0, 0, 0, 0.3)',
        zIndex: 1000,
        textAlign: 'start' as const,
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden' as const,
    },
    backdrop: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 999,
        backdropFilter: 'blur(4px)',
    },
    sidebar:{
        minWidth: '250px',
        width: '320px',
        borderLeft: '2px solid #e3e3e3',
        padding: '15px',
        display: 'flex',
        flexDirection: 'column' as const,
        flexShrink: 0,
    },
    toolbar: {
        flexDirection: 'row' as const,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        display: 'flex',
        flexShrink: 0,
        gap: '10px',
        height: '40px',
        width: '100%',
        borderBottom: '2px solid #e3e3e3',
    },
    content: {
        flex: 1,
        flexDirection: 'column' as const,
        minHeight: 0,
    },
    status:{
        whiteSpace: 'nowrap',
        borderRadius: '10px',
        paddingRight: '8px', paddingLeft: '8px', paddingBottom: '6px', paddingTop: '6px',
        fontFamily: 'var(--font-rounded)',
        fontWeight: 600,
        fontSize: '16px',
    },
    tags: {
        display: 'flex' as const,
        flexWrap: 'wrap' as const,
        gap: '6px',
        minHeight: '20px',
        marginBottom: '0px'
    },
    tag:{
        whiteSpace: 'nowrap',
        borderRadius: '10px',
        paddingRight: '8px', paddingLeft: '8px', paddingBottom: '6px', paddingTop: '6px',
        fontFamily: 'var(--font-rounded)',
        fontWeight: 600,
        fontSize: '16px',
    },
    modalContent: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "stretch",
        padding: "10px 5px 5px 5px",
        fontFamily: "var(--font-rounded)",
    },
    modalTitle: {
        marginTop: "0px",
        marginBottom: "20px",
        fontSize: "18px",
        fontWeight: 700,
        color: "#1e293b",
        textAlign: "center" as const,
    },
    pickerContainer: {
        width: "100%",
        marginBottom: "24px",
    },
    actionsRow: {
        display: "flex",
        justifyContent: "flex-end" as const,
        gap: "12px",
        width: "100%",
    },
    deadlineBlock: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "12px",
        padding: "14px",
        borderRadius: "12px",
        border: "1px solid",
        marginTop: "6px",
        marginBottom: "10px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        transition: "all 0.2s ease",
    },
    deadlineInfo: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "4px",
    },
    deadlineStatusText: {
        fontSize: "12px",
        fontWeight: 700,
        textTransform: "uppercase" as const,
        letterSpacing: "0.03em",
    },
    deadlineDateValue: {
        fontSize: "15px",
        fontWeight: 600,
        color: "#1e293b",
    }
}
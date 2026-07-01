import { useEffect, useState } from "react";
import StatusTaskContainer from "../components/status_task_container";
import type { IExecutors, ITags, ITaskData } from "../components/task_card";
import RichTextEditor from "../components/rich_text_editor";
import PriorityTaskContainer from "../components/priority_task_container";
import TagSelector from "../components/tag_selector";
import { useAuth} from "../context/auth_context";
import UserSelector from "../components/user_selector";
import { useTags } from "../hook/useTags";
import { useUsers } from "../hook/useUsers";

export interface ITaskModalEditor {
    task : ITaskData,
    renderButtons: (updatedTask: ITaskData) => React.ReactNode, 
    onSwitchStatus: (taskId : number, newStatus : number) => void,
}

const TaskModalEditor: React.FC<ITaskModalEditor> = ({task, renderButtons, onSwitchStatus}) => {
    const user = useAuth().user;
    const { allTags, fetchAllTags } = useTags(user?.id);
    const { allUsers, fetchAllUsers } = useUsers(user?.id, user?.role.permission_level);

    const [localTitle, setLocalTitle] = useState(task.title);
    const [localDeadline, setLocalDeadLine] = useState(task.deadline.split(' ')[0]);
    const [localDesc, setLocalDesc] = useState(task.full_desc);
    const [localPriority, setLocalPriority] = useState(task.priority);
    const [selectedTags, setSelectedTags] = useState<ITags[]>(task.tags || []);
    const initialSelectedUsers = (task.executors || []).filter(user => user.id !== task.author.id);
    const [selectedUsers, setSelectedUsers] = useState<IExecutors[]>(initialSelectedUsers);

    useEffect(() => {fetchAllTags();}, [fetchAllTags]);
    useEffect(() => {fetchAllUsers();}, [fetchAllUsers]);
    
    const updatedTaskData = { 
        ...task, 
        title: localTitle, 
        deadline: localDeadline, 
        full_desc: localDesc , 
        priority : localPriority, 
        tags: selectedTags,
        executors: selectedUsers,
    };
    
    return (
        <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column'}}>
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
                            <StatusTaskContainer status={task.status} taskId={task.id} onStatusChange={onSwitchStatus}></StatusTaskContainer>
                        </div>
                        <b style={styles.label}>Приоритет</b> 
                        <PriorityTaskContainer priority={localPriority} onPriorityChange={setLocalPriority}/>
                        <b style={styles.label}>Срок</b> 
                        
                            <input 
                                type="date"
                                style={styles.dateInput}
                                value={localDeadline}
                                onChange={(e) => setLocalDeadLine(e.target.value)}
                            />
                            
                        <div>
                                <b style={styles.label}>Исполнители (* - все пользователи):</b>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                                    <UserSelector
                                        small
                                        availableUsers={allUsers}
                                        selectedUsers={selectedUsers}
                                        onUsersChange={setSelectedUsers}
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
}
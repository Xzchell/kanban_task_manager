import { useEffect, useState } from "react";
import DefaultButton from "../components/default_button";
import { useAuth } from "../context/auth_context";
import { type ICreateTaskData } from "../hook/useTasks";
import { motion } from "framer-motion";
import PriorityTaskContainer from "../components/priority_task_container";
import RichTextEditor from "../components/rich_text_editor";
import { useAlert } from '../context/alert_context';
import TagSelector from "../components/tag_selector";
import type { IExecutors, ITags } from "../components/task_card";
import UserSelector from "../components/user_selector";
import { useTags } from "../hook/useTags";
import { useUsers } from "../hook/useUsers";

export interface ITaskModalCreate {
    onClose: () => void;
    onCreate: (data: ICreateTaskData) => void;
}

const TaskModalCreate: React.FC<ITaskModalCreate> = ({ onClose, onCreate }) => {
    const user = useAuth().user;
    
    const { allTags, fetchAllTags } = useTags(user?.id); 
    const { allUsers, fetchAllUsers } = useUsers(user?.id, user?.role.permission_level);

    const [title, setTitle] = useState("");
    const [shortDesc, setShortDesc] = useState("");
    const [fullDesc, setFullDesc] = useState("");
    const [priority, setPriority] = useState(1);
    const [localDeadline, setLocalDeadLine] = useState(new Date().toISOString().split('T')[0]);
    const [selectedTags, setSelectedTags] = useState<ITags[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<IExecutors[]>([]);

    const { showAlert, hideAlert } = useAlert();

    useEffect(() => {fetchAllTags();}, [fetchAllTags]);
    useEffect(() => {fetchAllUsers();}, [fetchAllUsers]);

    const handleSubmit = () => {
        if (!title.trim()) return alert("Введите название!");
        
        onCreate({
            title,
            short_desc: shortDesc,
            full_desc: fullDesc,
            status: 1,
            priority: priority,
            author_id: user?.id || 0,
            deadline: new Date(localDeadline).toISOString(),
            tags: selectedTags,
            executors: selectedUsers,
        });
        onClose();
    };
    return (
        <motion.div 
            style={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose} 
        >
            <motion.div 
                style={styles.modal}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 style={styles.title}>Новая задача</h2>
                
                <div style={styles.formContainer}>
                    <div style={styles.form}>
                        <label style={styles.label}>Название</label>
                        <input 
                            style={styles.input} 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Что нужно сделать?"
                        />

                        <label style={styles.label}>Краткое описание</label>
                        <textarea 
                            style={styles.textarea} 
                            value={shortDesc}
                            onChange={(e) => setShortDesc(e.target.value)}
                            placeholder="Пара слов о задаче..."
                        />                        
                        
                        <label style={styles.label}>Выбор приоритета</label>
                        <PriorityTaskContainer priority={priority} onPriorityChange={setPriority} />
                        
                        <label style={styles.label}>Выбор дедлайна</label>
                        
                        <input 
                            type="date"
                            style={styles.dateInput}
                            value={localDeadline}
                            onChange={(e) => setLocalDeadLine(e.target.value)}
                        />

                        <label style={styles.label}>Теги (* - все теги)</label>
                        <TagSelector 
                            availableTags={allTags}
                            selectedTags={selectedTags} 
                            onTagsChange={setSelectedTags} 
                        />

                        <label style={styles.label}>Пользователи (* - все пользователи)</label>
                        <UserSelector 
                            availableUsers={allUsers}
                            selectedUsers={selectedUsers}
                            onUsersChange={setSelectedUsers}
                        />

                        <label style={styles.label}>Полное описание</label>
                        
                        <div style={styles.editorWrapper}>
                            <RichTextEditor
                                content={fullDesc}
                                onChange={setFullDesc}
                                minHeight="200px" 
                            />
                        </div>
                    </div>
                </div>

                <div style={styles.actions}>
                    <DefaultButton text="Отмена" status="secondary" onClick={onClose} />
                    <DefaultButton text="Создать задачу" onClick={
                        title.trim() ? handleSubmit : () => {
                            showAlert(
                                "Ошибка создания задачи",
                                "Пожалуйста, заполните название.",
                                [
                                    { text: "Окей", status: "secondary", onClick: () => { hideAlert(); } },
                                ],
                            );
                        }
                    } />
                </div>
            </motion.div>
        </motion.div>
    );
}
export default TaskModalCreate;

const styles = {
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
    backdrop: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 900,
    },
    modal: {
        backgroundColor: '#fff',
        width: '80vw',
        maxWidth: '800px',
        maxHeight: '90vh',
        padding: '30px 0 25px 0', 
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden',
    },
    title: {
        margin: '0 30px 20px 30px',
        fontFamily: 'var(--font-rounded)',
        fontSize: '24px',
    },
    formContainer: {
        flex: 1,
        overflowY: 'auto' as const,
        padding: '0 30px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '16px',
        paddingBottom: '20px',
    },
    editorWrapper: {
        display: 'flex',
        flexDirection: 'column' as const,
        minHeight: '250px',
    },
    label: {
        fontSize: '14px',
        fontWeight: 600,
        color: '#666',
    },
    input: {
        padding: '12px',
        borderRadius: '10px',
        border: '1.5px solid #eee',
        fontSize: '16px',
        outline: 'none',
    },
    textarea: {
        padding: '12px',
        borderRadius: '10px',
        border: '1.5px solid #eee',
        fontSize: '16px',
        outline: 'none',
        minHeight: '80px',
        resize: 'none' as const,
    },
    actions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        padding: '20px 30px 0 30px',
        borderTop: '1px solid #f0f0f0',
    }
};
import { useEffect, useState } from "react";
import DefaultButton from "../components/default_button";
import { useAuth } from "../context/auth_context";
import { motion } from "framer-motion";
import PriorityTaskContainer from "../components/priority_task_container";
import RichTextEditor from "../components/rich_text_editor";
import { useAlert } from '../context/alert_context';
import TagSelector from "../components/tag_selector";
import type { ITags } from "../components/task_card";
import UserSelector from "../components/user_selector";
import { useTags } from "../hook/useTags";
import { ToggleSwitch } from "../components/switcher";
import { DeadlinePicker } from "../components/deadline_picker/deadline_picker";
import { useDesignMode } from "../context/design_context";
import { theme } from "../themes/themes";
import { useBoard } from "../hook/useBoards";
import { TimePointSelector } from "../components/time_point_selector";
import type { IBoardMember } from "../hook/useBoards";
import { formatToSqlTimestamp } from "../utils/formatters";
import FormInput from "../components/form_input";

export interface ITaskModalCreate {
    onClose: () => void;
}

const TaskModalCreate: React.FC<ITaskModalCreate> = ({ onClose}) => {
    const user = useAuth().user;
    
    const { selectedBoard, createTask } = useBoard();

    const { allTags, fetchAllTags } = useTags(user?.id); 
    const [title, setTitle] = useState("");
    const [shortDesc, setShortDesc] = useState("");
    const [fullDesc, setFullDesc] = useState("");
    const [priority, setPriority] = useState(1);

    const [deadline, setDeadline] = useState<Date | null>(selectedBoard?.type.name === "company" ? new Date() : null);
    
    const [selectedTags, setSelectedTags] = useState<ITags[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<IBoardMember[]>([]);
    const availableBoardUsers = selectedBoard?.users || [];

    const [isMvp, setIsMvp] = useState<boolean>(false);
    const [selectedIdTimePoint, setSelectedIdTimePoint] = useState<number | null>(null);
    const { showAlert, hideAlert } = useAlert();

    useEffect(() => {fetchAllTags();}, [fetchAllTags]);


    const handleSubmit = async () => {
        createTask({
            title,
            short_desc: shortDesc,
            full_desc: fullDesc,
            status: 1,
            priority: priority,
            author_id: user?.id || 0,
            deadline: formatToSqlTimestamp(deadline),
            tags: selectedTags,
            executors: selectedUsers,
            isMvp: isMvp,
            time_point_id: selectedIdTimePoint
        });
        console.log(selectedIdTimePoint);
        onClose();
    };

    const { mode } = useDesignMode();
    const currentMode = theme.modes[mode];
    
    return (
        <motion.div 
            style={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose} 
        >
            <motion.div 
                style={{...styles.modal, ...currentMode.card, backgroundColor: "rgba(255, 255, 255, 0.93)", }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 style={styles.title}>Новая задача</h2>
                
                <div style={styles.formContainer}>
                    <div style={styles.form}>
                        <FormInput
                            id="title-task"
                            label="Название"
                            onChange={setTitle}
                            value={title}
                            placeholder="Тема задачи..."
                            type="text"
                            maxLength={100}
                        />

                        <FormInput
                            id="title-task"
                            label="Краткое описание"
                            onChange={setShortDesc}
                            value={shortDesc}
                            placeholder="Пару слов о задаче..."
                            type="textarea"
                            maxLength={500}
                        />

                        <ToggleSwitch 
                            label="Это MVP задача" 
                            checked={isMvp} 
                            onChange={setIsMvp} 
                        />                        
                        <label style={styles.label}>Выбор приоритета</label>
                        <PriorityTaskContainer priority={priority} onPriorityChange={setPriority} />
                        
                        <label style={styles.label}>Выбор дедлайна</label>

                        {
                            selectedBoard?.type.name === "company" &&

                            <DeadlinePicker
                                value={deadline} 
                                onChange={setDeadline} 
                            />
                        }

                        {
                            (selectedBoard?.timePoints?.length ?? 0) > 0 && (
                            <>
                                <TimePointSelector
                                    onChange={(id: number | null) => setSelectedIdTimePoint(id)}
                                    selectedId={selectedIdTimePoint ?? 0}
                                    timePoints={selectedBoard?.timePoints ?? []}
                                />
                            </>
                            )
                        }
                        <label style={styles.label}>Теги (* - все теги)</label>
                        <TagSelector 
                            availableTags={allTags}
                            selectedTags={selectedTags} 
                            onTagsChange={setSelectedTags} 
                        />

                        <label style={styles.label}>Пользователи (* - все пользователи)</label>
                        <UserSelector 
                            availableUsers={availableBoardUsers}
                            selectedUsers={selectedUsers}
                            onUsersChange={(users) => setSelectedUsers(users)}
                            small={false}
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
        zIndex: 100,
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
    actions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        padding: '20px 30px 0 30px',
        borderTop: '1px solid #f0f0f0',
    }
};
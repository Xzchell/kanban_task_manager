import { motion } from "framer-motion";
import type { ITaskData } from "../components/task_card";
import DefaultButton from "../components/default_button";
import { useState, useEffect } from "react";
import TaskModalPreview from "./task_modal_preview";
import TaskModalEditor from "./task_modal_editor";
import { useAlert } from "../context/alert_context";
import { useBoardPermissions } from "../hook/useBoardMember";

export interface ITaskModal {
    task: ITaskData;
    onClose: () => void;
    onUpdate: (taskId: number, data: ITaskData) => void;
    onSwitchStatus: (taskId : number, newStatus : number) => void;
    onDelete?: (taskId: number) => void;
}

const TaskModal: React.FC<ITaskModal> = ({ task, onClose, onSwitchStatus, onUpdate, onDelete }) => {
    const [isEditing, setEditing] = useState(false);
    const [currentTask, setCurrentTask] = useState<ITaskData>(task);

    useEffect(() => {
        setCurrentTask(task);
    }, [
        task.id, 
        task.title, 
        task.full_desc, 
        task.status, 
        task.priority, 
        task.deadline,
        task.time_point?.id,
        task.tags?.length, 
        task.executors?.length
    ]);
    const { canEditOrDeleteTask } = useBoardPermissions();
    const canEdit = canEditOrDeleteTask(currentTask);

    const { showAlert, hideAlert } = useAlert();

    const handleStatusChange = (taskId: number, newStatus: number) => {
        onSwitchStatus(taskId, newStatus);
        setCurrentTask(prev => ({ ...prev, status: newStatus }));
    };

    const renderButtons = (updatedTask?: ITaskData) => {
        if(canEdit){
            if (!isEditing){
                return ( 
                    <div style = {{display: 'flex', flexDirection: 'row', gap: '5px'}}>
                        <DefaultButton text="Редактировать" onClick={() => {setEditing(true)}} fullWidth = {true}/> 
                        <DefaultButton text="Закрыть" onClick={onClose} fullWidth = {true} status="secondary"/>
                    </div>);
                }
            else{
                return ( 
                    <div style = {{display: 'flex', flexDirection: 'column'}}>
                        <div style = {{display: 'flex', flexDirection: 'row', gap: '5px'}}>
                            <DefaultButton text="Сохранить" onClick={() => 
                            {
                                if (updatedTask) {
                                    onUpdate(currentTask.id!, updatedTask);
                                    setCurrentTask(updatedTask);
                                }
                                setEditing(false);
                            }    
                            } fullWidth = {true}/> 
                            <DefaultButton text="Удалить" onClick={
                                () => {
                                    showAlert(
                                        "Удалить задачу",
                                        "Вы уверены, что хотите удалить эту задачу? Это действие нельзя будет отменить.",
                                        [
                                            { text: "Удалить", status: "danger", onClick: () => { onDelete?.(currentTask.id!); hideAlert(); onClose(); } },
                                            { text: "Отмена", status: "secondary", onClick: () => { hideAlert(); } },
                                        ],
                                    );
                                }
                            } fullWidth = {true} status="danger"/> 
                        </div>  
                        <DefaultButton text="Отменить" onClick={() => setEditing(false)} fullWidth = {true} status="secondary"/>
                    </div>
                );
            }
        }
        else{
            return (
                <div style = {{display: 'flex', flexDirection: 'row'}}>
                    <DefaultButton text="Закрыть" fullWidth = {true} onClick={onClose}  status="secondary"/>
                </div>
            );
        }
    }

    return (
        <motion.div style={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div style={styles.container}
                initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-40%" }} 
                animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}   
                exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-40%" }}    
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
            >
            {isEditing ? (
                <TaskModalEditor
                    task={currentTask}
                    renderButtons={renderButtons}
                    onSwitchStatus={handleStatusChange} 
                />
            ) : (
                <TaskModalPreview
                    task={currentTask}
                    renderButtons={renderButtons}
                    onSwitchStatus={handleStatusChange}
                />
            )}
            </motion.div>
        </motion.div>
    );
};

export default TaskModal;

const styles = {
    label: {    
        color: '#777777',
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
        width: '300px',
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
        padding: '0 20px',
        flex: 1,
        flexDirection: 'column' as const,
        minHeight: 0,
        overflowY: 'auto' as const,
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 5%, black 90%, transparent)',
        maskImage: 'linear-gradient(to bottom, transparent, black 5%, black 90%, transparent)',
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
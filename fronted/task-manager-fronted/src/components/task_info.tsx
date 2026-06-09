import type { FC } from "react";
import type { ITaskData } from "./task_card";

export interface ITaskDescription{
    task: ITaskData
}

const TaskInfo: FC<ITaskDescription> = ({task}) => {
    return(
        <div style={styles.info_container}>
            <h2 style={styles.info_title}>{task.title}</h2>
            <p style={styles.info_desc}>{task.full_desc}</p>
        </div>
    );
};

const styles = {
    info_container: {
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px',
    },  
    info_title: {
        fontSize: '24px',
        marginBottom: '10px',   
    },
    info_desc: {
        fontSize: '16px',
        color: '#555',
    }
};

export default TaskInfo;
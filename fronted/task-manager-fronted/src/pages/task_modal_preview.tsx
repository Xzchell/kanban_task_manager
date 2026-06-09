import StatusTaskContainer from "../components/status_task_container";
import type { ITaskData } from "../components/task_card";
import { formatedDate, formatFullName } from "../utils/formatters";

export interface ITaskModalPreview {
    task : ITaskData,
    renderButtons: () => React.ReactNode, 
    onSwitchStatus: (taskId : number, newStatus : number) => void,
}

const TaskModalPreview: React.FC<ITaskModalPreview> = ({task, renderButtons, onSwitchStatus}) => {
    
    const renderPriority = (priority : number) => {
        const config: { [key: number]: { text: string; color: string; backgroundColor: string } } = {
            1: { text: 'Низкий', color: '#00c950', backgroundColor: '#f0fdf4' },
            2: { text: 'Средний', color: '#f0b100', backgroundColor: '#fefce8' },
            3: { text: 'Высокий', color: '#ff6900', backgroundColor: '#fff7ed' },
            4: { text: 'Критический', color: '#fb2c36', backgroundColor: '#fef2f2' },
        };

        const current = config[priority] || config[1];

        return(
            <div
                style={{
                    ...styles.wrapper,
                    backgroundColor: current.backgroundColor,
                    color: current.color,
                    border: `1px solid ${current.color}40`,
                }}
            >
            <div style={styles.contentLeft}>
                    <span style={{ ...styles.dot, backgroundColor: current.color }}></span>
                    <span style={styles.textDisplay}>{current.text}</span>
                </div>
            </div>
        );
    };
    
    return (
        <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column'}}>
            <div style={styles.toolbar}>
                <h3>{task.title}</h3>
            </div>
            <div style={{display: 'flex', flex: 1, minHeight: 0}}>
                <div style={styles.content}>
                    <div
                        className="task_desc"
                        style = {{paddingBottom: '30px', paddingTop: '10px'}}
                        dangerouslySetInnerHTML={{ __html: task.full_desc }}
                    />
                </div>
                <div style = {styles.sidebar}>
                    <div style = {{flex: 1, display: 'flex', flexDirection: 'column' as const, gap: '5px', flexShrink: 0, overflowY: 'auto' as const,}}>
                        <b style={styles.label}>Статус</b>
                        <div style={{margin: '10px 0'}}> 
                            <StatusTaskContainer status={task.status} taskId={task.id} onStatusChange={onSwitchStatus}></StatusTaskContainer>
                        </div>
                        <b style={styles.label}>Приоритет</b> 
                        {renderPriority(task.priority)}
                        <b style={styles.label}>Срок</b> <label>{formatedDate(task.deadline)}</label>
                        <div>
                                <b style={styles.label}>Исполнители:</b>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                                    {task.executors && task.executors.length > 0 ? (
                                        task.executors.filter((executor) => executor.id != task.author.id).map((executor) => (
                                            <label key={executor.id} style={{ fontSize: '16px', fontFamily: 'var(--font-rounded)'}}>
                                                {formatFullName(executor)}
                                            </label>
                                        ))
                                    ) : (
                                        <span style={{ color: '#343434', fontSize: '16px', fontFamily: 'var(--font-rounded)', fontWeight: '600' }}>Не назначены</span>
                                    )}
                                </div>
                            </div>
                        
                        <b style={styles.label}>Автор:</b> <label>{task.author.last_name + ' ' + task.author.first_name + ' ' + task.author.middle_name}</label>
                        <b style={styles.label}>Теги</b>
                        <div style={styles.tags}>
                        {task.tags.map((tag) => (
                            <span 
                                key={tag.id} style={{...styles.tag, backgroundColor: tag.background_color, color: tag.tag_color, border: `1px solid color-mix(in srgb, ${tag.tag_color}, white 40%)`}}>
                                {tag.name}
                            </span>
                        ))}
                        </div>
                    </div>
                    {renderButtons()}
                </div>
            </div>
        </div>
    );
};

export default TaskModalPreview;

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
        marginBottom: '20px'
    },
    tag:{
        whiteSpace: 'nowrap',
        borderRadius: '10px',
        paddingRight: '8px', paddingLeft: '8px', paddingBottom: '6px', paddingTop: '6px',
        fontFamily: 'var(--font-rounded)',
        fontWeight: 600,
        fontSize: '16px',
    },
    wrapper: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: '10px',
        padding: '8px 12px',
    },
    contentLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    dot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        flexShrink: 0,
    },
    textDisplay: {
        fontFamily: 'var(--font-rounded)',
        fontWeight: 600,
        fontSize: '16px',
    },
}
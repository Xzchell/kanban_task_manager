import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { UserCircle } from "lucide-react";
import type { FC } from "react";
import type { IBoardMember, ITimePoint } from "../hook/useBoards";
import { TaskDeadlineWidget } from "./task_deadline_widget";

export interface ITaskData {
    id?: number;
    title: string;
    tags: ITags[];
    short_desc: string;
    full_desc: string;
    status: number;
    priority: number;
    progress: number;
    author: IAuthor;
    deadline: string | null;
    created_at: string;
    executors?: IBoardMember[];
    isMvp?: boolean;
    time_point?: ITimePoint | null;
}

export interface IAuthor {
    id: number;
    last_name: string;
    first_name: string;
    middle_name: string;
}

export interface ITags {
    id: number;
    name: string;
    tag_color: string;
    background_color: string;
}

interface ITask {
    task: ITaskData;
    boardType?: string;
    onClick?: () => void;
    dragHandleProps?: DraggableProvidedDragHandleProps | null;
}

const TaskCard: FC<ITask> = ({ task, boardType = "business", onClick, dragHandleProps }) => {
    const priorityConfig: { [key: number]: { text: string; color: string; backgroundColor: string } } = {
        1: { text: 'Низкий', color: '#00c950', backgroundColor: '#f0fdf4' },
        2: { text: 'Средний', color: '#f0b100', backgroundColor: '#fefce8' },
        3: { text: 'Высокий', color: '#ff6900', backgroundColor: '#fff7ed' },
        4: { text: 'Критический', color: '#fb2c36', backgroundColor: '#fef2f2' },
    };

    const currentPriority = priorityConfig[task.priority] || priorityConfig[1];

    return (
        <div style={styles.card} className="taskCard">
            <div style={styles.draggable} {...dragHandleProps}>
                <div style={{ width: '40px', height: '4px', backgroundColor: '#c4c4c4', borderRadius: '2px' }}></div>
            </div>
            
            <div style={styles.tags}>
                {task.tags.map((tag) => (
                    <span 
                        key={tag.id} 
                        style={{ ...styles.tag, border: `1px solid color-mix(in srgb, ${tag.tag_color}, white 40%)`, backgroundColor: tag.background_color, color: tag.tag_color }}
                    >
                        {tag.name}
                    </span>
                ))}
            </div>

            <div 
                style={styles.card_block_info} 
                onClick={onClick} 
                role="button" 
                tabIndex={1}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        onClick?.();
                    }
                }}
            >
                <div style={styles.title_block}>
                    <div style={{ ...styles.blue_stripe, backgroundColor: currentPriority.color }}></div>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginRight: "12px" }}>
                        <h3 style={styles.title}>{task.title}</h3>
                        {!!task.isMvp && (
                            <span style={styles.mvpBadge}>MVP</span>
                        )}
                    </div>
                    <p style={styles.short_desc}>{task.short_desc.length > 0 ? task.short_desc : "Нет описания"}</p>
                </div>

                {/* Блок дедлайнов */}
                {(task.deadline || (boardType === "hakaton" && task.time_point)) ? (
                    <div style={styles.deadlineSection}>
                        <TaskDeadlineWidget 
                            deadline={task.deadline} 
                            timePoint={task.time_point} 
                            boardType={boardType} 
                        />
                    </div>
                ) : (
                    <div style={{height: "25px"}}></div>
                )}

                <div style={styles.bottom_author_block}>
                    <hr style={styles.bottom_line}></hr>
                    <div style={styles.bottom_info_block}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', alignItems: 'center' }}>
                            <UserCircle size={20} color="#828282" />
                            <label style={{ color: '#828282', fontSize: '13px', fontWeight: 500 }}>
                                {task.author.first_name + ' ' + task.author.middle_name}
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;

const styles: { [key: string]: React.CSSProperties } = {
    card: {
        width: '100%',
        minWidth: '250px',
        height: 'fit-content',
        margin: '0px',
        borderRadius: '26px', 
        border: '1px solid #e3e3e3',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        backgroundColor: '#ffffff',
        display: 'flex',      
        flexDirection: 'column', 
    },
    card_block_info: {
        display: 'flex',  
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        marginTop: '8px',
        flexGrow: 1
    },
    tags: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        minHeight: '0px',
        margin: '12px',
        marginBottom: '0px'
    },
    tag: {
        whiteSpace: 'nowrap',
        borderRadius: '10px',
        paddingRight: '8px', paddingLeft: '8px', paddingBottom: '4px', paddingTop: '4px',
        fontFamily: 'var(--font-rounded)',
        fontWeight: 600,
        fontSize: '13px',
    },
    title_block: {
        position: 'relative',
        width: '100%',
        overflowWrap: 'anywhere',
        wordBreak: 'break-word',
    },
    title: {
        marginLeft: '12px',
        marginTop: "0px",
        marginBottom: '4px',
        fontSize: "16px",
        fontWeight: 700,
        fontFamily: 'var(--font-rounded)',
    },
    mvpBadge: {
        fontSize: "11px",
        fontWeight: 700,
        fontFamily: 'var(--font-rounded)',
        color: "#6366f1",
        backgroundColor: "#e0e7ff",
        padding: "2px 6px",
        borderRadius: "8px",
        lineHeight: "1",
        alignSelf: "flex-start",
        marginTop: "3px"
    },
    short_desc: {
        color: '#828282',
        fontSize: '14px',
        marginTop: '0px',
        marginLeft: '12px',
        marginRight: '12px',
        overflowWrap: 'anywhere',
        wordBreak: 'break-word',
        minHeight: "100px"
    },
    blue_stripe: {
        position: 'absolute',
        left: '-2.2px',
        top: '2px',
        width: '4px',
        height: '70px',
        borderRadius: '4px',
        zIndex: 10
    },
    deadlineSection: {
        paddingLeft: "12px",
        paddingRight: "12px",
        marginTop: "8px",
    },
    bottom_author_block: {
        paddingLeft: '12px',
        paddingRight: '12px',
        paddingBottom: '14px',
        marginTop: '4px'
    },
    bottom_info_block: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bottom_line: {
        borderColor: '#e3e3e3',
        borderRadius: '8px',
        borderStyle: 'solid',
        borderWidth: '0.5px',
        marginTop: "0px",
        marginBottom: "8px"
    },
    draggable: {
        height: '25px',
        width: '100%',
        borderBottom: '1px solid #e3e3e3',
        borderRadius: '26px 26px 0px 0px',
        cursor: 'grab',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
};
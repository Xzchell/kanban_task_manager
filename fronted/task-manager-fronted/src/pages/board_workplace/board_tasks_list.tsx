import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { useMemo, useState } from "react";
import SearchBar from "../../components/search_task_bar";
import FilterButton from "../../components/filter_button";
import { TimeWelcome } from "../../components/time_welcome";
import TaskCard from "../../components/task_card";
import { AnimatePresence, motion } from "framer-motion";
import TaskModalCreate from "../task_modal_create";
import { useAuth } from "../../context/auth_context";
import { useBoard } from "../../hook/useBoards";
import { Plus } from "lucide-react";
import TaskModal from "../task_modal";
import FilterDrawer from "../../components/filter_drawer";
import { useTask } from "../../hook/useTasks";
import { AnimatedBackground } from "../../components/animated_background";
import { useDesignMode } from "../../context/design_context";
import { theme } from "../../themes/themes";
import MiniDeadlineTimer from "../../components/mini_deadline_timer";
import { useSocket } from "../../context/socket_context";
import { useSocketVisibility } from "../../hook/useSocketVisibility";
import { useBoardPermissions } from "../../hook/useBoardMember";

const BoardTasksList = () => {
    const { user } = useAuth();
    const { socket } = useSocket();

    const {
        selectedBoard,
        loadingBoard,
        error,
        searchQuery,
        selectedBoardId,
        setSearchQuery,
        moveTask,
        updateTaskData,
        deleteTask,
        selectBoard,
    } = useBoard();

    const { canCreateAndMoveTasks } = useBoardPermissions();

    const { mode } = useDesignMode();
    const currentMode = theme.modes[mode];

    const {sortConfig, setSortConfig, filteredTasks} = useTask(selectedBoard?.tasks, searchQuery);

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);

    const handleCloseModal = () => setSelectedTask(null);

    const columns = useMemo(() => {
        if (selectedBoard && selectedBoard.columns && selectedBoard.columns.length > 0) {
            const sortedCols = [...selectedBoard.columns].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
            return sortedCols.map(col => ({
                id: String(col.id),
                title: col.name,
                items: filteredTasks.filter(t => Number(t.status) === col.id)
            }));
        }
        return [];
    }, [selectedBoard, filteredTasks]);

    useSocketVisibility({
        socket,
        boardId: selectedBoardId,
        isBusinessBoard: selectedBoard?.type.name !== "hakaton",
        onReconnect: () => {
            if (selectedBoardId) {
                selectBoard(Number(selectedBoardId));
            }
        }
    });


    const onDragEnd = (result: DropResult) => {
        if (!canCreateAndMoveTasks) return;
        const { destination, source, draggableId } = result;
        if (!destination) return;
        
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const taskId = Number(draggableId);
        const newStatus = Number(destination.droppableId);

        moveTask(taskId, newStatus);
        if (socket && selectedBoardId) {
            socket.emit('move_task', {
                boardId: String(selectedBoardId), 
                taskId: taskId,
                fromColumn: source.droppableId,
                toColumn: destination.droppableId,
                newIndex: destination.index
            });
        } else {
            console.warn("Предупреждение: сокет не подключен или boardId отсутствует в URL", { socket: !!socket, selectedBoardId });
        }
    };

    if (loadingBoard) {
        return (
            <div style={listStyles.center}>
                <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    style={listStyles.loader} 
                />
                <p>Загружаем задачи...</p>
            </div>
        );
    }

    if (error) return <div style={{ color: 'red', padding: '20px' }}>Ошибка: {error}</div>;
    if (!selectedBoard) return <div style={{ padding: '20px' }}>Доска не выбрана</div>;

    console.log(selectedBoard.timePoints + " ===================================");

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100%'}}>
            <div style={listStyles.backgroundFixedWrapper}>
                <AnimatedBackground />
            </div>
            <div style={listStyles.container}>
                <div style={listStyles.headerSticky}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                        <h2 style={{ ...listStyles.title, margin: 0 }}>{selectedBoard.title}</h2>
                    </div>
                    
                    <p style={{ color: '#64748b', fontSize: '18px', marginBottom: '20px' }}>{TimeWelcome()} {user?.first_name}!</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', marginBottom: '4px' }}>
                        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Поиск задач..." /> 
                        <FilterButton setIsSidebarOpen={setIsFilterOpen} />
                        {
                            selectedBoard.deadline &&
                            <MiniDeadlineTimer
                                deadline={selectedBoard.deadline ?? ''}
                            />
                        }
                    </div>            
                </div>

                <div style={listStyles.scrollContainer}>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <div style={listStyles.board}>
                            {columns.map((column) => (
                                <div key={column.id} style={{...listStyles.column, ...currentMode.searchBar, borderRadius: theme.borderRadius.large}}>
                                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <h3 style={listStyles.columnTitle}>
                                            {column.title} ({column.items.length})
                                        </h3>
                                        {
                                            canCreateAndMoveTasks &&
                                            <button onClick={() => setIsCreateModalOpen(true)} style={listStyles.addTaskBtn}>
                                                <Plus size={16} />
                                            </button>
                                        }
                                    </div>

                                    <Droppable 
                                        droppableId={column.id}
                                        renderClone={(provided, snapshot, rubric) => {
                                            const task = column.items.find(t => String(t.id) === rubric.draggableId);
                                            return (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={{
                                                        ...provided.draggableProps.style,
                                                        zIndex: 9999,
                                                        marginBottom: '10px'
                                                    }}
                                                >
                                                    {task ? <TaskCard task={task} onClick={() => setSelectedTask(task)} /> : null}
                                                </div>
                                            );
                                        }}
                                    >
                                        {(provided) => (
                                            <div {...provided.droppableProps} ref={provided.innerRef} style={listStyles.grid}>
                                                {column.items.map((task, index) => (
                                                    <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div 
                                                                ref={provided.innerRef} 
                                                                {...provided.draggableProps} 
                                                                {...provided.dragHandleProps} 
                                                                style={{ 
                                                                    ...provided.draggableProps.style, 
                                                                    zIndex: snapshot.isDragging ? 9999 : 'auto', 
                                                                    marginBottom: '10px'
                                                                }}
                                                            >
                                                                <TaskCard task={task} boardType={selectedBoard.type.name} onClick={() => setSelectedTask(task)} />
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            ))}
                            
                        </div><div style = {{ height: "50px"}}></div>
                    </DragDropContext>
                    
                </div>
            </div>

            <AnimatePresence>
                {selectedTask && (() => {
                    const liveTask = selectedBoard.tasks?.find(t => t.id === selectedTask.id) || selectedTask;
                    
                    return (
                        <TaskModal
                            onSwitchStatus={(taskId: number, newStatus: number) => {
                                moveTask(taskId, newStatus);
                                
                                if (socket && selectedBoardId) {
                                    socket.emit('move_task', {
                                        boardId: String(selectedBoardId), 
                                        taskId: taskId,
                                        fromColumn: String(liveTask.status),
                                        toColumn: String(newStatus),
                                        newIndex: 0
                                    });
                                } else {
                                    console.warn("Предупреждение: сокет не подключен или boardId отсутствует", { socket: !!socket, selectedBoardId });
                                }
                            }}
                            task={liveTask}
                            onClose={handleCloseModal} 
                            onUpdate={(id, data) => updateTaskData(id, data)} 
                            onDelete={(id) => { deleteTask(id); handleCloseModal(); }}
                        />
                    );
                })()}
                {isCreateModalOpen && (
                    <TaskModalCreate 
                        onClose={() => setIsCreateModalOpen(false)} 
                    />
                )}
                {isFilterOpen && (
                    <FilterDrawer
                        setSortConfig={setSortConfig}
                        sortConfig={sortConfig}
                        onClose={() => setIsFilterOpen(false)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default BoardTasksList;

const listStyles = {
    container: {
        marginTop: "50px",
        marginLeft: "120px",
        display: "flex",
        flexDirection: "column" as const,
        flex: 1,
        overflow: "hidden",
        zIndex: 2,
    },
    headerSticky: {
        position: "sticky" as const,
        top: 0,
        zIndex: 10,
        paddingLeft: "24px", 
        paddingRight: "24px",
    },
    title: {
        fontSize: "24px",
        fontWeight: 700,
        color: "#1e293b",
    },
    scrollContainer: {
        flex: 1,
        overflowY: "hidden" as const,
        WebkitMaskImage: `
            linear-gradient(to right, transparent, black 24px, black calc(100% - 24px), transparent),
            linear-gradient(to bottom, transparent, black 24px, black calc(100% - 24px), transparent)
        `,
        maskImage: `
            linear-gradient(to right, transparent, black 24px, black calc(100% - 24px), transparent),
            linear-gradient(to bottom, transparent, black 24px, black calc(100% - 24px), transparent)
        `,
        WebkitMaskComposite: "source-in" as const,
        maskComposite: "intersect" as const,
    },
    board: {
        display: "flex",
        flexDirection: "row" as const,
        gap: "20px",
        overflowX: "auto" as const,
        overflowY: "auto" as const,
        alignItems: "flex-start",
        height: "100%",
        paddingTop: "24px",
        paddingLeft: "24px",
        paddingRight: "24px"
    },
    column: {
        flex: 1,
        minWidth: "300px",
        padding: "16px",
        display: "flex",
        flexDirection: "column" as const,
        marginBottom: "40px"
    },
    columnTitle: {
        fontSize: "15px",
        fontWeight: 600,
        color: "#475569",
        margin: 0
    },
    addTaskBtn: {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        width: "28px",
        height: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "#64748b",
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
    },
    grid: {
        display: "flex",
        flexDirection: "column" as const,
        minHeight: "250px",
        height: "100%",
        flexGrow: 1
    },
    center: { 
        display: 'flex', 
        flexDirection: 'column' as const, 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        width: '100%',
        gap: '15px' 
    },
    loader: { 
        width: '40px', 
        height: '40px', 
        border: '4px solid #CBD5E0', 
        borderTopColor: '#4F46E5', 
        borderRadius: '50%' 
    },
    backgroundFixedWrapper: {
        position: "fixed" as const,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1,
        pointerEvents: "none" as const,
    },
};
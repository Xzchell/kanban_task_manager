import { useEffect, useMemo, useState} from 'react';
import TaskCard from '../components/task_card';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { useAuth } from '../context/auth_context';
//import { useAlert } from '../context/alert_context';
import TaskModal from './task_modal';
import { AnimatePresence, motion } from 'framer-motion';
import { useTask } from '../hook/useTasks';
import FilterButton from '../components/filter_button';
import FilterDrawer from '../components/filter_drawer';
import { Plus } from 'lucide-react';
import TaskModalCreate from './task_modal_create';
import { TimeWelcome } from '../components/time_welcome';
import SearchBar from '../components/search_task_bar';

const TaskList = () => {
    const {user} = useAuth();
    const { 
        selectedTask, 
        error, 
        loading, 
        filteredTasks,
        searchQuery,
        sortConfig,
        setSearchQuery,
        setSortConfig,
        fetchTasks, 
        setSelectedTask,
        updateTaskStatus,
        updateTaskData,
        createTask,
        deleteTask
    } = useTask(user?.id);

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const handleCloseModal = () => setSelectedTask(null);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

/*    const onDeleteTask = () => {
        showAlert(
            "Удалить задачу",
            "Вы уверены, что хотите удалить эту задачу? Это действие нельзя будет отменить.",
            [
                { text: "Удалить", status: "danger", onClick: () => { alert('Задача удалена'); hideAlert(); } },
                { text: "Редактировать", status: "primary", onClick: () => { alert('Переход к редактированию задачи'); hideAlert(); } },
                { text: "Отмена", status: "secondary", onClick: () => hideAlert() }
            ],
        );
    };
*/

    const columns = useMemo(() => [
        { id: '1', title: 'Нужно сделать', items: filteredTasks.filter(t => t.status === 1) },
        { id: '2', title: 'В работе', items: filteredTasks.filter(t => t.status === 2) },
        { id: '3', title: 'На проверке', items: filteredTasks.filter(t => t.status === 3) },
        { id: '4', title: 'Завершено', items: filteredTasks.filter(t => t.status === 4) }
    ], [filteredTasks]);

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const taskId = Number(draggableId);
        const newStatus = Number(destination.droppableId);

        updateTaskStatus(taskId, newStatus);
    };

    if (loading) {
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

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100%'}}>
        <div style={listStyles.container}>
            <h2 style={listStyles.title}>{TimeWelcome()} {user?.first_name}!</h2>
            <div style={{display : 'flex', flexDirection: 'row' as const, gap: '10px'}}>
                <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Поиск задач..." /> 
                <FilterButton setIsSidebarOpen={setIsFilterOpen}/>
            </div>           

            <DragDropContext onDragEnd={onDragEnd}>
                <div style={listStyles.board}>
                    
                    {columns.map((column) => (
                        <div key={column.id} style={listStyles.column}>
                            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                                <h3 style={listStyles.columnTitle}>
                                    {column.title} ({column.items.length})
                                </h3>
                                <button onClick={() => setIsCreateModalOpen(true)} style={{...listStyles.addTaskBtn, alignSelf: 'center'}}><Plus /></button>
                            </div>
                            <Droppable droppableId={column.id} >
                                {(provided) => (
                                    <div 
                                        {...provided.droppableProps} 
                                        ref={provided.innerRef} 
                                        style={listStyles.grid}
                                    >
                                        {column.items.map((task, index) => (
                                    <Draggable 
                                        key={task.id} 
                                        draggableId={String(task.id)} 
                                        index={index}
                                    >
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps} 
                                                style={{
                                                    ...provided.draggableProps.style,
                                                    zIndex: snapshot.isDragging ? 9999 : 'auto',
                                                    position: snapshot.isDragging ? 'fixed' : 'relative',
                                                }}
                                            >
                                                <TaskCard 
                                                    task={task}
                                                    onClick={() => setSelectedTask(task)}
                                                />
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

                </div>
            </DragDropContext>
        </div>
        
        <AnimatePresence>
            {selectedTask && (
                <TaskModal 
                    onUpdate={updateTaskData}
                    onSwitchStatus={updateTaskStatus}
                    task={selectedTask} 
                    onClose={handleCloseModal} 
                    onDelete={deleteTask}
                />
            )}
        </AnimatePresence>
        <AnimatePresence>
        {isCreateModalOpen && (
            <TaskModalCreate 
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={createTask}
            />
        )}
        </AnimatePresence>
            <FilterDrawer 
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
        />
        </div>            
    );
};

const listStyles = {
    container: {
        padding: '20px',
        minHeight: '90vh',
        fontFamily: 'sans-serif',
        width: '100%',
        minWidth: 0,
        backgroundColor: '#fff',
        overflowY: 'auto' as const,
    },
    board: {
        display: 'flex',
        flexDirection: 'row' as const,
        gap: '20px',
        alignItems: 'stretch',
        overflowX: 'auto' as const, 
        overflowY: 'auto' as const,
        flex: 1
    },
    column: {
        backgroundColor: '#f7f7f7',
        borderRadius: '26px',
        border: '1px solid #e3e3e3',
        width: '100%',
        minWidth: '265px',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column' as const,
    },
    columnTitle: {
        fontSize: '18px',
        fontWeight: 'bold',
        padding: '10px',
        color: '#444',
    },
    grid: {
        minHeight: '200px',
        display: 'flex',
        flex: 1,
        flexDirection: 'column' as const,
        gap: '10px',
        justifyContent: 'flex-start',
        paddingBottom: '50px',
    },
    title: {
        marginBottom: '20px',
        color: '#333'
    },
    center: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '15px' },
    loader: { width: '40px', height: '40px', border: '4px solid #CBD5E0', borderTopColor: '#4A90E2', borderRadius: '50%' },
    addTaskBtn: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',        
        alignItems: 'center',
        justifyItem: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        border: '1px solid #e3e3e3',
        fontSize: '24px',
        cursor: 'pointer',
        color: '#333',
    },
};

export default TaskList;
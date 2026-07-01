import { useCallback, useMemo, useState } from "react";
import type { IExecutors, ITags, ITaskData } from "../components/task_card";
import { api } from "../api_axios";
import { useAuth } from "../context/auth_context";

export type SortOrder = 'asc' | 'desc' | 'none';

export interface ISortConfig {
    alphabet: SortOrder;
    priority: SortOrder;
    status: SortOrder;
}

export interface ICreateTaskData {
    title: string;
    short_desc: string;
    full_desc: string;
    priority: number;
    status: number;
    deadline: string;
    author_id: number;
    tags?: ITags[];
    executors?: IExecutors[];
}

const initialSortConfig: ISortConfig = {
    alphabet: 'none',
    priority: 'none',
    status: 'none'
};

export const useTask = (userId : number | undefined) => {

    const user = useAuth().user;

    const [tasks, setTasks] = useState<ITaskData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<ITaskData | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<ISortConfig>(initialSortConfig);
    
    const formattedTasks = (task: ITaskData & {tags : string}) => ({
        ...task,
        id: Number(task.id), 
        status: Number(task.status),
        executors: typeof task.executors === 'string' ? JSON.parse(task.executors) : (task.executors || []),
        author: typeof task.author === 'string' ? JSON.parse(task.author) : task.author,
        tags: (typeof task.tags === 'string' && task.tags !== null) ? JSON.parse(task.tags) : (task.tags || []),
    });

    const filteredTasks = useMemo(() => {
        let result = [...tasks];
        
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(task => 
                task.title.toLowerCase().includes(lowerQuery) || 
                task.short_desc?.toLowerCase().includes(lowerQuery)
            );
        }

        result.sort((a, b) => {
            if (sortConfig.status !== 'none') {
                const res = sortConfig.status === 'asc' ? a.status - b.status : b.status - a.status;
                if (res !== 0) return res;
            }

            if (sortConfig.priority !== 'none') {
                const res = sortConfig.priority === 'asc' ? (a.priority || 0) - (b.priority || 0) : (b.priority || 0) - (a.priority || 0);
                if (res !== 0) return res;
            }

            if (sortConfig.alphabet !== 'none') {
                const res = a.title.localeCompare(b.title);
                return sortConfig.alphabet === 'asc' ? res : -res;
            }

            return 0;
        });
    return result;
    }, [searchQuery, tasks, sortConfig]);

    const fetchTasks = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const { data } = await api.get('', {
                params: {
                    endpoint: 'tasks',
                    action: 'get_tasks',
                    user_id: user.id
                }
            });
            const processed = data.map(formattedTasks);
            setTasks(processed);
            setError(null);
        } catch (err) {
            setError("Ошибка при загрузке задач");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    const updateTaskStatus = async (taskId: number, newStatus: number) => {
        const previousTasks = [...tasks];

        setTasks(prev => 
        {
            const newTasks = prev.map(t => 
                t.id === taskId ? { ...t, status: Number(newStatus) } : t
            );
            return newTasks;
        }
        );
        
        if (selectedTask?.id === taskId)
            setSelectedTask(prev => prev ? { ...prev, status: newStatus } : null);

        try {
            await api.post('', 
                { id: taskId, status: newStatus },
                { params: { endpoint: 'tasks', action: 'update_status', user_id: user?.id } }
            );
        } catch (err) {
            console.error("Ошибка при сохранении", err);
            setTasks(previousTasks); 
            alert("Ошибка соединения. Изменения не сохранены.");
        }
    };

    const updateTaskData = async (taskId : number, data : ITaskData) => {
        const previousTasks = [...tasks];

        setTasks(prev => 
            prev.map(t => t.id === taskId ? { ...t, ...data, id: Number(taskId) } : t)
        );
        
        if (selectedTask?.id === taskId) {
            setSelectedTask(prev => prev ? { ...prev, ...data } : null);
        }
        try {
            await api.post('', 
                { 
                    ...data,
                    id: taskId
                },
                { params: { endpoint: 'tasks', action: 'update_task', user_id: user?.id } }
            );
        } catch (err) {
            console.error("Ошибка при сохранении", err);
            setTasks(previousTasks); 
            alert("Ошибка соединения. Изменения не сохранены.");
        }
    };

    const createTask = async (data: ICreateTaskData) => {
        try {
            const loadTask = {
                ...data,
                title: data.title || "Новая задача",
                short_desc: data.short_desc || "Краткое описание",
                full_desc: data.full_desc || "Полное описание",
                priority: data.priority || 1,
                status: data.status || 1,
                deadline: (data.deadline || new Date().toISOString()).slice(0, 19).replace('T', ' '),
                author_id: Number(data.author_id || user?.id),
                tags: data.tags ? data.tags.map(tag => Number(tag.id)) : [],   
                executors: data.executors ? data.executors.map(executor => Number(executor.id)) : [],          
            };

            const response = await api.post('', loadTask, {
                params: { endpoint: 'tasks', action: 'create_task', user_id: user?.id }
            });

            if (response.data && response.data.id) {
                const new_task : ITaskData = {
                    ...loadTask,
                    id: response.data.id,
                    status: Number(loadTask.status),
                    author: {
                        id: Number(data.author_id || user?.id),
                        first_name: user?.first_name || "",
                        last_name: user?.last_name || "",
                        middle_name: user?.middle_name || ""
                    },
                    executors: [
                        ...(data.executors || []),
                        {
                            id: Number(data.author_id || user?.id),
                            first_name: user?.first_name || "",
                            last_name: user?.last_name || "",
                            middle_name: user?.middle_name || "",
                            role: user?.role || { id: 0, permission_level: 1, name: "Пользователь", description: "" },
                            email: user?.email || ""
                        }
                    ],
                    created_at: new Date().toLocaleDateString('ru-RU'),
                    progress: 0,
                    tags: data.tags || [],
                };
                setTasks(prev => [...prev, new_task]);
            }
            else {
                throw new Error("Некорректный ответ от сервера при создании задачи");
            }
        } catch (err) {
            console.error("Ошибка при создании задачи", err);
        }
    };

    const deleteTask = async (taskId: number) => {
        try {
            await api.post('', 
            { id: taskId },
            { params: { endpoint: 'tasks', action: 'delete_task', user_id: user?.id } }
            );

            setTasks(prev => prev.filter(t => t.id !== taskId));
        } catch (err) {
            console.error("Ошибка при удалении", err);
        }
    };

    return { 
        tasks, 
        selectedTask, 
        loading, 
        error, 
        filteredTasks,
        searchQuery,
        sortConfig,
        setSortConfig,
        setSearchQuery,
        fetchTasks, 
        setTasks, 
        setSelectedTask, 
        updateTaskStatus, 
        updateTaskData,
        deleteTask,
        createTask
    };
};
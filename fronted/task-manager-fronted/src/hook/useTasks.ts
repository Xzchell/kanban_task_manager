import { useCallback, useMemo, useState } from "react";
import type { IExecutors, ITags, ITaskData } from "../components/task_card";
import axios from "axios";
import { useAuth, type IUser } from "../context/auth_context";
import { API_URL } from "../api_key";

export type SortOrder = 'asc' | 'desc' | 'none';

export interface ISortConfig {
    alphabet: SortOrder;
    priority: SortOrder;
    status: SortOrder;
}

interface IUserResponseDTO {
    id: string | number;
    first_name: string;
    last_name: string;
    middle_name: string;
    email: string;
    role_id: string | number;
    permission_level: string | number;
    role_name: string;
    role_description: string;
    count_tasks?: number;
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

export const useTask = (userId : number | undefined, token: string | undefined) => {

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
        if (!userId || !token) return;
        setLoading(true);
        try {
            const { data } = await axios.get(`${API_URL}?endpoint=tasks&action=get_tasks&user_id=${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` } 
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
    }, [userId, token]);

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
            await axios.post(`${API_URL}?endpoint=tasks&action=update_status&user_id=${userId}`, 
                { id: taskId, status: newStatus },
                { headers: { 'Authorization': `Bearer ${token}` } }
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
            await axios.post(`${API_URL}?endpoint=tasks&action=update_task&user_id=${userId}`, 
                { 
                    ...data,
                    id: taskId
                },
                { headers: { 'Authorization': `Bearer ${token}` } }
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
                author_id: Number(data.author_id || userId),
                tags: data.tags ? data.tags.map(tag => Number(tag.id)) : [],   
                executors: data.executors ? data.executors.map(executor => Number(executor.id)) : [],          
            };

            const response = await axios.post(`${API_URL}?endpoint=tasks&action=create_task&user_id=${userId}`, loadTask, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data && response.data.id) {
                const new_task : ITaskData = {
                    ...loadTask,
                    id: response.data.id,
                    status: Number(loadTask.status),
                    author: {
                        id: Number(data.author_id || userId),
                        first_name: user?.first_name || "",
                        last_name: user?.last_name || "",
                        middle_name: user?.middle_name || ""
                    },
                    executors: [
                        ...(data.executors || []),
                        {
                            id: Number(data.author_id || userId),
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
            await axios.post(`${API_URL}?endpoint=tasks&action=delete_task&user_id=${userId}`, 
            { id: taskId }
            , { headers: { 'Authorization': `Bearer ${token}`}});

            setTasks(prev => prev.filter(t => t.id !== taskId));
        } catch (err) {
            console.error("Ошибка при удалении", err);
        }
    };

    const useAllTags = () => {
        const [allTags, setAllTags] = useState<ITags[]>([]);

        const fetchAllTags = useCallback(async () => {
            if (!token) return;
            try {
                const { data } = await axios.get(`${API_URL}?endpoint=tasks&action=get_all_tags&user_id=${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const parsedTags = data.map((t: ITags) => ({
                    id: Number(t.id),
                    name: t.name,
                    tag_color: t.tag_color,
                    background_color: t.background_color
                }));

                setAllTags(parsedTags);
            } catch (err) {
                console.error("Ошибка", err);
            }
        }, [token]);

        return { allTags, fetchAllTags };
    };

    const useAllUsers = () => {
        const [allUsers, setAllUsers] = useState<IUser[]>([]);

        const fetchAllUsers = useCallback(async () => {
            if (!token) return;
            try {
                const { data } = await axios.get(`${API_URL}?endpoint=users&action=get_all_users&user_id=${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const parsedUsers = data.map((u: IUserResponseDTO): IUser => ({
                    id: Number(u.id),
                    first_name: u.first_name,
                    last_name: u.last_name,
                    middle_name: u.middle_name || "",
                    email: u.email,
                    token: "", 
                    birthday: "",
                    username: "",
                    role: {
                        id: Number(u.role_id),
                        permission_level: Number(u.permission_level),
                        name: u.role_name,
                        description: u.role_description
                    }
                }));

                setAllUsers(parsedUsers);
            } catch (err) {
                console.error("Ошибка", err);
            }
        }, [token]);

        return { allUsers, fetchAllUsers };
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
        createTask,
        useAllTags,
        useAllUsers
    };
};
import { useMemo, useState } from "react";
import type { ITaskData } from "../components/task_card";
import type { IBoardMember } from "./useBoards";
import { useAuth } from "../context/auth_context";

export type SortOrder = 'asc' | 'desc' | 'none';

export interface ISortConfig {
    alphabet: SortOrder;
    priority: SortOrder;
    status: SortOrder;
    isMvpOnly: boolean; 
    iAmExecutor: boolean;
}

export interface ICreateTaskData {
    title: string;
    short_desc: string;
    full_desc: string;
    priority: number;
    status: number;
    deadline: string | null;
    author_id: number;
    tags?: any[];
    executors?: any[];
    isMvp?: boolean;
    time_point_id?: number | null;
}

const initialSortConfig: ISortConfig = {
    alphabet: 'none',
    priority: 'none',
    status: 'none',
    isMvpOnly: false,
    iAmExecutor: false
};

export const useTask = (rawTasks: ITaskData[] = [], searchQuery: string = '') => {
    const [selectedTask, setSelectedTask] = useState<ITaskData | null>(null);
    const [sortConfig, setSortConfig] = useState<ISortConfig>(initialSortConfig);

    const user = useAuth().user;

    const filteredTasks = useMemo(() => {
        let result = [...rawTasks];

        // Поисковый фильтр по названию задачи
        if (searchQuery.trim()) {
            result = result.filter(task =>
                task.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Только MVP задачи
        if (sortConfig.isMvpOnly) {
            result = result.filter(task => !!task.isMvp === true);
        }

        // Только те задачи, где пользователь исполнитель
        if (sortConfig.iAmExecutor && user?.id) {
            result = result.filter(task => 
                task.executors && task.executors.some((executor: IBoardMember) => executor.id === user.id) || task.author.id === user.id
            );
        }

        // Сортировка по алфавиту
        if (sortConfig.alphabet !== 'none') {
            result.sort((a, b) => {
                const titleA = a.title.toLowerCase();
                const titleB = b.title.toLowerCase();
                if (titleA < titleB) return sortConfig.alphabet === 'asc' ? -1 : 1;
                if (titleA > titleB) return sortConfig.alphabet === 'asc' ? 1 : -1;
                return 0;
            });
        }

        // Сортировка по приоритету
        if (sortConfig.priority !== 'none') {
            result.sort((a, b) => {
                const pA = a.priority || 0;
                const pB = b.priority || 0;
                return sortConfig.priority === 'asc' ? pA - pB : pB - pA;
            });
        }

        return result;
    }, [rawTasks, searchQuery, sortConfig]);

    return {
        filteredTasks,
        searchQuery,
        sortConfig,
        selectedTask,
        setSortConfig,
        setSelectedTask
    };
};
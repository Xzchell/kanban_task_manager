import { useCallback, useState } from "react";
import type { ITaskData } from "../components/task_card";
import { useAuth, type IUser } from "../context/auth_context";
import { api } from "../api_axios";

export interface IBoard {
    id: number;
    title: string;
    description: string;
    type : {
        name: string;
        displayName: string;
        maxUsers: number;
        hasWebSockets: boolean;
    }
    owner: {
        lastName: string;
        firstName: string;
        middleName: string;
    }
    createdAt: string;
    deadline?: string;
    columns?: IColumns[];
    tasks?: ITaskData[];
} 

export interface IBoardCreate {
    title: string;
    description: string;
    type_name: string;
    columns: IColumns[];
    deadline?: string;
    invited_users?: IUser[];
}

interface IColumns {
    id?: number;
    name: string;
    position: number;
}

export const useBoard = () => {
    const user = useAuth().user;

    const [boards, setBoards] = useState<IBoard[]>([]);
    const [selectedBoard, setSelectedBoard] = useState<IBoard | null>(null); 
    const [error, setError] = useState<string | null>(null);

    const [loading, setLoading] = useState<boolean>(true);

    const fetchBoards = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const { data } = await api.get('', {
                params: {
                    endpoint: 'boards',
                    action: 'get_boards',
                    user_id: user.id
                }
            });
            setBoards(data.boards || []);
            setError(null);
        } catch (err) {
            setError("Ошибка при загрузке задач");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    const createBoard = async (dataBoard: IBoardCreate) => {
        if (!user?.id) return;
        try {
            await api.post('',
                { 
                    ...dataBoard
                },
                { params: { endpoint: 'boards', action: 'create_board', user_id: user?.id } }
            );
            fetchBoards();
            setError(null);
        } catch (err) {
            setError("Ошибка при создании доски");
            console.error(err);
        }
    };

    return {
        boards,
        selectedBoard,
        error,
        loading, 
        fetchBoards, 
        createBoard
    };
}
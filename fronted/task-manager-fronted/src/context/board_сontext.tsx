import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api_axios";
import type { IBoard, IBoardCreate } from "../hook/useBoards";
import { useAuth } from "./auth_context";
import type { ITaskData } from "../components/task_card";
import type { ICreateTaskData } from "../hook/useTasks";
import { useSocket } from "./socket_context";
import { useNavigate } from "react-router-dom";

interface IBoardContext {
    boards: IBoard[];
    selectedBoard: IBoard | null;
    selectedBoardId: number | null;
    error: string | null;
    loading: boolean;
    loadingBoard: boolean;
    searchQuery: string;
    filteredBoards: IBoard[];
    resetDataBoard: () => void;
    setSearchQuery: (query: string) => void;
    setSelectedBoard: (board: IBoard | null) => void;
    fetchBoards: () => Promise<void>;
    createBoard: (dataBoard: IBoardCreate) => Promise<void>;
    selectBoard: (boardId: number) => Promise<void>;
    createTask: (taskData: ICreateTaskData) => Promise<any | null>;
    moveTask: (taskId: number, targetColumnId: number) => Promise<void>;
    updateTaskData: (taskId: number, data: ITaskData) => Promise<void>;
    deleteTask: (taskId: number) => Promise<void>;
    socketMoveTask: (taskId: number, targetColumnId: number) => void;
    socketUpdateTask: (taskId: number, data: Partial<ITaskData>) => void;
    socketDeleteTask: (data: number) => void;
    socketCreateTask: (data : ITaskData) => void;
    deleteBoardBd: (id: number) => void;
    updateBoardDetails: (value: IBoard) => void;
}

export const BoardContext = createContext<IBoardContext | undefined>(undefined);

export const BoardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const user = useAuth().user;
    const { socket } = useSocket();
    const navigate = useNavigate();
    
    const [boards, setBoards] = useState<IBoard[]>([]);
    const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
    const [selectedBoard, setSelectedBoard] = useState<IBoard | null>(null);
    
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingBoard, setLoadingBoard] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Сброс данных доски
    const resetDataBoard = useCallback(() => {
        setSelectedBoardId(null);
        setSelectedBoard(null);
        localStorage.removeItem("selected_board_id");
        setLoadingBoard(false);
        setError(null);
    }, []);

    // Поиск досок по названию
    const filteredBoards = useMemo(() => {
        return boards.filter((board) =>
            board.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [boards, searchQuery]);

    // Загрузка всех доступных пользователю досок
    const fetchBoards = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const response = await api.get("", {
                params: {
                    endpoint: "boards",
                    action: "get_boards",
                    user_id: user.id,
                },
            });
            if (response.data?.success && Array.isArray(response.data.boards)) {
                setBoards(response.data.boards);
                setError(null);
            }
        } catch (err) {
            console.error(err);
            setError("Не удалось загрузить список досок.");
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    // Создание новой доски
    const createBoard = useCallback(async (dataBoard: IBoardCreate) => {
        if (!user?.id) return;
        try {
            const response = await api.post(
                "",
                { ...dataBoard, owner_id: user.id },
                {
                    params: {
                        endpoint: "boards",
                        action: "create_board",
                        user_id: user.id,
                    },
                }
            );
            if (response.data?.status === "success") {
                await fetchBoards();
                setError(null);
            }
        } catch (err) {
            console.error(err);
            setError("Ошибка при создании доски.");
        }
    }, [fetchBoards, user?.id]);

    // Выбор конкретной доски и загрузка её структуры
    const selectBoard = useCallback(async (boardId: number) => {
        if (!user?.id) return;
        setLoadingBoard(true);
        setSelectedBoardId(boardId);
        localStorage.setItem("selected_board_id", String(boardId));

        try {
            const response = await api.get("", {
                params: {
                    endpoint: "boards",
                    action: "get_board_details",
                    board_id: boardId,
                    user_id: user.id,
                },
            });
            if (response.data?.success) {
                setSelectedBoard(response.data.board);
                setError(null);
            }
        } catch (err) {
            console.error(err);
            setError("Не удалось загрузить данные выбранной доски.");
        } finally {
            setLoadingBoard(false);
        }
    }, [user?.id]);

    const updateBoardDetails = useCallback(async (dataBoard: IBoard) => {
        if (!user?.id) return;
        try {
            const response = await api.post(
                "",
                { ...dataBoard},
                {
                    params: {
                        endpoint: "boards",
                        action: "update_board",
                        user_id: user.id,
                        board_id: dataBoard.id
                    },
                }
            );
            if (response.data?.success === true) {
                setSelectedBoard(dataBoard);
                
                setBoards((prevBoards) => 
                    prevBoards.map((b) => b.id === dataBoard.id ? dataBoard : b)
                );

                if (socket) {
                    socket.emit('update_board', {
                        boardId: dataBoard.id,
                        boardData: dataBoard
                    });
                }
            }
        } catch (err) {
            console.error(err);
            setError("Ошибка при создании доски.");
        }
    }, [user?.id]);

    const deleteBoardBd = useCallback(async (boardId: number) => {
        if (!user?.id) return;

        try {
            const response = await api.post(
                "",
                { },
                {
                    params: {
                        endpoint: "boards",
                        action: "delete_board",
                        board_id: boardId,
                        user_id: user.id,
                    },
                }
            );
        if(response.data.success === true)
        {
            resetDataBoard();
            navigate('/boards');
            if (socket) {
                socket.emit('delete_board', {
                    boardId: boardId,
                });
            }
        }
        } catch (err) {
            console.error(err);
            setError("Не удалось загрузить данные выбранной доски.");
        } finally {
            setLoadingBoard(false);
        }
    }, [user?.id]);

    // Автоматический выбор доски при перезагрузке страницы
    useEffect(() => {
        const savedBoardId = localStorage.getItem("selected_board_id");
        if (savedBoardId && user?.id && !selectedBoardId && !loadingBoard) {
            selectBoard(Number(savedBoardId));
            console.log("RRRRRRRRRRRRRRRRRR");
        }
    }, [user?.id, selectedBoardId, loadingBoard, selectBoard]);

    // Создание задачи внутри доски
    const createTask = useCallback(async (taskData: ICreateTaskData) => {
        if (!user?.id || !selectedBoard) return null;
        try {
            const response = await api.post(
                "",
                { ...taskData, author_id: user.id, board_id: selectedBoard.id },
                {
                    params: {
                        endpoint: "tasks",
                        action: "create_task",
                        board_id: selectedBoard.id,
                        user_id: user.id,
                    },
                }
            );

            if (response.data?.success && response.data?.id) {
                const newTaskId = response.data.id;
                const firstColumn = selectedBoard.columns?.sort((a,b) => a.position - b.position)[0];
                
                const timePoint = selectedBoard?.timePoints?.find(
                    (point) => point.id === taskData.time_point_id
                );

                const newCreatedTask: ITaskData = {
                    id: newTaskId,
                    title: taskData.title,
                    short_desc: taskData.short_desc,
                    full_desc: taskData.full_desc,
                    priority: taskData.priority,
                    status: firstColumn?.id || 0,
                    deadline: taskData.deadline,
                    author: {
                        id: user.id,
                        last_name: user.last_name,
                        first_name: user.first_name,
                        middle_name: user.middle_name
                    },
                    isMvp: taskData.isMvp ? true : false,
                    tags: taskData.tags || [],
                    executors: taskData.executors || [],
                    created_at: new Date().toISOString(),
                    progress: 0,
                    time_point: timePoint
                };
                
                setSelectedBoard((prev) => {
                    if (!prev) return null;
                    const currentTasks = prev.tasks || [];
                    return { ...prev, tasks: [...currentTasks, newCreatedTask] };
                });

                if (socket) {
                    socket.emit('create_task', {
                        boardId: selectedBoard.id,
                        task: newCreatedTask
                    });
                    setError(null);
                } else {
                    setError("Ошибка websocket подключения");
                }
            } else {
                setError("Некорректный ответ сервера при создании задачи.");
            }
        } catch (err) {
            console.error(err);
            setError("Ошибка при создании новой задачи.");
        }
    }, [selectedBoard, user?.id, socket]);

    // Перемещение задачи между колонками (Drag-and-Drop)
    const moveTask = useCallback(async (taskId: number, targetColumnId: number) => {
        if (!user?.id || !selectedBoard || !selectedBoard.tasks) return;

        const previousTasks = [...selectedBoard.tasks];
        const updatedTasks = selectedBoard.tasks.map((task) =>
            task.id === taskId ? { ...task, status: targetColumnId } : task
        );

        setSelectedBoard({ ...selectedBoard, tasks: updatedTasks });

        try {
            await api.post(
                "",
                { id: taskId, status: targetColumnId, board_id: selectedBoard.id }, // Добавили board_id в body
                {
                    params: {
                        endpoint: "tasks",
                        action: "update_status",
                        board_id: selectedBoard.id,
                        user_id: user.id,
                    },
                }
            );

            if (socket) {
                socket.emit('move_task', {
                    boardId: selectedBoard.id,
                    taskId: taskId,
                    targetColumnId: targetColumnId
                });
            }
            setError(null);
        } catch (err) {
            console.error(err);
            setSelectedBoard({ ...selectedBoard, tasks: previousTasks });
            setError("Ошибка при перемещении задачи. Изменения отменены.");
        }
    }, [selectedBoard, user?.id, socket]);

    // Редактирование полей задачи
    const updateTaskData = useCallback(async (taskId: number, data: ITaskData) => {
        if (!user?.id || !selectedBoard || !selectedBoard.tasks) return;

        const previousTasks = [...selectedBoard.tasks];
        const updatedTasks = selectedBoard.tasks.map((task) =>
            task.id === taskId ? { ...task, ...data } : task
        );

        setSelectedBoard({ ...selectedBoard, tasks: updatedTasks });

        try {
            await api.post(
                "",
                { id: taskId, ...data, board_id: selectedBoard.id }, // Добавили board_id в body
                {
                    params: {
                        endpoint: "tasks",
                        action: "update_task",
                        board_id: selectedBoard.id,
                        user_id: user.id,
                    },
                }
            );

            if (socket) {
                socket.emit('update_task', {
                    boardId: selectedBoard.id, // Передаем как number
                    task: data
                });
                setError(null);
            } else {
                setError("Ошибка websocket подключения");
            }
        } catch (err) {
            console.error(err);
            setSelectedBoard({ ...selectedBoard, tasks: previousTasks });
            setError("Не удалось сохранить изменения в задаче.");
        }
    }, [selectedBoard, user?.id, socket]);

    // Удаление задачи
    const deleteTask = useCallback(async (taskId: number) => {
        if (!user?.id || !selectedBoard || !selectedBoard.tasks) return;

        const previousTasks = [...selectedBoard.tasks];
        const updatedTasks = selectedBoard.tasks.filter((task) => task.id !== taskId);

        setSelectedBoard({ ...selectedBoard, tasks: updatedTasks });

        try {
            await api.post(
                "",
                { id: taskId, board_id: selectedBoard.id }, // Добавили board_id в body
                {
                    params: {
                        endpoint: "tasks",
                        action: "delete_task",
                        board_id: selectedBoard.id,
                        user_id: user.id,
                    },
                }
            );
            if (socket) {
                socket.emit('delete_task', {
                    boardId: selectedBoard.id, // Передаем как number
                    taskId: taskId
                });
                setError(null);
            } else {
                setError("Ошибка websocket подключения");
            }
        } catch (err) {
            console.error(err);
            setSelectedBoard({ ...selectedBoard, tasks: previousTasks });
            setError("Ошибка при удалении задачи.");
        }
    }, [selectedBoard, user?.id, socket]);

    /*
    * Функции-слушатели событий websockets
    */
    const socketDeleteTask = useCallback((data: number) => {
        setSelectedBoard((prev) => {
            if (!prev || !prev.tasks) return prev;
            const updatedTasks = prev.tasks.filter((task) => task.id !== Number(data));
            return { ...prev, tasks: updatedTasks };
        });
    }, []);

    const socketCreateTask = useCallback((data : ITaskData ) => {
        setSelectedBoard((prev) => {
            if (!prev) return null;
            const currentTasks = prev.tasks || [];
            if (currentTasks.some(t => t.id === data.id)) return prev;
            return { ...prev, tasks: [...currentTasks, data] };
        });
    }, []);

    const socketMoveTask = useCallback((taskId: number, targetColumnId: number) => {
        setSelectedBoard((prev) => {
            if (!prev || !prev.tasks) return prev;
            const updatedTasks = prev.tasks.map((task) =>
                task.id === taskId ? { ...task, status: Number(targetColumnId) } : task
            );
            return { ...prev, tasks: updatedTasks };
        });
    }, []);

    const socketUpdateTask = useCallback((taskId: number, data: Partial<ITaskData>) => {
        setSelectedBoard((prev) => {
            if (!prev || !prev.tasks) return prev;
            const updatedTasks = prev.tasks.map((task) =>
                task.id === taskId ? { ...task, ...data } : task
            );
            return { ...prev, tasks: updatedTasks };
        });
    }, []);

    const value = useMemo<IBoardContext>(() => ({
        boards,
        selectedBoard,
        selectedBoardId,
        error,
        loading,
        loadingBoard,
        searchQuery,
        filteredBoards,
        resetDataBoard,
        setSearchQuery,
        setSelectedBoard,
        fetchBoards,
        createBoard,
        selectBoard,
        updateTaskData,
        deleteTask,
        createTask,
        moveTask,
        socketMoveTask,
        socketUpdateTask,
        socketDeleteTask,
        socketCreateTask,
        deleteBoardBd,
        updateBoardDetails
    }), [boards, createBoard, createTask, deleteTask, error, fetchBoards, filteredBoards, loading, loadingBoard, moveTask, searchQuery, selectBoard, selectedBoard, selectedBoardId, updateTaskData, socketMoveTask, socketUpdateTask, socketDeleteTask, socketCreateTask]);

    return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
};
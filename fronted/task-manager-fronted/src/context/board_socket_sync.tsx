import React, { useEffect, type ReactNode } from "react";
import { useSocket } from "./socket_context";
import { useBoard } from "../hook/useBoards";
import { useUsers } from "../hook/useUsers";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./auth_context";

interface BoardSocketSyncProps {
    children: ReactNode;
}

export const BoardSocketSync: React.FC<BoardSocketSyncProps> = ({ children }) => {
    const { socket } = useSocket();
    const user = useAuth().user;
    const { 
        selectedBoardId, 
        socketMoveTask, 
        socketUpdateTask, 
        socketCreateTask, 
        socketDeleteTask,
        resetDataBoard,
        setSelectedBoard,
        selectedBoard
    } = useBoard();

    const navigate = useNavigate();

    const { changeUserRole, removeBoardMember } = useUsers();

useEffect(() => {
    if (!socket || !selectedBoardId) return;

    socket.emit('join_board', selectedBoardId);
    console.log(`Успешное подключение к комнате доски: ${selectedBoardId}`);

    return () => {
        console.log(`Отключение от комнаты доски: ${selectedBoardId}`);
        socket.emit('leave_board', selectedBoardId);
    };
}, [socket, selectedBoardId]);


useEffect(() => {
    if (!socket || !selectedBoardId) return;

    socket.on('task_moved_broadcast', (data) => {
        const columnId = data.targetColumnId ?? data.toColumn;
        socketMoveTask(Number(data.taskId), Number(columnId));
    });

    socket.on('task_updated_broadcast', (data) => {
        if (data.task && data.task.id) {
            socketUpdateTask(Number(data.task.id), data.task);
        }
    });

    socket.on('task_created_broadcast', (data) => {
        if (data && data.id) {
            socketCreateTask(data);
        }
    });

    socket.on('task_deleted_broadcast', (data) => {
        if (data) socketDeleteTask(data);
    });

    socket.on('updated_member_role_broadcast', (data) => {
        if (data) changeUserRole(data);
    });

    socket.on('remove_board_member_broadcast', (data) => {
        if (data) {
            removeBoardMember(data);
            console.log("removeBoardMember");
            if(user?.id && Number(user?.id) === Number(data)){
                resetDataBoard();
                navigate('/boards'); 
                console.log("navigate boards");
            }
        }
    });

    socket.on('delete_board_broadcast', (data) => {
        if (data) {
            resetDataBoard();
            navigate('/boards'); 
        }
    });

    socket.on('add_board_members_broadcast', (data) => {
        if (data && selectedBoard) {
            const currentUsers = selectedBoard?.users ?? [];
            setSelectedBoard({
                ...selectedBoard,
                users: [...currentUsers, ...data]
            });
        }
    });

    socket.on('update_board_broadcast', (data) => {
        if (data) {
            console.log("Получено обновление доски по сокету:", data);
            setSelectedBoard(data);
        }
    });

    return () => {
        socket.off('task_moved_broadcast');
        socket.off('task_updated_broadcast');
        socket.off('task_created_broadcast');
        socket.off('task_deleted_broadcast');
        socket.off('updated_member_role_broadcast');
        socket.off('remove_board_member_broadcast');
        socket.off('add_board_members_broadcast');
        socket.off('update_board_broadcast');
        socket.off('delete_board_broadcast');
    };
}, [navigate, user?.id, removeBoardMember, socket, selectedBoardId, selectedBoard, socketMoveTask, socketUpdateTask, socketCreateTask, socketDeleteTask, changeUserRole, resetDataBoard]);

    return <>{children}</>;
};
import { useEffect } from "react";
import { Socket } from "socket.io-client";

interface IUseSocketVisibilityProps {
    socket: Socket | null;
    boardId: number | string | null;
    isBusinessBoard: boolean; 
    onReconnect: () => void;
}

export const useSocketVisibility = ({ socket, boardId, isBusinessBoard, onReconnect }: IUseSocketVisibilityProps) => {
    useEffect(() => {
        if (!socket || !boardId || !isBusinessBoard) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                socket.emit("leave_board", boardId);
                socket.disconnect();
            } else {
                socket.connect();
                socket.emit("join_board", boardId);
                onReconnect();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [socket, boardId, isBusinessBoard, onReconnect]);
};
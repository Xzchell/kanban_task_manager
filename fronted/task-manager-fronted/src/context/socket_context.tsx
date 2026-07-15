import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface ISocketContext {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<ISocketContext>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socketInstance = io('http://localhost:3001', { // адрес ws сервера
            transports: ['websocket'], 
            autoConnect: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000
        });

        socketInstance.on('connect', () => {
            console.log('Подключено к WS серверу!');
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            setIsConnected(false);
        });

        setSocket(socketInstance);

        return () => {
            if(socket) socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
import { useCallback, useState, useEffect } from "react";
import type { IUser, IUserRole } from "../context/auth_context";
import axios from "axios";
import { api } from "../api_axios";

interface IUserResponseDTO {
    id: string | number;
    first_name: string;
    last_name: string;
    middle_name: string;
    birth_date: string;
    email: string;
    role_id: string | number;
    permission_level: string | number;
    role_name: string;
    role_description: string;
    background_color?: string;
    color?: string;
    count_tasks?: number;
    stats: {
        total: number;
        todo: number;
        in_progress: number;
        done: number;
    };
}
interface IRoleResponseDTO {
    id: string | number;
    permission_level: string | number;
    name: string;
    description: string;
    background_color?: string;
    color?: string;
}

export interface ISearchedUser {
    id: number;
    username: string;
    email: string;
}

const parsedUsers = (u: IUserResponseDTO): IUser => ({
    id: Number(u.id),
    first_name: u.first_name,
    last_name: u.last_name,
    middle_name: u.middle_name || "",
    email: u.email,
    birthday: u.birth_date,
    username: "",
    role: {
        id: Number(u.role_id),
        permission_level: Number(u.permission_level),
        name: u.role_name,
        description: u.role_description,
        background_color: u.background_color || "#e3e3e3",
        color: u.color || "#333"
    },
    count_tasks: u.stats ? Number(u.stats.in_progress) : 0,
});

const parsedRoles = (r: IRoleResponseDTO): IUserRole => ({
    id: Number(r.id),
    permission_level: Number(r.permission_level),
    name: r.name,
    description: r.description,
    background_color: r.background_color || "#e3e3e3",
    color: r.color || "#333"
});

export const useUsers = (userId : number | undefined, editorLevel: number | undefined) => {
    const [allUsers, setAllUsers] = useState<IUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
    const [availableRoles, setAvailableRoles] = useState<IUserRole[]>([]);
    
    const fetchAvailableRoles = useCallback(async (editorLevel: number | undefined, signal?: AbortSignal) => {
        if (!userId || editorLevel === undefined || editorLevel === null) return;
        
        try {
            const { data } = await api.get(
                '',
                { params: { endpoint: 'users', action: 'get_all_roles', user_id: userId, editor_level: editorLevel }, signal }
            );

            setAvailableRoles(data.map(parsedRoles));
        } catch (err) {
            if(axios.isCancel(err)) return;
            console.error("Ошибка при получении списка ролей", err);
        }
    }, [userId]);

    const fetchAllUsers = useCallback(async (signal?: AbortSignal) => {
        if (!userId) return;
        try {
            const { data } = await api.get<IUserResponseDTO[]>(
                '',
                {signal, params: { endpoint: 'users', action: 'get_all_users', user_id: userId }}
            );
            setAllUsers(data.map(u => parsedUsers(u)));
        } catch (err) {
            if(axios.isCancel(err)) return;
            console.error("Ошибка при получении списка пользователей", err);
        }
    }, [userId]);

    useEffect(() => {
        if(!userId) return;
        
        const controller = new AbortController();
        fetchAllUsers(controller.signal);
        return () => controller.abort();

    }, [fetchAllUsers, userId]);

    useEffect(() => {
        if(!userId || editorLevel === undefined || editorLevel === null) return;
        
        const controller = new AbortController();
        fetchAvailableRoles(editorLevel, controller.signal);
        return () => controller.abort();

    }, [fetchAvailableRoles, userId, editorLevel]);

    const searchUser = async(username: string): Promise<ISearchedUser[]> => {
        if (!userId) return [];
        try{
            const response = await api.post('', {query: username}, {
                params: { endpoint: 'users', action: 'search_user', user_id: userId }
            });

            if (response.data.success && Array.isArray(response.data.user)){
                return response.data.user;
            }
            else return [];
        }
        catch (err) {
            console.error("Ошибка поиска пользователя", err);
            return [];
        }
    }






    //Ниже код не нужен

    const addNewUser = async (data : IUser, password : string) => {
        if (!userId) return;
        try {
            const loadUser = {
                id_role: data.role.id,
                first_name: data.first_name,
                last_name: data.last_name,
                middle_name: data.middle_name || "",
                birthday: data.birthday || "",
                username: data.username || "",
                email: data.email,
                password: password
            };

            const response = await api.post('', loadUser, {
                params: { endpoint: 'users', action: 'add_new_user', user_id: userId }
            });

            if (response.data && response.data.id) {
                const new_user : IUser = {
                    id: response.data.id,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    middle_name: data.middle_name || "",
                    birthday: data.birthday || "",
                    username: data.username || "",
                    email: data.email,
                    role: response.data.role,
                    count_tasks: 0
                };
                
                setAllUsers(prev => [...prev, new_user]);
            } else {
                throw new Error("Некорректный ответ от сервера при создании пользователя");
            }
        } catch (err) {
            console.error("Ошибка при добавлении нового пользователя", err);
        }
    };

    const updateUser = async (targetUserId: number, updatedFields: Partial<IUser>) => {
        if (!userId) return;
        try {
            const currentUserState = allUsers.find(u => u.id === targetUserId);
            if (!currentUserState) return;

            const mergedUser = { ...currentUserState, ...updatedFields };

            const loadUser = {
                id: targetUserId,
                id_role: mergedUser.role.id,
                first_name: mergedUser.first_name,
                last_name: mergedUser.last_name,
                middle_name: mergedUser.middle_name || "",
                birthday: mergedUser.birthday || "",
                email: mergedUser.email
            };

            const { data } = await api.put('', loadUser, {
                params: { endpoint: 'users', action: 'update_user', user_id: userId }
            });

            if (data.status === "success") {
                const updatedUser: IUser = {
                    ...mergedUser,
                    role: data.role
                };

                setAllUsers(prev => prev.map(u => u.id === targetUserId ? updatedUser : u));
                
                if (selectedUser?.id === targetUserId) {
                    setSelectedUser(updatedUser);
                }
            }
        } catch (err) {
            console.error("Ошибка при обновлении пользователя", err);
        }
    };

    const deleteUser = async (targetUserId: number) => {
        if (!userId) return;
        try {
            const { data } = await api.delete('', {
                params: { endpoint: 'users', action: 'delete_user', user_id: userId, target_user_id: targetUserId }
            });

            if (data.status === "success") {
                setAllUsers(prev => prev.filter(u => u.id !== targetUserId));
                if (selectedUser?.id === targetUserId) {
                    setSelectedUser(null);
                }
            }
        } catch (err) {
            console.error("Ошибка при удалении пользователя", err);
        }
    };

    return { 
        allUsers, 
        availableRoles,
        selectedUser, 
        fetchAllUsers, 
        setSelectedUser, 
        addNewUser, 
        updateUser, 
        deleteUser,
        fetchAvailableRoles,
        searchUser
    };
};
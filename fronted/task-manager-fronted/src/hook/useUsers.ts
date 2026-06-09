import { useCallback, useState, useEffect } from "react";
import type { IUser, IUserRole } from "../context/auth_context";
import { API_URL } from "../api_key";
import axios from "axios";

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

export const useUsers = (userId : number | undefined, token: string | undefined, editorLevel: number | undefined) => {
    const [allUsers, setAllUsers] = useState<IUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
    const [availableRoles, setAvailableRoles] = useState<IUserRole[]>([]);
    
    const fetchAvailableRoles = useCallback(async (editorLevel: number | undefined) => {
        
        if (!token || !userId || editorLevel === undefined || editorLevel === null) return;
        
        try {
            const { data } = await axios.get(
                `${API_URL}?endpoint=users&action=get_all_roles&user_id=${userId}&editor_level=${editorLevel}`, 
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            const parsedRoles = data.map((r: IRoleResponseDTO): IUserRole => ({
                id: Number(r.id),
                permission_level: Number(r.permission_level),
                name: r.name,
                description: r.description,
                background_color: r.background_color || "#e3e3e3",
                color: r.color || "#333"
            }));

            setAvailableRoles(parsedRoles);
        } catch (err) {
            console.error("Ошибка при получении списка ролей", err);
        }
    }, [token, userId]);

    const fetchAllUsers = useCallback(async () => {
        if (!token) return;
        try {
            const { data } = await axios.get<IUserResponseDTO[]>(`${API_URL}?endpoint=users&action=get_all_users&user_id=${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const parsedUsers = data.map((u: IUserResponseDTO): IUser => ({
                id: Number(u.id),
                first_name: u.first_name,
                last_name: u.last_name,
                middle_name: u.middle_name || "",
                email: u.email,
                token: "", 
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
                
            }));

            setAllUsers(parsedUsers);
        } catch (err) {
            console.error("Ошибка при получении списка пользователей", err);
        }
    }, [token, userId]);

    useEffect(() => {
        if (token) {
            fetchAvailableRoles(editorLevel);
            fetchAllUsers();
        }
    }, [token, fetchAvailableRoles, fetchAllUsers]);

    const addNewUser = async (data : IUser, password : string) => {
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

            const response = await axios.post(`${API_URL}?endpoint=users&action=add_new_user&user_id=${userId}`, loadUser, {
                headers: { 'Authorization': `Bearer ${token}` }
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
                    token: "",
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

            const { data } = await axios.post(`${API_URL}?endpoint=users&action=update_user&user_id=${userId}`, loadUser, {
                headers: { 'Authorization': `Bearer ${token}` }
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
        try {
            const { data } = await axios.delete(
                `${API_URL}?endpoint=users&action=delete_user&user_id=${userId}&target_user_id=${targetUserId}`, 
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

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
        fetchAllUsers, 
        selectedUser, 
        setSelectedUser, 
        addNewUser, 
        updateUser, 
        deleteUser,
        availableRoles,
        fetchAvailableRoles
    };
};
import React from "react";
import { AuthContext, type IUser } from "./auth_context";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api_key";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();

    const [user, setUser] = React.useState<IUser | null>(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [isAuth, setIsAuth] = React.useState<boolean>(!!localStorage.getItem('user'));

    const login = async (loginStr: string, passwordStr: string) => {
        try {
            const response = await fetch(`${API_URL}?endpoint=auth&action=login`, {
                method: 'POST',
                body: JSON.stringify({ login: loginStr, password: passwordStr })
            });
            
            const data = await response.json();

            if (data.success) {
                const userData: IUser = {
                    id: Number(data.user_data['id']),
                    role: {
                        id: Number(data.user_data['role']?.['id'] ?? 0),
                        permission_level: Number(data.user_data['role']?.['permission_level'] ?? 0),
                        name: data.user_data['role']?.['role_name'] ?? 'Пользователь',
                        description: data.user_data['role']?.['description'] ?? '',
                        background_color: data.user_data['role']?.['background_color'] ?? '#e2e8f0',
                        color: data.user_data['role']?.['text_color'] ?? '#475569'
                    },
                    first_name: data.user_data['first_name'],
                    last_name: data.user_data['last_name'],
                    middle_name: data.user_data['middle_name'],
                    birthday: data.user_data['birthday'],
                    username: data.user_data['username'],
                    email: data.user_data['email'],
                    token: data.token
                };
                
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                setIsAuth(true);
                navigate('/tasks');
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch {
            return { success: false, message: "Ошибка сервера" };
        }
    };

    const logout = () => {
        if(user?.token) {
            fetch(`${API_URL}?endpoint=auth&action=logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                }
            }).catch(err => console.error('Ошибка при выходе:', err));
        }

        setUser(null);
        setIsAuth(false);
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, isAuth, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
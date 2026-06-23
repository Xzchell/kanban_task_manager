import React from "react";
import { AuthContext, type IUser } from "./auth_context";
import { useNavigate } from "react-router-dom";
import { api } from "../api_axios";

export interface IUserData {
    fullNameUser: string,
    birthDate: string,
    email: string,
    username: string,
    password: string,
    confirmPassword: string
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();

    const [user, setUser] = React.useState<IUser | null>(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [isAuth, setIsAuth] = React.useState<boolean>(!!localStorage.getItem('user'));

    const login = async (loginStr: string, passwordStr: string) => {
        try {

            const response = await api.post('', 
                { login: loginStr, password: passwordStr},
                { params: { endpoint: 'auth', action: 'login'} }
            );
            
            const data = response.data;

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
                    email: data.user_data['email']
                };
                
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                setIsAuth(true);
                navigate('/tasks');
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
            } catch (error: any) {
                if (error.response && error.response.data) {
                    return { success: false, message: error.response.data.message };
                }
                return { success: false, message: "Ошибка сервера" };
            }
    };

    const resendRegisterCode = async (email: string) => {
        try {
            const response = await api.post('', 
                { email: email },
                { params: { endpoint: 'auth', action: 'resend_code' } }
            );

            const data = response.data;

            if (data.success) {
                return { success: true, message: data.message };
            }
            return { success: false, message: data.message };
        } catch (error: any) {
            if (error.response && error.response.data) {
                return { success: false, message: error.response.data.message };
            }
            return { success: false, message: "Ошибка при повторной отправке кода" };
        }
    };

    const register = async (userData : IUserData) => {
        try{
            const response = await api.post('',
                { 
                username: userData.username, 
                email: userData.email, 
                fullNameUser: userData.fullNameUser, 
                birthDate: userData.birthDate,
                password: userData.password 
                },
                { params: { endpoint: 'auth', action: 'register' } }
            );

            const data = response.data;

            if (data.success){
                return { success: true, message: data.message, debugCode: data.debug_code };
            }
            return { success: false, message: data.message };
        } catch (error: any) {
            if (error.response && error.response.data) {
                return { success: false, message: error.response.data.message };
            }
            return { success: false, message: "Ошибка при регистрации" };
        }
    }

    const verifyRegisterCode = async (email: string, code: string) => {
        try {
            const response = await api.post('', 
                { email: email, code: code },
                { params: { endpoint: 'auth', action: 'verify' } } 
            );

            const data = response.data;

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
                    email: data.user_data['email']
                };

                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                setIsAuth(true);
                
                navigate('/tasks');
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error: any) {
            if (error.response && error.response.data) {
                return { success: false, message: error.response.data.message };
            }
            return { success: false, message: "Ошибка верификации кода" };
        }
    };

    const logout = async () => {
        
        await api.post('', {},
            { params: { endpoint: 'auth', action: 'logout'} }
        );

        setUser(null);
        setIsAuth(false);
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, isAuth, login, logout, register, verifyRegisterCode, resendRegisterCode }}>
            {children}
        </AuthContext.Provider>
    );
};
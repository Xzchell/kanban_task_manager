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
                console.log(data.need_verif); 
                return { success: false, message: data.message, need_verif: data.need_verif};
            }
            } catch (error: any) {
                if (error.response && error.response.data) {
                    return { success: false, message: error.response.data.message, need_verif: !!error.response.data.need_verif };
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
                return { success: true};
            } else {
                console.log(data.message);
                return { success: false, message: data.message };
            }
        } catch (error: any) {
            if (error.response && error.response.data) {
                return { success: false, message: error.response.data.message };
            }
            return { success: false, message: "Ошибка верификации кода" };
        }
    };

    const resetPasswordConfirm = async (email: string, password: string) => {
        try {
            const response = await api.post('', 
                { 
                    email: email, 
                    password: password 
                },
                { 
                    params: { endpoint: 'auth', action: 'update_password' } 
                }
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
            return { success: false, message: "Ошибка при сохранении нового пароля" };
        }
    };

    const sendResetPasswordCode = async (email: string) => {
        try {
            const response = await api.post('', 
                { 
                    email: email,
                    isPasswordReset: true
                },
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

    const verifyResetPasswordCode = async (email: string, code: string) => {
        try {
            const response = await api.post('', 
                { 
                    email: email, 
                    code: code,
                    isPasswordReset: true 
                },
                { 
                    params: { endpoint: 'auth', action: 'verify' } 
                } 
            );

            const data = response.data;

            if (data.success) {
                return { success: true };
            } else {
                console.log(data.message);
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

    const getOtherSessions = async () => {
        try {
            const response = await api.post('', {}, { 
                params: { endpoint: 'sessions', action: 'get_other_sessions' } 
            });
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || "Ошибка загрузки сессий" };
        }
    };

    const revokeSession = async (sessionId: number) => {
        try {
            const response = await api.post('', { sessionId }, { 
                params: { endpoint: 'sessions', action: 'revoke_session' } 
            });
            return response.data;
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || "Ошибка удаления сессии" };
        }
    };

    return (
        <AuthContext.Provider value={{revokeSession, getOtherSessions, user, isAuth, login, resetPasswordConfirm, sendResetPasswordCode, verifyResetPasswordCode, logout, register, setUser, verifyRegisterCode, resendRegisterCode }}>
            {children}
        </AuthContext.Provider>
    );
};
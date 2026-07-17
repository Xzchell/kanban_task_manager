import React from "react";
import type { IUserData } from "./auth_provider";

export interface IUser{
    id: number;
    first_name: string;
    last_name: string;
    middle_name: string;
    birthday: string;
    username: string;
    email: string;
}

export interface ISessionItem {
    id: number;
    created_at: string;
    device?: string;
}

export interface IAuthContextType {
    user: IUser | null;
    isAuth: boolean;
    login: (loginStr: string, passwordStr: string) => Promise<{ success: boolean; message?: string, need_verif?: boolean }>;
    logout: () => void;
    register: (userData : IUserData) => Promise<{ success: boolean; message?: string }>;
    verifyRegisterCode: (email: string, code: string) => Promise<{ success: boolean; message?: string }>; 
    resendRegisterCode: (email: string) => Promise<{ success: boolean; message?: string }>;
    setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
    verifyResetPasswordCode: (email: string, code: string) => Promise<{ success: boolean; message?: string }>; 
    sendResetPasswordCode: (email : string) => Promise<{ success: boolean; message?: string }>;
    resetPasswordConfirm: (email: string, password : string) => Promise<{ success: boolean; message?: string }>;
    getOtherSessions: () => Promise<{ success: boolean; sessions?: ISessionItem[]; message?: string }>;
    revokeSession: (sessionId: number) => Promise<{ success: boolean; message?: string }>;
}

export const AuthContext = React.createContext<IAuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
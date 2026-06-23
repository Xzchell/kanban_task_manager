import React from "react";
import type { IUserData } from "./auth_provider";

export interface IUser{
    id: number;
    role: IUserRole;
    first_name: string;
    last_name: string;
    middle_name: string;
    birthday: string;
    username: string;
    email: string;
    count_tasks?: number;
}

export interface IUserRole{
    id : number;
    permission_level: number;
    name: string;
    description: string;
    background_color?: string;
    color?: string;
}

export interface IAuthContextType {
    user: IUser | null;
    isAuth: boolean;
    login: (loginStr: string, passwordStr: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
    register: (userData : IUserData) => Promise<{ success: boolean; message?: string }>;
    verifyRegisterCode: (email: string, code: string) => Promise<{ success: boolean; message?: string }>; 
    resendRegisterCode: (email: string) => Promise<{ success: boolean; message?: string }>;
}

export const AuthContext = React.createContext<IAuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
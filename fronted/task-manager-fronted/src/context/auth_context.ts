import React from "react";

export interface IUser{
    id: number;
    role: IUserRole;
    token: string;
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
}

export const AuthContext = React.createContext<IAuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
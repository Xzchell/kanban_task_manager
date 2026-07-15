import { useContext} from "react";
import type { ITaskData } from "../components/task_card";
import { BoardContext } from "../context/board_сontext";

export interface IBoardMember {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    avatar_url?: string | null;
    username: string;
    role?: {
        id: number;
        name: string;
        displayName?: string;
        permission_level: number;
        description?: string;
    };
}

export interface ITimePoint {
    id: number;
    board_id?: number;
    title: string;
    target_date: string;
}

export interface IBoard {
    id: number;
    title: string;
    description: string;
    type : {
        name: string;
        displayName: string;
        maxUsers: number;
        hasWebSockets: boolean;
    }
    owner: {
        id?: number;
        lastName: string;
        firstName: string;
        middleName: string;
    }
    createdAt: string;
    users?: IBoardMember[];
    deadline?: string;
    columns?: IColumns[];
    tasks?: ITaskData[];
    timePoints?: ITimePoint[];
}

export interface IBoardCreate {
    title: string;
    description: string;
    type_name: BoardTypeKind;
    columns: IColumns[];
    deadline?: string | null;
    invited_users?: IInvitedUser[];
    milestones?: ITimePoint[];
}

export interface IInvitedUser {
    user_id: number;
    role_id: number;
}

export interface IColumns {
    id?: number;
    name: string;
    position: number;
}

export const TYPE_BOARD = {
    hakaton: "hakaton",
    company: "company"
} as const; 

export type BoardTypeKind = typeof TYPE_BOARD[keyof typeof TYPE_BOARD]

export const useBoard = () => {
    const context = useContext(BoardContext);
    if (!context) {
        throw new Error("useBoard must be used within a BoardProvider");
    }
    return context;
};
import { useMemo } from "react";
import { useAuth } from "../context/auth_context";
import { useBoard, type IBoardMember } from "./useBoards";
import type { ITaskData } from "../components/task_card";

export interface IInviteMemberPayload {
    email: string;
    role_id: number;
}

export const useBoardPermissions = () => {
    const { user } = useAuth();
    const { selectedBoard } = useBoard();

    const currentBoardUser = useMemo(() => {
        if (!user || !selectedBoard?.users) return null;
        return selectedBoard.users.find((u) => u.id === user.id) || null;
    }, [selectedBoard?.users, user]);

    const isTrueCreator = useMemo(() => {
        if (!user || !selectedBoard?.owner?.id) return false;
        return selectedBoard.owner.id === user.id;
    }, [selectedBoard?.owner?.id, user]);

    const isOwner = useMemo(() => {
        if (!user) return false;
        const hasOwnerRole = currentBoardUser?.role?.id === 1;
        return isTrueCreator || hasOwnerRole;
    }, [isTrueCreator, currentBoardUser, user]);

    const isUser = useMemo(() => !isOwner && currentBoardUser?.role?.id === 2, [isOwner, currentBoardUser]);
    const isSpectator = useMemo(() => !isOwner && currentBoardUser?.role?.id === 3, [isOwner, currentBoardUser]);

    const canManageBoard = useMemo(() => {
        return isOwner; 
    }, [isOwner]);

    const canInviteMembers = useMemo(() => {
        return isOwner;
    }, [isOwner]);

    const canChangeMemberRoleOrRemove = (targetMember: IBoardMember) => {
        if (!isOwner) return false;

        const isTargetTrueCreator = selectedBoard?.owner?.id === targetMember.id;
        if (isTargetTrueCreator) return false;

        if (isTrueCreator) return true;

        const isTargetOwner = targetMember.role?.id === 1;
        return !isTargetOwner;
    };

    const canCreateAndMoveTasks = useMemo(() => {
        if (isSpectator) return false;
        return isOwner || isUser;
    }, [isOwner, isUser, isSpectator]);

    const canEditOrDeleteTask = (task: ITaskData) => {
        if (isSpectator) return false;
        if (isOwner) return true; 
        return isUser && task.author.id === user?.id;
    };

    const members = useMemo(() => selectedBoard?.users ?? [], [selectedBoard?.users]);

    return {
        members,
        isOwner,
        isUser,
        isSpectator,
        canManageBoard,
        isTrueCreator,
        canInviteMembers,
        canChangeMemberRoleOrRemove,
        canCreateAndMoveTasks,
        canEditOrDeleteTask,
        currentUserId: user?.id ?? null,
    };
};
import { useState } from "react";
import { useAuth, type IUser} from "../context/auth_context";
import { api } from "../api_axios";
import { useBoard, type IBoardMember } from "./useBoards";
import { useSocket } from "../context/socket_context";

export interface ISearchedUser {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
}

export const useUsers = () => {
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
    const userId = useAuth().user?.id;
    
    const {selectedBoardId, setSelectedBoard , selectedBoard} = useBoard();
    const { socket } = useSocket();

    const searchUser = async(username: string): Promise<ISearchedUser[]> => {
        if (!userId) return [];
        try{
            const response = await api.post('', {query: username}, {
                params: { endpoint: 'users', action: 'search_user', user_id: userId, board_id: selectedBoard ? selectedBoardId : -1 }
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

    const addBoardMembersBD = async (newMembers: IBoardMember[]) => {
        if (!userId || !selectedBoardId) return false;
        try {
            const membersPayload = newMembers.map(member => ({
                user_id: member.id,
                role_id: member.role?.id ?? 2
            }));

            await api.post("", { members: membersPayload }, {
                params: { 
                    endpoint: 'users', 
                    action: 'add_board_members', 
                    board_id: selectedBoardId, 
                    user_id: userId 
                }
            });
            
        } catch (err) {
            console.error("Ошибка при добавлении участников на доску:", err);
        }
    };

    const removeBoardMemberBD = async (targetUserId: number) => {
        if (!userId) return;
        try{
            const response = await api.post("", { targetUserId }, {
                params: { endpoint: 'users', action: 'remove_board_member', board_id: selectedBoardId, user_id: userId }
            });

            if (socket && response.data.success) {
                socket.emit('remove_board_member', { boardId: String(selectedBoardId), targetId: targetUserId });
            }
        }catch (err) {
            console.error("Ошибка удаления пользователя", err);
        }
    }

    const updateMemberRole = async (newDataUser : IBoardMember, targetUserId : number) => {
        if (!userId) return;
        try{
            const response = await api.post("", { newIdRole: newDataUser.role?.id, targetUserId }, {
                params: { endpoint: 'users', action: 'update_member_role', board_id: selectedBoardId, user_id: userId }
            });

            if (socket && response.data.success) {
                socket.emit('update_member_role', { boardId: String(selectedBoardId), newRole: newDataUser });
            }
        }catch (err) {
            console.error("Ошибка обновления роли пользователя", err);
        }
    }

    const changeUserRole = (updatedUser: IBoardMember) => {
        if (!selectedBoard) return;
        const currentUsers = selectedBoard.users ?? [];
        const updatedUsers = currentUsers.map((member) => member.id === updatedUser.id ? updatedUser : member);
        setSelectedBoard({ ...selectedBoard, users: updatedUsers });
    };

    const removeBoardMember = (userId: number) => {
        if (!selectedBoard || !selectedBoard.users) return;
        const updatedUsers = selectedBoard.users.filter(u => u.id !== userId);
        setSelectedBoard({ ...selectedBoard, users: updatedUsers });
    };

    return { 
        selectedUser, 
        setSelectedUser, 
        searchUser,
        updateMemberRole,
        changeUserRole,
        removeBoardMember,
        removeBoardMemberBD,
        addBoardMembersBD
    };
};
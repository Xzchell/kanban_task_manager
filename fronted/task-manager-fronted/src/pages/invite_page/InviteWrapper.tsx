import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import InVitePage from "./invite_page";
import { AnimatedBackground } from "../../components/animated_background";
import DefaultButton from "../../components/default_button";
import { api } from "../../api_axios";
import { useAuth } from "../../context/auth_context";
import { useBoard, type IBoardMember } from "../../hook/useBoards";
import { useSocket } from "../../context/socket_context";

interface IInvitationData {
    boardOwner: {
        firstName: string;
        lastName: string;
        middleName?: string;
    };
    boardInfo: {
        id: number;
        title: string;
    };
    invitedRole: {
        id: number;
        name: string;
        displayName?: string;
        permission_level: number;
    };
}

export const InviteWrapper: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const { socket } = useSocket(); 
    
    const token = searchParams.get("token") || "";

    const {selectBoard} = useBoard();

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [invitationData, setInvitationData] = useState<IInvitationData | null>(null);

    useEffect(() => {
        if (!token) {
            setError("Отсутствует токен приглашения.");
            setLoading(false);
            return;
        }

        const fetchDetails = async () => {
            try {
                const response = await api.get("", {
                    params: {
                        endpoint: "users",
                        action: "get_invitation_details",
                        token: token,
                        user_id: user?.id,
                    },
                });

                if (response.data.success) {
                    setInvitationData(response.data.data);
                } else {
                    setError(response.data.message || "Не удалось загрузить данные приглашения.");
                }
            } catch (err) {
                setError("Сетевая ошибка при попытке связаться с сервером.");
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [token, user?.id]);

    const handleRespondSuccess = async (value : boolean) => {
        if (!invitationData || !user) {
            return;
        }

        if(value){
            const mainUser: IBoardMember = {
                id: Number(user.id),
                username: user.username || "",
                email: user.email || "",
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                middle_name: user.middle_name,
                avatar_url: null,
                
                role: {
                    id: invitationData.invitedRole.id,
                    name: invitationData.invitedRole.name,
                    displayName: invitationData.invitedRole.displayName || "Участник",
                    permission_level: invitationData.invitedRole.permission_level
                }
            };
            if (socket) {
                socket.emit('add_board_members', {
                    boardId: String(invitationData.boardInfo.id),
                    newMembers: [mainUser],
                });
            }
            navigate("/board-tasks");
            await selectBoard(invitationData.boardInfo.id);
        }
        else navigate("/boards");

    };

    if (loading) {
        return (
            <div style={styles.centerContainer}>
                <AnimatedBackground />
                <div style={styles.loaderCard}>Загрузка приглашения...</div>
            </div>
        );
    }

    if (error || !invitationData) {
        return (
            <div style={styles.centerContainer}>
                <AnimatedBackground />
                <div style={styles.errorCard}>
                    <h2 style={styles.errorTitle}>Ошибка доступа</h2>
                    <p style={styles.errorMessage}>{error || "Приглашение недействительно."}</p>
                    
                    <div style={styles.buttonWrapper}>
                        <DefaultButton 
                            onClick={() => navigate("/boards")} 
                            text="Вернуться к доскам"
                            fullWidth={true}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <InVitePage
            token={token}
            boardOwner={invitationData.boardOwner}
            boardInfo={invitationData.boardInfo}
            onRespondSuccess={handleRespondSuccess}
        />
    );
};

const styles = {
    centerContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100vh",
        position: "relative" as const,
        fontFamily: "var(--font-rounded)",
    },
    loaderCard: {
        zIndex: 2,
        background: "rgba(255, 255, 255, 0.9)",
        padding: "20px 40px",
        borderRadius: "12px",
        fontSize: "18px",
        fontWeight: "bold",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    },
    errorCard: {
        position: 'fixed' as const,
        zIndex: 2,
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column" as const,
        justifyContent: "center",
        alignItems: "center",
        width: "min(90vw, 600px)",
        height: "300px",
        padding: "40px",
        boxSizing: "border-box" as const,
    },
    errorTitle: {
        color: "#ff4d4f", 
        marginTop: 0,
        marginBottom: "12px",
        fontSize: "24px",
    },
    errorMessage: {
        color: "#4b5563",
        fontSize: "16px",
        margin: "0 0 24px 0",
        textAlign: "center" as const,
    },
    buttonWrapper: {
        width: "100%",
        maxWidth: "280px",
    }
};
import React, { useState } from "react";
import { AnimatedBackground } from "../../components/animated_background";
import DefaultButton from "../../components/default_button";
import { useDesignMode } from "../../context/design_context";
import { theme } from "../../themes/themes";
import { api } from "../../api_axios";
import { useAuth } from "../../context/auth_context";

interface IInvitePageProps {
    token: string;
    boardOwner: {
        firstName: string;
        lastName: string;
        middleName?: string;
    };
    boardInfo: {
        id: number;
        title: string;
    };
    onRespondSuccess: (accepted: boolean) => void; 
}

const InVitePage: React.FC<IInvitePageProps> = ({ token, boardOwner, boardInfo, onRespondSuccess }) => {
    const { mode } = useDesignMode();
    const currentDesign = theme.modes[mode];

    const { user } = useAuth(); 
    
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const ownerFullName = [
        boardOwner.lastName,
        boardOwner.firstName,
        boardOwner.middleName
    ].filter(Boolean).join(" ");

    const guestFullName = user 
        ? [user.first_name, user.middle_name].filter(Boolean).join(" ")
        : "пользователь";

    const handleInvitationResponse = async (accept: boolean) => {
        setIsSubmitting(true);
        setErrorMessage(null);

        const action = accept ? "accept_invitation" : "decline_invitation";

        try {
            const response = await api.post(
                "",
                { 
                    token: token
                },
                {
                    params: {
                        endpoint: "users",
                        action: action,
                        user_id: user?.id
                    },
                }
            );
            
            if (response.data.success) {
                onRespondSuccess(accept);
            } else {
                setErrorMessage(response.data.message || "Произошла ошибка при обработке запроса.");
            }
        } catch (error) {
            setErrorMessage("Не удалось связаться с сервером. Попробуйте позже.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100%', position: 'relative' }}>
            <div style={styles.backgroundFixedWrapper}>
                <AnimatedBackground />
            </div>

            <div style={styles.pageContainer}>
                <div style={{
                    ...styles.cardInvitation, 
                    ...currentDesign.searchBar, 
                    borderRadius: theme.borderRadius.xlarge,
                    color: "#000" 
                }}>
                    <div style={styles.contentWrapper}>
                        <h1 style={styles.title}>Приглашение в команду</h1>
                        
                        <p style={styles.description}>
                            Уважаемый(ая) <strong>{guestFullName}</strong>! <strong>{ownerFullName}</strong> приглашает вас присоединиться к совместной работе над доской <strong>«{boardInfo.title}»</strong>.
                        </p>

                        {errorMessage && (
                            <div style={styles.errorText}>
                                {errorMessage}
                            </div>
                        )}

                        <div style={styles.buttonGroup}>
                            <DefaultButton
                                text={isSubmitting ? "Секунду..." : "Принять"}
                                onClick={() => handleInvitationResponse(true)}
                                disabled={isSubmitting}
                                fullWidth={true}
                            />
                            <DefaultButton
                                text={isSubmitting ? "Секунду..." : "Отклонить"}
                                onClick={() => handleInvitationResponse(false)}
                                disabled={isSubmitting}
                                fullWidth={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InVitePage;

const styles = {
    pageContainer: {
        display: "flex",
        flexDirection: "column" as const,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100vh",
        zIndex: 2,
        fontFamily: "var(--font-rounded)",
    },
    backgroundFixedWrapper: {
        position: "fixed" as const,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1,
        pointerEvents: "none" as const,
    },
    cardInvitation: {
        display: "flex",
        flexDirection: "column" as const,
        justifyContent: "center",
        alignItems: "center",
        width: "min(90vw, 600px)",
        padding: "40px",
        boxSizing: "border-box" as const,
        boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
        textAlign: "center" as const,
    },
    contentWrapper: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "24px",
        width: "100%",
    },
    title: {
        fontSize: "28px",
        margin: 0,
        fontWeight: "bold",
    },
    description: {
        fontSize: "18px",
        lineHeight: "1.6",
        margin: "10px 0",
    },
    buttonGroup: {
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        marginTop: "10px",
        width: "100%",
    },
    errorText: {
        color: "#ff4d4f",
        fontSize: "14px",
        fontWeight: "bold",
    }
};
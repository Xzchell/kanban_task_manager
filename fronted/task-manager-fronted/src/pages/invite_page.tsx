import React, { useState } from "react";
import { AnimatedBackground } from "../components/animated_background";
import DefaultButton from "../components/default_button";
import { useDesignMode } from "../context/design_context";
import { theme } from "../themes/themes";

// Расширяем интерфейс пропсов дополнительными параметрами
interface IInvitePageProps {
    invitationId: number; // ID приглашения для отправки на бэкенд
    boardOwner: {
        firstName: string;
        lastName: string;
        middleName?: string;
    };
    boardInfo: {
        id: number;
        title: string;
    };
    // Колбэки для уведомления родительского компонента об успешном результате
    onRespondSuccess: (accepted: boolean) => void; 
}

const InVitePage: React.FC<IInvitePageProps> = ({ 
    invitationId, 
    boardOwner, 
    boardInfo, 
    onRespondSuccess 
}) => {
    const { mode } = useDesignMode();
    const currentDesign = theme.modes[mode];
    
    // Состояние для предотвращения повторных кликов во время запроса
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Форматируем красивое отображение ФИО создателя
    const ownerFullName = [
        boardOwner.lastName,
        boardOwner.firstName,
        boardOwner.middleName
    ].filter(Boolean).join(" ");

    // Общая функция отправки ответа на PHP-бэкенд
    const handleInvitationResponse = async (accept: boolean) => {
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            // Замени на свой реальный инстанс axios/fetch, например, api.post
            const response = await fetch("/api/index.php?action=respond_invitation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    invitation_id: invitationId,
                    accept: accept
                })
            });

            const data = await response.json();

            if (data.success) {
                // Вызываем колбэк, чтобы родитель сделал редирект (например, в ЛК или на доску)
                onRespondSuccess(accept);
            } else {
                setErrorMessage(data.message || "Произошла ошибка при обработке запроса.");
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
                            Уважаемый пользователь! <strong>{ownerFullName}</strong> приглашает вас присоединиться к совместной работе над доской <strong>«{boardInfo.title}»</strong>.
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
                            />
                            <DefaultButton
                                text={isSubmitting ? "Секунду..." : "Отклонить"}
                                onClick={() => handleInvitationResponse(false)}
                                disabled={isSubmitting}
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
        width: "min(90vw, 600px)", // Адаптивная ширина вместо жестких 800px
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
import React, { useEffect, useState } from "react";
import { useDesignMode } from "../context/design_context";
import { theme } from "../themes/themes";
import { useAuth } from "../context/auth_context"; // Импортируем твой хук авторизации
import DefaultButton from "./default_button";

interface IActiveSession {
    id: number;
    created_at: string;
    device?: string;
}

export const UserSessionsBlock: React.FC = () => {
    const { mode } = useDesignMode();
    const activeTheme = theme.modes[mode];
    
    // Получаем функции работы с сессиями из контекста
    const auth = useAuth(); 

    const [sessions, setSessions] = useState<IActiveSession[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadSessions = async () => {
        setLoading(true);
        setError(null);
        
        // Проверяем наличие метода в контексте безопасности ради
        if (!auth || !auth.getOtherSessions) {
            setError("Сервис управления сессиями недоступен.");
            setLoading(false);
            return;
        }

        const result = await auth.getOtherSessions();
        
        if (result && result.sessions) {
            setSessions(result.sessions);
        } else {
            setError(result?.message || "Не удалось загрузить сессии устройств.");
        }
        setLoading(false);
    };

    useEffect(() => {
        loadSessions();
    }, []);

    const handleRevoke = async (sessionId: number) => {
        if (!auth || !auth.revokeSession) {
            alert("Сервис удаления сессий недоступен.");
            return;
        }

        const result = await auth.revokeSession(sessionId);
        
        if (result && result.success) {
            // Оптимистичное обновление UI: сразу убираем облако из списка
            setSessions(prev => prev.filter(s => s.id !== sessionId));
        } else {
            alert(result?.message || "Не удалось завершить сессию.");
        }
    };

    if (loading) {
        return <div style={styles.loadingText}>Загрузка активных сессий устройств...</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.headerRow}>
                <h2 style={styles.sectionTitle}>Активные сессии (Другие устройства)</h2>
                <p style={styles.subtitle}>Список мест, откуда был выполнен вход в ваш аккаунт помимо текущего окна</p>
            </div>

            {error && <div style={styles.errorText}>{error}</div>}

            {sessions.length === 0 ? (
                <div style={{ ...activeTheme.searchBar, ...styles.emptyCard, borderRadius: theme.borderRadius.xlarge }}>
                    <span style={styles.emptyText}>Другие активные устройства не обнаружены.</span>
                </div>
            ) : (
                <div style={styles.cloudsGrid}>
                    {sessions.map((session) => (
                        <div 
                            key={session.id} 
                            style={{ ...activeTheme.searchBar, ...styles.cloudCard, borderRadius: theme.borderRadius.xlarge }}
                        >
                            <div style={styles.sessionInfo}>
                                <span style={styles.infoLabel}>Дата и время входа</span>
                                <span style={styles.infoValue}>{session.created_at}</span>
                                <span style={styles.idLabel}>ID Сессии: #{session.id}</span>
                            </div>
                            <div style={styles.actionWrapper}>
                                <DefaultButton 
                                    text="Завершить сессию" 
                                    status="danger" 
                                    onClick={() => handleRevoke(session.id)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        marginTop: "30px",
        width: "100%",
        display: "flex",
        flexDirection: "column" as const,
        gap: "16px"
    },
    headerRow: {
        marginBottom: "10px"
    },
    sectionTitle: { fontSize: "18px", fontWeight: 700, color: "#1e293b", margin: "0 0 4px 0" },
    subtitle: { fontSize: "13px", color: "#64748b", margin: 0 },
    loadingText: { fontSize: "14px", color: "#64748b", padding: "20px 0" },
    errorText: { color: "#ef4444", fontSize: "14px", fontWeight: 600, marginTop: "4px" },
    
    cloudsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "20px",
        width: "100%"
    },
    cloudCard: {
        padding: "20px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)",
        display: "flex",
        flexDirection: "row" as const,
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px"
    },
    sessionInfo: {
        display: "flex",
        flexDirection: "column" as const
    },
    infoLabel: { fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.05em" },
    infoValue: { fontSize: "15px", color: "#334155", fontWeight: 600, marginTop: "4px" },
    idLabel: { fontSize: "12px", color: "#7177f4", fontWeight: 600, marginTop: "4px" },
    actionWrapper: {
        flexShrink: 0
    },
    emptyCard: {
        padding: "24px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)",
        textAlign: "center" as const
    },
    emptyText: { fontSize: "14px", color: "#64748b", fontWeight: 500 }
};
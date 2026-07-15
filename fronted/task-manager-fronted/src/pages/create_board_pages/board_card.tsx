import type { IBoard } from "../../hook/useBoards";
import { Building, ChevronRight, Clock, Zap } from "lucide-react";
import CountdownTimer from "../../components/countdown_timer";
import { useNavigate } from "react-router-dom";
import { useBoard } from "../../hook/useBoards";

interface IBoardCardProps {
    board?: IBoard;
    isLoading?: boolean;
}

export const BoardCard: React.FC<IBoardCardProps> = ({ board, isLoading = false }) => {
    const navigate = useNavigate();
    const { selectBoard } = useBoard();
    const renderCardStyles = () => (
        <style>{`
            @keyframes skeletonPulse {
                0%, 100% { opacity: 0.15; }
                50% { opacity: 0.75; }
            }
            .skeleton-blink {
                animation: skeletonPulse 1.2s ease-in-out infinite;
                background-color: rgba(255, 255, 255, 0.3) !important;
            }
            .skeleton-blink-dark {
                animation: skeletonPulse 1.2s ease-in-out infinite;
                background-color: rgba(100, 116, 139, 0.2) !important;
            }
            .interactive-board-card {
                transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: pointer;
            }
            .interactive-board-card:hover {
                transform: translateY(-6px);
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                border-color: rgba(148, 163, 184, 0.3);
            }
            .interactive-board-card:hover .arrow-btn-icon {
                transform: translateX(3px);
                background-color: #f1f5f9;
            }
            .arrow-btn-icon {
                transition: transform 0.2s ease, background-color 0.2s ease;
            }
        `}</style>
    );

    if (isLoading || !board) {
        return (
            <div style={styles.container}>
                {renderCardStyles()}
                <div style={{
                    ...styles.topSection,
                    background: "linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)"
                }}>
                    <div style={styles.badgeRow}>
                        <div style={{ ...styles.typeBadge, width: "90px", height: "28px" }} className="skeleton-blink" />
                        <div style={{ ...styles.columnsBadge, width: "80px", height: "28px" }} className="skeleton-blink" />
                    </div>

                    <div style={{ width: "80%", height: "26px", borderRadius: "8px" }} className="skeleton-blink" />

                    <div style={styles.deadlineSection}>
                        <div style={{ width: "40%", height: "12px", borderRadius: "4px" }} className="skeleton-blink" />
                        <div style={{ width: "100%", height: "40px", borderRadius: "10px" }} className="skeleton-blink" />
                    </div>
                </div>

                <div style={styles.bottomSection}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div style={{ width: "100%", height: "14px", borderRadius: "4px" }} className="skeleton-blink-dark" />
                        <div style={{ width: "90%", height: "14px", borderRadius: "4px" }} className="skeleton-blink-dark" />
                        <div style={{ width: "60%", height: "14px", borderRadius: "4px" }} className="skeleton-blink-dark" />
                    </div>

                    <div style={styles.footer}>
                        <div style={styles.usersSection}>
                            <div style={{ display: "flex", gap: "4px" }}>
                                <div style={{ ...styles.avatar, border: "none" }} className="skeleton-blink-dark" />
                                <div style={{ ...styles.avatar, border: "none", marginLeft: "-8px" }} className="skeleton-blink-dark" />
                            </div>
                            <div style={{ width: "80px", height: "14px", borderRadius: "4px" }} className="skeleton-blink-dark" />
                        </div>
                        <div style={{ ...styles.arrowButton, backgroundColor: "#e2e8f0" }} className="skeleton-blink-dark" />
                    </div>
                </div>
            </div>
        );
    }

    const isHakaton = board.type.name === "hakaton"; 

    const handleBoardClick = async () => {
        if (!board?.id) return;
        
        try {
            navigate("/board-tasks");
            await selectBoard(board.id);
        } catch (err) {
            console.error("Не удалось открыть доску:", err);
        }
    };

    const renderAvatars = () => {
        if(!board.users || board.users.length === 0) return <span style={styles.usersCount}>Нет пользователей</span>;
        const userStr : string = board.users.length === 1 ? "участник" : "участника";
        return(
            <>
            <div style={styles.avatarStack}>                
            {
                board.users.slice(0,4).map((user, idx) => (
                    <div 
                        key={user.id} 
                        style={{
                            ...styles.avatar,
                            backgroundColor: "#ec4899",
                            marginLeft: idx === 0 ? 0 : "-8px",
                            zIndex: 10 - idx
                            }}
                    >
                    <span>{user.first_name[0]}</span>
                    </div>
                ))
            }
            </div>
            <span style={styles.usersCount}>{board.users.length} {userStr}</span>
            </>
        );
    }

    return (
        <div style={styles.container} className="interactive-board-card" onClick={handleBoardClick}>
            {renderCardStyles()}
            <div style={{
                ...styles.topSection,
                height: isHakaton ? "230px" : "190px",
                background: isHakaton 
                    ? "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" 
                    : "linear-gradient(135deg, #047857 0%, #00c79a 100%)"
            }}>
                <div style={styles.badgeRow}>
                    <div style={styles.typeBadge}>
                        {isHakaton ? <Zap size={12} color="#fff" /> : <Building size={12} color="#fff" />}
                        <span>{board.type.displayName}</span>
                    </div>
                    <div style={styles.columnsBadge}>
                        <span style={{ fontSize: '14px', marginRight: '4px' }}>☰</span>
                        <span>{board.columns?.length ?? 0} колонок</span>
                    </div>
                </div>

                <h2 style={styles.boardTitle}>{board.title}</h2>

                {isHakaton ? (
                    <div style={styles.deadlineSection}>
                        <div style={styles.deadlineTitle}>
                            <Clock size={12} />
                            <span>ДО ДЕДЛАЙНА</span>
                        </div>
                        <CountdownTimer deadlineStr={board.deadline} />
                    </div>
                ) : (
                    <div style={{ height: "40px" }} /> 
                )}
            </div>

            <div style={styles.bottomSection}>
                <p style={styles.description}>
                    {board.description.length === 0 ? "Нет описания" : board.description}
                </p>

                <div style={styles.footer}>
                    <div style={styles.usersSection}>
                        {renderAvatars()}
                    </div>

                    <button style={styles.arrowButton} className="arrow-btn-icon">
                        <ChevronRight size={18} color="#64748b" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BoardCard;

const styles = {
    container: {
        width: "320px",
        minHeight: "350px",
        borderRadius: "24px",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column" as const,
        overflow: "hidden",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 16px -8px rgba(0, 0, 0, 0.05)",
        border: "1px solid #f1f5f9",
        boxSizing: "border-box" as const,
    },
    topSection: {
        padding: "24px",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column" as const,
        gap: "16px",
        position: "relative" as const,
        boxSizing: "border-box" as const,
    },
    badgeRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    typeBadge: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        backgroundColor: "rgba(255, 255, 255, 0.18)",
        padding: "6px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: 600,
        backdropFilter: "blur(4px)",
        border: '1.5px solid #ffffff20',
        boxSizing: "border-box" as const,
    },
    columnsBadge: {
        display: "flex",
        alignItems: "center",
        gap: "4px",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        padding: "6px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: 500,
        border: '1.5px solid #ffffff20',
        boxSizing: "border-box" as const,
    },
    boardTitle: {
        margin: 0,
        fontSize: "22px",
        fontWeight: 700,
        letterSpacing: "-0.02em",
        whiteSpace: "nowrap" as const,
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    deadlineSection: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "8px",
        marginTop: "auto"
    },
    deadlineTitle: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.08em",
        opacity: 0.7,
    },
    bottomSection: {
        padding: "24px",
        display: "flex",
        flexDirection: "column" as const,
        flexGrow: 1,
        justifyContent: "space-between",
    },
    description: {
        margin: 0,
        fontSize: "14px",
        color: "#64748b",
        lineHeight: "1.5",
        display: "-webkit-box",
        WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical" as const,
        overflow: "hidden",
    },
    footer: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "auto",
    },
    usersSection: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },
    avatarStack: {
        display: "flex",
        alignItems: "center",
    },
    avatar: {
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        border: "2px solid #ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
        fontSize: "10px",
        fontWeight: 700,
        backgroundColor: "#cbd5e1",
    },
    usersCount: {
        fontSize: "13px",
        color: "#64748b",
        fontWeight: 500,
    },
    arrowButton: {
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        backgroundColor: "#f8fafc",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
    },
};
import React, { useState, useEffect } from "react";
import { Trash2, Tag, ChevronUp, ChevronDown } from "lucide-react";
import { theme } from "../themes/themes";
import { useDesignMode } from "../context/design_context";
import type { ITimePoint } from "../hook/useBoards";


interface ITimePointRowProps {
    point: ITimePoint;
    boardDeadline: Date | null;
    onUpdate: (field: "title" | "target_date", value: string) => void;
    onRemove: () => void;
}

export const TimePointRow: React.FC<ITimePointRowProps> = ({ point, boardDeadline, onUpdate, onRemove }) => {
    const { mode } = useDesignMode();
    const currentMode = theme.modes[mode];

    const getMaxOffsetHours = () => {
        if (!boardDeadline) return 999;
        
        const nowMs = new Date().getTime();
        const deadlineMs = new Date(boardDeadline).getTime();
        
        if (deadlineMs <= nowMs) return 0;

        const diffHours = Math.floor((deadlineMs - nowMs) / (1000 * 60 * 60));
        return diffHours > 0 ? diffHours - 1 : 0;
    };

    const getInitialOffsets = () => {
        if (!boardDeadline || !point.target_date) return { h: 2, m: 0 };

        const deadlineMs = new Date(boardDeadline).getTime();
        const pointMs = new Date(point.target_date).getTime();

        if (isNaN(deadlineMs) || isNaN(pointMs)) return { h: 2, m: 0 };

        const diffMs = deadlineMs - pointMs;
        if (diffMs <= 0) return { h: 0, m: 0 };

        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(totalMinutes / 60);
        const diffMinutes = totalMinutes % 60;

        return { h: diffHours, m: Math.round(diffMinutes / 5) * 5 % 60 };
    };

    const [offsetHours, setOffsetHours] = useState(() => getInitialOffsets().h);
    const [offsetMinutes, setOffsetMinutes] = useState(() => getInitialOffsets().m);

    useEffect(() => {
        const maxH = getMaxOffsetHours();
        if (offsetHours > maxH) {
            setOffsetHours(maxH);
        }
    }, [boardDeadline]);

    useEffect(() => {
        if (!boardDeadline) return;

        const targetDate = new Date(boardDeadline);
        
        targetDate.setHours(targetDate.getHours() - offsetHours + 3);
        targetDate.setMinutes(targetDate.getMinutes() - offsetMinutes);
        targetDate.setSeconds(0);
        targetDate.setMilliseconds(0);

        const isoString = targetDate.toISOString();
        if (point.target_date !== isoString) {
            onUpdate("target_date", isoString);
        }
    }, [offsetHours, offsetMinutes, boardDeadline]);

    const handleHoursUp = () => {
        const maxH = getMaxOffsetHours();
        setOffsetHours((prev) => (prev >= maxH ? 0 : prev + 1));
    };

    const handleHoursDown = () => {
        const maxH = getMaxOffsetHours();
        setOffsetHours((prev) => (prev <= 0 ? maxH : prev - 1));
    };

    const handleMinutesUp = () => setOffsetMinutes((prev) => (prev + 5) % 60);
    const handleMinutesDown = () => setOffsetMinutes((prev) => (prev - 5 + 60) % 60);

    return (
        <div style={styles.row}>
            <div style={styles.inputContainer}>
                <Tag size={16} style={{ color: theme.colors.text.secondary, position: "absolute", left: "12px" }} />
                <input
                    type="text"
                    placeholder="Название этапа..."
                    value={point.title}
                    onChange={(e) => onUpdate("title", e.target.value)}
                    style={{
                        ...styles.input,
                        paddingLeft: "36px",
                        background: currentMode.formInput.background,
                        border: currentMode.formInput.border,
                        color: currentMode.formInput.color,
                    }}
                />
            </div>

            <div style={styles.timeSectionWrapper}>
                <span style={{ ...styles.labelText, color: theme.colors.text.secondary }}>за</span>
                
                <div style={styles.timePickerContainer}>
                    <div style={styles.timeColumn}>
                        <button type="button" onClick={handleHoursUp} style={styles.arrowBtn}>
                            <ChevronUp size={14} />
                        </button>
                        <div style={styles.timeDisplay}>{offsetHours}</div>
                        <button type="button" onClick={handleHoursDown} style={styles.arrowBtn}>
                            <ChevronDown size={14} />
                        </button>
                    </div>

                    <span style={{ ...styles.labelText, color: theme.colors.text.secondary, padding: "0 6px" }}>ч</span>

                    <div style={styles.timeColumn}>
                        <button type="button" onClick={handleMinutesUp} style={styles.arrowBtn}>
                            <ChevronUp size={14} />
                        </button>
                        <div style={styles.timeDisplay}>{String(offsetMinutes).padStart(2, "0")}</div>
                        <button type="button" onClick={handleMinutesDown} style={styles.arrowBtn}>
                            <ChevronDown size={14} />
                        </button>
                    </div>

                    <span style={{ ...styles.labelText, color: theme.colors.text.secondary, paddingLeft: "6px" }}>м</span>
                </div>

                <span style={{ ...styles.labelText, color: theme.colors.text.secondary }}>до дедлайна</span>
            </div>

            <button
                type="button"
                onClick={onRemove}
                style={styles.deleteButton}
                title="Удалить тайм-поинт"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
};

const styles = {
    row: {
        display: "flex",
        alignItems: "center",
        width: "100%",
        gap: "16px",
        boxSizing: "border-box" as const,
    },
    inputContainer: {
        position: "relative" as const,
        display: "flex",
        alignItems: "center",
        flex: 1,
        width: "100%",
    },
    input: {
        width: "100%",
        padding: "12px 14px",
        borderRadius: theme.borderRadius.medium,
        fontSize: "14px",
        fontFamily: "var(--font-rounded), system-ui, sans-serif",
        fontWeight: 500,
        outline: "none",
        boxSizing: "border-box" as const,
        transition: "all 0.2s ease",
    },
    timeSectionWrapper: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },
    timePickerContainer: {
        display: "flex",
        alignItems: "center",
        backgroundColor: "rgba(244, 246, 250, 0.8)",
        padding: "4px 12px",
        borderRadius: "14px",
        border: "1px solid #eef2f6",
    },
    timeColumn: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
    },
    arrowBtn: {
        background: "none",
        border: "none",
        color: "#94a3b8",
        cursor: "pointer",
        padding: "1px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    timeDisplay: {
        fontFamily: "var(--font-rounded), system-ui, sans-serif",
        minWidth: "28px",
        height: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "15px",
        fontWeight: 700,
        color: "#1e293b",
    },
    labelText: {
        fontFamily: "var(--font-rounded), system-ui, sans-serif",
        fontSize: "14px",
        fontWeight: 500,
        whiteSpace: "nowrap" as const,
    },
    deleteButton: {
        background: "none",
        border: "none",
        color: theme.colors.system.error,
        cursor: "pointer",
        padding: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: theme.borderRadius.small,
        transition: "all 0.2s ease",
    }
};

export default TimePointRow;
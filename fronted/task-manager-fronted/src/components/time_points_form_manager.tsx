import React from "react";
import { Plus, CalendarClock } from "lucide-react";
import { theme } from "../themes/themes";
import TimePointRow from "./time_point_row";
import type { ITimePoint } from "../hook/useBoards";

interface ITimePointsFormManagerProps {
    timePoints: ITimePoint[];
    boardDeadline: Date | null;
    onChange: (updatedPoints: ITimePoint[]) => void;
}

export const TimePointsFormManager: React.FC<ITimePointsFormManagerProps> = ({ timePoints, onChange, boardDeadline }) => {
    const handleAddPoint = () => {
        let defaultTargetDate = "";
        
    if (boardDeadline) {
        const defaultDate = boardDeadline instanceof Date 
            ? new Date(boardDeadline.getTime())
            : new Date(String(boardDeadline).replace(' ', 'T'));

        if (!isNaN(defaultDate.getTime())) {
            defaultDate.setHours(defaultDate.getHours() - 2);
            defaultTargetDate = defaultDate.toISOString().replace('Z', '');
        }
    }

        onChange([
            ...timePoints,
            { id: Date.now(), title: "", target_date: defaultTargetDate }
        ]);
    };

    const handleRemovePoint = (id: number) => {
        onChange(timePoints.filter(tp => tp.id !== id));
    };

    const handleFieldChange = (id: number, field: "title" | "target_date", value: string) => {
        const updated = timePoints.map(tp => {
            if (tp.id === id) {
                return { ...tp, [field]: value };
            }
            return tp;
        });
        onChange(updated);
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <CalendarClock size={18} style={{ color: theme.colors.brand.blue }} />
                    <label style={{ ...styles.mainLabel, color: theme.colors.text.primary }}>
                        Контрольные точки хакатона
                    </label>
                </div>
                <button
                    type="button"
                    onClick={handleAddPoint}
                    style={styles.addButton}
                >
                    <Plus size={16} />
                    Добавить поинт
                </button>
            </div>

            {timePoints.length === 0 ? (
                <div style={{ ...styles.emptyContainer, borderColor: theme.colors.text.muted + "33" }}>
                    <p style={{ ...styles.emptyText, color: theme.colors.text.secondary }}>
                        Список тайм-поинтов пуст. Нажмите «Добавить поинт», чтобы запланировать этапы.
                    </p>
                </div>
            ) : (
                <div style={styles.list}>
                    {timePoints.map((point) => (
                        <TimePointRow
                            boardDeadline={boardDeadline}
                            key={point.id}
                            point={point}
                            onUpdate={(field, value) => handleFieldChange(point.id ?? 0, field, value)}
                            onRemove={() => handleRemovePoint(point.id ?? 0)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "14px",
        width: "100%",
        marginTop: "8px",
        boxSizing: "border-box" as const,
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
    },
    mainLabel: {
        fontFamily: "var(--font-rounded), system-ui, sans-serif",
        fontSize: "15px",
        fontWeight: 600,
    },
    addButton: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "none",
        border: "none",
        color: theme.colors.brand.blue,
        fontFamily: "var(--font-rounded), system-ui, sans-serif",
        fontSize: "13px",
        fontWeight: 700,
        cursor: "pointer",
        padding: "4px 8px",
        borderRadius: "6px",
        transition: "opacity 0.2s ease",
        ":hover": { opacity: 0.8 }
    },
    emptyContainer: {
        width: "100%",
        padding: "20px",
        border: "1px dashed",
        borderRadius: theme.borderRadius.medium,
        textAlign: "center" as const,
        boxSizing: "border-box" as const,
    },
    emptyText: {
        fontSize: "13px",
        fontFamily: "var(--font-rounded), system-ui, sans-serif",
        margin: 0,
        fontWeight: 500,
    },
    list: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "12px",
        width: "100%",
    },
};

export default TimePointsFormManager;
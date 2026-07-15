import { useEffect, useState } from "react";
import { useDesignMode } from "../../../context/design_context";
import { useBoard, type IBoard, type IColumns, type ITimePoint } from "../../../hook/useBoards";
import { theme } from "../../../themes/themes";
import FormInput from "../../../components/form_input";
import ColumnsFormManager from "../../../components/columns_selector/columns_manager";
import { DeadlinePicker } from "../../../components/deadline_picker/deadline_picker";
import TimePointsFormManager from "../../../components/time_points_form_manager";
import { Timer } from "lucide-react";
import { formatToSqlTimestamp } from "../../../utils/formatters";

interface IHakatonBoardSettingsProps {
    onChange: (value: IBoard) => void;
    isReadOnly?: boolean; 
}

const HakatonBoardSettings: React.FC<IHakatonBoardSettingsProps> = ({ isReadOnly, onChange }) => {
    const { mode } = useDesignMode();
    const activeTheme = theme.modes[mode];
    const { selectedBoard } = useBoard();

    const [localTitle, setLocalTitle] = useState<string>(selectedBoard?.title ?? "");
    const [localDesc, setLocalDesc] = useState<string>(selectedBoard?.description ?? "");
    const [columns, setColumns] = useState<IColumns[]>(selectedBoard?.columns ?? []);
    const [deadline, setDeadline] = useState<Date | null>(
        selectedBoard?.deadline ? new Date(selectedBoard.deadline) : null
    );
    const [timePoints, setTimePoints] = useState<ITimePoint[]>(selectedBoard?.timePoints ?? []);

    useEffect(() => {
        if (!selectedBoard) return;

        const updatedBoard: IBoard = {
            ...selectedBoard,
            title: localTitle,
            description: localDesc,
            columns: columns,
            deadline: String(formatToSqlTimestamp(deadline)),
            timePoints: timePoints
        };
        onChange(updatedBoard);
    }, [localTitle, localDesc, columns, selectedBoard, onChange, timePoints, deadline]);

    return (
        <div style={{ ...activeTheme.searchBar, borderRadius: theme.borderRadius.xlarge, width: "auto", height: "auto", display: "flex", flexDirection: "column", padding: "25px", gap: "20px", marginBottom: "20px" }}>
            <FormInput
                id="board-name"
                label="Название доски"
                type="text"
                onChange={setLocalTitle}
                value={localTitle}
                maxLength={100}
                disabled={isReadOnly} 
                placeholder="Введите название доски"
            />

            <FormInput
                id="desc-board"
                label="Описание доски"
                onChange={setLocalDesc}
                value={localDesc}
                type="textarea"
                disabled={isReadOnly} 
                placeholder="Введите описание для доски"
            />

            {isReadOnly ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <label style={styles.sectionLabel}>Колонки доски</label>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Порядок</th>
                                <th style={styles.th}>Название колонки</th>
                            </tr>
                        </thead>
                        <tbody>
                            {columns.map((col, index) => (
                                <tr key={col.id || index} style={styles.tr}>
                                    <td style={styles.td}>{index + 1}</td>
                                    <td style={styles.td}>{col.name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <ColumnsFormManager
                    columns={columns}
                    onChange={setColumns}
                />
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{display: "flex", flexDirection: "row", gap: "6px", alignItems: "center"}}>
                    <Timer size={18} color="#0d6fff"/><label style={styles.sectionLabel}>Дедлайн проекта</label>
                </div>
                {isReadOnly ? (
                    <div style={styles.readOnlyTextValue}>
                        {deadline ? deadline.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Не установлен"}
                    </div>
                ) : (
                    <DeadlinePicker
                        value={deadline} 
                        onChange={setDeadline} 
                    />
                )}
            </div>

            {isReadOnly ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                    <label style={styles.sectionLabel}>Контрольные точки хакатона</label>
                    {timePoints.length === 0 ? (
                        <div style={styles.readOnlyTextValue}>Список контрольных точек пуст</div>
                    ) : (
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Этап</th>
                                    <th style={styles.th}>Дата и время (МСК)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {timePoints.map((point) => {
                                    const pointDate = point.target_date ? new Date(String(point.target_date).replace(' ', 'T')) : null;
                                    const formattedDate = pointDate && !isNaN(pointDate.getTime())
                                        ? pointDate.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                        : "Не указана";

                                    return (
                                        <tr key={point.id} style={styles.tr}>
                                            <td style={styles.td}>{point.title || "Без названия"}</td>
                                            <td style={styles.td}>{formattedDate}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            ) : (
                <div style={{ width: "100%", marginTop: "10px", marginBottom: "10px" }}>
                    <TimePointsFormManager 
                        boardDeadline={deadline}
                        timePoints={timePoints} 
                        onChange={setTimePoints} 
                    />
                </div>
            )}
        </div>
    );
};

export default HakatonBoardSettings;

const styles = {
    sectionLabel: { 
        fontSize: "14px", 
        fontWeight: 600, 
        color: "#0f172a", 
    },
    readOnlyTextValue: {
        fontSize: "14px",
        fontWeight: 500,
        color: "#1e293b",
        padding: "10px 14px",
        backgroundColor: "rgba(244, 246, 250, 0.5)",
        borderRadius: "8px",
        border: "1px solid #eef2f6",
        width: "fit-content"
    },
    table: {
        width: "100%",
        borderCollapse: "collapse" as const,
        marginTop: "4px",
        fontFamily: "var(--font-rounded), system-ui, sans-serif",
        background: "#f4f8ff",
        borderRadius: "16px"
    },
    th: {
        textAlign: "left" as const,
        padding: "10px 12px",
        fontSize: "13px",
        fontWeight: 600,
        color: "#64748b",
        borderBottom: "2px solid #eef2f6",
    },
    td: {
        padding: "10px 12px",
        fontSize: "14px",
        color: "#334155",
        borderBottom: "1px solid #eef2f6",
    },
    tr: {
        transition: "background-color 0.2s ease",
        ":hover": { backgroundColor: "rgba(244, 246, 250, 0.3)" }
    }
};
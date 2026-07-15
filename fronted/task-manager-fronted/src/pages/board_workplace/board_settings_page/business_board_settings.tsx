import { useEffect, useState } from "react";
import { useDesignMode } from "../../../context/design_context";
import { theme } from "../../../themes/themes";
import { useBoard, type IBoard, type IColumns } from "../../../hook/useBoards";
import FormInput from "../../../components/form_input";
import ColumnsFormManager from "../../../components/columns_selector/columns_manager";

interface IBusinessBoardSettingsProps {
    onChange: (value : IBoard) => void;
    isReadOnly?: boolean;
}

const BusinessBoardSettings : React.FC<IBusinessBoardSettingsProps> = ({isReadOnly, onChange}) => {
    const { mode } = useDesignMode();
    const activeTheme = theme.modes[mode];

    const {selectedBoard} = useBoard();

    const [localTitle, setLocalTitle] = useState<string>(selectedBoard?.title ?? "");
    const [localDesc, setLocalDesc] = useState<string>(selectedBoard?.description ?? "");
    const [columns, setColumns] = useState<IColumns[]>(selectedBoard?.columns ?? []);

    useEffect(() => {
        if (!selectedBoard) return;

        const updatedBoard: IBoard = {
            ...selectedBoard,
            title: localTitle,
            description: localDesc,
            columns: columns,
        };

        onChange(updatedBoard);
    }, [localTitle, localDesc, columns, selectedBoard, onChange]);

    return(
        <div style={{...activeTheme.searchBar, borderRadius: theme.borderRadius.xlarge, width: "auto", height: "auto", display: "flex", flexDirection: "column", padding: "25px", gap: "20px"}}>
            <FormInput
                id="board-name"
                label="Название доски"
                type="text"
                onChange={setLocalTitle}
                value={localTitle}
                maxLength={100}
                placeholder="Введите название доски (макс. 100 символов)"
                disabled={isReadOnly}
            />

            <FormInput
                id="desc-board"
                label="Описание доски"
                onChange={setLocalDesc}
                value={localDesc}
                type="textarea"
                placeholder="Введите описание для доски"
                disabled={isReadOnly}
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
        </div>
    );
}

export default BusinessBoardSettings;

const styles = {
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
    },
    sectionLabel: { 
        fontSize: "12px", 
        fontWeight: 700, 
        color: "#4b5563", 
        letterSpacing: "0.08em", 
        textTransform: "uppercase" as const 
    },
}
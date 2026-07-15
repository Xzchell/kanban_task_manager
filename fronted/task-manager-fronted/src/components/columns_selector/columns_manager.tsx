import React from "react";
import { Plus, Trash2, Columns } from "lucide-react";
import type { IColumns } from "../../hook/useBoards";
import { theme } from "../../themes/themes";
import FormInput from "../form_input";

interface IColumnsFormManagerProps {
    columns: IColumns[];
    onChange: (updatedColumns: IColumns[]) => void;
}

export const ColumnsFormManager: React.FC<IColumnsFormManagerProps> = ({ columns, onChange }) => {
    
    const handleAddColumn = () => {
        const nextIndex = columns.length;
        const newColumn: IColumns = {
        id: nextIndex,
        name: `Колонка ${nextIndex + 1}`,
        position: nextIndex
        };
        onChange([...columns, newColumn]);
    };

    const handleRemoveColumn = (indexToRemove: number) => {
        const filtered = columns.filter((_, index) => index !== indexToRemove);
        
        const reindexed = filtered.map((col, index) => ({
        ...col,
        id: index,
        position: index
        }));
        
        onChange(reindexed);
    };

    const handleNameChange = (indexToUpdate: number, newName: string) => {
        const updated = columns.map((col, index) => {
        if (index === indexToUpdate) {
            return { ...col, name: newName };
        }
        return col;
        });
        onChange(updated);
    };

    const handleBlurCheck = (indexToCheck: number, currentName: string) => {
        if (!currentName.trim()) {
        const restored = columns.map((col, index) => {
            if (index === indexToCheck) {
            return { ...col, name: `Колонка ${index + 1}` };
            }
            return col;
        });
        onChange(restored);
        }
    };

    return (
        <div style={styles.container}>
        <div style={styles.header}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Columns size={18} style={{ color: theme.colors.brand.blue }} />
            <span style={{ ...styles.mainLabel, color: theme.colors.text.primary }}>
                Колонки на доске
            </span>
            </div>
            <button type="button" onClick={handleAddColumn} style={styles.addButton}>
            <Plus size={16} />
            Добавить колонку
            </button>
        </div>

        {columns.length === 0 ? (
            <div style={{ ...styles.emptyContainer, borderColor: theme.colors.text.muted + "33" }}>
            <p style={{ ...styles.emptyText, color: theme.colors.text.secondary }}>
                Список колонок пуст. Добавьте колонки для этапов работы.
            </p>
            </div>
        ) : (
            <div style={styles.list}>
            {columns.map((col, index) => {
                const currentId = col.position; 

                return (
                <div key={`col-${currentId}`} style={styles.row}>
                    <div style={styles.inputWrapper}>
                    <Columns 
                        size={16} 
                        style={{ 
                        color: theme.colors.text.secondary, 
                        position: "absolute", 
                        left: "14px", 
                        zIndex: 2,
                        top: "50%",
                        transform: "translateY(-50%)"
                        }} 
                    />
                    <div style={{ width: "100%" }} onBlur={() => handleBlurCheck(index, col.name)}>
                        <FormInput
                        id={`column-input-${currentId}`}
                        label=""
                        type="text"
                        value={col.name}
                        onChange={(val) => handleNameChange(index, val)}
                        placeholder="Название колонки..."
                        maxLength={100}
                        inputStyle={{ paddingLeft: "40px" }}
                        containerStyle={{ gap: "0px", width: "100%" }}
                        />
                    </div>
                    </div>

                    <button
                    type="button"
                    onClick={() => handleRemoveColumn(index)}
                    style={styles.deleteButton}
                    title="Удалить колонку"
                    >
                    <Trash2 size={18} />
                    </button>
                </div>
                );
            })}
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
    row: {
        display: "flex",
        alignItems: "center",
        width: "100%",
        gap: "12px",
        boxSizing: "border-box" as const,
    },
    inputWrapper: {
        position: "relative" as const,
        display: "flex",
        alignItems: "center",
        flex: 1,
    },
    deleteButton: {
        background: "none",
        border: "none",
        color: theme.colors.system.error,
        cursor: "pointer",
        padding: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: theme.borderRadius.small,
    }
};

export default ColumnsFormManager;
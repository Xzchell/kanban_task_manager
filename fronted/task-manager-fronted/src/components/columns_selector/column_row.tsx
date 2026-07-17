import React from "react";
import { Trash2, Columns } from "lucide-react";
import type { IColumns } from "../../hook/useBoards"; 
import { theme } from "../../themes/themes";
import FormInput from "../form_input";

interface IColumnRowProps {
  column: IColumns;
  onUpdate: (name: string) => void;
  onRemove: () => void;
}

export const ColumnRow: React.FC<IColumnRowProps> = ({ column, onUpdate, onRemove }) => {
  return (
    <div style={styles.row}>
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
        <FormInput
            id={`column-input-${column.id ?? column.position}`} 
            type="text"
            value={column.name}
            onChange={onUpdate}
            placeholder="Название колонки (например, Тестирование)..."
            maxLength={100}
            label=""
        />
      </div>

      <button
        type="button"
        onClick={onRemove}
        style={styles.deleteButton}
        title="Удалить колонку"
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
    transition: "all 0.2s ease",
  }
};

export default ColumnRow;
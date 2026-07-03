import React, { useState, useEffect } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { ChevronUp, ChevronDown } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import { ru } from "date-fns/locale/ru";
import stylesModule from "../../components/deadline_picker/deadline_picker.module.css";

registerLocale("ru", ru);

interface DeadlinePickerProps {
    value: Date | null;
    onChange: (date: Date) => void;
}

export const DeadlinePicker: React.FC<DeadlinePickerProps> = ({ value, onChange }) => {
    const baseDate = value ? new Date(value) : new Date();

    const [hours, setHours] = useState(baseDate.getHours());
    const [minutes, setMinutes] = useState(Math.round(baseDate.getMinutes() / 5) * 5 % 60);

    useEffect(() => {
        if (value) {
            const currentSelected = new Date(value);
            currentSelected.setHours(hours);
            currentSelected.setMinutes(minutes);
            currentSelected.setSeconds(0);
            
            if (currentSelected.getTime() !== value.getTime()) {
                onChange(currentSelected);
            }
        }
    }, [hours, minutes]);

    const handleDateChange = (date: Date | null) => {
        if (!date) return;
        const updatedDate = new Date(date);
        updatedDate.setHours(hours);
        updatedDate.setMinutes(minutes);
        onChange(updatedDate);
    };

    const adjustHours = (amount: number) => {
        setHours((prev) => (prev + amount + 24) % 24);
    };

    const adjustMinutes = (amount: number) => {
        setMinutes((prev) => (prev + amount + 60) % 60);
    };

    const formatHeaderText = () => {
        if (!value) return "";
        const formattedMonths = [
            "января", "февраля", "марта", "апреля", "мая", "июня",
            "июля", "августа", "сентября", "октября", "ноября", "декабря"
        ];
        const day = value.getDate();
        const month = formattedMonths[value.getMonth()];
        const year = value.getFullYear();
        const displayHours = hours < 10 ? `0${hours}` : hours;
        const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;

        return `${day} ${month} ${year} г. в ${displayHours}:${displayMinutes}`;
    };

    return (
        <div style={styles.pickerBox}>
            <div style={styles.purpleHeader}>
                {formatHeaderText()}
            </div>
            <div style={styles.mainGrid}>
                <div style={styles.calendarWrapper} className={stylesModule.customPickerContainer}>
                    <DatePicker
                        selected={value}
                        onChange={handleDateChange}
                        inline
                        locale="ru"
                        dateFormat="dd.MM.yyyy"
                    />
                </div>
                <div style={styles.timeNode}>
                    <span style={styles.timeTitle}>ВРЕМЯ</span>
                    
                    <div style={styles.timeControlsRow}>
                        <div style={styles.timeColumn}>
                            <button type="button" onClick={() => adjustHours(1)} style={styles.arrowTime}><ChevronUp size={18} /></button>
                            <div style={styles.timeDisplay}>{hours < 10 ? `0${hours}` : hours}</div>
                            <button type="button" onClick={() => adjustHours(-1)} style={styles.arrowTime}><ChevronDown size={18} /></button>
                        </div>

                        <span style={styles.colonSeparator}>:</span>

                        <div style={styles.timeColumn}>
                            <button type="button" onClick={() => adjustMinutes(5)} style={styles.arrowTime}><ChevronUp size={18} /></button>
                            <div style={styles.timeDisplay}>{minutes < 10 ? `0${minutes}` : minutes}</div>
                            <button type="button" onClick={() => adjustMinutes(-5)} style={styles.arrowTime}><ChevronDown size={18} /></button>
                        </div>
                    </div>

                    <span style={styles.stepCaption}>шаг 5 мин</span>
                </div>
            </div>
        </div>
    );
};

const styles = {
    pickerBox: {
        display: "flex",
        flexDirection: "column" as const,
        border: "1px solid #eef2f6",
        borderRadius: "24px",
        backgroundColor: "#ffffff",
        overflow: "hidden",
        width: "100%",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.03)"
    },
    quickBar: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px 24px",
        backgroundColor: "#f4f5ff",
        borderBottom: "1px solid #eef2f6"
    },
    quickTitle: {
        fontSize: "11px",
        fontWeight: 700,
        color: "#94a3b8",
        letterSpacing: "0.08em"
    },
    quickButtonsContainer: {
        display: "flex",
        gap: "10px"
    },
    quickBtn: {
        padding: "6px 16px",
        borderRadius: "14px",
        border: "1px solid #e2e8f0",
        backgroundColor: "#ffffff",
        fontSize: "13px",
        fontWeight: 700,
        color: "#7177f4",
        cursor: "pointer",
        boxShadow: "0 2px 4px rgba(0,0,0,0.01)",
        transition: "transform 0.1s, border-color 0.2s"
    },
    mainGrid: {
        display: "flex",
        padding: "24px",
        alignItems: "center"
    },
    calendarWrapper: {
        flex: 1,
        display: "flex",
        justifyContent: "center",
        fontFamily: "var(--font-rounded)",
    },
    timeNode: {
        flex: 1,
        borderLeft: "1px solid #f1f5f9",
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: "24px"
    },
    timeTitle: {
        fontSize: "12px",
        fontWeight: 700,
        color: "#94a3b8",
        marginBottom: "20px",
        letterSpacing: "0.05em"
    },
    timeControlsRow: {
        display: "flex",
        alignItems: "center",
        gap: "8px"
    },
    timeColumn: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        gap: "4px"
    },
    arrowTime: {
        background: "none",
        border: "none",
        color: "#94a3b8",
        cursor: "pointer",
        padding: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "color 0.2s"
    },
    timeDisplay: {
        fontFamily: "var(--font-rounded)",
        width: "56px",
        height: "56px",
        borderRadius: "18px",
        backgroundColor: "#f4f6fa",
        border: "1px solid #eef2f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "22px",
        fontWeight: 800,
        color: "#1e293b",
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
    },
    colonSeparator: {
        fontSize: "24px",
        fontWeight: 800,
        color: "#cbd5e1",
        paddingBottom: "4px"
    },
    stepCaption: {
        fontSize: "12px",
        color: "#94a3b8",
        marginTop: "16px",
        fontWeight: 500
    },
    purpleHeader: {
        fontFamily: "var(--font-rounded)",
        backgroundColor: "#7177f4",
        color: "#ffffff",
        padding: "10px",
        textAlign: "center" as const,
        fontSize: "15px",
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        letterSpacing: "0.02em"
    }
};
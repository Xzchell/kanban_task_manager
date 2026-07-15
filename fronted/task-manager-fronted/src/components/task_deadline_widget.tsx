import { type FC, useState, useEffect } from "react";
import { LucideCalendarFold, Timer } from "lucide-react";
import type { ITimePoint } from "../hook/useBoards";

interface ITaskDeadlineWidgetProps {
    deadline: string | null;
    timePoint: ITimePoint | null | undefined;
    boardType: string;
}

const formatBusinessDeadline = (deadlineStr: string): string => {
    if (!deadlineStr || deadlineStr.trim() === "") return "";

    const isoStr = deadlineStr.includes(' ') && !deadlineStr.includes('T') 
        ? deadlineStr.replace(' ', 'T') 
        : deadlineStr;
        
    const date = new Date(isoStr);
    if (isNaN(date.getTime())) return deadlineStr; 

    const datePart = new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "short",
        year: "numeric"
    }).format(date);

    const timePart = new Intl.DateTimeFormat("ru-RU", {
        hour: "2-digit",
        minute: "2-digit"
    }).format(date);

    return `${datePart} в ${timePart}`;
};

const HackathonTimer: FC<{ targetDate: string; title: string }> = ({ targetDate, title }) => {
    const [timeLeft, setTimeLeft] = useState("");
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
        const updateTimer = () => {
            const isoStr = targetDate.includes(' ') && !targetDate.includes('T') 
                ? targetDate.replace(' ', 'T') 
                : targetDate;
                
            const diff = new Date(isoStr).getTime() - new Date().getTime();
            if (diff <= 0) {
                setTimeLeft("Время истекло");
                setIsUrgent(true);
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            
            setIsUrgent(hours < 2);
            setTimeLeft(`${hours}ч ${minutes}м`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000);
        return () => clearInterval(interval);
    }, [targetDate]);

    return (
        <div style={{...styles.widget}}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Timer size={14} color={isUrgent ? "#ef4444" : "#64748b"} />
                <span style={{ fontSize: "13px", fontWeight: 600, color: isUrgent ? "#b91c1c" : "#334155" }}>
                    До "{title}" осталось: 
                </span>
            </div>
            <span style={{ fontSize: "13px", fontWeight: 700, color: isUrgent ? "#ef4444" : "#0f172a" }}>
                {timeLeft}
            </span>
        </div>
    );
};

export const TaskDeadlineWidget: FC<ITaskDeadlineWidgetProps> = ({ deadline, timePoint, boardType }) => {
    if (boardType === "hakaton" && timePoint) {
        return <HackathonTimer targetDate={timePoint.target_date} title={timePoint.title || "Чекпоинт"} />;
    }

    if (deadline && deadline.trim() !== "") {
        return (
            <div style={styles.widget}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <LucideCalendarFold size={14} color="#64748b" />
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>Дедлайн:</span>
                </div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", marginLeft: "8px" }}>
                    {formatBusinessDeadline(deadline)}
                </span>
            </div>
        );
    }

    return null;
};

const styles = {
    widget: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxSizing: "border-box" as const,
        fontFamily: 'var(--font-rounded)',
    }
};
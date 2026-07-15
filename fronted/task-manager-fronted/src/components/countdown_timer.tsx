import React, { useState, useEffect } from "react";

interface CountdownTimerProps {
    deadlineStr?: string | null;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ deadlineStr }) => {
    const [timeLeft, setTimeLeft] = useState({ hours: "00", minutes: "00", seconds: "00" });

    useEffect(() => {
        if (!deadlineStr) {
            setTimeLeft({ hours: "00", minutes: "00", seconds: "00" });
            return;
        }

        const updateTimer = () => {
            const targetTime = new Date(deadlineStr).getTime();
            const currentTime = new Date().getTime();

            if (isNaN(targetTime)) {
                console.error("Некорректный формат даты дедлайна:", deadlineStr);
                setTimeLeft({ hours: "--", minutes: "--", seconds: "--" });
                return;
            }

            const diff = targetTime - currentTime;

            if (diff <= 0) {
                setTimeLeft({ hours: "00", minutes: "00", seconds: "00" });
                return;
            }

            const totalHours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            setTimeLeft({
                hours: String(totalHours).padStart(2, "0"),
                minutes: String(minutes).padStart(2, "0"),
                seconds: String(seconds).padStart(2, "0"),
            });
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        
        return () => clearInterval(interval);
    }, [deadlineStr]);

    return (
        <div style={styles.timerWrapper}>
            <div style={styles.timerBlock}>
                <span style={styles.timerNum}>{timeLeft.hours}</span>
                <span style={styles.timerLabel}>Ч</span>
            </div>
            <div style={styles.timerBlock}>
                <span style={styles.timerNum}>{timeLeft.minutes}</span>
                <span style={styles.timerLabel}>М</span>
            </div>
            <div style={styles.timerBlock}>
                <span style={styles.timerNum}>{timeLeft.seconds}</span>
                <span style={styles.timerLabel}>С</span>
            </div>
        </div>
    );
};

export default CountdownTimer;

const styles = {
    timerWrapper: {
        display: "flex",
        gap: "10px",
    },
    timerBlock: {
        border: '1.5px solid #ffffff20',
        backgroundColor: "rgba(255, 255, 255, 0.25)",
        borderRadius: "14px",
        width: "52px",
        height: "52px",
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(4px)",
    },
    timerNum: {
        fontSize: "18px",
        fontWeight: 700,
    },
    timerLabel: {
        fontSize: "9px",
        opacity: 0.8,
        fontWeight: 500,
    },
};
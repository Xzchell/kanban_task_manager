import React, { useEffect, useState } from "react";
import { theme } from "../themes/themes";
import { useDesignMode } from "../context/design_context";

interface IMiniDeadlineTimerProps {
    deadline: string;
}

interface ITimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isOver: boolean;
}

const calculateTimeLeft = (deadlineDate: string): ITimeLeft => {
    const difference = new Date(deadlineDate).valueOf() - new Date().valueOf();
    
    if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true };
    }

    return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isOver: false,
    };
};

const formatNumber = (num: number): string => {
    return num < 10 ? `0${num}` : `${num}`;
};

export const MiniDeadlineTimer: React.FC<IMiniDeadlineTimerProps> = ({ deadline }) => {
    const [timeLeft, setTimeLeft] = useState<ITimeLeft>(calculateTimeLeft(deadline));

    const { mode } = useDesignMode();
    const currentMode = theme.modes[mode];

    useEffect(() => {
        setTimeLeft(calculateTimeLeft(deadline));
        
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(deadline));
        }, 1000);

        return () => clearInterval(timer);
    }, [deadline]);

    if (timeLeft.isOver) {
        return (
            <div style={{...styles.expiredContainer, ...currentMode.searchBar, backgroundColor: "rgba(148, 163, 184, 0.1)",}}>
                <span style={styles.expiredText}>Время вышло! Дедлайн просрочен</span>
            </div>
        );
    }

    return (
        <div style={{...styles.container, ...currentMode.searchBar}}>

            <div style={styles.segment}>
                <span style={styles.label}>Дедлайн | </span>
            </div>            

            {
                timeLeft.days > 0 && 
                <>
                    <div style={styles.segment}>
                        <span style={styles.number}>{formatNumber(timeLeft.days)}</span>
                        <span style={styles.label}>дн</span>
                    </div>
                    <span style={styles.separator}>:</span>
                </>
            }

            {
                timeLeft.hours > 0 &&
                <>
                    <div style={styles.segment}>
                        <span style={styles.number}>{formatNumber(timeLeft.hours)}</span>
                        <span style={styles.label}>ч</span>
                    </div>
                    <span style={styles.separator}>:</span>                
                </>
            }

            {
                timeLeft.minutes > 0 &&

                <>
                <div style={styles.segment}>
                    <span style={styles.number}>{formatNumber(timeLeft.minutes)}</span>
                    <span style={styles.label}>мин</span>
                </div>
                <span style={styles.separator}>:</span>
                </>
            }
            <div style={styles.segment}>
                <span style={styles.number}>{formatNumber(timeLeft.seconds)}</span>
                <span style={styles.label}>сек</span>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "14px",
        padding: "6px 12px",
        gap: "4px",
        fontFamily: "var(--font-rounded)",
        margin: 0,
    },
    segment: {
        display: "flex",
        alignItems: "baseline",
        gap: "2px",
    },
    number: {
        fontSize: "17px",
        fontWeight: 700,
        color: "#000000",
    },
    label: {
        fontSize: "15px",
        fontWeight: 500,
        color: "rgba(0, 0, 0, 0.7)",
    },
    separator: {
        fontSize: "14px",
        fontWeight: 700,
        color: "rgba(0, 0, 0, 0.4)",
        paddingBottom: "2px",
    },
    expiredContainer: {
        display: "inline-flex",
        alignItems: "center",
        borderRadius: "14px",
        padding: "6px 12px",
        margin: 0,
        fontFamily: "var(--font-rounded)",
    },
    expiredText: {
        fontSize: "15px",
        fontWeight: 600,
        color: "#64748b",
    },
};

export default MiniDeadlineTimer;
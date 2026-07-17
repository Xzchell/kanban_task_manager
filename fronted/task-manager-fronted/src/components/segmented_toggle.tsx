import { motion } from "framer-motion";

export interface IToggleOption {
    id: string;
    label: string;
    onClick: () => void;
}

interface ISegmentedToggleProps {
    options: IToggleOption[];
    activeId: string;
    orientation?: "horizontal" | "vertical";
    gap?: string;
    normalColor?: string;
    priorityColor?: string;
}

const SegmentedToggle: React.FC<ISegmentedToggleProps> = ({ 
    options, 
    activeId, 
    orientation = "horizontal",
    gap = "6px",
    normalColor = "#6b7280",
    priorityColor = "#0d6fff"
}) => {
    const isVertical = orientation === "vertical";

    return (
        <div style={{
            ...styles.toggleContainer,
            gap: gap,
            gridAutoFlow: isVertical ? ("row" as const) : ("column" as const),
            gridAutoRows: isVertical ? "1fr" : undefined,
            gridAutoColumns: isVertical ? undefined : "1fr",
        }}>
            {options.map((option) => {
                const isActive = option.id === activeId;

                return (
                    <button
                        key={option.id}
                        type="button"
                        onClick={option.onClick}
                        style={{
                            ...styles.button,
                            color: isActive ? "#ffffff" : normalColor,
                        }}
                    >
                        {isActive && (
                            <motion.span
                                layoutId="tab-pill"
                                style={{
                                    ...styles.pill,
                                    backgroundColor: priorityColor,
                                    boxShadow: `0 8px 24px ${priorityColor}40`, 
                                }}
                                transition={{ 
                                    type: "spring", 
                                    stiffness: 380, 
                                    damping: 30 
                                }}
                            />
                        )}
                        <span style={styles.label}>{option.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default SegmentedToggle;

const styles = {
    toggleContainer: {
        display: "grid",
        padding: "6px",
        backgroundColor: "rgba(240, 244, 255, 0.7)",
        borderRadius: "22px",
        marginBottom: "28px",
        position: "relative" as const,
    },
    button: {
        position: "relative" as const,
        paddingTop: "14px",
        paddingBottom: "14px",
        borderRadius: "16px",
        fontSize: "15px",
        fontWeight: 700,
        border: "none",
        background: "none",
        cursor: "pointer",
        outline: "none",
        fontFamily: "inherit",
        transition: "color 0.3s ease",
        zIndex: 10,
    },
    label: {
        position: "relative" as const,
        zIndex: 11,
    },
    pill: {
        position: "absolute" as const,
        inset: 0,
        borderRadius: "16px",
        zIndex: 1,
    },
};
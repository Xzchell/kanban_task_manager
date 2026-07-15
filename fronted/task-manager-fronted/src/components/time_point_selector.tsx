import React, { useState, useRef, useEffect } from "react";
import { theme } from "../themes/themes";
import { useDesignMode } from "../context/design_context";
import { Timer, ChevronDown } from "lucide-react";
import type { ITimePoint } from "../hook/useBoards";
import { formatUtcTime } from "../utils/formatters";

interface ITimePointSelectorProps {
    timePoints: ITimePoint[];
    selectedId: number | null;
    onChange: (id: number | null) => void;
}

export const TimePointSelector: React.FC<ITimePointSelectorProps> = ({ timePoints, selectedId, onChange }) => {
    const { mode } = useDesignMode();
    const currentMode = theme.modes[mode];
    
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedTimePoint = timePoints.find(tp => tp.id === selectedId);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (id: number | null) => {
        onChange(id);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} style={styles.container}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    ...styles.selectTrigger,
                    background: currentMode.formInput.background,
                    border: currentMode.formInput.border,
                    color: currentMode.formInput.color,
                    borderRadius: theme.borderRadius.medium,
                }}
            >
                <div style={styles.leftInfo}>
                    <Timer size={18} style={{ color: theme.colors.text.secondary, minWidth: "18px" }} />
                    <span style={styles.triggerText}>
                        {selectedTimePoint 
                            ? `${selectedTimePoint.title} — (${formatUtcTime(selectedTimePoint.target_date)})`
                            : "Без привязки к тайм-поинту"
                        }
                    </span>
                </div>
                <ChevronDown 
                    size={16} 
                    style={{ 
                        color: theme.colors.text.secondary,
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                    }} 
                />
            </div>

            {isOpen && (
                <div
                    style={{
                        ...styles.dropdown,
                        background: mode === 'glass' ? 'rgba(255, 255, 255, 0.8)' : currentMode.formInput.background,
                        border: currentMode.formInput.border,
                        backdropFilter: mode === 'glass' ? 'blur(16px)' : 'none',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    }}
                >
                    <div
                        onClick={() => handleSelect(null)}
                        style={{
                            ...styles.dropdownItem,
                            color: currentMode.formInput.color,
                            fontWeight: !selectedId ? 600 : 500,
                            backgroundColor: !selectedId ? 'rgba(0,0,0,0.04)' : 'transparent'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = !selectedId ? 'rgba(0,0,0,0.04)' : 'transparent'}
                    >
                        Без привязки к тайм-поинту
                    </div>

                    {timePoints.map((tp) => {
                        const isSelected = tp.id === selectedId;
                        const dateStr = formatUtcTime(tp.target_date);
                        
                        return (
                            <div
                                key={tp.id}
                                onClick={() => handleSelect(tp.id)}
                                style={{
                                    ...styles.dropdownItem,
                                    color: currentMode.formInput.color,
                                    fontWeight: isSelected ? 600 : 500,
                                    backgroundColor: isSelected ? 'rgba(0,0,0,0.04)' : 'transparent'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isSelected ? 'rgba(0,0,0,0.04)' : 'transparent'}
                            >
                                <span style={styles.tpTitle}>{tp.title}</span>
                                <span style={{ ...styles.tpTime, color: theme.colors.text.secondary }}>({dateStr})</span>
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
        position: "relative" as const,
        width: "100%",
    },
    selectTrigger: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        fontSize: "15px",
        fontFamily: "var(--font-rounded), system-ui, sans-serif",
        fontWeight: 500,
        cursor: "pointer",
        userSelect: "none" as const,
        transition: "all 0.2s ease",
    },
    leftInfo: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        overflow: "hidden",
    },
    triggerText: {
        whiteSpace: "nowrap" as const,
        overflow: "hidden",
        textOverflow: "ellipsis" as const,
    },
    dropdown: {
        position: "absolute" as const,
        top: "calc(100% + 6px)",
        left: 0,
        right: 0,
        borderRadius: "12px",
        maxHeight: "240px",
        overflowY: "auto" as const,
        zIndex: 1000,
        padding: "6px",
    },
    dropdownItem: {
        padding: "10px 12px",
        borderRadius: "8px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: "var(--font-rounded), system-ui, sans-serif",
        fontSize: "14px",
        transition: "background 0.15s ease",
        marginBottom: "2px",
    },
    tpTitle: {
        overflow: "hidden",
        textOverflow: "ellipsis" as const,
        whiteSpace: "nowrap" as const,
        marginRight: "8px",
    },
    tpTime: {
        fontSize: "13px",
        whiteSpace: "nowrap" as const,
    },
};
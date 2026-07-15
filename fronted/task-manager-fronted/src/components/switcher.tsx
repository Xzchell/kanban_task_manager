import React from "react";
import { theme } from "../themes/themes";
import { useDesignMode } from "../context/design_context";


interface IToggleSwitchProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

export const ToggleSwitch: React.FC<IToggleSwitchProps> = ({ label, checked, onChange, disabled = false }) => {
    const { mode } = useDesignMode();
    const currentMode = theme.modes[mode].switch;

    const containerStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        padding: "14px 16px",
        borderRadius: theme.borderRadius.medium,
        backgroundColor: mode === "glass" ? "rgba(255, 255, 255, 0.35)" : "#f8fafc",
        border: mode === "glass" ? "1px solid rgba(255, 255, 255, 0.4)" : "1px solid #e2e8f0",
        backdropFilter: mode === "glass" ? "blur(16px)" : "none",
        WebkitBackdropFilter: mode === "glass" ? "blur(16px)" : "none",
        boxShadow: mode === "glass" ? "0 4px 12px rgba(0, 0, 0, 0.02)" : "none",
        cursor: disabled ? "not-allowed" : "pointer",
        userSelect: "none",
        opacity: disabled ? 0.5 : 1,
        boxSizing: "border-box",
        transition: "all 0.2s ease-in-out",
    };

    const labelStyle: React.CSSProperties = {
        color: currentMode.labelColor,
        fontSize: "15px",
        fontWeight: 500,
        fontFamily: "var(--font-rounded, sans-serif)",
    };

    const trackStyle: React.CSSProperties = {
        position: "relative",
        width: "46px",
        height: "26px",
        borderRadius: "100px",
        transition: "background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        backgroundColor: checked ? currentMode.checkedBackground : currentMode.uncheckedBackground,
        boxShadow: checked ? currentMode.shadow : "none",
    };

    const handleStyle: React.CSSProperties = {
        position: "absolute",
        top: "3px",
        left: "3px",
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        backgroundColor: currentMode.handleBackground,
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
        transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: checked ? "translateX(20px)" : "translateX(0)",
    };

    const hiddenInputStyle: React.CSSProperties = {
        position: "absolute",
        opacity: 0,
        width: 0,
        height: 0,
        margin: 0,
    };

    return (
        <label style={containerStyle}>
            <span style={labelStyle}>{label}</span>
            <div style={trackStyle}>
                <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.checked)}
                    style={hiddenInputStyle}
                />
                <div style={handleStyle} />
            </div>
        </label>
    );
};
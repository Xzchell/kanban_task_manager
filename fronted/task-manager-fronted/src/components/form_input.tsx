import React, { useState } from "react";
import { EyeIcon, EyeOff } from "lucide-react";

export interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
    id: string;
    label: string;
    type: "text" | "email" | "password";
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    helperText?: string;
    containerStyle?: React.CSSProperties;
    labelStyle?: React.CSSProperties;
    inputStyle?: React.CSSProperties;
}

const defaultStyles = {
    container: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "10px",
        width: "100%",
    },
    label: {
        fontSize: "12px",
        fontWeight: 700,
        color: "#4b5563",
        letterSpacing: "0.08em",
        textTransform: "uppercase" as const,
    },
    inputWrapper: {
        position: "relative" as const,
        width: "100%",
    },
    input: {
        width: "100%",
        padding: "16px 18px",
        borderRadius: "18px",
        border: "1px solid #e5e7eb",
        background: "rgba(248, 249, 255, 0.7)",
        fontSize: "15px",
        color: "#111827",
        outline: "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxSizing: "border-box" as const,
    },
    eyeButton: {
        position: "absolute" as const,
        right: "14px",
        top: "50%",
        transform: "translateY(-50%)",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    helperText: {
        fontSize: "13px",
        color: "#6b7280",
    },
};

const FormInput: React.FC<FormInputProps> = ({
    id,
    label,
    type,
    value,
    onChange,
    placeholder,
    helperText,
    containerStyle,
    labelStyle,
    inputStyle,
    ...inputProps
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const actualType = type === "password" ? (showPassword ? "text" : "password") : type;

    return (
        <div style={{ ...defaultStyles.container, ...containerStyle }}>
            <label htmlFor={id} style={{ ...defaultStyles.label, ...labelStyle }}>
                {label}
            </label>
            <div style={defaultStyles.inputWrapper}>
                <input
                    id={id}
                    type={actualType}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    style={{ ...defaultStyles.input, ...inputStyle }}
                    {...inputProps}
                />
                {type === "password" && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        style={defaultStyles.eyeButton}
                    >
                        {showPassword ? (
                            <EyeOff size={18} color="#6b7280" />
                        ) : (
                            <EyeIcon size={18} color="#6b7280" />
                        )}
                    </button>
                )}
            </div>
            {helperText && <span style={defaultStyles.helperText}>{helperText}</span>}
        </div>
    );
};

export default FormInput;

import React, { useState, useRef, useEffect } from "react";
import { EyeIcon, EyeOff } from "lucide-react";
import { useDesignMode } from "../context/design_context";
import { theme } from "../themes/themes";

export interface FormInputProps extends Omit<React.AllHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>, "type" | "value" | "onChange"> {
    id: string;
    label: string;
    type: "text" | "email" | "password" | "date-time" | "date-only" | "textarea";
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    helperText?: string;
    containerStyle?: React.CSSProperties;
    labelStyle?: React.CSSProperties;
    inputStyle?: React.CSSProperties;
    rows?: number;
}

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
    rows = 3,
    ...inputProps 
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const { mode } = useDesignMode();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    const isPassword = type === "password";
    const isTextArea = type === "textarea";

    const getNativeInputType = (): string => {
        if (isPassword) {
            return showPassword ? "text" : "password";
        }
        if (type === "date-only") {
            return "date";
        }
        if (type === "date-time") {
            return "datetime-local";
        }
        return type; 
    };

    const actualType = getNativeInputType();

    useEffect(() => {
        if (isTextArea && textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value, isTextArea]);

    const combinedInputStyle = {
        ...defaultStyles.input,
        ...theme.modes[mode].formInput,
        paddingRight: isPassword ? "44px" : "18px",
        ...(isTextArea ? defaultStyles.textareaAdditional : {}),
        ...inputStyle
    };

    return (
        <div style={{ ...defaultStyles.container, ...containerStyle }}>
            <label htmlFor={id} style={{ ...defaultStyles.label, color: theme.colors.text.secondary, ...labelStyle }}>
                {label}
            </label>
            <div style={defaultStyles.inputWrapper}>
                {isTextArea ? (
                    <textarea
                        id={id}
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        rows={rows}
                        style={combinedInputStyle as React.CSSProperties}
                        {...(inputProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                    />
                ) : (
                    <input
                        id={id}
                        type={actualType}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        style={combinedInputStyle}
                        {...(inputProps as React.InputHTMLAttributes<HTMLInputElement>)}
                    />
                )}
                
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        style={defaultStyles.eyeButton}
                    >
                        {showPassword ? (
                            <EyeOff size={18} color={theme.colors.text.muted} />
                        ) : (
                            <EyeIcon size={18} color={theme.colors.text.muted} />
                        )}
                    </button>
                )}
            </div>
            {helperText && <span style={{ ...defaultStyles.helperText, color: theme.colors.text.muted }}>{helperText}</span>}
        </div>
    );
};

export default FormInput;

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
        fontSize: "15px",
        outline: "none",
        transition: "border-color 0.2s, box-shadow 0.2s, background-color 0.3s ease, border 0.3s ease",
        boxSizing: "border-box" as const,
    },
    textareaAdditional: {
        minHeight: "80px",
        resize: "none" as const,
        fontFamily: "inherit",
        overflowY: "hidden" as const,
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
    },
};
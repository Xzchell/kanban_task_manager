export const theme = {
    colors: {
        system: {
            error: "#ef4444",
            errorBg: "rgba(254, 242, 242, 0.2)",
            errorBorder: "rgba(248, 113, 113, 0.4)",
            success: "#10b981",
            focusShadow: "rgba(13, 111, 255, 0.15)",
            errorShadow: "rgba(239, 68, 68, 0.15)",
        },
        bg: {
            main: "#eef4ff",
            button: "#f8fafc",
        },
        text: {
            primary: "#0f172a",
            secondary: "#666666",
            muted: "#94a3b8",
        },
        brand: {
            blue: "#0d6fff",
            purple: "#8b5cf6",
        }
    },

    borderRadius: {
        small: "8px",
        medium: "14px",
        large: "16px", 
        xlarge: "24px",
    },

    modes: {
        color: {
            column: {
                backgroundColor: "#f1f5f9",
                border: "1px solid #e2e8f0",
                color: "#475569"
            },
            card: {
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.03)",
            },
            sidebar: {
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05)",
            },
            otpBase: {
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                color: "#0f172a",
            },
            errorAlert: {
                background: "#fef2f2",
                border: "1px solid #fca5a5",
                color: "#991b1b",
            },
            formInput: {
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                color: "#0f172a",
            },
            modal: {
                backdropBackground: "rgba(15, 23, 42, 0.3)",
                backdropFilter: "none",
                WebkitBackdropFilter: "none",
                cardBackground: "#ffffff",
                border: "1px solid #e2e8f0",
                boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.15)",
            },
            searchBar: {
                background: "#f1f5f9",
                border: "1.5px solid #e2e8f0",
                color: "#0f172a",
            },
            switch: {
                uncheckedBackground: "#e2e8f0",
                checkedBackground: "#0d6fff",
                handleBackground: "#ffffff",
                labelColor: "#0f172a",
                shadow: "0 2px 4px rgba(0,0,0,0.1)"
            },
            filterDrawer: {
                divider: "1px solid #f1f5f9",
                optNormal: {
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    color: "#334155",
                },
                optActive: {
                    background: "#0d6fff",
                    border: "1px solid #0d6fff",
                    color: "#ffffff",
                    boxShadow: "0 4px 12px rgba(13, 111, 255, 0.2)",
                }
            }
        },
        glass: {
            column: {
                backgroundColor: "rgba(255, 255, 255, 0.25)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "#1e293b"
            },
            card: {
                backgroundColor: "rgba(255, 255, 255, 0.65)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.4), 0 20px 25px -5px rgba(0, 0, 0, 0.05)",
                transform: "translateZ(0)",
                willChange: "transform",
            },
            sidebar: {
                backgroundColor: "rgba(255, 255, 255, 0.35)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.4)",
                boxShadow: "0 1px 0 0 rgba(255, 255, 255, 0.2) inset, 0 0 0 1px rgba(0, 0, 0, 0.06), 0 20px 40px -15px rgba(0, 0, 0, 0.15)",
                transform: "translateZ(0)", 
                willChange: "transform",
            },
            otpBase: {
                background: "rgba(255, 255, 255, 0.8)", 
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.6)",
                boxShadow: "0 1px 0 0 rgba(255, 255, 255, 0.5) inset, 0 4px 6px -1px rgba(0, 0, 0, 0.04)",
                color: "#0f172a",
            },
            errorAlert: {
                background: "linear-gradient(135deg, rgba(254, 242, 242, 0.85) 0%, rgba(254, 226, 226, 0.9) 100%)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                border: "1px solid rgba(239, 68, 68, 0.35)",
                boxShadow: "0 8px 16px -4px rgba(239, 68, 68, 0.06)",
                color: "#991b1b",
            },
            formInput: {
                background: "rgba(255, 255, 255, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                color: "#0f172a",
            },
            modal: {
                backdropBackground: "rgba(15, 23, 42, 0.2)",
                backdropFilter: "blur(16px)", 
                WebkitBackdropFilter: "blur(16px)",
                cardBackground: "rgba(255, 255, 255, 0.85)",
                border: "1px solid rgba(255, 255, 255, 0.6)",
                boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.5), 0 30px 60px -15px rgba(15, 23, 42, 0.15)",
            },
            searchBar: {
                background: "rgba(255, 255, 255, 0.45)",
                border: "1.5px solid rgba(255, 255, 255, 0.4)",
                color: "#0f172a",
                backdropFilter: "blur(16px)", 
                WebkitBackdropFilter: "blur(16px)",
                boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.5), 0 30px 60px -15px rgba(15, 23, 42, 0.15)",
            },
            switch: {
                uncheckedBackground: "rgba(15, 23, 42, 0.15)",
                checkedBackground: "#0d6fff",
                handleBackground: "#ffffff",
                labelColor: "#0f172a",
                shadow: "0 4px 10px rgba(13, 111, 255, 0.2)"
            },
        filterDrawer: {
                divider: "1px solid rgba(255, 255, 255, 0.2)",
                optNormal: {
                    background: "rgba(255, 255, 255, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    color: "#0f172a",
                },
                optActive: {
                    background: "#0d6fff",
                    border: "1px solid #0d6fff",
                    color: "#ffffff",
                    boxShadow: "0 6px 16px rgba(13, 111, 255, 0.35)",
                }
            }
        }
    }
};

export type ThemeType = typeof theme;
export type DesignMode = 'color' | 'glass';
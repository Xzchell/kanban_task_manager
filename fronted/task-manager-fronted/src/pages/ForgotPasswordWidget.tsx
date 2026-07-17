import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Mail, Lock } from "lucide-react";
import { OTPInput, REGEXP_ONLY_DIGITS } from "input-otp";
import { useAuth } from "../context/auth_context";
import { useDesignMode } from "../context/design_context";
import { theme } from "../themes/themes";
import DefaultButton from "../components/default_button";
import FormInput from "../components/form_input";
import { AnimatedBackground } from "../components/animated_background";

const ChangePasswordPage: React.FC = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const { mode } = useDesignMode();
    const activeDesign = theme.modes[mode];

    const email = auth?.user?.email || "";

    const [step, setStep] = useState(0); 
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [otpString, setOtpString] = useState("");
    const [otpError, setOtpError] = useState(false);
    const [otpShake, setOtpShake] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(30);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const hasRequestedCode = useRef(false);

    useEffect(() => {
        if (email && auth?.sendResetPasswordCode && !hasRequestedCode.current) {
            hasRequestedCode.current = true;
            auth.sendResetPasswordCode(email);
        }
    }, [email, auth]);

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const interval = setInterval(() => {
            setResendCooldown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [resendCooldown]);

    const handleVerifyOtp = async () => {
        if (otpString.length !== 6) return;

        setIsLoading(true);
        setErrorMessage(null);
        setOtpError(false);

        if (auth?.verifyResetPasswordCode && email) {
            const result = await auth.verifyResetPasswordCode(email, otpString);
            
            if (result.success) {
                setStep(1); 
            } else {
                setOtpError(true);
                setOtpShake(true);
                setErrorMessage(result.message || "Неверный код подтверждения");
                setOtpString("");
                setTimeout(() => setOtpShake(false), 500);
            }
        } else {
            setErrorMessage("Метод восстановления пароля не найден в контексте");
        }
        setIsLoading(false);
    };

    const handleResendOtp = () => {
        if (!email) return;
        setOtpString("");
        setOtpError(false);
        setErrorMessage(null);
        setResendCooldown(30);
        if (auth?.sendResetPasswordCode) {
            auth.sendResetPasswordCode(email);
        }
    };

    const handleSavePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!password || !confirmPassword) {
            setErrorMessage("Заполните все поля");
            return;
        }
        
        if (password !== confirmPassword) {
            setErrorMessage("Пароли не совпадают");
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            if (auth?.resetPasswordConfirm && email) {
                const result = await auth.resetPasswordConfirm(email, password);

                if (result.success) {
                    navigate("/profile"); 
                } else {
                    setErrorMessage(result.message || "Не удалось сохранить новый пароль");
                }
            } else {
                setErrorMessage("Метод сохранения пароля не найден в контексте");
            }
        } catch (error) {
            console.error("Ошибка при сохранении пароля:", error);
            setErrorMessage("Произошла непредвиденная ошибка на сервере");
        } finally {
            setIsLoading(false);
        }
    };

    const isOtpComplete = otpString.length === 6;

    return (
        <div style={styles.screenContainer}>
            <AnimatedBackground />
            <motion.div
                key="forgot-password-card"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                style={{ ...styles.card, backgroundColor: activeDesign.card.backgroundColor ?? '#ffffff' }}
            >
                <AnimatePresence mode="wait">
                    {step === 0 ? (
                        <motion.div
                            key="step-otp"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={styles.form}
                        >
                            <div style={styles.iconWrapper}>
                                <Mail size={32} color="#0d6fff" />
                            </div>

                            <div style={styles.textContainer}>
                                <h3 style={styles.title}>Подтверждение</h3>
                                <p style={styles.subtitle}>
                                    Мы отправили код на почту <span style={styles.emailHighlight}>{email}</span>
                                </p>
                            </div>

                            <div style={{ flexGrow: 1 }} />

                            <motion.div
                                animate={otpShake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
                                transition={{ duration: 0.45 }}
                            >
                                <OTPInput
                                    pattern={REGEXP_ONLY_DIGITS}
                                    maxLength={6}
                                    value={otpString}
                                    onChange={(val) => {
                                        setOtpString(val);
                                        setOtpError(false);
                                        setErrorMessage(null);
                                    }}
                                    autoFocus
                                    type="text"
                                    inputMode="numeric"
                                    disabled={isLoading}
                                    render={({ slots }) => (
                                        <div style={styles.otpRow}>
                                            {slots.map((slot, idx) => {
                                                let currentSlotStyle = {
                                                    ...styles.otpInput,
                                                    ...theme.modes[mode].otpBase
                                                };

                                                if (slot.char) currentSlotStyle = { ...currentSlotStyle, ...styles.otpInputActive };
                                                if (slot.isActive) currentSlotStyle = { ...currentSlotStyle, ...styles.otpInputFocused };
                                                if (otpError || errorMessage) currentSlotStyle = { ...currentSlotStyle, ...styles.otpInputError };

                                                return (
                                                    <div key={idx} style={currentSlotStyle}>
                                                        {slot.char}
                                                        {slot.hasFakeCaret && <div style={styles.fakeCaret} />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                />
                            </motion.div>

                            {errorMessage && (
                                <div style={{ ...styles.message, ...activeDesign.errorAlert }}>
                                    {errorMessage}
                                </div>
                            )}

                            <div style={{ flexGrow: 1 }} />

                            <DefaultButton
                                text={isLoading ? "Проверка..." : "Подтвердить код"}
                                status="primary"
                                fullWidth={true}
                                br="18px"
                                onClick={handleVerifyOtp}
                                disabled={!isOtpComplete || isLoading}
                            />

                            <div style={styles.bottomRow}>
                                {resendCooldown > 0 ? (
                                    <span>
                                        Отправить повторно через <span style={styles.cooldownText}>{resendCooldown}с</span>
                                    </span>
                                ) : (
                                    <button type="button" onClick={handleResendOtp} style={styles.resendLink}>
                                        <RefreshCw size={12} style={{ marginRight: '4px' }} />
                                        Отправить повторно
                                    </button>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
                                <button type="button" onClick={() => navigate(-1)} style={styles.backFormLink} disabled={isLoading}>
                                    Назад
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step-password"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={styles.form}
                        >
                            <div style={styles.iconWrapper}>
                                <Lock size={32} color="#0d6fff" />
                            </div>

                            <div style={styles.textContainer}>
                                <h3 style={styles.title}>Новый пароль</h3>
                                <p style={styles.subtitle}>Придумайте сложный пароль для защиты</p>
                            </div>

                            <form onSubmit={handleSavePassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>
                                <FormInput
                                    id="new-password"
                                    label="Новый пароль"
                                    type="password"
                                    value={password}
                                    onChange={setPassword}
                                    placeholder="••••••••"
                                    required
                                />
                                <FormInput
                                    id="confirm-password"
                                    label="Повторите пароль"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={setConfirmPassword}
                                    placeholder="••••••••"
                                    required
                                />

                                {errorMessage && (
                                    <div style={{ ...styles.message, ...activeDesign.errorAlert }}>
                                        {errorMessage}
                                    </div>
                                )}

                                <DefaultButton
                                    text={isLoading ? "Сохранение..." : "Изменить пароль"}
                                    status="primary"
                                    fullWidth={true}
                                    br="18px"
                                    onClick={() => {}}
                                    disabled={isLoading}
                                />
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ChangePasswordPage;

const styles = {
    screenContainer: {
        fontFamily: "var(--font-rounded)",
        position: 'relative' as const,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    card: {
        position: 'relative' as const,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column' as const,
        borderRadius: '24px',
        padding: '32px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        boxSizing: 'border-box' as const,
    },
    form: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '18px',
        alignItems: 'center',
        width: '100%',
        flexGrow: 1,
    },
    textContainer: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '4px',
        alignItems: 'center',
    },
    title: {
        margin: 0,
        fontSize: '24px',
        fontWeight: 800,
        lineHeight: 1.1,
        color: '#111827',
    },
    subtitle: {
        margin: '4px 0 0',
        color: '#6b7280',
        fontSize: '15px',
        lineHeight: 1.4,
        textAlign: 'center' as const,
    },
    emailHighlight: {
        color: '#111827',
        fontWeight: 700,
    },
    otpRow: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '8px',
        marginTop: '10px',
    },
    otpInput: {
        width: '54px',
        height: '54px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        fontWeight: 800,
        borderRadius: theme.borderRadius.large,
        boxSizing: 'border-box' as const,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative' as const,
        outline: 'none',
        textAlign: 'center' as const,
    },
    otpInputActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderColor: '#0d6fff',
    },
    otpInputFocused: {
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        borderColor: '#0d6fff',
        color: '#0d6fff',
        boxShadow: `0 0 0 4px ${theme.colors.system.focusShadow}, 0 1px 0 0 rgba(255, 255, 255, 0.2) inset`,
        transform: 'scale(1.02)',
    },
    otpInputError: {
        background: 'linear-gradient(135deg, rgba(254, 242, 242, 0.5) 0%, rgba(239, 68, 68, 0.08) 100%)',
        borderColor: theme.colors.system.error,
        color: theme.colors.system.error,
        boxShadow: `0 0 0 4px ${theme.colors.system.errorShadow}, 0 4px 10px -2px rgba(239, 68, 68, 0.1)`,
    },
    fakeCaret: {
        position: "absolute" as const,
        width: "2px",
        height: "22px",
        backgroundColor: "#0d6fff",
        animation: "input-otp-blink 1s step-end infinite",
    },
    message: {
        borderRadius: '16px',
        padding: '12px 16px',
        fontSize: '14px',
        textAlign: 'center' as const,
        marginTop: '6px',
        width: '100%',
        boxSizing: 'border-box' as const,
    },
    bottomRow: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '6px',
        marginTop: '6px',
        color: '#6b7280',
        fontSize: '14px',
    },
    cooldownText: {
        color: '#0d6fff',
        fontWeight: 700,
    },
    resendLink: {
        display: 'flex',
        alignItems: 'center',
        border: 'none',
        background: 'transparent',
        color: '#2563eb',
        fontWeight: 700,
        cursor: 'pointer',
        padding: 0,
        fontSize: '14px',
    },
    iconWrapper: {
        width: '64px',
        height: '64px',
        borderRadius: '25%',
        backgroundColor: 'rgba(13, 111, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '4px',
    },
    backFormLink: {
        border: 'none',
        background: 'transparent',
        color: '#9ca3af',
        fontWeight: 600,
        cursor: 'pointer',
        padding: '4px 8px',
        fontSize: '14px',
        transition: 'color 0.2s',
    },
};
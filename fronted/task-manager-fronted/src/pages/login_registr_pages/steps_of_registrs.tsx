import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import FormInput from "../../components/form_input";
import DefaultButton from "../../components/default_button";
import ProgressBar from "../../components/progress_bar";
import type { IUserData } from "../../context/auth_provider";
import { useAuth } from "../../context/auth_context";

interface StepsRegistrProps {
    onSwitchToLogin: () => void;
    onVerifyEmail?: (email: string) => void;
}

const stepRegData = [
    { id: 1, title: "Личные данные", description: "Введите своё имя и дату рождения" },
    { id: 2, title: "Аккаунт", description: "Выберите имя пользователя и укажите email" },
    { id: 3, title: "Безопасность", description: "Придумайте надёжный пароль" }
];

const StepsRegistr: React.FC<StepsRegistrProps> = ({ onSwitchToLogin, onVerifyEmail }) => {
    const auth = useAuth();
    
    const [registerStep, setRegisterStep] = useState(0);
    const [animationDirection, setAnimationDirection] = useState<'next' | 'prev'>('next');

    const [fullName, setFullName] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatBirthDate = (value: string) => {
        const digits = value.replace(/\D/g, "").slice(0, 8);
        const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
        return parts.join('.');
    };

    const handleBirthDateChange = (value: string) => {
        setBirthDate(formatBirthDate(value));
    };

    const handleNextStep = () => {
        if (registerStep < 2) {
            setAnimationDirection('next');
            setRegisterStep((prev) => prev + 1);
            setMessage(null);
        }
    };

    const handlePrevStep = () => {
        if (registerStep > 0) {
            setAnimationDirection('prev');
            setRegisterStep((prev) => prev - 1);
            setMessage(null);
        }
    };

    const handleSubmit = async () => {
        if (password !== confirmPassword) {
            setMessage("Пароли не совпадают.");
            return;
        }

        setIsSubmitting(true);
        setMessage(null);

        if (auth && auth.register) {
            const payload: IUserData = {
                fullNameUser: fullName,
                birthDate: birthDate,
                username: username,
                email: email,
                password: password,
                confirmPassword: confirmPassword
            };

            const result = await auth.register(payload);

            if (result.success) {
                onVerifyEmail?.(email);
            } else {
                setMessage(result.message || "Ошибка при регистрации.");
            }
        } else {
            setMessage("Ошибка: Сервис регистрации недоступен.");
        }

        setIsSubmitting(false);
    };

    const prevArrow = () => {
        if (registerStep === 0 || registerStep === 3) return null;

        return (
            <button
                type="button"
                onClick={handlePrevStep}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <ArrowRight size={20} color="#6b7280" style={{ transform: 'rotate(180deg)' }} />
            </button>
        );
    };

    const registerStepsInput = () => {
        switch (registerStep) {
            case 0:
                return (
                    <>
                        <FormInput
                            id="fullName"
                            label="ФИО"
                            type="text"
                            value={fullName}
                            onChange={setFullName}
                            placeholder="Иванов Иван Иванович"
                            required
                        />
                        <FormInput
                            id="birthDate"
                            label="ДАТА РОЖДЕНИЯ"
                            type="text"
                            value={birthDate}
                            onChange={handleBirthDateChange}
                            placeholder="дд.мм.гггг"
                            inputMode="numeric"
                            pattern="\d{2}\.\d{2}\.\d{4}"
                            onKeyDown={(e) => {
                                const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
                                if (!/\d/.test(e.key) && !allowedKeys.includes(e.key)) {
                                    e.preventDefault();
                                }
                            }}
                            onPaste={(e) => {
                                const text = e.clipboardData.getData('text/plain');
                                if (!/^\d+$/.test(text.replace(/\D/g, ''))) {
                                    e.preventDefault();
                                }
                            }}
                            maxLength={10}
                            required
                        />
                    </>
                );
            case 1:
                return (
                    <>
                        <FormInput
                            id="username"
                            label="Имя пользователя"
                            type="text"
                            value={username}
                            onChange={setUsername}
                            placeholder="ivanov_ivan"
                            required
                        />
                        <FormInput
                            id="email"
                            label="Email"
                            type="email"
                            value={email}
                            onChange={setEmail}
                            placeholder="ivanov_ivan@example.com"
                            required
                        />
                    </>
                );
            case 2:
                return (
                    <>
                        <FormInput
                            id="password"
                            label="Пароль"
                            type="password"
                            value={password}
                            onChange={setPassword}
                            placeholder="••••••••"
                            required
                        />
                        <FormInput
                            id="confirmPassword"
                            label="Повторите пароль"
                            type="password"
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                            placeholder="••••••••"
                            required
                        />
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <motion.div
            key="register-card"
            initial={{ opacity: 0, x: 50, scale: 1 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                mass: 1,
            }}
            exit={{ opacity: 0, x: 50, scale: 1, transition: { duration: 0.1 } }}
            style={styles.card}
        >
            <div style={styles.form}>
                <div style={{ flexDirection: 'row', display: 'flex', alignItems: 'center', gap: '12px', minHeight: '64px' }}>
                    {prevArrow()}
                    <div
                        key={`title-${registerStep}`}
                        style={{
                            ...styles.textAnimationContainer,
                            animation: animationDirection === 'next'
                                ? 'slideUpIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards'
                                : 'slideDownIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                        }}
                    >
                        <h3 style={styles.title}>{stepRegData[Math.min(registerStep, stepRegData.length - 1)].title}</h3>
                        <p style={styles.subtitle}>{stepRegData[Math.min(registerStep, stepRegData.length - 1)].description}</p>
                    </div>
                </div>

                <ProgressBar currentStep={Math.min(registerStep, stepRegData.length - 1)} totalSteps={stepRegData.length} />

                {registerStep === 3 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
                        <h3 style={styles.title}>Готово!</h3>
                    </div>
                ) : (
                    <div
                        key={`input-container-${registerStep}`}
                        style={{
                            ...styles.inputStepAnimation,
                            animation: animationDirection === 'next'
                                ? 'slideLeftIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards'
                                : 'slideRightIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            {registerStepsInput()}
                        </div>
                    </div>
                )}

                {message && <div style={styles.message}>{message}</div>}

                {registerStep !== 3 && (
                    <DefaultButton
                        onClick={() => {
                            if (registerStep === 2) {
                                handleSubmit();
                            } else {
                                handleNextStep();
                            }
                        }}
                        disabled={isSubmitting}
                        text={
                            isSubmitting 
                                ? "Создание..." 
                                : (registerStep === 2 ? "Создать аккаунт" : "Продолжить")
                        }
                        status="primary"
                        fullWidth={true}
                        br="18px"
                        leftIcon={registerStep === 2}
                        icon={registerStep !== 2 && !isSubmitting ? <ArrowRight size={18} color="#fff" /> : undefined}
                    />
                )}

                <div style={styles.bottomRow}>
                    <span>Уже есть аккаунт?</span>
                    <button type="button" style={styles.textLink} onClick={onSwitchToLogin}>
                        Войти
                    </button>
                </div>
            </div>

            <style>
                {`
                @keyframes slideUpIn {
                    0% { opacity: 0; transform: translateY(16px); filter: blur(4px); }
                    100% { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
                @keyframes slideDownIn {
                    0% { opacity: 0; transform: translateY(-16px); filter: blur(4px); }
                    100% { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
                @keyframes slideLeftIn {
                    0% { opacity: 0; transform: translateX(24px); filter: blur(4px); }
                    100% { opacity: 1; transform: translateX(0); filter: blur(0); }
                }
                @keyframes slideRightIn {
                    0% { opacity: 0; transform: translateX(-24px); filter: blur(4px); }
                    100% { opacity: 1; transform: translateX(0); filter: blur(0); }
                }
                `}
            </style>
        </motion.div>
    );
};

export default StepsRegistr;

const styles = {
    card: {
        display: 'flex',
        flexDirection: 'column' as const,
        borderRadius: '16px',
        
        height: '100%',
        boxSizing: 'border-box' as const,
    },
    form: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '18px',
        flexGrow: 1,
    },
    title: {
        margin: 0,
        fontSize: '24px',
        fontWeight: 800,
        lineHeight: 1.1,
        color: '#111827',
    },
    subtitle: {
        margin: '8px 0 0',
        color: '#6b7280',
        fontSize: '15px',
        lineHeight: 1.6,
    },
    message: {
        borderRadius: '16px',
        //backgroundColor: '#fee2e2',
        color: '#b91c1c',
        padding: '12px 16px',
        fontSize: '14px',
        textAlign: 'center' as const,
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
    textLink: {
        border: 'none',
        background: 'transparent',
        color: '#2563eb',
        fontWeight: 700,
        cursor: 'pointer',
        padding: 0,
        fontSize: '14px',
    },
    textAnimationContainer: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '6px',
        flexGrow: 1,
    },
    inputStepAnimation: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '18px',
    },
};

import { useState } from "react";
import FormInput from "../../components/form_input";
import { useAuth } from "../../context/auth_context";
import { AnimatedBackground } from "../../components/animated_background";
import DefaultButton from "../../components/default_button";
import { AnimatePresence, motion } from "motion/react";
import SegmentedToggle from "../../components/segmented_toggle";
import StepsRegistr from "./steps_of_registrs";
import { VerifyEmailStep } from "./verify_email_step";
import { theme } from "../../themes/themes";
import { useDesignMode } from "../../context/design_context";

const LoginRegistrPage: React.FC = () => {
    // login data
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [isLogin, setIsLogin] = useState(true);
    const [message, setMessage] = useState<string | null>(null);
    const { login: loginAction } = useAuth();
    const [isVerifyStatus, setVerifyStatus] = useState(false);
    const [verifyEmail, setVerifyEmail] = useState("");

    const auth = useAuth();

    const { mode } = useDesignMode();
    const activeDesign = theme.modes[mode];

    const toggleConfig = [
        {
            id: "login",
            label: "Вход",
            onClick: () => {
                setIsLogin(true);
                setMessage(null);
            }
        },
        {
            id: "register",
            label: "Регистрация",
            onClick: () => {
                setIsLogin(false);
                setMessage(null);
            }
        }
    ];

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const result = await loginAction(email, password);

        if (!result.success) {
            if(result.need_verif){
                setIsLogin(false);
                setVerifyStatus(true);
                setVerifyEmail(email);
                auth.resendRegisterCode(email);
            }
            else
                setMessage(result.message || "Произошла ошибка при входе.");
        } else {
            setMessage(null);
        }
    };

    const loginCard = () => {
        return (
            <motion.div
                key = 'login-card'
                initial={{ opacity: 0, x: 50, scale: 1 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    mass: 1
                }}
                exit={{ opacity: 0, x: -50, scale: 1, transition: { duration: 0.1 } }}

                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    //background: '#fff',
                    borderRadius: '16px',
                    boxSizing: 'border-box'
                }}
            >
            <form style={{...styles.form, flexGrow: 1}} onSubmit={handleSubmit}>
                    <div style={{flexGrow: 1}}/>
                    <div>
                        <h2 style={styles.title}>С возвращением!</h2>
                        <p style={styles.subtitle}>Рады снова вас видеть</p>
                    </div>
                <FormInput
                    id="email"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com"
                    required
                />
                <FormInput
                    id="password"
                    label="Пароль"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    placeholder="••••••••"
                    required
                />
                {message && <div style={{...styles.message, ...activeDesign.errorAlert}}>{message}</div>}

                <div style={{flexGrow: 1}}/>

                <DefaultButton
                    text="Войти"
                    status="primary"
                    fullWidth={true}
                    br="18px"
                    onClick={() => {}}
                />

                <div style={styles.bottomRow}>
                    <span>Нет аккаунта?</span>
                    <button type="button" style={styles.textLink} onClick={() => { setIsLogin(false); setMessage(null); }}>
                        Создать
                    </button>
                </div>
                </form>
            </motion.div>
        );
    };

    return (
        <div className="login-register-page-background" style={styles.background}>
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
                @keyframes justFadeIn {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
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
            
            <AnimatedBackground />
            <div className="login-register-page-card" style={{...styles.card, ...activeDesign.sidebar}}>
                <div>
                    <AnimatePresence mode="wait">
                        {!isVerifyStatus && (
                            <motion.div
                                key="toggle-panel"
                                initial={{ opacity: 0, y: -15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.2 }}
                                style={{ width: '100%' }}
                            >
                                <SegmentedToggle 
                                    options={toggleConfig} 
                                    activeId={isLogin ? "login" : "register"} 
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <AnimatePresence mode="wait">
                    {isLogin ? (
                        loginCard()
                    ) : isVerifyStatus ? (
                        <VerifyEmailStep
                            key="verify-email"
                            email={verifyEmail}
                            onVerified={() => setIsLogin(true)}
                            onBack={() => setVerifyStatus(false)}
                        />
                    ) : (
                        <StepsRegistr
                            key="register-card"
                            onSwitchToLogin={() => setIsLogin(true)}
                            onVerifyEmail={(email: string) => {
                                setVerifyEmail(email);
                                setVerifyStatus(true);
                            }}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default LoginRegistrPage;
const styles = {
    background: {
        position: 'relative' as const,
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '30px',
        fontFamily: 'var(--font-rounded)',
        overflow: 'hidden' as const, 
        boxSizing: 'border-box' as const,
    },
    card: {
        position: 'relative' as const,
        zIndex: 2,
        width: '100%',
        minHeight: '560px',
        maxWidth: '500px',
        paddingLeft: '32px',
        paddingRight: '32px',
        paddingTop: '24px',
        paddingBottom: '32px',
        borderRadius: '32px',
        //...theme.modes[mode].card,
        //background: 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(247,249,255,0.85) 100%)',
        //border: '1px solid rgba(255, 255, 255, 0.6)',
        boxSizing: 'border-box' as const,
    },
    form: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '18px',
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
    fieldGroup: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '10px',
    },
    label: {
        fontSize: '12px',
        fontWeight: 700,
        color: '#4b5563',
        letterSpacing: '0.08em',
        textTransform: 'uppercase' as const,
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
    message: {
        //...theme.modes[mode].errorAlert,
        borderRadius: '16px',
        backgroundColor: '#fee2e2',

        padding: '12px 16px',
        fontSize: '14px',
        textAlign: 'center' as const,
    },
    textAnimationContainer: {
        display: 'flex',
        flexDirection: 'column' as const,
        willChange: 'transform, opacity',
    },
};
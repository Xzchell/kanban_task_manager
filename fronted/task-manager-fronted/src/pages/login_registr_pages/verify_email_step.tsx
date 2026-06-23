import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RefreshCw, Mail } from "lucide-react";
import { OTPInput, REGEXP_ONLY_DIGITS } from "input-otp";
import DefaultButton from "../../components/default_button";
import { useAuth } from "../../context/auth_context";

interface VerifyEmailStepProps {
  email: string;
  onVerified: (code: string) => void;
  onBack: () => void;
  serverError?: string | null;
}

export const VerifyEmailStep: React.FC<VerifyEmailStepProps> = ({ email, onVerified, onBack, serverError }) => {
    const auth = useAuth();

    const [otpString, setOtpString] = useState("");
    const [otpError, setOtpError] = useState(false);
    const [otpShake, setOtpShake] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(30);

    const [isLoading, setIsLoading] = useState(false);
    const [backendError, setBackendError] = useState<string | null>(null);

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [resendCooldown]);

    const handleVerify = async () => {
        if (otpString.length !== 6) return;
        
        setIsLoading(true);
        setBackendError(null);
        setOtpError(false);

        if (auth && auth.verifyRegisterCode) {
        const result = await auth.verifyRegisterCode(email, otpString);
        
        if (result.success) {
            onVerified(otpString);
        } else {
            setOtpError(true);
            setOtpShake(true);
            setBackendError(result.message || "Неверный код подтверждения");
            
            setTimeout(() => setOtpShake(false), 500);
            setOtpString(""); 
        }
        } else {
        setBackendError("Критическая ошибка: Контекст авторизации не найден");
        }

        setIsLoading(false);
    };

    const handleResend = () => {
        setOtpString("");
        setOtpError(false);
        setResendCooldown(30);
        auth.resendRegisterCode(email);
    };

    const otpComplete = otpString.length === 6;
    const displayError = serverError || backendError || (otpError ? "Неверный код подтверждения" : null);

return (
    <motion.div
      key="otp"
      initial={{ opacity: 0, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={styles.content}>
        <div style={styles.iconWrapper}>
          <Mail size={32} color="#0d6fff" />
        </div>

        <div style={styles.textContainer}>
          <h3 style={styles.title}>Подтвердите почту</h3>
          <p style={styles.subtitle}>
            Мы отправили код на <span style={styles.emailHighlight}>{email || "ваш email"}</span>
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
                setBackendError(null);
            }}
            autoFocus
            type="text"
            inputMode="numeric"
            disabled={isLoading}
            render={({ slots }) => (
            <div style={styles.otpRow}>
                {slots.map((slot, idx) => {
                    let currentSlotStyle = { ...styles.otpInput };
                    if (slot.char) currentSlotStyle = { ...currentSlotStyle, ...styles.otpInputActive };
                    if (slot.isActive) currentSlotStyle = { ...currentSlotStyle, ...styles.otpInputFocused };
                    if (displayError) currentSlotStyle = { ...currentSlotStyle, ...styles.otpInputError };

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

        <AnimatePresence>
            {displayError && (
            <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                style={styles.messageError}
            >
                {displayError}
            </motion.div>
            )}
        </AnimatePresence>
        <DefaultButton
            text={isLoading ? "Проверка..." : "Подтвердить"}
            status="primary"
            fullWidth={true}
            br="18px"
            onClick={handleVerify}
            disabled={!otpComplete || isLoading}
        />
            <div style={{ flexGrow: 1 }} />
        <div style={styles.bottomRow}>
            {resendCooldown > 0 ? (
            <span>
                Отправить повторно через <span style={styles.cooldownText}>{resendCooldown}с</span>
            </span>
            ) : (
            <button type="button" onClick={handleResend} style={styles.resendLink}>
                <RefreshCw size={12} style={{ marginRight: '4px' }} />
                Отправить повторно
            </button>
            )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
            <button type="button" onClick={onBack} style={styles.backFormLink} disabled={isLoading}>
                <label style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}>Вернуться на форму</label>
            </button>
        </div>
        </div>

        <div style={{ flexGrow: 1 }} />
    </motion.div>
  );
};

const styles = {
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '18px',
    alignItems: 'center',
    width: '100%',
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
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
    background: 'rgba(248, 249, 255, 0.7)',
    color: '#111827',
    boxSizing: 'border-box' as const,
    transition: 'all 0.15s ease-in-out',
    position: 'relative' as const,
  },
  otpInputActive: {
    backgroundColor: 'rgba(238, 242, 255, 0.7)',
    borderColor: '#0d6fff',
    color: '#0d6fff',
  },
  otpInputFocused: {
    borderColor: '#0d6fff',
    backgroundColor: 'rgba(238, 242, 255, 0.7)',
    boxShadow: '0 0 0 3px rgba(13, 111, 255, 0.1)',
  },
  otpInputError: {
    borderColor: '#f87171',
    backgroundColor: '#fef2f2',
    color: '#ef4444',
  },
  fakeCaret: {
    position: "absolute" as const,
    width: "2px",
    height: "22px",
    backgroundColor: "#0d6fff",
    animation: "input-otp-blink 1s step-end infinite",
  },
  messageError: {
    borderRadius: '16px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '12px 16px',
    fontSize: '14px',
    textAlign: 'center' as const,
    marginTop: '6px',
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
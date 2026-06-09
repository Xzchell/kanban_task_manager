import { useState, type ReactNode } from "react";
import type { IAlertButtonProps } from "../components/alert_button";
import type { IAlert } from "../components/alert";
import { AlertContext } from "./alert_context";
import Alert from "../components/alert";
import { AnimatePresence, motion } from "framer-motion";

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [alertConfig, setAlertConfig] = useState<IAlert | null>(null);

    const showAlert = (title: string, description: string, buttons: IAlertButtonProps[]) => {
        setAlertConfig({ title, description, buttons });
    };

    const hideAlert = () => setAlertConfig(null);
    
    return (
            <AlertContext.Provider value={{ showAlert, hideAlert }}>
                {children}
                <AnimatePresence>
                {alertConfig && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.1, ease: "easeIn" } }} 
                            style={styles.overlayStyle} 
                            onClick={hideAlert}
                        />
                        <Alert {...alertConfig} />
                    </>
                )}
                </AnimatePresence>
            </AlertContext.Provider>
        );
};

const styles: { overlayStyle: React.CSSProperties } = {
    overlayStyle: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 999,
    }
}
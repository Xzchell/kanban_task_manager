import { motion } from "framer-motion";
import AlertButton from "./alert_button";
import type { IAlertButtonProps } from "./alert_button";

export interface IAlert{
    title: string;
    description: string;
    buttons: IAlertButtonProps[];
}

const Alert: React.FC<IAlert> = ({title, description, buttons}) => {
    return (
        <motion.div style={styles.container}
            initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            exit={{ 
                opacity: 0, 
                scale: 0.95, 
                transition: { duration: 0.1, ease: "easeIn" }
            }}
            transition={{ 
                type: "spring", 
                damping: 25, 
                stiffness: 400 
            }}
            >
            
            <h3 style={{
                margin: '0 0 10px 0',
            }}>{title}</h3>
            <p>{description}</p>
            <div style={{
                ...styles.sort_buttons, 
                flexDirection: buttons.length > 2 ? 'column' : 'row' as const,
                gap: buttons.length > 2 ? '6px' : '10px',
                alignItems: 'stretch'
                }}>
            {buttons.map((button, index) => (
                <AlertButton key={index} {...button} />
            ))}
            </div>
        </motion.div>
    );
}

export default Alert;

const styles = {
    container: {
        maxWidth: '400px',
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        backgroundColor: '#fff',
        padding: '20px',
        border: '1px solid #e3e3e3',
        borderRadius: '26px',
        boxShadow: '0 10px 40px 20px rgba(0, 0, 0, 0.3)',
        zIndex: 10000,
        textAlign: 'start' as const,
    },
    sort_buttons: {
        display: 'flex',
        justifyContent: 'center' as const,
    }
}
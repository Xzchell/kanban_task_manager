import type React from "react";
import type { IUser, IUserRole } from "../../context/auth_context";
import { motion } from "framer-motion";
import UserModalPreview from "./user_model_preview";
import UserModalEditor from "./user_model_editor";
import { useState } from "react";
import { useAuth } from "../../context/auth_context"; 
import DefaultButton from "../default_button";
import { useAlert } from "../../context/alert_context"; 

export interface IUserModel {
    user: IUser;
    onClose: () => void;
    availableRoles: IUserRole[];
    onUpdate?: (userId: number, updatedData: Partial<IUser>) => void;
    onDelete?: (userId: number) => void;
}

const UserModel: React.FC<IUserModel> = ({ user, onClose, onUpdate, onDelete, availableRoles }) => {
    const [isEditing, setEditing] = useState(false);
    const { user: currentUser } = useAuth(); 
    
    const { showAlert, hideAlert } = useAlert();

    const currentRoleId = currentUser?.role?.id;
    const hasAccess = currentRoleId === 2 || currentRoleId === 3;

    const renderButtons = (updatedUser?: Partial<IUser>) => {
        if (hasAccess) {
            if (!isEditing) {
                return (
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', width: '100%' }}>
                        <DefaultButton text="Редактировать" onClick={() => setEditing(true)} fullWidth={true} /> 
                        
                        <DefaultButton 
                            text="Удалить" 
                            onClick={() => {
                                showAlert(
                                    "Удалить участника",
                                    `Вы уверены, что хотите удалить участника ${user.last_name} ${user.first_name}? Это действие нельзя будет отменить.`,
                                    [
                                        { 
                                            text: "Удалить", 
                                            status: "danger", 
                                            onClick: () => { 
                                                onDelete?.(user.id); 
                                                hideAlert(); 
                                                onClose(); 
                                            } 
                                        },
                                        { 
                                            text: "Отмена", 
                                            status: "secondary", 
                                            onClick: () => { hideAlert(); } 
                                        },
                                    ]
                                );
                            }} 
                            fullWidth={true} 
                            status="danger" 
                        /> 
                        
                        <DefaultButton text="Закрыть" onClick={onClose} fullWidth={true} status="secondary" />
                    </div>
                );
            } else {
                return (
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', width: '100%' }}>
                        <DefaultButton 
                            text="Сохранить" 
                            onClick={() => {
                                if (onUpdate && updatedUser) {
                                    onUpdate(user.id, updatedUser);
                                }
                                setEditing(false);
                            }} 
                            fullWidth={true} 
                        /> 
                        <DefaultButton text="Отменить" onClick={() => setEditing(false)} fullWidth={true} status="secondary" />
                    </div>
                );
            }
        } else {
            return (
                <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                    <DefaultButton text="Закрыть" fullWidth={true} onClick={onClose} status="secondary" />
                </div>
            );
        }
    };

    return (
        <motion.div style={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div style={styles.container}
                initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-40%" }} 
                animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}   
                exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-40%" }}    
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
            >
                {isEditing ? (
                    <UserModalEditor
                        availableRoles={availableRoles}
                        user={user}
                        renderButtons={renderButtons}
                    />
                ) : (
                    <UserModalPreview
                        user={user}
                        renderButtons={renderButtons}
                    />
                )}
            </motion.div>
        </motion.div>
    );
};

export default UserModel;

const styles = {
    backdrop: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 999,
        backdropFilter: 'blur(4px)',
    },
    container: {
        maxWidth: '100%',
        maxHeight: '100%',
        width: '50vw',
        height: '70vh',
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#fff',
        border: '1px solid #e3e3e3',
        borderRadius: '18px',
        boxShadow: '0 10px 40px 20px rgba(0, 0, 0, 0.3)',
        zIndex: 1000,
        textAlign: 'start' as const,
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden' as const,
    },
};
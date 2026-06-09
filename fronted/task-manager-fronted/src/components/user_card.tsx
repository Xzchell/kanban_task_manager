import { CircleCheckBig, Mail, User } from "lucide-react";
import {type IUser } from "../context/auth_context";

export interface IUserCard {
    member: IUser;
    onSelect: (user: IUser) => void;
}

const UserCard = ({ member, onSelect }: { member: IUser; onSelect: (user: IUser) => void }) => {

    return(
        <div style={styles.container} onClick={() => onSelect(member)} role="button" tabIndex={1}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onSelect(member);
                }}}>
            <div className="topInfo" style={{ display: 'flex', alignItems: 'center', height: '100px'}}>
                <div style={styles.avatar}>
                    <User size={32} />
                </div>
                
                <div className="userInfo" style={{ marginLeft: '15px', display: 'flex', flexDirection: 'column' as const, gap: '4px'}}>
                    <label>{member.first_name} {member.last_name} {member.middle_name}</label>
                    <div style={{padding: '6px 8px', borderRadius: '10px', border: `1px solid color-mix(in srgb, ${member.role.color}, white 40%)`, backgroundColor: member.role.background_color || '#e3e3e3', color: member.role.color || '#333', width: 'fit-content'}}>
                        <label>{member.role.name}</label>
                    </div>
                </div>
            </div>
            <hr style={styles.bottom_line}></hr>
            <div className="bottomInfo" style={{ display: 'flex', alignItems: 'stretch', height: '100px', gap: '8px', flexDirection: 'column' as const, justifyContent: 'center'}}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <Mail size={20} />
                    <label>{member.email}</label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <CircleCheckBig size={20} />
                    <label>Задач в работе: {member.count_tasks}</label>
                </div>
            </div>
        </div>
    );
};

export default UserCard;

const styles ={
    container : {
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column' as const,
        paddingLeft: '15px',
        paddingRight: '15px',
        borderRadius: '26px', 
        backgroundColor: '#ffffff',
        border: '1px solid #e3e3e3',
        maxWidth: '350px',
        minWidth: '300px',
        width: '300px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    avatar: {
        flexShrink: 0,
        width: '65px',
        height: '65px',
        borderRadius: '14px', 
        backgroundColor: '#4A90E2',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        fontWeight: 'bold',
    },
    bottom_line:{
        borderColor: '#e3e3e3',
        borderRadius: '8px',
        borderStyle: 'solid',
        width: '100%',
        margin: '0px',
    },
}
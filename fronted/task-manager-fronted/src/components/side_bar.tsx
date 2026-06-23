import { LogOut } from "lucide-react";
import { useAuth } from "../context/auth_context";
import { useNavigate } from "react-router-dom";
import DefaultButton from "./default_button";
import type { ISideBarItem } from "./side_bar_item";
import { useState } from "react";
import SegmentedToggle from "./segmented_toggle";

const SideBar = () => {
    const navigate = useNavigate();
    const {logout : authlogout} = useAuth();
    const [activeTab, setActiveTab] = useState<string>("tasks");
    const handleLogout = () => authlogout()
    
    const sideBarItems: ISideBarItem[] = [
        { id: 1, name: 'Задачи', icon: <i className="fa-solid fa-list-check"></i>, onClick: () => {navigate('/tasks'); setActiveTab('tasks')}},
        { id: 2, name: 'Моя команда', icon: <i className="fa-solid fa-diagram-project"></i>, onClick: () => {navigate('/team'); setActiveTab('team') }},
        { id: 3, name: 'Мой профиль', icon: <i className="fa-solid fa-users"></i>, onClick: () => {navigate('/profile'); setActiveTab('profile')}},
    ];

    const toggleConfig = [
        { 
            id: "tasks", 
            label: "Задачи", 
            onClick: () => { setActiveTab('tasks'); navigate('/tasks') } 
        },
        { 
            id: "myteam", 
            label: "Моя команда", 
            onClick: () => { setActiveTab('myteam'); navigate('/team')} 
        },
        { 
            id: "myprofile", 
            label: "Мой профиль", 
            onClick: () => { setActiveTab('myprofile'); navigate('/profile')} 
        }
    ];


    return (
        <div className="side-bar" style={styles.container}>
            <div className = "side-bar-logo" style={styles.logo}>
                <img src="src\assets\site_logo.svg" alt="Logo" style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
                <h2 style={{ color: '#000000', marginLeft: '10px', fontSize: '20px', fontFamily: 'var(--font-rounded)' }}>TaskManager</h2>
            </div>
            <div style={{display: 'flex', flexDirection: 'column' as const, flex: 1}}>


               {sideBarItems.map((item) => (
                    <DefaultButton 
                        onClick={item.onClick}
                        key={item.id} 
                        text={item.name}
                        status='secondary'
                        fullWidth={true}
                    />
                ))}
                
            </div>
            <DefaultButton 
                    text="Выйти из системы" 
                    onClick={handleLogout} 
                    status='danger'
                    fullWidth={true}
                    icon={<LogOut size={12}/>}
                />  

        </div>
    );
};

export default SideBar;

const styles = {
    container: {
        flexShrink: 0,
        width: '250px',
        minWidth: '250px',
        height: '100%',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column' as const,
        padding: '20px',
        boxSizing: 'border-box' as const,
        borderRight: '3px solid #e3e3e3',
    },
    logo: {
        flexDirection: 'row' as const,
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '60px',
        marginBottom: '20px',
        marginLeft: '5px',
        gap: '5px',
    }
}
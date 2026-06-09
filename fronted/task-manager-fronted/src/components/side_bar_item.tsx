import React from 'react';
export interface ISideBarItem {
    id: number;
    name: string;
    icon: React.ReactNode;
    onClick: () => void;
}

const SideBarItem: React.FC<ISideBarItem> = ({ id, name, icon, onClick }) => {
    return <button onClick = {onClick} key={id} className="side-bar-item" style={styles.container}>
        {icon}
        <span>{name}</span>
    </button>;
}

export default SideBarItem;

const styles = {
    container: {
        textAlign: 'center' as const,
        padding: '10px 20px',
        margin: '5px',
        backgroundColor: '#0d6fff',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        fontFamily: 'var(--font-rounded)',
        transition: 'background-color 0.3s',
    }
}
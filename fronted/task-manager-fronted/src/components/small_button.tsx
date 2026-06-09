export interface IButtonProps {
    text: string;
    onClick: () => void;
    disabled?: boolean;
    status?: 'primary' | 'secondary' | 'danger';
}

const SmallButton: React.FC<IButtonProps> = ({ text, onClick, disabled = false, status = 'primary' }) => {
    return (
        <button onClick={onClick} disabled={disabled} style={{
            minWidth: 'fit-content',
            padding: '5px 20px',
            margin: '5px 0 5px 0',
            backgroundColor: disabled ? '#ccc' : status == 'primary' ? '#0d6fff' : status == 'secondary' ? '#d3d2d2' : '#f1bebf',
            color: disabled ? '#666' : status == 'primary' ? '#fff' : status == 'secondary' ? '#3f3f3f' : '#ff060b',
            border: 'none',
            borderRadius: '10px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            fontFamily: 'var(--font-rounded)',
            transition: 'background-color 0.3s',
        }}>
            {text}
        </button>
    );
}

export default SmallButton;
import { Search, X } from 'lucide-react';

interface ISearchBarProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}

const SearchBar: React.FC<ISearchBarProps> = ({ value, onChange, placeholder }) => {
    return (
        <div style={searchStyles.container}>
            <Search size={20} style={searchStyles.icon} />
            <input
                type="text"
                placeholder={placeholder || "Поиск..."}
                value={value}
                onChange={(e) => onChange(e.target.value)} 
                style={searchStyles.input}
            />
            {value && (
                <X 
                    size={18} 
                    style={searchStyles.clearBtn} 
                    onClick={() => onChange('')} 
                />
            )}
        </div>
    );
};
export default SearchBar;

const searchStyles = {
    container: {
        position: 'relative' as const,
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: '400px',
        marginBottom: '24px',
    },
    input: {
        width: '100%',
        padding: '12px 40px 12px 45px',
        borderRadius: '16px',
        border: '1.5px solid #e3e3e3',
        backgroundColor: '#f9f9f9',
        fontFamily: 'var(--font-rounded)',
        fontSize: '16px',
        outline: 'none',
        transition: 'all 0.2s ease',
    },
    icon: {
        position: 'absolute' as const,
        left: '15px',
        color: '#8e8e93',
    },
    clearBtn: {
        position: 'absolute' as const,
        right: '15px',
        color: '#8e8e93',
        cursor: 'pointer',
    }
};
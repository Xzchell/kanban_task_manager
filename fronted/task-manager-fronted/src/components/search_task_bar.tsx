import React from 'react';
import { Search, X } from 'lucide-react';
import { useDesignMode } from '../context/design_context';
import { theme } from '../themes/themes';

interface ISearchBarProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}

const SearchBar: React.FC<ISearchBarProps> = ({ value, onChange, placeholder }) => {
    const { mode } = useDesignMode();
    const activeSearchTheme = theme.modes[mode].searchBar;

    const dynamicInputStyle = {
        ...searchStyles.input,
        ...activeSearchTheme
    };

    return (
        <div style={searchStyles.container}>
            <Search size={20} style={{ ...searchStyles.icon, color: theme.colors.text.muted }} />
            <input
                type="text"
                placeholder={placeholder || "Поиск..."}
                value={value}
                onChange={(e) => onChange(e.target.value)} 
                style={dynamicInputStyle}
            />
            {value && (
                <X 
                    size={18} 
                    style={{ ...searchStyles.clearBtn, color: theme.colors.text.muted }} 
                    onClick={() => onChange('')} 
                />
            )}
        </div>
    );
};

const searchStyles = {
    container: {
        position: 'relative' as const,
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: '500px',
    },
    input: {
        width: '100%',
        padding: '12px 40px 12px 45px',
        borderRadius: '16px',
        fontFamily: 'var(--font-rounded)',
        fontSize: '16px',
        outline: 'none',
        transition: 'all 0.2s ease, background-color 0.3s ease, border 0.3s ease',
    },
    icon: {
        position: 'absolute' as const,
        left: '15px',
        zIndex: 15,
    },
    clearBtn: {
        position: 'absolute' as const,
        right: '15px',
        cursor: 'pointer',
    }
};

export default SearchBar;
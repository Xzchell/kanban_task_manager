import { SlidersHorizontal } from 'lucide-react';
export interface IFilterButton {
    setIsSidebarOpen : (opened : boolean) => void;
}

const FilterButton : React.FC<IFilterButton> = ({setIsSidebarOpen}) => {
    return(
        <button onClick={() => setIsSidebarOpen(true)} style={styles.filterBtn}>
            <SlidersHorizontal size={20} />
            <span>Фильтры</span>
        </button>
    );
};

export default FilterButton;

const styles = {
    filterBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0px 20px',
        backgroundColor: '#f7f7f7',
        border: '1.5px solid #e3e3e3',
        borderRadius: '16px',
        color: 'var(--text-main)',
        fontFamily: 'var(--font-rounded)',
        fontWeight: 600,
        marginBottom: '24px',
        fontSize: '15px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
    },
};
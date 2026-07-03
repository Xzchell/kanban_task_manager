import { X } from "lucide-react";

interface IListItemProps {
    items: IItemProps[];
    onItemChange: (items: IItemProps[]) => void;
}

export interface IItemProps {
    id: number;
    name: string;
}

const ListItems: React.FC<IListItemProps> = ({ items, onItemChange }) => {
    const removeItem = (tagId: number) => {
        onItemChange(items.filter(t => t.id !== tagId));
    };

    return(
        <div style={styles.container}>
        {items.map(
            item => (
                <span key = {item.id} style={styles.item}>
                    {item.name}
                    <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeItem(item.id)} />
                </span>
            )
        )}
        </div>
    );
}

export default ListItems;

const styles = {
    container: {
        display: 'flex', 
        flexWrap: 'wrap' as const, 
        gap: '8px', 
        marginBottom: '10px',
        justifyContent: 'flex-start' as const,
        alignItems: 'center' as const,
    },
    item: {
        whiteSpace: 'nowrap',
        borderRadius: '10px',
        paddingRight: '8px', paddingLeft: '8px', paddingBottom: '6px', paddingTop: '6px',
        fontFamily: 'var(--font-rounded)',
        fontWeight: 600,
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: "#fafbff", 
        color: "#64748b",
        border: "1px solid #64748b",
    },
}
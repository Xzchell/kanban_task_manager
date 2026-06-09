import React, { useState, useMemo,} from 'react';
import type { ITags } from "./task_card";
import { X, Search } from 'lucide-react';

interface ITagSelectorProps {
    availableTags: ITags[]; 
    selectedTags: ITags[];
    onTagsChange: (tags: ITags[]) => void;
}

const TagSelector: React.FC<ITagSelectorProps> = ({ availableTags, selectedTags, onTagsChange }) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filtered = useMemo(() => {
        return availableTags.filter(tag => 
        {
            const isNotSelected = !selectedTags.some(s => s.id === tag.id);
            const matchesQuery = query === '*' || tag.name.toLowerCase().includes(query.toLowerCase());
            return isNotSelected && matchesQuery;
        }
        );
    }, [availableTags, selectedTags, query]);

    const addTag = (tag: ITags) => {
        onTagsChange([...selectedTags, tag]);
        setQuery('');
    };

    const removeTag = (tagId: number) => {
        onTagsChange(selectedTags.filter(t => t.id !== tagId));
    };

    return (
        <div style={tagSelectorStyles.container}>
            
            <div style={tagSelectorStyles.tagList}>
                {selectedTags.map(tag => (
                    <span key={tag.id} style={{
                        ...tagSelectorStyles.activeTag, 
                        backgroundColor: tag.background_color, 
                        color: tag.tag_color,
                        border: `1px solid ${tag.tag_color}`,
                    }}>
                        {tag.name}
                        <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeTag(tag.id)} />
                    </span>
                ))}
            </div>

            <div style={tagSelectorStyles.searchWrapper}>
                <div style={tagSelectorStyles.inputContainer}>
                    <Search size={16} color="#828282" />
                    <input 
                        style={tagSelectorStyles.input}
                        placeholder="Поиск тегов..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsOpen(true)}
                    />
                </div>

                {isOpen && query && (
                    <div style={tagSelectorStyles.dropdown}>
                        {filtered.length > 0 ? filtered.map(tag => (
                            <div 
                                key={tag.id} 
                                onClick={() => addTag(tag)}
                                style={tagSelectorStyles.dropdownItem}
                            >
                                <span style={{
                                    ...tagSelectorStyles.dot, 
                                    backgroundColor: tag.tag_color
                                }} />
                                {tag.name}
                            </div>
                        )) : (
                            <div style={tagSelectorStyles.noResult}>Теги не найдены</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const tagSelectorStyles = {
    container: { marginBottom: '20px' },
    label: { display: 'block', fontSize: '14px', fontWeight: 600, color: '#444', marginBottom: '8px' },
    tagList: { 
        display: 'flex', 
        flexWrap: 'wrap' as const, 
        gap: '8px', 
        marginBottom: '10px',
        justifyContent: 'flex-start' as const,
        alignItems: 'center' as const,
    },
    activeTag: {
        whiteSpace: 'nowrap',
        borderRadius: '10px',
        paddingRight: '8px', paddingLeft: '8px', paddingBottom: '6px', paddingTop: '6px',
        fontFamily: 'var(--font-rounded)',
        fontWeight: 600,
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    searchWrapper: { position: 'relative' as const },
    inputContainer: {
        display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
        border: '1px solid #e3e3e3', borderRadius: '12px', backgroundColor: '#f9f9f9'
    },
    input: { border: 'none', backgroundColor: 'transparent', outline: 'none', width: '100%', fontSize: '14px' },
    dropdown: {
        position: 'absolute' as const, top: '45px', left: 0, right: 0,
        backgroundColor: '#fff', border: '1px solid #e3e3e3', borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, maxHeight: '200px', overflowY: 'auto' as const
    },
    dropdownItem: {
        padding: '10px 15px', 
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center',
        fontFamily: 'var(--font-rounded)',
        fontWeight: 600,
        gap: '10px',
        fontSize: '14px', 
        transition: 'background 0.2s'
    },
    dot: { width: '8px', height: '8px', borderRadius: '50%' },
    noResult: { 
        padding: '10px 15px', 
        color: '#828282', 
        fontSize: '14px',
        fontFamily: 'var(--font-rounded)',
    },
};

export default TagSelector;
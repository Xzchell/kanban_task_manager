import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TapUnderline from '@tiptap/extension-underline';
import { Bold, Code2, Heading1, Heading2, Heading3, Italic, ListOrdered, LucideList, Underline } from 'lucide-react';

interface IRichTextEditor {
    content: string;
    onChange: (html: string) => void;
    minHeight?: string;
}

const RichTextEditor = ({ content, onChange, minHeight }: IRichTextEditor) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                underline: false,
            }),
            TaskList,
            TapUnderline,
            TaskItem.configure({
                nested: true,
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    if (!editor) return null;

    const handleWrapperClick = () => {
        if (editor && !editor.isFocused) {
            editor.chain().focus().run();
        }
    };

    return (
        <div 
            style={{...styles.editorWrapper, minHeight: minHeight || '300px'}}
            onClick={handleWrapperClick}
        >
            <div style={styles.toolbar} onClick={(e) => e.stopPropagation()}>
               
                <button 
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    style={{ 
                        ...styles.toolBtn, 
                        backgroundColor: editor.isActive('bold') ? '#e3e3e3' : 'transparent',
                        color: editor.isActive('bold') ? '#000' : '#555'
                    }}
                >
                    <Bold size={20}/>
                </button>
                <button 
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    style={{ 
                        ...styles.toolBtn, 
                        backgroundColor: editor.isActive('italic') ? '#e3e3e3' : 'transparent',
                        color: editor.isActive('italic') ? '#000' : '#555'
                    }}
                >
                    <Italic size={20}/>
                </button>
                <button 
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    style={{ 
                        ...styles.toolBtn, 
                        backgroundColor: editor.isActive('underline') ? '#e3e3e3' : 'transparent',
                        color: editor.isActive('underline') ? '#000' : '#555'
                    }}
                >
                    <Underline size={20} />
                </button>
                
                <div style={styles.divider}></div>

                <button 
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    style={{ 
                        ...styles.toolBtn, 
                        backgroundColor: editor.isActive('bulletList') ? '#e3e3e3' : 'transparent',
                        color: editor.isActive('bulletList') ? '#000' : '#555'
                    }}
                >
                    <LucideList size={20}/>
                </button>

                <button 
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    style={{ 
                        ...styles.toolBtn, 
                        backgroundColor: editor.isActive('orderedList') ? '#e3e3e3' : 'transparent',
                        color: editor.isActive('orderedList') ? '#000' : '#555'
                    }}
                >
                    <ListOrdered size={20}/>
                </button>
                
                <div style={styles.divider}></div>
                
                <button 
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    style={{ 
                        ...styles.toolBtn, 
                        backgroundColor: editor.isActive('heading', { level: 1 }) ? '#e3e3e3' : 'transparent',
                        color: editor.isActive('heading', { level: 1 }) ? '#000' : '#555'
                    }}
                >
                    <Heading1 size={20}/>
                </button>
                <button 
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    style={{ 
                        ...styles.toolBtn, 
                        backgroundColor: editor.isActive('heading', { level: 2 }) ? '#e3e3e3' : 'transparent',
                        color: editor.isActive('heading', { level: 2 }) ? '#000' : '#555'
                    }}
                >
                    <Heading2 size={20}/>
                </button>
                <button 
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    style={{ 
                        ...styles.toolBtn, 
                        backgroundColor: editor.isActive('heading', { level: 3 }) ? '#e3e3e3' : 'transparent',
                        color: editor.isActive('heading', { level: 3 }) ? '#000' : '#555'
                    }}
                >
                    <Heading3 size={20}/>
                </button>

                <div style={styles.divider}></div>
                
                <button 
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    style={{ 
                        ...styles.toolBtn, 
                        backgroundColor: editor.isActive('codeBlock') ? '#e3e3e3' : 'transparent',
                        color: editor.isActive('codeBlock') ? '#000' : '#555'
                    }}
                >
                    <Code2 size={20}/>
                </button>
            </div>

            <EditorContent editor={editor} style={styles.content} />
        </div>
    );
};

const styles = {
    editorWrapper: {
        border: 'none',
        overflow: 'hidden',
        outline: 'none',
        display: 'flex',
        width: '100%',
        flexDirection: 'column' as const,
        maxHeight: '100%',
        minHeight: '300px',
        cursor: 'text'
    },
    toolbar: {
        display: 'flex',
        flexShrink: 0,
        gap: '5px',
        padding: '5px',
        borderBottom: '2px solid #e3e3e3',
        backgroundColor: '#f9f9f9',
    },
    toolBtn: {
        border: 'none',
        padding: '5px 10px',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease'
    },
    content: {
        display: 'flex',
        flex: 1,
        padding: '10px',
        outline: 'none',
        border: 'none',
        overflowY: 'auto' as const,
        flexDirection: 'column' as const,
        wordBreak: 'break-word' as const,
        whiteSpace: 'pre-wrap' as const,
    },
    divider: {
        width: '2px',
        height: '30px',
        backgroundColor: '#e3e3e3',
        alignSelf: 'center',
    }
};

export default RichTextEditor;
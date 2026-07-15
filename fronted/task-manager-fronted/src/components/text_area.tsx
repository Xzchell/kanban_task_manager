interface ITextAreaProps {
    placeHolder : string;
    onChange: (value : string) => void;
    value: string;
}

const TextArea : React.FC<ITextAreaProps> = ({placeHolder, onChange, value}) => {
    return(
        <textarea
            onChange={(e) => onChange(e.target.value)}
            value={value}
            placeholder={placeHolder}
            style={{
                padding: '12px',
                borderRadius: '10px',
                border: '1.5px solid #eee',
                fontSize: '16px',
                outline: 'none',
                minHeight: '80px',
                resize: 'none' as const
            }}
        />
    );
}

export default TextArea;
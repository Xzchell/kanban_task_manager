import React, { useState } from 'react';
import { useAuth } from '../context/auth_context';
import AlertButton from '../components/alert_button';

const LoginPage = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const { login: loginAction } = useAuth();

    const handleInputChange = (e : React.ChangeEvent<HTMLInputElement>, type : string) => {
        switch (type) {
            case "username":
                setLogin(e.target.value);
                break;
            case "password":
                setPassword(e.target.value);
                break;
            default:
                break;
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const result = await loginAction(login, password);
        if (!result.success) {
            alert(result.message);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Вход в систему</h2>
                <form style={styles.form} onSubmit={handleSubmit}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Логин</label>
                        <input 
                            type="text" 
                            value={login}
                            onChange={(e) => handleInputChange(e, "username")}
                            style={styles.input}
                            placeholder="Введите логин"
                            required
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Пароль</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => handleInputChange(e, "password")}
                            style={styles.input}
                            placeholder="Введите пароль"
                            required
                        />
                    </div>
                    <AlertButton
                        text="Войти"
                        status="primary"
                        type="submit"
                        onClick={() => {}}
                    />
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f2f5', 
    },
    card: {
        width: '100%',
        maxWidth: '400px',
        padding: '40px',
        backgroundColor: '#fff',
        borderRadius: '26px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
        textAlign: 'center' as const,
    },
    title: {
        marginBottom: '30px',
        color: '#333',
        fontSize: '24px',
        fontWeight: 'bold',
    },
    form: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '20px',
    },
    inputGroup: {
        textAlign: 'left' as const,
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        color: '#666',
        fontSize: '14px',
    },
    input: {
        width: '100%',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '16px',
        boxSizing: 'border-box' as const,
        outline: 'none',
    },
    button: {
        fontFamily: 'var(--font-rounded)',
        width: '100%',
        padding: '14px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    }
};

export default LoginPage;
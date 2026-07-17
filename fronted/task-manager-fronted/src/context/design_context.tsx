import React, { createContext, useContext, useState, useEffect } from 'react';
import type { DesignMode } from '../themes/themes';


interface DesignContextType {
    mode: DesignMode;
    toggleMode: (newMode: DesignMode) => void;
}

const DesignContext = createContext<DesignContextType | undefined>(undefined);
 
export const DesignProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<DesignMode>('color');

    useEffect(() => {
        const savedMode = localStorage.getItem('design-mode') as DesignMode;
        if (savedMode === 'color' || savedMode === 'glass') {
            setMode(savedMode);
        }
    }, []);

    const toggleMode = (newMode: DesignMode) => {
        setMode(newMode);
        localStorage.setItem('design-mode', newMode);
    };

    return (
        <DesignContext.Provider value={{ mode, toggleMode }}>
            {children}
        </DesignContext.Provider>
    );
};

export const useDesignMode = () => {
    const context = useContext(DesignContext);
    if (!context) throw new Error('useDesignMode must be used within DesignProvider');
    return context;
};
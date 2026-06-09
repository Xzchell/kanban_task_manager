import { createContext, useContext} from "react";
import type { IAlertButtonProps } from "../components/alert_button";

export interface IAlertContextType{
    showAlert: (title: string, description: string, buttons: IAlertButtonProps[]) => void;
    hideAlert: () => void;
}

export const AlertContext = createContext<IAlertContextType | undefined>(undefined);

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};
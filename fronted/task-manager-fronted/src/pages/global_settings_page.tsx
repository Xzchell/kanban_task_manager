import { AnimatedBackground } from "../components/animated_background";
import { ToggleSwitch } from "../components/switcher";
import { useDesignMode } from "../context/design_context";
import { theme } from "../themes/themes";

const GlobalSettingsPage: React.FC = () => {
    const { mode, toggleMode } = useDesignMode();
    const currentDesign = theme.modes[mode];

    const handleToggleChange = () => {
        const nextMode = mode === 'color' ? 'glass' : 'color';
        toggleMode(nextMode);
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
            <div style={styles.backgroundFixedWrapper}>
                <AnimatedBackground />
            </div>

            <div style={{...styles.pageContainer}}>
                <div style={styles.headerRow}>
                    <div>
                        <h1 style={styles.title}>Параметры</h1>
                        <p style={styles.subtitle}>
                            Персонализация веб-сервиса
                        </p>
                    </div>
                </div>
                
                <div style={styles.scrollContainer}>
                    <div style={{ 
                        ...currentDesign.searchBar, 
                        borderRadius: theme.borderRadius.xlarge, 
                        width: "auto", 
                        height: "auto", 
                        display: "flex", 
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "25px", 
                        gap: "20px", 
                        marginBottom: "20px" 
                    }}>                        
                        <ToggleSwitch
                            label="Включить эффект размытия (Влияет на производительность)"
                            checked={mode === 'glass'} 
                            onChange={handleToggleChange}
                        />
                    <label>Остальные параметры будут добавлны позже...</label>
                    </div>                    
                </div>
            </div>
        </div>
    );
}

export default GlobalSettingsPage;

const styles = {
    pageContainer: {
        display: "flex",
        flexDirection: "column" as const,
        flex: 1,
        overflow: "hidden",
        zIndex: 2,
        fontFamily: "var(--font-rounded)",
    },
    backgroundFixedWrapper: {
        position: "fixed" as const,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1,
        pointerEvents: "none" as const,
    },
    headerRow: { paddingTop: "50px", paddingLeft: "120px", paddingRight: "20px", width: "auto", marginBottom: "10px", display: "flex", flexDirection: "row" as const, justifyContent: 'space-between'},
    title: { fontSize: "26px", fontWeight: 700, color: "#1e293b", margin: "0 0 6px 0" },
    subtitle: { fontSize: "14px", color: "#64748b", margin: 0 },
    scrollContainer: {
        paddingLeft: "120px",
        paddingRight: "20px",
        paddingTop: "15px",
        flex: 1,
        overflowY: "auto" as const,
        WebkitMaskImage: `linear-gradient(to bottom, transparent, black 24px, black calc(100% - 24px), transparent)`,
        maskImage: `linear-gradient(to bottom, transparent, black 24px, black calc(100% - 24px), transparent)`,
        WebkitMaskComposite: "source-in" as const,
        maskComposite: "intersect" as const,
    },
}
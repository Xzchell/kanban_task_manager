import React from "react";

export const AnimatedBackground: React.FC = () => {
    return (
        <div style={styles.container}>
        <style>
            {`
            @keyframes float1 {
                0% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
                25% { transform: translate(80px, -120px) scale(1.15) rotate(90deg); }
                50% { transform: translate(160px, -40px) scale(0.9) rotate(180deg); }
                75% { transform: translate(60px, 80px) scale(1.05) rotate(270deg); }
                100% { transform: translate(0px, 0px) scale(1) rotate(360deg); }
            }
            @keyframes float2 {
                0% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
                33% { transform: translate(-140px, 80px) scale(0.85) rotate(-120deg); }
                66% { transform: translate(80px, -160px) scale(1.2) rotate(-240deg); }
                100% { transform: translate(0px, 0px) scale(1) rotate(-360deg); }
            }
            @keyframes float3 {
                0% { transform: translate(0px, 0px) scale(1) rotate(0deg); }
                30% { transform: translate(180px, 160px) scale(1.1) rotate(100deg); }
                70% { transform: translate(-100px, 200px) scale(0.95) rotate(240deg); }
                100% { transform: translate(0px, 0px) scale(1) rotate(360deg); }
            }
            `}
        </style>
-
            <div style={{ ...styles.spot, ...styles.blueSpot }}></div>
            <div style={{ ...styles.spot, ...styles.purpleSpot }}></div>
            <div style={{ ...styles.spot, ...styles.lightBlueSpot }}></div>

            <div style={styles.gridOverlay}></div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
        zIndex: 0,
        backgroundColor: "#eef4ff", 
    },
    spot: {
        position: "absolute",
        borderRadius: "50%",
        filter: "blur(90px)",
        opacity: 0.2, 
    },
    blueSpot: {
        top: "-10%",
        left: "-10%",
        width: "45vw",
        height: "35vw",
        backgroundColor: "#0d6fff", 
        animation: "float1 14s infinite ease-in-out",
    },
    purpleSpot: {
        bottom: "-10%",
        right: "-10%",
        width: "30vw",
        height: "30vw",
        backgroundColor: "#8b5cf6", 
        animation: "float2 18s infinite ease-in-out",
    },
    lightBlueSpot: {
        top: "0%",
        left: "60%",
        width: "45vw",
        height: "45vw",
        backgroundColor: "#06b6d4", 
        animation: "float3 12s infinite ease-in-out",
    },
    gridOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: "radial-gradient(rgba(107, 114, 128, 0.25) 1px, transparent 1px)",
        backgroundSize: "28px 28px", 
        WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 90%)",
        maskImage: "radial-gradient(ellipse at center, black 30%, transparent 90%)",
        zIndex: 1, 
        pointerEvents: "none",
    },
};
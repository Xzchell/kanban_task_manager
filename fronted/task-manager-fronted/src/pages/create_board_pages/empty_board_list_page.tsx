import React, { useState } from "react";
import { Plus, Layers } from "lucide-react";
import NeonButton from "../../components/neon_button";
import CustomModal from "../../components/custom_modal";
import { AnimatePresence } from "motion/react";
import { AnimatedBackground } from "../../components/animated_background";

interface EmptyBoardsStateProps {
  onCreateBoard: () => void;
}

const FLOAT_CARDS = [
  { label: "Бэклог", count: 4, badgeBg: "#6366f1", badgeText: "#ffffff", top: "12%", left: "8%", rotate: "-6deg", delay: "0s" },
  { label: "В работе", count: 2, badgeBg: "#f59e0b", badgeText: "#ffffff", top: "18%", right: "10%", rotate: "5deg", delay: "0.4s" },
  { label: "Готово", count: 7, badgeBg: "#10b981", badgeText: "#ffffff", bottom: "20%", left: "10%", rotate: "4deg", delay: "0.8s" },
  { label: "Ревью", count: 1, badgeBg: "#8b5cf6", badgeText: "#ffffff", bottom: "16%", right: "8%", rotate: "-4deg", delay: "1.2s" },
];

const EmptyBoardsState: React.FC<EmptyBoardsStateProps> = ({ onCreateBoard }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    
    const [title, setTitle] = useState("");

    const handleSave = () => {
        // Твоя логика отправки на бэкенд: createBoard({ title, ... })
        setModalOpen(false);
    };


    return (
        <div style={styles.container}>
        <style>{`
            @keyframes emptyFloat {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-10px); }
            }
            @keyframes pulseRing {
            0%   { transform: scale(1);   opacity: 0.4; }
            100% { transform: scale(1.9); opacity: 0; }
            }
            @keyframes spinSlow {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
            }
            @media (max-width: 768px) {
            .responsive-float-card { display: none !important; }
            }
        `}</style>
    <AnimatedBackground />
        {FLOAT_CARDS.map((card) => (
            <div
            key={card.label}
            className="responsive-float-card"
            style={{
                ...styles.floatCardWrapper,
                top: card.top,
                left: card.left,
                right: card.right,
                bottom: card.bottom,
                animationDelay: card.delay,
            }}
            >
            <div style={{ ...styles.floatCardBody, transform: `rotate(${card.rotate})` }}>
                <div style={styles.floatCardHeader}>
                    <span style={styles.floatCardLabel}>{card.label}</span>
                    <span style={{ ...styles.floatCardBadge, backgroundColor: card.badgeBg, color: card.badgeText }}>
                        {card.count}
                    </span>
                </div>
                <div style={styles.floatCardProgressWrapper}>
                    <div style={{...styles.floatCardProgressLine1, backgroundColor: card.badgeBg }} />
                    <div style={styles.floatCardProgressLine1} />
                    <div style={styles.floatCardProgressLine2} />
                </div>
            </div>
            </div>
        ))}


        <div style={styles.neonSphereLeft} />
        <div style={styles.neonSphereRight} />

        <div style={styles.contentBlock}>
            

            <div style={styles.ringsWrapper}>
            {[0, 1, 2].map((i) => (
                <span
                key={i}
                style={{
                    ...styles.pulseRing,
                    width: 80 + i * 44,
                    height: 80 + i * 44,
                    animationDelay: `${i * 0.6}s`,
                }}
                />
            ))}

            <div style={styles.iconContainer}>
                <div style={styles.iconSpinRing} />
                <Layers size={28} style={styles.icon} />
            </div>
            </div>

            <h2 style={styles.title}>Нет досок</h2>
            <p style={styles.subtitle}>
            Создайте первую доску — и начните управлять задачами, спринтами и командой
            </p>

            
            <NeonButton
                onClick={
                    () => {
                        setModalOpen(true);
                    }
                }
                text="Создать доску"
                icon={<Plus size={16} color="#fff" />}
                status="primary"
                fullWidth={false}
                borderRadius="20px"
                leftIcon={true}
            />

            <p style={styles.footerHint}>
            Хакатон или бизнес — выберите тип после нажатия
            </p>
            </div>
            <CustomModal 
                isOpen={isModalOpen} 
                onClose={() => setModalOpen(false)}
                width="50vw"
                height="70vh"
                children={
                   <div className="modal-content" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}> 
                        <div className="modal-header" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px", width: "100%" }}>
                            <h2 style={{ margin: 0 }}>Новая доска</h2>
                            <label style={{ color: "#647080" }}>Выберите тип пространства</label>
                        </div>
                   </div>
                }
                />
        
        </div>
    );
};

export default EmptyBoardsState;

const styles = {
  container: {
    position: "relative" as const,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    width: "100%",
    height: "100%",
    overflow: "hidden" as const,
    backgroundColor: "#e0e7ff",
    transition: "background-color 0.3s, color 0.3s",
  },

  floatCardWrapper: {
    position: "absolute" as const,
    userSelect: "none" as const,
    pointerEvents: "none" as const,
    animation: "emptyFloat 4s ease-in-out infinite",
  },
  floatCardBody: {
    backgroundColor: "#fff", 
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderRadius: "16px",
    padding: "12px 16px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    border: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
    minWidth: "130px",
    transition: "background-color 0.3s, border-color 0.3s",
  },
  floatCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },
  floatCardLabel: {
    fontSize: "11px",
    fontWeight: "bold",
    color: "var(--muted-foreground)",
  },
  floatCardBadge: {
    fontSize: "10px",
    fontfamily: "var(--font-rounded)",
    fontWeight: 600,
    width: "15px",
    height: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
  },
  floatCardProgressWrapper: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "4px",
  },
  floatCardProgressLine1: {
    height: "6px",
    borderRadius: "9999px",
    backgroundColor: "rgba(100, 116, 139, 0.2)",
    width: "80%",
  },
  floatCardProgressLine2: {
    height: "6px",
    borderRadius: "9999px",
    backgroundColor: "rgba(100, 116, 139, 0.1)",
    width: "55%",
  },
  neonSphereLeft: {
    position: "absolute" as const,
    width: "320px",
    height: "320px",
    borderRadius: "50%",
    backgroundColor: "rgba(79, 110, 247, 0.1)",
    filter: "blur(64px)",
    zIndex: -10,
    top: "10%",
    left: "20%",
  },
  neonSphereRight: {
    position: "absolute" as const,
    width: "240px",
    height: "240px",
    borderRadius: "50%",
    backgroundColor: "rgba(79, 110, 247, 0.05)",
    filter: "blur(64px)",
    zIndex: -10,
    bottom: "15%",
    right: "15%",
  },

  contentBlock: {
    position: "relative" as const,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    zIndex: 10,
    textAlign: "center" as const,
  },

  ringsWrapper: {
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "32px",
  },
  pulseRing: {
    position: "absolute" as const,
    borderRadius: "50%",
    border: "1px solid rgba(79, 110, 247, 0.2)",
    animation: "pulseRing 2.4s ease-out infinite",
  },
  iconContainer: {
    position: "relative" as const,
    width: "80px",
    height: "80px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7177f4   ",
    boxShadow: "0 20px 25px -5px rgba(79, 110, 247, 0.2), 0 10px 10px -5px rgba(79, 110, 247, 0.2)",
  },
  iconSpinRing: {
    position: "absolute" as const,
    inset: "8px",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderTop: "1px solid rgba(255, 255, 255, 0.6)",
    animation: "spinSlow 3s linear infinite",
  },
  icon: {
    color: "#fff",
    position: "relative" as const,
    zIndex: 10,
  },

  title: {
    fontSize: "30px",
    fontWeight: 800,
    color: "var(--foreground)",
    letterSpacing: "-0.025em",
    marginBottom: "12px",
  },
  subtitle: {
    fontSize: "14px",
    color: "var(--muted-foreground)",
    maxWidth: "280px",
    lineHeight: "1.6",
    marginBottom: "40px",
  },
  footerHint: {
    marginTop: "20px",
    fontSize: "11px",
    color: "var(--muted-foreground)",
    fontWeight: 500,
  },

  ctaButton: {
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 40px",
    backgroundColor: "var(--primary)",
    color: "var(--primary-foreground)",
    borderRadius: "var(--radius)",
    fontWeight: "bold",
    fontSize: "16px",
    overflow: "hidden" as const,
    border: "none",
    outline: "none",
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(79, 110, 247, 0.25)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  ctaButtonGlow: {
    position: "absolute" as const,
    inset: 0,
    background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 100%)",
    transform: "translateX(-100%)",
    transition: "transform 0.6s ease-in-out",
    pointerEvents: "none" as const,
  },
  ctaButtonIconWrapper: {
    position: "relative" as const,
    width: "32px",
    height: "32px",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: "calc(var(--radius) - 4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
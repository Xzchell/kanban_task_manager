import { motion } from "motion/react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div style={barStyles.container}>
      {steps.map((s, index) => {
        let bgColor = "#e5e7eb"; 
        if (index < currentStep) {
          bgColor = "rgba(13,111,255,0.3)";
        } else if (index === currentStep) {
          bgColor = "#0d6fff"; 
        }

        return (
          <motion.div
            key={s}
            layout
            style={barStyles.step}
            animate={{
              flex: index === currentStep ? 2 : 1,
              backgroundColor: bgColor,
            }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          />
        );
      })}
    </div>
  );
}

const barStyles = {
  container: {
    display: 'flex',
    gap: '6px',
    width: '100%',
    margin: '8px 0',
  },
  step: {
    height: '6px',
    borderRadius: '9999px',
    overflow: 'hidden',
  }
};
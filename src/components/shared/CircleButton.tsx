import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  button: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    borderStyle: "solid",
    borderWidth: 0,
    cursor: "pointer",
    transition: "transform 0.1s ease",
    ":hover": { transform: "scale(1.2)" },
  },
  active: {
    boxShadow: "0 0 0 2px rgba(255, 255, 255, 0.5), 0 0 8px rgba(0,0,0,0.3)",
    transform: "scale(1.2)",
  },
});

interface CircleButtonProps {
  backgroundColor: string;
  isActive: boolean;
  onClick: () => void;
  "aria-label"?: string;
}

export default function CircleButton({
  backgroundColor,
  isActive,
  onClick,
  "aria-label": ariaLabel,
}: CircleButtonProps) {
  return (
    <button
      type="button"
      {...stylex.props(styles.button, isActive && styles.active)}
      style={{ backgroundColor }}
      onClick={onClick}
      aria-label={ariaLabel}
    />
  );
}

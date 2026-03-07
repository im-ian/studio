import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";

import { colors, spacing } from "../../tokens.stylex";

const styles = stylex.create({
  button: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    padding: `${spacing.xsmall} ${spacing.small}`,
    borderRadius: "12px",
    borderStyle: "solid",
    borderWidth: 0,
    backgroundColor: "transparent",
    color: colors.textMain,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    ":active": {
      transform: "scale(0.95)",
    },
  },
  activeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: colors.accent,
  },
});

interface IconButtonProps {
  children: ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  type?: "button" | "submit" | "reset";
  "aria-label"?: string;
}

export default function IconButton({
  children,
  onClick,
  isActive = false,
  type = "button",
  "aria-label": ariaLabel,
}: IconButtonProps) {
  return (
    <button
      type={type}
      {...stylex.props(styles.button, isActive && styles.activeButton)}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

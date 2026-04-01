import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";

import { spacing } from "../../../tokens.stylex";

const styles = stylex.create({
  submenu: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: spacing.small,
    padding: `${spacing.small} ${spacing.medium}`,
    backgroundColor: "rgba(200, 200, 200, 0.1)",
    backdropFilter: "blur(16px)",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    marginBottom: spacing.small,
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.4)",
    animationName: stylex.keyframes({
      from: { opacity: 0, transform: "translateY(10px)" },
      to: { opacity: 1, transform: "translateY(0)" },
    }),
    animationDuration: "0.2s",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  closing: {
    opacity: 0,
    transform: "translateY(20px) scale(0.95)",
    pointerEvents: "none",
  },
});

interface SubmenuContainerProps {
  children: ReactNode;
  isExiting?: boolean;
}

export default function SubmenuContainer({
  children,
  isExiting = false,
}: SubmenuContainerProps) {
  return (
    <div {...stylex.props(styles.submenu, isExiting && styles.closing)}>
      {children}
    </div>
  );
}

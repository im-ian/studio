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
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(16px)",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    marginBottom: spacing.small,
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
    animationName: stylex.keyframes({
      from: { opacity: 0, transform: "translateY(10px)" },
      to: { opacity: 1, transform: "translateY(0)" },
    }),
    animationDuration: "0.2s",
  },
  bounce: {
    animationName: stylex.keyframes({
      "0%, 20%, 50%, 80%, 100%": { transform: "translateY(0)" },
      "40%": { transform: "translateY(-10px)" },
      "60%": { transform: "translateY(-5px)" },
    }),
    animationDuration: "1s",
    animationIterationCount: 1,
  },
});

interface SubmenuContainerProps {
  children: ReactNode;
  shouldBounce?: boolean;
}

export default function SubmenuContainer({
  children,
  shouldBounce = false,
}: SubmenuContainerProps) {
  return (
    <div {...stylex.props(styles.submenu, shouldBounce && styles.bounce)}>
      {children}
    </div>
  );
}

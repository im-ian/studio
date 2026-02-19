import * as stylex from "@stylexjs/stylex";

import { colors, spacing } from "../tokens.stylex.ts";

const styles = stylex.create({
  toolbar: {
    width: "48px",
    backgroundColor: colors.bgPanel,
    borderRight: `1px solid ${colors.border}`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingBlock: spacing.md,
    gap: spacing.md,
  },
  toolIcon: {
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    borderRadius: "4px",
    color: colors.textMuted,
    fontSize: "20px",
    ":hover": {
      backgroundColor: colors.bgActive,
      color: colors.textMain,
    },
  },
  active: {
    backgroundColor: colors.bgActive,
    color: colors.accent,
  },
});

export const Toolbar = () => {
  return (
    <aside {...stylex.props(styles.toolbar)}>
      <div {...stylex.props(styles.toolIcon, styles.active)}>✥</div>
      <div {...stylex.props(styles.toolIcon)}>⬚</div>
      <div {...stylex.props(styles.toolIcon)}>✎</div>
      <div {...stylex.props(styles.toolIcon)}>🪄</div>
      <div {...stylex.props(styles.toolIcon)}>✄</div>
      <div {...stylex.props(styles.toolIcon)}>🎨</div>
      <div {...stylex.props(styles.toolIcon)}>⎗</div>
    </aside>
  );
};

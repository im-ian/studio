import * as stylex from "@stylexjs/stylex";

import { colors, spacing } from "../tokens.stylex.ts";

const styles = stylex.create({
  header: {
    height: "40px",
    backgroundColor: colors.bgHeader,
    display: "flex",
    alignItems: "center",
    paddingInline: spacing.md,
    borderBottom: `1px solid ${colors.border}`,
    color: colors.textMain,
    fontSize: "13px",
    gap: spacing.lg,
  },
  menuItem: {
    cursor: "pointer",
    ":hover": {
      color: "#fff",
    },
  },
});

export const Header = () => {
  return (
    <header {...stylex.props(styles.header)}>
      <div {...stylex.props(styles.menuItem)}>File</div>
      <div {...stylex.props(styles.menuItem)}>Edit</div>
      <div {...stylex.props(styles.menuItem)}>Image</div>
      <div {...stylex.props(styles.menuItem)}>Layer</div>
      <div {...stylex.props(styles.menuItem)}>Select</div>
      <div {...stylex.props(styles.menuItem)}>Filter</div>
      <div {...stylex.props(styles.menuItem)}>Window</div>
      <div {...stylex.props(styles.menuItem)}>Help</div>
    </header>
  );
};

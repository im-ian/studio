import * as stylex from "@stylexjs/stylex";

import { colors, spacing } from "../tokens.stylex.ts";

const styles = stylex.create({
  panel: {
    width: "300px",
    backgroundColor: colors.bgPanel,
    borderLeft: `1px solid ${colors.border}`,
    display: "flex",
    flexDirection: "column",
    color: colors.textMain,
  },
  section: {
    flex: 1,
    padding: spacing.md,
    borderBottom: `1px solid ${colors.border}`,
  },
  title: {
    fontSize: "11px",
    fontWeight: "bold",
    textTransform: "uppercase",
    color: colors.textMuted,
    marginBottom: spacing.sm,
    display: "flex",
    justifyContent: "space-between",
  },
  layerItem: {
    height: "32px",
    backgroundColor: colors.bgActive,
    borderRadius: "2px",
    marginBottom: "4px",
    display: "flex",
    alignItems: "center",
    paddingInline: spacing.sm,
    fontSize: "12px",
    cursor: "pointer",
    border: `1px solid ${colors.accent}`,
  },
  mutedLayer: {
    backgroundColor: "transparent",
    border: "1px solid transparent",
    color: colors.textMuted,
  },
});

export const SidePanel = () => {
  return (
    <div {...stylex.props(styles.panel)}>
      <div {...stylex.props(styles.section)}>
        <div {...stylex.props(styles.title)}>Properties</div>
        <div style={{ fontSize: "12px" }}>No selection</div>
      </div>
      <div {...stylex.props(styles.section)}>
        <div {...stylex.props(styles.title)}>
          <span>Layers</span>
          <span>+</span>
        </div>
        <div {...stylex.props(styles.layerItem)}>Layer 1</div>
        <div {...stylex.props(styles.layerItem, styles.mutedLayer)}>
          Background
        </div>
      </div>
    </div>
  );
};

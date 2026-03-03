import * as stylex from "@stylexjs/stylex";
import { Aperture } from "react-feather";

import { radius, spacing } from "../../tokens.stylex.ts";

const styles = stylex.create({
  header: {
    position: "fixed",
    top: spacing.medium,
    left: spacing.medium,
    right: spacing.medium,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: `${spacing.small} ${spacing.small}`,
    borderRadius: radius["2xl"],
    zIndex: 1000,
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xsmall,
  },
  logo: {
    fontSize: 20,
    fontWeight: 800,
  },
  menu: {
    display: "flex",
    alignItems: "center",
    gap: spacing.medium,
  },
});

export default function Header() {
  return (
    <header {...stylex.props(styles.header)}>
      <div {...stylex.props(styles.logoContainer)}>
        <Aperture />
        <h1 {...stylex.props(styles.logo)}>Studio</h1>
      </div>

      <div {...stylex.props(styles.menu)}></div>
    </header>
  );
}

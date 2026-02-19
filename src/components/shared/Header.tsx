import * as stylex from "@stylexjs/stylex";
import { Aperture } from "react-feather";

import { radius, spacing } from "../../tokens.stylex.ts";
import InputFile from "../ui/InputFile.tsx";

const styles = stylex.create({
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.medium,
    borderRadius: radius["2xl"],
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xsmall,
  },
  logo: {
    fontSize: 24,
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
    <div {...stylex.props(styles.header)}>
      <div {...stylex.props(styles.logoContainer)}>
        <Aperture />
        <h1 {...stylex.props(styles.logo)}>Studio</h1>
      </div>

      <div {...stylex.props(styles.menu)}>
        <InputFile placeholder="업로드" />
      </div>
    </div>
  );
}

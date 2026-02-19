import * as stylex from "@stylexjs/stylex";
import type { HTMLProps } from "react";

import { colors, radius, spacing, timing } from "../../tokens.stylex";

const styles = stylex.create({
  button: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xsmall,
    appearance: "none",
    WebkitAppearance: "none",
    height: 32,
    padding: `0 ${spacing.medium}`,
    borderRadius: radius.full,
    borderStyle: "solid",
    borderColor: colors.textMain,
    backgroundColor: {
      default: colors.bgApp,
      ":hover": colors.textMain,
    },
    color: {
      default: colors.textMain,
      ":hover": colors.bgApp,
    },
    fontSize: 14,
    transition: `background-color ${timing.slow} ease-in-out, color ${timing.slow} ease-in-out`,
    cursor: "pointer",
  },
});

interface ButtonProps extends HTMLProps<HTMLButtonElement> {
  type: "button" | "submit" | "reset";
}

export default function Button({ type, ...props }: ButtonProps) {
  return <button type={type} {...stylex.props(styles.button)} {...props} />;
}

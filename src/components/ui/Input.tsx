import * as stylex from "@stylexjs/stylex";
import type { HTMLProps } from "react";

import { colors, radius, spacing, timing } from "../../tokens.stylex";

const styles = stylex.create({
  input: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xsmall,
    appearance: "none",
    WebkitAppearance: "none",
    height: 32,
    padding: `0 ${spacing.medium}`,
    borderRadius: radius.md,
    borderStyle: "solid",
    borderColor: colors.textMain,
    backgroundColor: colors.bgApp,
    color: colors.textMain,
    fontSize: 14,
    outline: "none",
    transition: `background-color ${timing.slow} ease-in-out, color ${timing.slow} ease-in-out`,
  },
});

interface InputProps extends HTMLProps<HTMLInputElement> {}

export default function Input({ ...props }: InputProps) {
  return <input {...stylex.props(styles.input)} {...props} />;
}

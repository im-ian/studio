import * as stylex from "@stylexjs/stylex";
import { type HTMLProps, useRef, useState } from "react";
import { Upload } from "react-feather";

import { colors, radius, spacing, timing } from "../../tokens.stylex";

const styles = stylex.create({
  appearance: {
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
  displayNone: {
    display: "none",
  },
});

interface InputFileProps extends HTMLProps<HTMLInputElement> {
  displayFileName?: boolean;
}

export default function InputFile({
  placeholder = "",
  value,
  children: _children,
  displayFileName,
  ...props
}: InputFileProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  return (
    <div>
      <button
        {...stylex.props(styles.appearance)}
        onClick={() => {
          if (!inputRef.current) return;
          inputRef.current.click();
        }}
      >
        <Upload size={16} /> {displayFileName ? file?.name : placeholder}
      </button>
      <input
        ref={inputRef}
        type="file"
        value={value}
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        {...stylex.props(styles.displayNone)}
        {...props}
      />
    </div>
  );
}

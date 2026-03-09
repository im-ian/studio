import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";

import { colors, fontSize, radius, spacing } from "../../tokens.stylex";
import Modal from "./Modal";

const styles = stylex.create({
  message: {
    color: colors.textMain,
    fontSize: fontSize.medium,
    lineHeight: 1.5,
    margin: 0,
    opacity: 0.9,
  },
  footer: {
    padding: `${spacing.medium} ${spacing.medium}`,
    display: "flex",
    gap: spacing.small,
    justifyContent: "flex-end",
    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
    marginTop: spacing.medium,
  },
  button: {
    padding: `${spacing.small} ${spacing.large}`,
    borderRadius: radius.md,
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    borderWidth: 0,
    borderStyle: "solid",
  },
  buttonCancel: {
    backgroundColor: "transparent",
    color: colors.textMain,
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
    },
  },
  buttonConfirm: {
    backgroundColor: colors.accent,
    color: "white",
    ":hover": {
      backgroundColor: "rgba(0, 120, 212, 0.8)",
    },
  },
  buttonDanger: {
    backgroundColor: "#ff3b30",
    color: "white",
    ":hover": {
      backgroundColor: "rgba(255, 59, 48, 0.8)",
    },
  },
});

interface ConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "primary" | "danger";
}

export default function Confirm({
  isOpen,
  onClose,
  onConfirm,
  title = "확인",
  message,
  confirmText = "확인",
  cancelText = "취소",
  variant = "primary",
}: ConfirmProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showCloseButton={false}
    >
      <p {...stylex.props(styles.message)}>{message}</p>
      <div {...stylex.props(styles.footer)}>
        <button
          type="button"
          onClick={onClose}
          {...stylex.props(styles.button, styles.buttonCancel)}
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          {...stylex.props(
            styles.button,
            variant === "primary" ? styles.buttonConfirm : styles.buttonDanger,
          )}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}

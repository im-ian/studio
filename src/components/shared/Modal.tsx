import * as stylex from "@stylexjs/stylex";
import { type ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "react-feather";

import { useClickOutside } from "../../hooks/useClickOutside";
import { colors, radius, spacing } from "../../tokens.stylex";
import IconButton from "./IconButton";

const styles = stylex.create({
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    animationName: stylex.keyframes({
      from: { opacity: 0 },
      to: { opacity: 1 },
    }),
    animationDuration: "0.2s",
  },
  modal: {
    backgroundColor: colors.bgPanel,
    borderRadius: radius.lg,
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
    minWidth: "320px",
    maxWidth: "90vw",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    animationName: stylex.keyframes({
      from: { opacity: 0, transform: "scale(0.9) translateY(10px)" },
      to: { opacity: 1, transform: "scale(1) translateY(0)" },
    }),
    animationDuration: "0.3s",
    animationTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  header: {
    padding: `${spacing.large} ${spacing.large} ${spacing.medium}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  },
  title: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: colors.textMain,
    margin: 0,
  },
  closeButton: {
    marginRight: "-8px",
  },
  content: {
    padding: spacing.large,
    color: colors.textMain,
  },
});

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  showCloseButton?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useClickOutside(modalRef, onClose, isOpen);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div {...stylex.props(styles.overlay)}>
      <div ref={modalRef} {...stylex.props(styles.modal)}>
        {(title || showCloseButton) && (
          <div {...stylex.props(styles.header)}>
            {title && <h3 {...stylex.props(styles.title)}>{title}</h3>}
            {showCloseButton && (
              <div {...stylex.props(styles.closeButton)}>
                <IconButton onClick={onClose} aria-label="Close modal">
                  <X size={20} />
                </IconButton>
              </div>
            )}
          </div>
        )}
        <div {...stylex.props(styles.content)}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}

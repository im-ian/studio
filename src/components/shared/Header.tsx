import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { Aperture, Settings } from "react-feather";

import { radius, spacing } from "../../tokens.stylex.ts";
import SettingsModal from "../features/SettingsModal.tsx";
import IconButton from "../ui/IconButton.tsx";

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <header {...stylex.props(styles.header)}>
      <div {...stylex.props(styles.logoContainer)}>
        <Aperture />
        <h1 {...stylex.props(styles.logo)}>Studio</h1>
      </div>

      <div {...stylex.props(styles.menu)}>
        <IconButton onClick={() => setIsSettingsOpen(true)} aria-label="설정">
          <Settings size={18} />
        </IconButton>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </header>
  );
}

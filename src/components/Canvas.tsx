import * as stylex from "@stylexjs/stylex";

import { colors } from "../tokens.stylex.ts";

const styles = stylex.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgCanvas,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  canvas: {
    width: "80%",
    height: "80%",
    backgroundColor: "#ffffff",
    boxShadow: "0 0 20px rgba(0,0,0,0.5)",
    cursor: "crosshair",
  },
  zoomInfo: {
    position: "absolute",
    bottom: "10px",
    left: "10px",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: "4px 8px",
    borderRadius: "2px",
    color: colors.textMain,
    fontSize: "11px",
  },
});

export const Canvas = () => {
  return (
    <main {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.canvas)} />
      <div {...stylex.props(styles.zoomInfo)}>100%</div>
    </main>
  );
};

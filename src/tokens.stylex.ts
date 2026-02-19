import * as stylex from "@stylexjs/stylex";

export const DARKMODE = "@media (prefers-color-scheme: dark)";

export const colors = stylex.defineVars({
  bgApp: "#1e1e1e",
  bgPanel: "#252525",
  bgHeader: "#3c3c3c",
  bgCanvas: "#2a2a2a",
  bgActive: "#4d4d4d",
  border: "#121212",
  textMain: "#eee",
  textMuted: "#888888",
  accent: "#0078d4",
});

export const spacing = stylex.defineVars({
  none: "0px",
  xsmall: "4px",
  small: "8px",
  medium: "12px",
  large: "20px",
  xlarge: "32px",
  xxlarge: "48px",
  xxxlarge: "96px",
});

export const radius = stylex.defineVars({
  xs: "2px",
  sm: "4px",
  md: "8px",
  lg: "16px",
  xl: "32px",
  "2xl": "64px",
  full: "9999px",
});

export const timing = stylex.defineVars({
  fast: "100ms",
  normal: "200ms",
  slow: "300ms",
});

export const size = stylex.defineVars({
  full: "100%",
  "1/2": "50%",
  "1/3": "33.33%",
  "2/3": "66.66%",
  "1/4": "25%",
  "3/4": "75%",
  "1/5": "20%",
  "2/5": "40%",
  "3/5": "60%",
  "4/5": "80%",
  "1/6": "16.66%",
  "5/6": "83.33%",
});

import * as stylex from "@stylexjs/stylex";

import { Canvas } from "./components/Canvas.tsx";
import { Header } from "./components/Header.tsx";
import { SidePanel } from "./components/SidePanel.tsx";
import { Toolbar } from "./components/Toolbar.tsx";
import { colors } from "./tokens.stylex.ts";

const styles = stylex.create({
  app: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: colors.bgApp,
    color: colors.textMain,
    overflow: "hidden",
  },
  middle: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },
});

function App() {
  return (
    <div {...stylex.props(styles.app)}>
      <Header />
      <div {...stylex.props(styles.middle)}>
        <Toolbar />
        <Canvas />
        <SidePanel />
      </div>
    </div>
  );
}

export default App;

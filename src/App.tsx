import * as stylex from "@stylexjs/stylex";

import Header from "./components/shared/Header.tsx";
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
      <div {...stylex.props(styles.middle)}></div>
    </div>
  );
}

export default App;

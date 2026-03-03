import * as stylex from "@stylexjs/stylex";

import ImageEditor from "./components/features/ImageEditor.tsx";
import Header from "./components/shared/Header.tsx";
import { colors, spacing } from "./tokens.stylex.ts";

const styles = stylex.create({
  app: {
    display: "flex",
    flexDirection: "column",
    width: "100vw",
    height: "100vh",
    backgroundColor: colors.bgApp,
    color: colors.textMain,
    overflow: "hidden",
  },
  middle: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
});

function App() {
  return (
    <div {...stylex.props(styles.app)}>
      <Header />
      <div {...stylex.props(styles.middle)}>
        <ImageEditor />
      </div>
    </div>
  );
}

export default App;

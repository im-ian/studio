import * as stylex from "@stylexjs/stylex";

import Header from "./components/shared/Header.tsx";
import ImageEditor from "./components/shared/ImageEditor.tsx";
import { colors, spacing } from "./tokens.stylex.ts";

const styles = stylex.create({
  app: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: colors.bgApp,
    color: colors.textMain,
    padding: spacing.medium,
    gap: spacing.medium,
  },
  middle: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: spacing.medium,
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

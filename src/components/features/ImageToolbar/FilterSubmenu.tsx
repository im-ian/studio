import IconButton from "../../shared/IconButton";
import SubmenuContainer from "./SubmenuContainer";

export default function FilterSubmenu() {
  return (
    <SubmenuContainer>
      <IconButton>선명하게</IconButton>
      <IconButton>흑백</IconButton>
      <IconButton>세피아</IconButton>
    </SubmenuContainer>
  );
}

import IconButton from "../../shared/IconButton";
import SubmenuContainer from "./SubmenuContainer";

export default function EditSubmenu() {
  return (
    <SubmenuContainer>
      <IconButton>자르기</IconButton>
      <IconButton>회전</IconButton>
      <IconButton>크기 조절</IconButton>
    </SubmenuContainer>
  );
}

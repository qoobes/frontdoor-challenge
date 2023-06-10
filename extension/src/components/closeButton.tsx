import { CgClose } from "react-icons/cg";
import { IconButton, IconButtonProps } from "./ui/IconButton";

type Props = Omit<IconButtonProps, "children">;

export const CloseButton: React.FC<Props> = ({ ...rest }) => (
  <IconButton {...rest}>
    <CgClose />
  </IconButton>
);

import { CloseButton } from "./closeButton";

type Props = {
  title: string;
  onClose: () => void;
};

export const ModalHeader: React.FC<Props> = ({ title, onClose }) => (
  <div className="w-full flex justify-between items-center">
    <h1 className="text-xl font-bold font-space">{title}</h1>

    <CloseButton onClick={onClose} />
  </div>
);

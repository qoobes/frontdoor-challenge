import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ModalStates } from "../../utils/enums";
import { Summary } from "../../utils/types";

type Props = {
  modal: ModalStates;
  setModal: (modal: ModalStates) => void;
  selectedItem: Summary | null;
  setSelectedItem: (item: Summary | null) => void;
  className?: string;
};

export const Overlay: React.FC<Props> = ({
  modal,
  selectedItem,
  setModal,
  setSelectedItem,
  className,
}) => (
  <AnimatePresence>
    <motion.div
      animate={
        modal &&
        modal !== ModalStates.PROMPT_HIGHLIGHT &&
        modal !== ModalStates.GENERATE_SUMMARY_LOADING
          ? "open"
          : "closed"
      }
      variants={{
        open: {
          opacity: 0.4,
          pointerEvents: "auto",
        },
        closed: {
          opacity: 0,
          pointerEvents: "none",
        },
      }}
      style={{ zIndex: 500, opacity: 0 }}
      className={clsx(
        "bg-black opacity-0 w-screen h-screen fixed top-0 left-0 backdrop-blur-xl",
        className,
      )}
      onClick={
        modal === ModalStates.GENERATE_SUMMARY_LOADING
          ? () => {}
          : () => {
              if (selectedItem) {
                setSelectedItem(null);
                return;
              }
              setModal(ModalStates.NONE);
            }
      }
    />
  </AnimatePresence>
);

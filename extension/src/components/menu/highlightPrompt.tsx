import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useSetAtom } from "jotai";
import { selectedItemAtom } from "../../pages/legere";
import { ModalStates } from "../../utils/enums";
import { getSummaries } from "../../utils/summaries";
type Props = {
  modal: ModalStates;
  setModal: (modal: ModalStates) => void;
};

export const HighlightPrompt: React.FC<Props> = ({ modal, setModal }) => {
  const queryClient = useQueryClient();
  const setSelectedItem = useSetAtom(selectedItemAtom);

  const summariseHighlight = () => {
    setModal(ModalStates.GENERATE_SUMMARY_LOADING);
    const highlight = window.getSelection()?.toString();

    if (!highlight || highlight.length < 50) {
      setModal(ModalStates.NONE);
      return;
    }

    getSummaries({
      text: highlight,
      precision: 0,
      queryClient,
      onError: () => {
        setModal(ModalStates.GENERATE_SUMMARY_FAILURE);
      },
      onSuccess: (res) => {
        setSelectedItem(res.data);
        setModal(ModalStates.VIEW_SUMMARIES);
      },
    });
  };

  return (
    <motion.div
      animate={modal === ModalStates.PROMPT_HIGHLIGHT ? "open" : "closed"}
      whileHover={{
        scale: 1.02,
        backgroundColor: "#f3f4f6",
      }}
      whileTap={{
        scale: 0.98,
        backgroundColor: "#E5E7EB",
      }}
      variants={{
        open: {
          opacity: 1,
          display: "block",
          transition: {
            delay: 0.3,
          },
        },
        closed: {
          opacity: 0,
          display: "none",
        },
      }}
      className="rounded-lg p-2 bg-white cursor-pointer"
    >
      <button className="text-base font-medium" onClick={summariseHighlight}>
        Summarise your highlight
      </button>
    </motion.div>
  );
};

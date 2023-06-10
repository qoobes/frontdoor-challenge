import clsx from "clsx";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { LegereIcon } from "../components/legereIcon";
import { LegereMenu } from "../components/menu";
import { HighlightPrompt } from "../components/menu/highlightPrompt";
import "../index.css";
import { GenerateSummary } from "../pages/generateSummary";
import { SummaryList } from "../pages/summaryList";
import { ModalStates } from "../utils/enums";
import { Summary } from "../utils/types";

type Props = {
  modal: ModalStates;
  setModal: (modal: ModalStates) => void;
  data: Array<Summary>;
  isError: boolean;
};

export const LegereModal: React.FC<Props> = ({
  modal,
  setModal,
  data,
  isError,
}) => {
  const modalVariant = useMemo(() => {
    if (modal === ModalStates.PROMPT_HIGHLIGHT) return "highlight";
    if (modal === ModalStates.GENERATE_SUMMARY_LOADING) return "generating";

    return ["modal", modal === ModalStates.VIEW_SUMMARIES ? "tallModal" : ""];
  }, [modal]);
  const viewSummaries = () => setModal(ModalStates.VIEW_SUMMARIES);
  const summarise = () => setModal(ModalStates.GENERATE_SUMMARY);

  return (
    <motion.div
      whileHover={modal ? modalVariant : ["open"]}
      animate={modal ? modalVariant : undefined}
      initial="closed"
      onClick={(e) => e.stopPropagation()}
      variants={{
        open: {
          scale: 1,
          width: modal ? 56 : 170,
          height: modal ? 56 : 120,
          borderRadius: 0,
          top: 80,
          right: 0,
          margin: 0,
          borderTopLeftRadius: 10,
          borderBottomLeftRadius: 10,
          flexDirection: "row",
        },
        generating: {
          scale: 1,
          width: 250,
          height: 56,
          borderRadius: 0,
          borderTopLeftRadius: 28,
          borderBottomLeftRadius: 28,
          top: 20,
          right: 0,
          margin: 0,
          flexDirection: "row",
        },
        highlight: {
          scale: 1,
          width: 250,
          height: 56,
          borderRadius: 0,
          borderTopLeftRadius: 28,
          borderBottomLeftRadius: 28,
          top: 80,
          right: 0,
          margin: 0,
          flexDirection: "row",
        },
        closed: {
          scale: 1,
          width: 56,
          height: 56,
          borderRadius: 0,
          borderTopLeftRadius: 28,
          borderBottomLeftRadius: 28,
          top: 80,
          right: 0,
          margin: 0,
          flexDirection: "row",
        },
        modal: {
          scale: 1,
          width: 400,
          height: 300,
          borderRadius: 12,
          borderTopLeftRadius: 12,
          borderBottomLeftRadius: 12,
          position: "fixed",
          top: 20,
          right: 20,
          //     bottom: 0,
          //     left: 0,
          margin: "auto",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        },
        tallModal: {
          height: "80vh",
        },
      }}
      className={clsx(
        "fixed right-0 top-20 select-none text-lg bg-white text-black font-bold shadow-xl",
        "flex items-center justify-center",
      )}
      style={{ zIndex: 1000 }}
    >
      <SummaryList
        setModalState={setModal}
        modalState={modal}
        error={isError}
        summaries={data || []}
      />

      <GenerateSummary setModalState={setModal} modal={modal} />

      <HighlightPrompt modal={modal} setModal={setModal} />

      <LegereIcon
        variants={{
          open: {
            opacity: 0,
            display: "none",
            translateX: 100,
          },
          highlight: {
            opacity: 0,
            display: "none",
            translateX: 100,
          },
          closed: {
            opacity: 1,
            translateX: 0,
          },
          generating: {
            opacity: 0,
            display: "none",
          },
          modal: {
            opacity: 0,
            display: "none",
            translateX: 100,
          },
        }}
      />

      <LegereMenu summarise={summarise} viewSummaries={viewSummaries} />
    </motion.div>
  );
};

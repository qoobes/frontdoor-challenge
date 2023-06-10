import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { MotionProps, motion } from "framer-motion";
import { useSetAtom } from "jotai";
import { useMemo, useRef, useState } from "react";
import { CgSpinner } from "react-icons/cg";
import { ModalHeader } from "../components/modalHeader";
import { ModalStates } from "../utils/enums";
import { getContentOfArticle } from "../utils/getText";
import { getSummaries } from "../utils/summaries";
import { selectedItemAtom } from "./legere";

type Props = {
  modal: ModalStates;
  setModalState: (modal: ModalStates) => void;
} & MotionProps;

export const GenerateSummary: React.FC<Props> = ({
  modal,
  setModalState,
  ...rest
}) => {
  const precisionRef = useRef<HTMLInputElement>(null);
  const setSelectedItem = useSetAtom(selectedItemAtom);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const generateSummary = () => {
    setModalState(ModalStates.GENERATE_SUMMARY_LOADING);

    let precision = Number(precisionRef.current?.value);

    if (!precision || precision < 0 || precision > 2) precision = 1;

    const text = getContentOfArticle();

    if (!text) {
      setError("No text found");
      setModalState(ModalStates.GENERATE_SUMMARY_FAILURE);
      return;
    }

    getSummaries({
      text,
      precision,
      queryClient,
      onError: () => {
        setModalState(ModalStates.GENERATE_SUMMARY_FAILURE);
        setError("Something went wrong, please try again later.");
      },
      onSuccess: (res) => {
        setSelectedItem(res.data);
        setModalState(ModalStates.VIEW_SUMMARIES);
      },
    });
  };

  const modalState = useMemo(() => {
    switch (modal) {
      case ModalStates.GENERATE_SUMMARY:
        return "open";
      case ModalStates.GENERATE_SUMMARY_LOADING:
        return "loading";
      case ModalStates.GENERATE_SUMMARY_SUCCESS:
        return "success";
      case ModalStates.GENERATE_SUMMARY_FAILURE:
        return "error";
      default:
        return "closed";
    }
  }, [modal]);

  return (
    <motion.div
      animate={modalState}
      variants={{
        open: {
          scale: 1,
          opacity: 100,
          display: "block",
        },
        closed: {
          scale: 0,
          opacity: 0,
          display: "none",
        },
        loading: {},
      }}
      className="w-full h-full flex flex-col items-center gap-2 p-8 text-center relative overflow-hidden"
      {...rest}
    >
      <motion.div
        animate={error !== "" || modalState === "error" ? "open" : "closed"}
        variants={{
          open: {
            scale: 1,
            opacity: 100,
          },
          closed: {
            scale: 0,
            opacity: 0,
          },
        }}
        className="bg-red-500 text-white w-full h-full absolute rounded-xl top-0 left-0 right-0 bottom-0 flex items-center justify-center flex-col gap-4"
      >
        <h1 className="text-xl font-medium font-space">
          {error || "Something went wrong."}
        </h1>
      </motion.div>
      <motion.div
        animate={modalState === "loading" ? "loading" : "closed"}
        variants={{
          loading: {
            scale: 1,
            opacity: 100,
          },
          closed: {
            scale: 0,
            opacity: 0,
          },
        }}
        className="bg-blue-500 text-white w-full h-full absolute rounded-xl top-0 left-0 right-0 bottom-0 flex items-center justify-between text-left px-4"
      >
        <p className="text-lg font-bold text-left font-space w-full">
          Generating
        </p>

        <CgSpinner className={"text-white text-3xl animate-spin"} />
      </motion.div>

      <ModalHeader
        title="Generate Summary"
        onClose={() => setModalState(ModalStates.NONE)}
      />

      <div className="w-full flex flex-col items-center gap-4">
        <div className="my-4" />
        <label htmlFor="precision" className="text-sm font-medium font-space">
          Pick a level of <strong>Precision</strong>
        </label>
        <input
          id="default-range"
          type="range"
          min={0}
          max={2}
          ref={precisionRef}
          step={1}
          defaultValue={1}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />

        <div className="w-full flex justify-between">
          <span className="text-xs font-medium font-space">Low</span>
          <span className="text-xs font-medium font-space">Medium</span>
          <span className="text-xs font-medium font-space">High</span>
        </div>

        {/* generate summary button */}
        <button
          className={clsx(
            "w-full h-10 bg-blue-500 rounded-lg text-white font-medium font-space mt-8 leading-0 flex items-center justify-center",
          )}
          onClick={generateSummary}
        >
          Generate summary
        </button>
      </div>
    </motion.div>
  );
};

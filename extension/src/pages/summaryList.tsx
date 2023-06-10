import clsx from "clsx";
import { motion } from "framer-motion";
import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { CgChevronDown, CgSpinner } from "react-icons/cg";
import { ModalHeader } from "../components/modalHeader";
import { ScrollArea } from "../components/scroll-area";
import { SummaryCard } from "../components/summaries/summaryCard";
import { ModalStates } from "../utils/enums";
import { Summary } from "../utils/types";
import { selectedItemAtom } from "./legere";

type Props = {
  className?: string;
  setModalState: (modal: ModalStates) => void;
  modalState: ModalStates;
  summaries: Array<Summary>;
  error: boolean;
};

export const SummaryList: React.FC<Props> = ({
  className,
  modalState,
  setModalState,
  summaries,
  error,
  ...rest
}) => {
  const [query, setQuery] = useState<string>("");
  const selectedItem = useAtomValue(selectedItemAtom);
  const [sortDate, setSortDate] = useState<"asc" | "desc">("desc");

  const filteredSummaries = useMemo(
    () =>
      summaries
        .filter((summary) => {
          if (query === "") return true;
          const processedQuery = query.trim().toLowerCase();

          return (
            summary.name.trim().toLowerCase().includes(processedQuery) ||
            summary.tags.some((t) =>
              t.trim().toLowerCase().includes(processedQuery),
            ) ||
            summary.summarisedText.trim().toLowerCase().includes(processedQuery)
          );
        })
        .sort((a, b) => {
          if (sortDate === "asc") {
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          } else {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          }
        }),
    [query, summaries, sortDate],
  );

  // scroll to the item if it isn't in view
  useEffect(() => {
    if (selectedItem) {
      const idx = filteredSummaries.findIndex(
        (summary) => summary._id === selectedItem._id,
      );

      if (idx === -1) return;

      setTimeout(() => {
        const shadowRoot = document.getElementById("legere-host")?.shadowRoot;

        if (!shadowRoot) return;

        const el = shadowRoot.getElementById(`summary-${idx}`);
        if (!el) return;

        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      }, 800);
    }
  }, [selectedItem]);

  return (
    <motion.div
      animate={modalState === ModalStates.VIEW_SUMMARIES ? "open" : "closed"}
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
      className="w-full h-full flex flex-col items-center gap-2 p-6 pr-0 text-left relative"
      {...rest}
    >
      <motion.div
        variants={{
          open: {
            scale: 0,
            display: "none",
          },
          closed: {
            scale: 0,
            display: "none",
          },
          loading: {
            position: "absolute",
            display: "flex",
            zIndex: 1000,
            scale: 1,
          },
        }}
        className="flex items-center justify-center bg-white w-full h-full inset-0 rounded-xl"
      >
        <CgSpinner className={"animate-spin text-3xl text-black"} />
      </motion.div>

      {error && (
        <h1 className="text-xl font-space">
          Something went wrong, please try again later.
        </h1>
      )}

      <div className="pr-8">
        <ModalHeader
          title="Your Summaries"
          onClose={() => setModalState(ModalStates.NONE)}
        />

        {/* search bar */}
        <div className="flex items-center gap-2">
          <input
            className={clsx(
              "w-full h-10 rounded-lg border-2 border-gray-300 p-2 bg-white text-base mr-1 my-4",
              "placeholder:text-grayp-700 focus:outline-none focus:ring-0 focus:border-blue-400 transition",
            )}
            placeholder="Search for text or tags"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <motion.button
            whileHover={{
              scale: 1.02,
              backgroundColor: "#f3f4f6",
            }}
            whileTap={{
              scale: 0.98,
              backgroundColor: "#E5E7EB",
            }}
            className="flex gap-0.5 items-center leading-none bg-white rounded-lg h-10 px-4"
            onClick={() => {
              setSortDate((prev) => (prev === "asc" ? "desc" : "asc"));
            }}
          >
            <span className="text-sm">Date</span>
            <motion.div
              animate={sortDate}
              variants={{
                asc: {
                  rotate: 180,
                },
                desc: {
                  rotate: 0,
                },
              }}
            >
              <CgChevronDown className={"text-base"} />
            </motion.div>
          </motion.button>
        </div>
      </div>

      <ScrollArea
        className="w-[336px] pr-8 overflow-visible"
        style={{
          height: "60vh",
        }}
      >
        <motion.div className="flex flex-col gap-2 pt-2">
          {summaries && summaries.length > 0 ? (
            filteredSummaries?.map((summary, idx) => (
              <SummaryCard
                setSearchQuery={setQuery}
                idx={idx}
                summary={summary}
                className="w-full"
              />
            ))
          ) : (
            <p>No summaries found.</p>
          )}
        </motion.div>
      </ScrollArea>
    </motion.div>
  );
};

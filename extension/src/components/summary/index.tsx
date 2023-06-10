import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { CgTrash } from "react-icons/cg";
import { selectedItemAtom } from "../../pages/legere";
import { axiosInstance } from "../../utils/axios";
import { Summary } from "../../utils/types";
import { CloseButton } from "../closeButton";
import { ScrollArea } from "../scroll-area";
import { IconButton } from "../ui/IconButton";
import { TagSuggestion } from "./tag";

type Props = {
  summaries: Array<Summary>;
};

export const SummaryScreen: React.FC<Props> = ({ summaries }) => {
  const [selectedItem, setSelectedItem] = useAtom(selectedItemAtom);
  const [showInput, setShowInput] = useState(false);
  const [selectedInput, setSelectedInput] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const queryClient = useQueryClient();

  const allPossibleTags = useMemo(() => {
    if (!summaries) return [];

    const alltags = summaries.reduce((acc, curr) => {
      curr.tags.forEach((tag) => {
        if (!acc.includes(tag)) acc.push(tag);
      });

      return acc;
    }, [] as Array<string>);

    return alltags;
  }, [summaries]);

  const suggestedTags = useMemo(() => {
    if (!selectedItem || inputValue === "") return allPossibleTags.slice(0, 5);

    const suggestedTags = allPossibleTags
      .filter((tag) => tag.toLowerCase().includes(inputValue || ""))
      .slice(0, 5);

    return suggestedTags;
  }, [selectedItem, allPossibleTags, inputValue]);

  const addTag = (input?: string) => {
    if (!input) input = inputValue;

    if (!selectedItem || !input || input === "") {
      setShowInput(false);
      return;
    }

    // Check if tag already exists
    if (selectedItem.tags.includes(input.trim().toLowerCase())) {
      setShowInput(false);
      return;
    }

    // Optimistic update
    setSelectedItem({
      ...selectedItem,
      tags: [...selectedItem.tags, input.trim().toLowerCase()],
    });

    axiosInstance
      .post("/summaries/tag", {
        id: selectedItem._id,
        tag: input.trim().toLowerCase(),
      })
      .then(() => queryClient.invalidateQueries(["summaries"]));

    setInputValue("");
    setShowInput(false);
  };

  //  Make sure the selected input is always in range
  useEffect(() => {
    if (!showInput || !selectedItem) return;
    if (suggestedTags.length === 0) setSelectedInput(0);

    if (selectedInput > suggestedTags.length) {
      setSelectedInput(suggestedTags.length);
    }
  }, [suggestedTags]);

  const saveNameUpdate = () => {
    if (!selectedItem) return;

    axiosInstance
      .patch("/summaries", {
        id: selectedItem._id,
        name: selectedItem.name.trim().replace("\n", ""),
      })
      .then(() => queryClient.invalidateQueries(["summaries"]));
  };

  const deleteTag = (tag: string) => {
    if (!selectedItem) return;

    setSelectedItem({
      ...selectedItem,
      tags: selectedItem.tags.filter((t) => t !== tag),
    });

    axiosInstance
      .post("/summaries/untag", {
        id: selectedItem._id,
        tag,
      })
      .then(() => queryClient.invalidateQueries(["summaries"]));
  };

  const deleteSummary = () => {
    if (!selectedItem) return;

    axiosInstance
      .post("/summaries/delete", {
        id: selectedItem._id,
      })
      .then(() => {
        queryClient.invalidateQueries(["summaries"]);
        setSelectedItem(null);
      });
  };

  const closeInput = () => {
    setShowInput(false);
    setInputValue("");
  };

  return (
    <motion.div
      animate={selectedItem ? "open" : "closed"}
      initial="closed"
      onClick={(e) => e.stopPropagation()}
      variants={{
        open: {
          width: "50vw",
          height: "80vh",
          borderRadius: 12,
          translateX: 0,
          opacity: 1,
          pointerEvents: "all",
          top: 20,
          right: 450,
          margin: 0,
          flexDirection: "column",
        },
        closed: {
          width: "50vw",
          height: "80vh",
          opacity: 0,
          translateX: 100,
          borderRadius: 12,
          pointerEvents: "none",
          flexDirection: "column",
        },
      }}
      className={clsx(
        "fixed right-0 top-20 select-none text-lg bg-white text-black font-bold shadow-xl",
        "flex flex-col items-center",
      )}
      style={{ zIndex: 1000 }}
    >
      <div className="p-8 text-left select-text w-full">
        <div className="flex justify-between items-start w-full">
          <textarea
            className="text-2xl font-bold font-space !ring-0 !outline-none border-2 border-transparent focus:border-blue-200 bg-white w-full"
            value={selectedItem?.name}
            onBlur={() => saveNameUpdate()}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
            onChange={(e) => {
              if (!selectedItem) return;

              setSelectedItem({
                ...selectedItem,
                name: e.target.value,
              });
            }}
          />

          <div className="flex items-center gap-2">
            <IconButton onClick={deleteSummary}>
              <CgTrash className={"text-red-400"} />
            </IconButton>
            <CloseButton onClick={() => setSelectedItem(null)} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          {selectedItem?.tags.map((tag, idx) => (
            <div
              key={idx}
              className="text-sm font-medium bg-blue-200 rounded-lg p-1 px-2 h-6 flex items-center justify-center"
            >
              {tag}

              <CloseButton
                small
                className="ml-1 !bg-blue-200"
                onClick={() => deleteTag(tag)}
              />
            </div>
          ))}
          {showInput ? (
            <div className="relative">
              <input
                type="text"
                className="text-sm m-0 font-medium bg-white focus:ring-0 focus:outline-none focus:border-blue-200 border-2 rounded-lg py-0.5 px-2"
                placeholder="Add a tag"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                autoFocus
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    if (selectedInput === 0) {
                      addTag();
                      return;
                    }

                    addTag(suggestedTags[selectedInput - 1]);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp") {
                    setSelectedInput((prev) => Math.max(prev - 1, 0));
                  }

                  if (e.key === "ArrowDown") {
                    setSelectedInput((prev) =>
                      Math.min(prev + 1, suggestedTags.length),
                    );
                  }
                }}
              />

              <div className="absolute right-1 top-[5px] text-sm cursor-pointer hover:">
                <CloseButton small onClick={closeInput} />
              </div>

              <motion.div
                animate={showInput ? "open" : "closed"}
                style={{
                  zIndex: 99999999,
                }}
                variants={{
                  open: { opacity: 1, scale: 1 },
                  closed: { opacity: 0, scale: 0.9 },
                }}
                className="absolute top-8 rounded-lg border-2 border-blue-200 left-0 right-0 text-sm py-2 bg-white font-normal"
              >
                <TagSuggestion
                  tag={`"${inputValue}"`}
                  idx={-1}
                  isUserInput
                  addTag={addTag}
                  selectedInput={selectedInput}
                  setInputValue={setInputValue}
                />

                {suggestedTags?.map((tag, idx) => (
                  <TagSuggestion
                    tag={tag}
                    idx={idx}
                    addTag={addTag}
                    selectedInput={selectedInput}
                    setInputValue={setInputValue}
                  />
                ))}
              </motion.div>
            </div>
          ) : (
            <motion.button
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
              className="text-sm font-medium bg-blue-800 text-white rounded-lg p-1 px-2 cursor-pointer flex items-center justify-center"
              onClick={() => setShowInput(true)}
            >
              Add a tag
            </motion.button>
          )}
        </div>

        {/* summary */}

        <div className="mt-4 overflow-hidden">
          <ScrollArea
            className="w-full px-4"
            style={{
              height: "65vh",
            }}
          >
            {selectedItem?.summarisedText?.split("\n").map((line, idx) => (
              <p key={idx} className="text-base mb-1 font-normal">
                {line}
              </p>
            ))}
          </ScrollArea>
        </div>
      </div>
    </motion.div>
  );
};

import clsx from "clsx";
import { motion } from "framer-motion";
import { useAtom } from "jotai";
import { selectedItemAtom } from "../../pages/legere";
import { Summary } from "../../utils/types";
import { Tag } from "../tag";

type Props = {
  summary: Summary;
  className?: string;
  idx: number;
  setSearchQuery: (query: string) => void;
};

export const SummaryCard: React.FC<Props> = ({
  summary,
  className,
  idx,
  setSearchQuery,
}) => {
  const [selectedItem, setSelectedItem] = useAtom(selectedItemAtom);
  const isSelected = selectedItem?._id === summary._id;

  return (
    <motion.div
      id={`summary-${idx}`}
      key={`summary-${idx}`}
      style={{
        zIndex: 99999999,
      }}
      whileHover={{
        scale: 1,
        backgroundColor: "#E5E7EB",
      }}
      whileTap={{
        scale: 0.98,
        backgroundColor: "#E5E7EB",
      }}
      variants={{
        open: {
          translateX: 0,
          opacity: 100,
          display: "flex",
          transition: {
            // Stagger the animation of the first 9 or so elements, let all the other ones just jump right in
            delay: idx < 8 ? Math.min(0.3 + idx * 0.05, 0.6) : 0.7,
          },
        },
        closed: {
          translateX: -100,
          opacity: 0,
          display: "none",
        },
      }}
      onClick={() =>
        isSelected ? setSelectedItem(null) : setSelectedItem(summary)
      }
      className={clsx(
        "font-space rounded-xl p-2 cursor-pointer bg-white flex-col border-2",
        isSelected ? " border-blue-400" : "border-transparent",
        className,
      )}
    >
      <div
        className={clsx(
          "transition",
          isSelected ? "opacity-100" : "opacity-90",
        )}
      >
        <h3 className="text-base font-medium">{summary.name}</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {summary &&
            summary.tags &&
            summary.tags.map((tag, idx) => (
              <Tag
                size="small"
                tag={tag}
                idx={idx}
                setSearchQuery={setSearchQuery}
              />
            ))}
        </div>
      </div>
    </motion.div>
  );
};

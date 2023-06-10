import clsx from "clsx";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { MenuItem } from "./menuItem";

type Props = {
  className?: string;
  summarise: () => void;
  viewSummaries: () => void;
};

export const LegereMenu: React.FC<Props> = ({
  summarise,
  viewSummaries,
  className,
}) => {
  const MENU_ITEMS = useMemo(
    () => [
      {
        name: "Summarise Text",
        onClick: summarise,
      },
      {
        name: "View summaries",
        onClick: viewSummaries,
      },
    ],
    [viewSummaries, summarise],
  );

  return (
    <motion.div
      variants={{
        open: {
          opacity: 1,
        },
        closed: {
          opacity: 0,
        },
      }}
      className={clsx("flex flex-col gap-1 overflow-none", className)}
    >
      {MENU_ITEMS.map((item, idx) => (
        <motion.div
          variants={{
            open: {
              display: "block",
              opacity: 1,
              transition: {
                delay: 0.3,
              },
            },
            closed: {
              display: "none",
              opacity: 0,
              transition: {
                delay: 0.3,
              },
            },
          }}
          key={idx}
          className={"w-full"}
        >
          <MenuItem onClick={item.onClick}>{item.name}</MenuItem>
        </motion.div>
      ))}
    </motion.div>
  );
};

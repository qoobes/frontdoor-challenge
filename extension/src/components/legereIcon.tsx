import clsx from "clsx";
import { MotionProps, motion } from "framer-motion";

type Props = MotionProps & { className?: string };

export const LegereIcon: React.FC<Props> = ({ className, ...rest }) => (
  <motion.div
    {...rest}
    className={clsx(
      "rounded-full border border-black flex items-center justify-center !w-7 !h-7 font-space",
      className,
    )}
  >
    L
  </motion.div>
);

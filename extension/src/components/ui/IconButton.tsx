import clsx from "clsx";
import { MotionProps, motion } from "framer-motion";

export type IconButtonProps = MotionProps & {
  className?: string;
  onClick: () => void;
  small?: boolean;
  children?: React.ReactNode;
};

export const IconButton: React.FC<IconButtonProps> = ({
  className,
  small,
  children,
  ...rest
}) => (
  <motion.button
    whileHover={{
      scale: 1.05,
      backgroundColor: "#E5E7EB",
    }}
    whileTap={{
      scale: 0.95,
      backgroundColor: "#E5E7EB",
    }}
    className={clsx(
      "font-bold font-space bg-white rounded-full",
      small ? "text-sm p-1" : "text-xl p-2",
      className,
    )}
    {...rest}
  >
    {children}
  </motion.button>
);

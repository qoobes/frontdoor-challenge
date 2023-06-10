import clsx from "clsx";
import { MotionProps, motion } from "framer-motion";

type Props = {
  enabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
} & MotionProps;
export const ExtensionButton: React.FC<Props> = ({
  enabled,
  onClick,
  children,
  className,
  ...rest
}) => (
  <motion.button
    style={{
      backgroundColor: "#f3f4f6",
    }}
    whileHover={{
      scale: 1.05,
      backgroundColor: "#E5E7EB",
    }}
    whileTap={{
      scale: 0.95,
      backgroundColor: "#f3f4f6",
    }}
    onClick={onClick}
    className={clsx("text-sm px-2 py-1 rounded-md font-space", className)}
    {...rest}
  >
    {children}
  </motion.button>
);

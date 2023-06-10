import clsx from "clsx";
import { HTMLProps } from "react";

type Props = HTMLProps<HTMLDivElement>;

export const MenuItem: React.FC<Props> = ({ className, children, ...rest }) => (
  <div
    {...rest}
    className={clsx(
      "px-2 py-1 rounded break-normal hover:bg-gray-100 transition cursor-pointer font-normal font-space text-base",
      className,
    )}
  >
    {children}
  </div>
);

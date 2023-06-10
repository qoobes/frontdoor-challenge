import clsx from "clsx";

type Props = {
  tag: string;
  size?: "small" | "normal";
  idx: number;
  setSearchQuery?: (query: string) => void;
};

export const Tag: React.FC<Props> = ({
  tag,
  size = "normal",
  idx,
  setSearchQuery,
}) => (
  <div
    key={idx}
    className={clsx(
      "font-normal bg-blue-200 rounded-lg p-1 px-2",
      setSearchQuery &&
        "hvoer:bg-blue-100 hover:scale-110 transition-all active:scale-95",
      size === "small" ? "text-sm" : "text-base",
    )}
    onClick={
      setSearchQuery
        ? (e) => {
            e.stopPropagation();
            setSearchQuery(tag);
          }
        : undefined
    }
  >
    {tag}
  </div>
);

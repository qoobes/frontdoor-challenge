import clsx from "clsx";

type Props = {
  tag: string;
  idx: number;
  selectedInput: number;
  addTag: (tag?: string) => void;
  setInputValue: (value: string) => void;
  isUserInput?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export const TagSuggestion: React.FC<Props> = ({
  idx,
  selectedInput,
  setInputValue,
  tag,
  addTag,
  isUserInput = false,
  ...rest
}) => (
  <div
    key={idx}
    className={clsx(
      "p-1 px-2 cursor-pointer hover:bg-blue-200 rounded-lg",
      selectedInput === idx + 1 ? "bg-blue-100" : "",
    )}
    onClick={() => {
      // Remove the brackets if it's the user's input
      addTag(isUserInput ? tag.slice(1, tag.length - 1) : tag);
    }}
    {...rest}
  >
    {tag}
  </div>
);

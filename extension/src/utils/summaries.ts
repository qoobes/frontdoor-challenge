import { QueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { axiosInstance } from "./axios";

export const getSummaries = ({
  precision,
  queryClient,
  text,
  onError,
  onSuccess,
}: {
  text: string;
  precision: number;
  queryClient: QueryClient;
  onSuccess: (res: AxiosResponse) => void;
  onError: (err: unknown) => void;
}) =>
  axiosInstance
    .post("/summaries/generate", { text, precision })
    .then((res) => {
      queryClient.invalidateQueries(["summaries"]);

      setTimeout(() => onSuccess(res), 2000);
    })
    .catch(onError);

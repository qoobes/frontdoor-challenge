import { useEffect, useState } from "react";
import { axiosInstance } from "../utils/axios";
import { API_URL, AUTH_TOKEN } from "../utils/constants";
import { getEnabled, setEnabled } from "../utils/storage";
import { ExtensionButton } from "./components/ExtensionButton";

export const TogglePage = () => {
  const [enabled, setEnabledState] = useState(false);

  const updateEnabledState = () => {
    setEnabled(!enabled).then(() => setEnabledState(!enabled));
  };

  useEffect(() => {
    getEnabled().then((enabled) => {
      setEnabledState(enabled);
    });
  }, []);

  useEffect(() => {
    chrome.runtime.sendMessage({ enabled });
  }, [enabled]);

  const exportSummaries = () => {
    axiosInstance.get("/summaries/viewToken").then((res) => {
      if (res.data.token) {
        window.open(
          `${API_URL}/summaries/export?type=csv&viewToken=${res.data.token}`,
        );
      }
    });
  };

  return (
    <div className="w-[300px] text-center flex items-center flex-col bg-white text-black p-8 transition-all">
      <h1 className="font-bold text-3xl text-black mb-4 font-space transition-all">
        Legere
      </h1>

      <div className="flex justify-between items-center gap-4">
        <p className="text-sm text-black font-space transition-all">
          Legere is{" "}
          {enabled ? (
            <span className="font-semibold text-green-400">enabled </span>
          ) : (
            <span className="font-semibold text-red-400">disabled </span>
          )}
        </p>

        <ExtensionButton enabled={enabled} onClick={updateEnabledState}>
          {enabled ? "Disable" : "Enable"}
        </ExtensionButton>
      </div>

      <ExtensionButton className="mt-4" enabled onClick={exportSummaries}>
        Export summaries
      </ExtensionButton>

      <div className="text-xs mt-4">
        Tired of us making your sad life better?{" "}
        <p
          className="text-black font-bold cursor-pointer transition-all hover:text-black/80 underline"
          onClick={() => {
            chrome.storage.local.remove([AUTH_TOKEN]);
            window.location.reload();
          }}
        >
          Sign out
        </p>
      </div>
    </div>
  );
};

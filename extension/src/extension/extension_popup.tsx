import { atom, useAtom } from "jotai";
import { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { getToken } from "../utils/storage";
import { AuthPage } from "./auth";
import { TogglePage } from "./toggle";

export const authedAtom = atom(false);

function ExtensionPopup() {
  const [authed, setAuthed] = useAtom(authedAtom);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getToken().then((token) => {
      if (token) {
        setAuthed(true);
      }

      setLoading(false);
    });

    chrome.runtime.onMessage.addListener(function (request) {
      if (Object(request).hasOwnProperty("authed")) {
        setAuthed(request.authed);
      }
    });
  }, [authed]);

  if (loading) {
    return (
      <div className="w-[300px] h-[300px] flex items-center justify-center text-center bg-gray-900 text-white p-8 transition-all">
        <FaSpinner className="animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return <AuthPage />;
  }

  return <TogglePage />;
}

export default ExtensionPopup;

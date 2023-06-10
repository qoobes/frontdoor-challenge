import { useQuery } from "@tanstack/react-query";
import { atom, useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { LegereModal } from "../components/legereModal";
import { Overlay } from "../components/menu/overlay";
import { SummaryScreen } from "../components/summary";
import "../index.css";
import { axiosInstance } from "../utils/axios";
import { ModalStates } from "../utils/enums";
import { getEnabled } from "../utils/storage";
import { Summary } from "../utils/types";

export const selectedItemAtom = atom<Summary | null>(null);

export const LegereApp = () => {
  const [enabled, setEnabled] = useState(false);
  const [modal, _setModal] = useState(ModalStates.NONE);
  const modalRef = useRef<ModalStates>(modal);
  const [selectedItem, setSelectedItem] = useAtom(selectedItemAtom);

  const { data, isError } = useQuery({
    queryKey: ["summaries"],
    queryFn: async () => {
      const result = await axiosInstance.get("/summaries");

      return result.data;
    },
  });

  const setModal = (modal: ModalStates) => {
    modalRef.current = modal;
    _setModal(modal);
  };

  useEffect(() => {
    getEnabled().then((enabled) => setEnabled(enabled));

    chrome.runtime.onMessage.addListener(function (request) {
      if (Object(request).hasOwnProperty("enabled")) {
        setEnabled(request.enabled);
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (modalRef.current === ModalStates.GENERATE_SUMMARY_LOADING) return;

        setSelectedItem(null);
        setModal(ModalStates.NONE);
      }
    };

    window.addEventListener("keyup", handleKeyDown);

    const handleSelection = () => {
      if (
        modalRef.current !== ModalStates.NONE &&
        modalRef.current !== ModalStates.PROMPT_HIGHLIGHT
      )
        return;

      const selection = window.getSelection()?.toString();

      if (
        !selection ||
        selection.trim() === "" ||
        (selection.length < 100 &&
          modalRef.current === ModalStates.PROMPT_HIGHLIGHT)
      ) {
        setModal(ModalStates.NONE);
        return;
      }

      if (!selection) return;

      if (selection.length >= 100) setModal(ModalStates.PROMPT_HIGHLIGHT);
    };

    window.addEventListener("mouseup", handleSelection);

    return () => {
      window.removeEventListener("keyup", handleKeyDown);
      window.removeEventListener("mouseup", handleSelection);
    };
  }, []);

  useEffect(() => {
    if (selectedItem) {
      setModal(ModalStates.VIEW_SUMMARIES);
    }
  }, [selectedItem]);

  useEffect(() => {
    if (modal !== ModalStates.VIEW_SUMMARIES && selectedItem) {
      setSelectedItem(null);
    }
  }, [modal]);

  useEffect(() => {
    if (selectedItem) {
      const item = data?.find((d: Summary) => d._id === selectedItem._id);

      if (!item) {
        setSelectedItem(null);
      }

      setSelectedItem(item);
    }
  }, [data]);

  if (!enabled) return null;

  return (
    <div id="legere-app-window" className="!font-space">
      <SummaryScreen summaries={data} />

      <LegereModal
        data={data}
        isError={isError}
        modal={modal}
        setModal={setModal}
      />

      <Overlay
        modal={modal}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        setModal={setModal}
      />
    </div>
  );
};

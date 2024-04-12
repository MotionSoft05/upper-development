"use client";

import { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [jobPosition, setJobPosition] = useState("");

  return (
    <ModalContext.Provider
      value={{
        isModalOpen,
        setIsModalOpen,
        applyModalOpen,
        setApplyModalOpen,
        jobPosition,
        setJobPosition,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  return useContext(ModalContext);
}

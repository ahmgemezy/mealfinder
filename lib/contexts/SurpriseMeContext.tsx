"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SurpriseMeContextType {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
}

const SurpriseMeContext = createContext<SurpriseMeContextType | undefined>(undefined);

export function SurpriseMeProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    return (
        <SurpriseMeContext.Provider value={{ isOpen, openModal, closeModal }}>
            {children}
        </SurpriseMeContext.Provider>
    );
}

export function useSurpriseMe() {
    const context = useContext(SurpriseMeContext);
    if (!context) {
        throw new Error("useSurpriseMe must be used within a SurpriseMeProvider");
    }
    return context;
}

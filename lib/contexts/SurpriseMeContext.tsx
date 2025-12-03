"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from "react";

interface SurpriseMeContextType {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
}

const SurpriseMeContext = createContext<SurpriseMeContextType | undefined>(undefined);

export function SurpriseMeProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const openModal = useCallback(() => setIsOpen(true), []);
    const closeModal = useCallback(() => setIsOpen(false), []);

    const value = useMemo(() => ({ isOpen, openModal, closeModal }), [isOpen, openModal, closeModal]);

    return (
        <SurpriseMeContext.Provider value={value}>
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

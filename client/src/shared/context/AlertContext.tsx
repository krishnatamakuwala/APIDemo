'use client';

import { ResponseStatus } from "@/enums/APIStatus";
import { SnackbarProvider, useSnackbar, VariantType } from "notistack";
import { createContext, ReactNode, useContext } from "react";

interface IAlertContextType {
    addAlert: (message: string, responseStatus: ResponseStatus) => void;
}

/**
 * Maps response status to notistack variant type
 * @param status Response status
 * @returns Variant Type
 */
function mapStatusToVariant(status: ResponseStatus): VariantType {
    switch (status) {
        case ResponseStatus.Success:
            return "success";
        case ResponseStatus.Error:
            return "error";
        case ResponseStatus.Warning:
            return "warning";
        case ResponseStatus.Information:
            return "info";
        default:
            return "default";
    }
};

const AlertContext = createContext<IAlertContextType | undefined>(undefined);

export function AlertInnerProvider({ children }: { children: ReactNode }) {
    const { enqueueSnackbar } = useSnackbar();

    const addAlert = (message: string, responseStatus: ResponseStatus) => {
        enqueueSnackbar(message, {
            variant: mapStatusToVariant(responseStatus),
            autoHideDuration: 6000,
            anchorOrigin: { horizontal: "right", vertical: "bottom" }
        })
    }

    return (
        <AlertContext.Provider value={{ addAlert }}>
            {children}
        </AlertContext.Provider>
    )
}

export function AlertProvider({ children }: { children: ReactNode }) {
    return (
        <SnackbarProvider maxSnack={5}>
            <AlertInnerProvider>{children}</AlertInnerProvider>
        </SnackbarProvider>
    )
}

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) throw new Error('useAlert must be used within an AlertProvider');
    return context;
};
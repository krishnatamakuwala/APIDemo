// components/ClientWrapper.tsx
"use client";

import { UserProvider } from "../context/UserContext";
import { AlertProvider } from "../context/AlertContext";
import { StyledEngineProvider } from "@mui/material/styles";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
    return (
        <StyledEngineProvider injectFirst>
            <AlertProvider>
                <UserProvider>
                    {children}
                </UserProvider>
            </AlertProvider>
        </StyledEngineProvider>
    );
}

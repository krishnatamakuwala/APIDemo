"use client";

// import { useEffect, useState } from "react";
import styles from "./page.module.css";
// import Grid, { ICount, IGridColumnConfig, IGridConfig } from "../shared/theme/components/Grid";
// import { apiContext, IAPIResponse } from "@/shared/context/APIContext";
// import { ResponseStatus } from "@/enums/APIStatus";
// import { useAlert } from "@/shared/context/AlertContext";
import { useAuthRedirect, useUserContext } from "@/shared/context/UserContext";
// import Loader from "@/shared/theme/components/Loader";
import { Box, CssBaseline } from "@mui/material";
import SideMenu from "@/shared/theme/components/sideMenu/SideMenu";
// import SidePanel from "@/shared/theme/components/SidePanel";

export default function Home() {
    // const { addAlert } = useAlert();
    const { user, loading } = useUserContext();
    useAuthRedirect(user, loading);

    // const [open, setOpen] = useState<boolean>(false);

    return (
        <div className={styles.main}>
            <main className={styles.main}>
                <CssBaseline enableColorScheme />
                <Box sx={{ display: 'flex', height: '100%' }}>
                    <SideMenu />
                </Box>
            </main>
        </div>
    );
}

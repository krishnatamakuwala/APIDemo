"use client";

import { useUserContext } from "@/shared/context/UserContext";
import { Avatar, Box, Typography } from "@mui/material";
import { Fragment } from "react";
import Loader from "../Loader";
import OptionsMenu from "./OptionsMenu";

export default function UserDetail() {
    const { user, loading } = useUserContext();

    return (
        <Fragment>
            {loading && user ? (
                <Loader />
            ) : (
                <Fragment>
                    <Avatar
                        sizes="small"
                        alt={user?.username}
                        src={user?.profilePicture ?? "/default_logo.avif"}
                        sx={{ width: 36, height: 36 }}
                    />
                    <Box sx={{ mr: 'auto' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: '16px' }}>
                            {user?.username}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {user?.email}
                        </Typography>
                    </Box>
                    <OptionsMenu />
                </Fragment>
            )
            }

        </Fragment>
    )
}
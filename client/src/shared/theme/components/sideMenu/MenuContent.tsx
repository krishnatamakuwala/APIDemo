"use client";

import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import { useAuthRedirect, useUserContext } from '@/shared/context/UserContext';
import { useRouter } from 'next/navigation';
import PersonIcon from '@mui/icons-material/Person';

export default function MenuContent() {
    const router = useRouter();
    const { user, loading } = useUserContext();
    useAuthRedirect(user, loading);

    const handleClick = () => {
        router.push("/users");
    };

    return (
        <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
            <List>
                    <ListItem disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                            selected={true}
                            onClick={() => handleClick()}
                        >
                            <ListItemIcon>{<PersonIcon />}</ListItemIcon>
                            <ListItemText primary="Users" />
                        </ListItemButton>
                    </ListItem>
            </List>
        </Stack>
    );
}

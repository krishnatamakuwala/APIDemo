import { styled } from '@mui/material/styles';
import { dividerClasses } from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MuiMenuItem from '@mui/material/MenuItem';
import { paperClasses } from '@mui/material/Paper';
import { listClasses } from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon, { listItemIconClasses } from '@mui/material/ListItemIcon';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import MenuButton from './MenuButton';
import { useState, Fragment } from 'react';
import { apiContext, IAPIResponse } from '@/shared/context/APIContext';
import { ResponseStatus } from '@/enums/APIStatus';
import { useAlert } from '@/shared/context/AlertContext';
import { redirect } from 'next/navigation';

const MenuItem = styled(MuiMenuItem)({
    margin: '2px 0',
});

export default function OptionsMenu() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const { addAlert } = useAlert();

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    function logout() {
        let redirectPath = "";
        apiContext.post("/v1/auth/logout")
            .then((response) => {
                const res = response.data as IAPIResponse;
                if (res.status === ResponseStatus.Success) {
                    redirectPath = "/auth/signin";
                } else {
                    addAlert(res.message, res.status);
                }
            })
            .catch((error) => {
                if (error.response) {
                    const res = error.response.data as IAPIResponse;
                    if (res.message) {
                        addAlert(res.message, res.status);
                    } else {
                        addAlert("Something went wrong. Please try again after some time.", ResponseStatus.Error);
                    }
                } else {
                    addAlert("Something went wrong. Please try again after some time.", ResponseStatus.Error);
                }
            })
            .finally(() => {
                if (redirectPath !== "") {
                    redirect(redirectPath);
                }
            });
    }

    return (
        <Fragment>
            <MenuButton
                aria-label="Open menu"
                onClick={handleClick}
                sx={{ borderColor: 'transparent' }}
            >
                <MoreVertRoundedIcon />
            </MenuButton>
            <Menu
                anchorEl={anchorEl}
                id="menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                sx={{
                    [`& .${listClasses.root}`]: {
                        padding: '4px',
                    },
                    [`& .${paperClasses.root}`]: {
                        padding: 0,
                    },
                    [`& .${dividerClasses.root}`]: {
                        margin: '4px -4px',
                    },
                }}
            >
                {/* <MenuItem onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleClose}>My account</MenuItem>
                <Divider />
                <MenuItem onClick={handleClose}>Add another account</MenuItem>
                <MenuItem onClick={handleClose}>Settings</MenuItem>
                <Divider /> */}
                <MenuItem
                    onClick={() => { handleClose(); logout(); }}
                    sx={{
                        [`& .${listItemIconClasses.root}`]: {
                            ml: 'auto',
                            minWidth: 0,
                        },
                    }}
                >
                    <ListItemText sx={{ marginRight: "8px" }}>Logout</ListItemText>
                    <ListItemIcon>
                        <LogoutRoundedIcon fontSize="small" />
                    </ListItemIcon>
                </MenuItem>
            </Menu>
        </Fragment>
    );
}

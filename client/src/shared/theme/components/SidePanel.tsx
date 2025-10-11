import { IconButton } from "@mui/material";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import { styled } from '@mui/material/styles';
import { ChevronRight } from "@mui/icons-material"
import { ReactNode } from "react";

const drawerWidth = 270;

const Drawer = styled(MuiDrawer)({
    // width: drawerWidth,
    flexShrink: 0,
    boxSizing: 'border-box',
    mt: 10,
    [`& .${drawerClasses.paper}`]: {
        height: 'calc(100vh - 20px)',
        width: drawerWidth,
        boxSizing: 'border-box',
        margin: '10px'
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));

export default function SidePanel(props: ISidePanelProps) {

    const handleDrawerClose = () => {
        props.setOpen(false);
        if (typeof props.onClose === "function") {
            props.onClose();
        }
    }

    return (
        <Drawer
            variant="persistent"
            // sx={{
            //     display: "block",
            //     // [`& .${drawerClasses.paper}`]: {
            //     //     backgroundColor: 'background.paper',
            //     // },
            // }}
            anchor="right"
            open={props.open}
            slotProps={{ paper: {
                elevation: 1,
                square: false,
            } }}
        >
            <DrawerHeader>
                <IconButton onClick={handleDrawerClose}>
                    <ChevronRight />
                </IconButton>
            </DrawerHeader>
            {props.children}
        </Drawer>
    )
}

export interface ISidePanelProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    onClose?: () => void;
    children: ReactNode;
}
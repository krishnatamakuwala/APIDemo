"use client";

import { Fragment, ReactNode } from "react";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Box } from "@mui/material";

export default function AlertDialog(props: IAlertDialogProps) {

    return (
        <Fragment>
            <Dialog
                open={props.open}
                onClose={props.onClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {props.titleIcon ? (
                        <Fragment>
                            <Box width="100%" display="flex" padding="10px" justifyContent={"center"} alignItems={"center"}>
                                {props.titleIcon}
                            </Box>
                            <p>{props.title}</p>
                        </Fragment>
                    ) : (
                        <p>{props.title}</p>
                    )}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {props.description}
                    </DialogContentText>
                    {props.children ?? <></>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        props.onClose();
                    }}>Cancel</Button>
                    <Button onClick={() => {
                        if (typeof props.onProceed === "function" && props.value) {
                            if (typeof props.validateInput === "function" && !props.validateInput()) {
                                return;
                            }
                            props.onProceed(props.value);
                        }
                        props.onClose();
                    }} autoFocus>Ok</Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}

interface IAlertDialogProps {
    title: string;
    titleIcon?: React.JSX.Element;
    description: string;
    open: boolean;
    value?: string | number | boolean;
    onClose: () => void;
    validateInput?: () => boolean;
    onProceed?: (value: string | number | boolean) => void;
    children?: ReactNode;
}
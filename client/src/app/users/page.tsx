"use client";

import { Fragment, useRef, useState } from "react";
import styles from "../page.module.css";
import { Box, Button, CssBaseline, FormControl, Stack, TextField } from "@mui/material";
import SideMenu from "@/shared/theme/components/sideMenu/SideMenu";
import SidePanel from "@/shared/theme/components/SidePanel";
import UserForm from "./UserForm";
import UserGrid from "./UserGrid";
import Typography from '@mui/material/Typography';
import SearchBar from "@/shared/theme/components/SearchBar";
import { CancelOutlined, Refresh } from "@mui/icons-material";
import AlertDialog from "@/shared/theme/components/AlertDialog";
import { ICustomGridRef } from "@/shared/base/CustomGrid";
import { FormType, ICustomFormRef } from "@/shared/base/CustomForm";
import ColorModeIconDropdown from "@/shared/theme/ColorModeIconDropdown";

export default function Users() {
    const formRef = useRef<ICustomFormRef>(null);
    const gridRef = useRef<ICustomGridRef>(null);

    const [formOpen, setFormOpen] = useState<boolean>(false);
    const [formType, setFormType] = useState<FormType>(FormType.add);
    const [dialogValue, setDialogValue] = useState<string | undefined>();
    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);

    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

    function handleConfirmDialogOpen(value: string) {
        resetDialogForm();
        setDialogValue(value);
        setConfirmDialogOpen(true);
    }

    function handleConfirmDialogClose() {
        setDialogValue(undefined);
        setConfirmDialogOpen(false);
    }

    function handleEditAndClone(moduleGroupId: number) {
        formRef.current?.getFormData(moduleGroupId);
    }

    function handleDelete(email: string, password: string) {
        formRef.current?.handleDelete(email, password);
    }

    function handleSearch(value: string) {
        gridRef.current?.setSearchText(value);
    }

    function resetDialogForm() {
        setPassword("");
        setPasswordError(false);
        setPasswordErrorMessage("");
    }

    const validateInputs = () => {
        let isValid = true;

        if (!password) {
            setPasswordError(true);
            setPasswordErrorMessage("Password is required.");
            isValid = false;
        } else if (password && !new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,30}$").test(password)) {
            setPasswordError(true);
            setPasswordErrorMessage("Password must be between 8 and 30 character, having at least one lower case, one upper case, one number, and one special character.");
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage("");
        }

        return isValid;
    };

    return (
        <div className={styles.main}>
            <main className={styles.main}>
                <CssBaseline enableColorScheme />
                <Box sx={{ display: 'flex', width: `100vw`, height: '100%' }}>
                    <SideMenu />
                    <Fragment>
                        <Fragment>
                            <Stack
                                sx={{ width: "calc(100% - 270px)", height: '100%', padding: '8px' }}
                                display={"flex"}
                                direction={"column"}
                                alignItems={"flex-start"}
                                justifyContent={"flex-start"}
                                spacing={1}
                            >
                                <Stack
                                    width={"100%"}
                                    alignItems={"flex-end"}
                                >
                                    <ColorModeIconDropdown />
                                </Stack>
                                <Typography
                                    component="h3"
                                    variant="h4"
                                    sx={{ width: '100%' }}
                                >
                                    Users
                                </Typography>
                                <SearchBar onSearch={handleSearch} placeHolder="Search users by email" />
                                <Stack
                                    width="100%"
                                    direction={"row"}>
                                    <Button
                                        type="button"
                                        variant="contained"
                                        onClick={() => {
                                            formRef.current?.resetForm();
                                            setFormType(FormType.add);
                                            setFormOpen(true);
                                        }}
                                    >
                                        Add
                                    </Button>
                                    <Stack
                                        width="100%"
                                        direction={"row"}
                                        justifyContent={"right"}
                                        columnGap={"8px"}
                                    >
                                        <Button
                                            sx={{
                                                minWidth: 0
                                            }}
                                            type="button"
                                            variant="text"
                                            onClick={() => {
                                                gridRef.current?.getGridData();
                                            }}
                                        >
                                            <Refresh />
                                        </Button>
                                    </Stack>
                                </Stack>
                                <UserGrid
                                    ref={gridRef}
                                    handleConfirmDialogOpen={handleConfirmDialogOpen}
                                    handleEditAndClone={handleEditAndClone}
                                    setFormType={setFormType}
                                    resetForm={() => { formRef.current?.resetForm() }}
                                />
                                <AlertDialog
                                    titleIcon={<CancelOutlined color="error" sx={{ fontSize: 50 }} />}
                                    title="Are you sure you want to delete this user?"
                                    description="This action is irreversible and this user will be gone forever. Enter password to confirm deletion."
                                    value={dialogValue}
                                    open={confirmDialogOpen}
                                    onClose={handleConfirmDialogClose}
                                    validateInput={validateInputs}
                                    onProceed={() => {
                                        if (dialogValue) {
                                            handleDelete(dialogValue, password);
                                        }
                                    }}
                                >
                                    <FormControl>
                                        <TextField
                                            error={passwordError}
                                            helperText={passwordErrorMessage}
                                            id="password"
                                            type="password"
                                            name="password"
                                            placeholder="••••••"
                                            value={password}
                                            autoFocus
                                            required
                                            fullWidth
                                            variant="outlined"
                                            color={passwordError ? 'error' : 'primary'}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </FormControl>
                                </AlertDialog>
                            </Stack>
                            <SidePanel
                                open={formOpen}
                                setOpen={setFormOpen}
                                onClose={() => {
                                    formRef.current?.resetForm();
                                }}
                            >
                                <UserForm
                                    ref={formRef}
                                    formOpen={formOpen}
                                    setFormOpen={setFormOpen}
                                    formType={formType}
                                    refreshGrid={gridRef.current?.getGridData}
                                />
                            </SidePanel>
                        </Fragment>
                    </Fragment>
                </Box>
            </main>
        </div>
    );
}

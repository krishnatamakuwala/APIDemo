"use client";

import { forwardRef, Fragment, useImperativeHandle, useState } from "react";
import { Box, Button, FormControl, FormLabel, Stack, TextField } from "@mui/material";
import { useAlert } from "@/shared/context/AlertContext";
import { apiContext, IAPIResponse } from "@/shared/context/APIContext";
import { ResponseStatus } from "@/enums/APIStatus";
import { FormType, ICustomFormProps, ICustomFormRef } from "@/shared/base/CustomForm";

const UserForm = forwardRef<ICustomFormRef, ICustomFormProps>((props, ref) => {
    const { addAlert } = useAlert();

    const [userId, setUserId] = useState<number | null>(null);
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [oldUserData, setOldUserData] = useState<IUser | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [firstNameError, setFirstNameError] = useState(false);
    const [firstNameErrorMessage, setFirstNameErrorMessage] = useState("");
    const [lastNameError, setLastNameError] = useState(false);
    const [lastNameErrorMessage, setLastNameErrorMessage] = useState("");
    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState("");
    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

    useImperativeHandle(ref, () => ({
        resetForm,
        getFormData,
        handleDelete
    }));

    function resetForm() {
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setFirstNameError(false);
        setFirstNameErrorMessage("");
        setLastNameError(false);
        setLastNameErrorMessage("");
        setEmailError(false);
        setEmailErrorMessage("");
        setPasswordError(false);
        setPasswordErrorMessage("");
        setOldUserData(null);
    }

    function validateInputs() {
        let isValid = true;

        if (!firstName) {
            setFirstNameError(true);
            setFirstNameErrorMessage("First Name is required.");
            isValid = false;
        } else if (firstName && firstName.length < 1) {
            setFirstNameError(true);
            setFirstNameErrorMessage("First Name can not be empty.");
            isValid = false;
        } else if (firstName && firstName.length > 35) {
            setFirstNameError(true);
            setFirstNameErrorMessage("First Name must be less than 35 characters.");
            isValid = false;
        } else {
            setFirstNameError(false);
            setFirstNameErrorMessage("");
        }

        if (!lastName) {
            setLastNameError(true);
            setLastNameErrorMessage("Last Name is required.");
            isValid = false;
        } else if (lastName && lastName.length < 1) {
            setLastNameError(true);
            setLastNameErrorMessage("Last Name can not be empty.");
            isValid = false;
        } else if (lastName && lastName.length > 35) {
            setLastNameError(true);
            setLastNameErrorMessage("Last Name must be less than 35 characters.");
            isValid = false;
        } else {
            setLastNameError(false);
            setLastNameErrorMessage("");
        }

        if (!email) {
            setEmailError(true);
            setEmailErrorMessage("Email is required.");
            isValid = false;
        } else if (email && !new RegExp("^[\\w\\.-]+@([\\w-]+\\.)+[\\w-]{2,4}$").test(email)) {
            setEmailError(true);
            setEmailErrorMessage("Please enter a valid email address.");
            isValid = false;
        } else {
            setEmailError(false);
            setEmailErrorMessage("");
        }

        if (props.formType == FormType.add) {
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
        }

        return isValid;
    }

    function handleDelete(email: string, password: string) {
        apiContext.put("/v1/users/delete", {
            data: {
                email: email,
                password: password
            }
        })
            .then((response) => {
                const res = response.data as IAPIResponse;
                if (res.status === ResponseStatus.Success) {
                    if (typeof props.refreshGrid === "function") {
                        props.refreshGrid();
                    }
                    addAlert(res.message, res.status);
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
            });
    }

    function handleSubmit() {
        if (isSubmitting || !validateInputs()) {
            return;
        }

        console.log(props.formType);
        setIsSubmitting(true);
        let url: string = "";
        let _firstName, _lastName, _email;
        let request = apiContext.post;
        if (props.formType === FormType.add) {
            setUserId(null);
            url = "/v1/users/create";
            _firstName = firstName;
            _lastName = lastName;
            _email = email;
        } else {
            request = apiContext.patch;
            url = "/v1/users/update";
            _firstName = oldUserData?.firstName === firstName ? null : firstName;
            _lastName = oldUserData?.lastName === lastName ? null : lastName;
            _email = oldUserData?.email === email ? null : email;
        }

        request(url, {
            userId: userId !== null ? Number(userId) : null,
            firstName: _firstName,
            lastName: _lastName,
            email: _email,
            password: password
        })
            .then((response) => {
                const res = response.data as IAPIResponse;
                if (res.status === ResponseStatus.Success) {
                    if (typeof props.refreshGrid === "function") {
                        props.setFormOpen(false);
                        props.refreshGrid();
                    }
                    addAlert(res.message, res.status);
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
                setIsSubmitting(false);
            });
    }

    function getFormData(_userId: number) {
        apiContext.post("/v1/users/findOne", {
            userId: Number(_userId)
        })
            .then((response) => {
                const res = response.data as IAPIResponse;
                if (res.status === ResponseStatus.Success) {
                    const resUser = res.data as IUser;
                    setUserId(_userId);
                    setFirstName(resUser.firstName);
                    setLastName(resUser.lastName);
                    setEmail(resUser.email);

                    setOldUserData({
                        userId: _userId,
                        firstName: resUser.firstName,
                        lastName: resUser.lastName,
                        email: resUser.email
                    })
                    props.setFormOpen(true);
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
            });
    }

    return (
        <Box
            component="form"
            noValidate
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                gap: 2,
                padding: '8px'
            }}
        >
            <FormControl>
                <FormLabel htmlFor="firstName">First Name</FormLabel>
                <TextField
                    error={firstNameError}
                    helperText={firstNameErrorMessage}
                    id="firstName"
                    type="text"
                    name="firstName"
                    placeholder="John"
                    value={firstName}
                    autoFocus
                    required
                    fullWidth
                    variant="outlined"
                    color={firstNameError ? 'error' : 'primary'}
                    onChange={(e) => setFirstName(e.target.value)}
                />
            </FormControl>
            <FormControl>
                <FormLabel htmlFor="lastName">Last Name</FormLabel>
                <TextField
                    error={lastNameError}
                    helperText={lastNameErrorMessage}
                    id="lastName"
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    value={lastName}
                    autoFocus
                    required
                    fullWidth
                    variant="outlined"
                    color={lastNameError ? 'error' : 'primary'}
                    onChange={(e) => setLastName(e.target.value)}
                />
            </FormControl>
            <FormControl>
                <FormLabel htmlFor="email">Email</FormLabel>
                <TextField
                    error={emailError}
                    helperText={emailErrorMessage}
                    id="email"
                    type="email"
                    name="email"
                    placeholder="john.doe@email.com"
                    value={email}
                    autoFocus
                    required
                    fullWidth
                    variant="outlined"
                    color={emailError ? 'error' : 'primary'}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </FormControl>
            <Fragment>
                {props.formType === FormType.add ? (
                    <FormControl>
                        <FormLabel htmlFor="password">Password</FormLabel>
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
                ) : (
                    <Fragment></Fragment>
                )}
            </Fragment>
            <Stack
                direction={"row"}
                sx={{ position: 'absolute', marginBottom: '8px', bottom: 0, columnGap: '8px', width: 'calc(100% - 16px)', }}
            >
                <Button
                    type="button"
                    variant="outlined"
                    sx={{ flexGrow: 1 }}
                    onClick={() => {
                        props.setFormOpen(false);
                        resetForm();
                    }}
                >
                    Cancel
                </Button>
                <Button
                    type="button"
                    variant="contained"
                    sx={{ flexGrow: 1 }}
                    onClick={handleSubmit}
                >
                    {props.formType}
                </Button>
            </Stack>
        </Box>
    );
});
UserForm.displayName = "UserForm";

export default UserForm;

interface IUser {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
}
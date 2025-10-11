'use client';

import { useState } from 'react';
import { Fragment } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import { useAlert } from '@/shared/context/AlertContext';
import { apiContext, IAPIResponse } from '@/shared/context/APIContext';
import { ResponseStatus } from '@/enums/APIStatus';
import { redirect, useRouter } from 'next/navigation';

export default function SignInForm() {
    const { addAlert } = useAlert();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

    const handleSubmit = () => {
        if (isSubmitting || !validateInputs()) {
            return;
        }
        setIsSubmitting(true);
        let redirectPath = "";
        apiContext.post("/v1/auth/login", {
            email: email,
            password: password
        })
            .then((response) => {
                const res = response.data as IAPIResponse;
                if (res.status === ResponseStatus.Success) {
                    redirectPath = "/";
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
            }).finally(() => {
                setIsSubmitting(false);
                if (redirectPath !== "") {
                    redirect(redirectPath);
                }
            });
    };

    const validateInputs = () => {
        let isValid = true;

        if (!email) {
            setEmailError(true);
            setEmailErrorMessage("Email address is required.");
            isValid = false;
        } else if (email && !new RegExp("^[\\w\\.-]+@([\\w-]+\\.)+[\\w-]{2,4}$").test(email)) {
            setEmailError(true);
            setEmailErrorMessage("Please enter a valid email address.");
            isValid = false;
        } else {
            setEmailError(false);
            setEmailErrorMessage("");
        }

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
        <Fragment>
            <Box
                component="form"
                noValidate
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    gap: 2,
                }}
            >
                <FormControl>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <TextField
                        error={emailError}
                        helperText={emailErrorMessage}
                        id="email"
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        // autoComplete="email"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                        color={emailError ? 'error' : 'primary'}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </FormControl>
                <FormControl>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <TextField
                        error={passwordError}
                        helperText={passwordErrorMessage}
                        name="password"
                        placeholder="••••••"
                        type="password"
                        id="password"
                        // autoComplete="current-password"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                        color={passwordError ? 'error' : 'primary'}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </FormControl>
                <Button
                    type="button"
                    fullWidth
                    variant="contained"
                    onClick={handleSubmit}
                >
                    Sign in
                </Button>
            </Box>
        </Fragment>
    );
}

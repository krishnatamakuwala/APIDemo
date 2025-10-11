import React from "react";
import Loader from "./Loader";
import { Typography } from "@mui/material";
import { MuiOtpInput } from "mui-one-time-password-input";

export interface IOtpValidationProps {
    disableCustomTheme?: boolean;
    verificationTitle?: string;
    otpValidityTime?: string;
    otpLoading: boolean;
    otpReciever: string;
    otp: string;
    handleChange: (newValue: string) => void;
    handleComplete: (value: string) => Promise<void>;
    validateChar: (value: string) => boolean;
}

export default function OTPValidation(props: IOtpValidationProps) {
    return (
        <React.Fragment>
            {props.otpLoading ? (
                <Loader />
            ) : (
                <React.Fragment>
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{ textAlign: "center", width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
                    >
                        {props.verificationTitle}
                    </Typography>
                    <Typography
                        component="h6"
                        sx={{ textAlign: "center", width: "100%", marginBottom: "50px" }}
                    >
                        We&apos;ve sent an OTP on {props.otpReciever}. This OTP will be valid for {props.otpValidityTime ?? "5 minutes"}.
                    </Typography>
                    <MuiOtpInput sx={{ gap: "30px", maxWidth: "500px" }} length={6} value={props.otp} onChange={props.handleChange} onComplete={props.handleComplete} validateChar={props.validateChar} />
                </React.Fragment>
            )}
        </React.Fragment>
    )
}
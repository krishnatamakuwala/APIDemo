import { NextFunction, Request, Response } from "express";
import { CommonInputValidation } from "./CommonInputValidation";
import { LogManager } from "../../utilities/logManager/LogManager";
import { HttpStatus, ResponseStatus } from "../../enums/APIStatus";
import { z } from "zod";

export class AuthValidation {
    public static validateUserRegistration(req: Request, res: Response, next: NextFunction) {
        try {
            CommonInputValidation.name("First name").parse(req.body.firstName);
            CommonInputValidation.name("Last name")
                .optional()
                .or(z.literal('')).parse(req.body.lastName);
            CommonInputValidation.email.parse(req.body.email);
            CommonInputValidation.password.parse(req.body.password);
            next();
        } catch (error) {
            const err = error as Error;
            const errorMessage = CommonInputValidation.getZodErrorMessage(err.message as string);
            LogManager.error(errorMessage ?? "Invalid inputs.", err);
            res.status(HttpStatus.BadRequest).json({
                status: ResponseStatus.Error,
                message: errorMessage ?? "Invalid inputs.",
            });
        }
    }

    public static validateUserLogin(req: Request, res: Response, next: NextFunction) {
        try {
            CommonInputValidation.email.parse(req.body.email);
            CommonInputValidation.password.parse(req.body.password);
            next();
        } catch (error) {
            const err = error as Error;
            const errorMessage = CommonInputValidation.getZodErrorMessage(err.message as string);
            LogManager.error(errorMessage ?? "Invalid inputs.", err);
            res.status(HttpStatus.BadRequest).json({
                status: ResponseStatus.Error,
                message: errorMessage ?? "Invalid inputs.",
            });
        }
    }
}
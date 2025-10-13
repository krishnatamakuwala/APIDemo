import { NextFunction, Request, Response } from "express";
import { CommonInputValidation } from "./CommonInputValidation";
import { LogManager } from "../../utilities/logManager/LogManager";
import { HttpStatus, ResponseStatus } from "../../enums/APIStatus";
import { z } from "zod";

export class UserValidation {
    public static validateUser(req: Request, res: Response, next: NextFunction) {
        try {
            CommonInputValidation.nameField("First name").parse(req.body.firstName);
            CommonInputValidation.nameField("Last name").parse(req.body.lastName);
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

    public static validateNullableUser(req: Request, res: Response, next: NextFunction) {
        try {
            CommonInputValidation.nameField("First name").nullable().parse(req.body.firstName);
            CommonInputValidation.nameField("Last name").nullable().parse(req.body.lastName);
            CommonInputValidation.email.nullable().parse(req.body.email);
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

    public static validateUserId(req: Request, res: Response, next: NextFunction) {
        try {
            CommonInputValidation.number("User id").parse(req.body.userId);
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

    public static validateUserAuth(req: Request, res: Response, next: NextFunction) {
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
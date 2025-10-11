import { NextFunction, Request, Response } from "express";
import { CommonInputValidation } from "./CommonInputValidation";
import { LogManager } from "../../utilities/logManager/LogManager";
import { HttpStatus, ResponseStatus } from "../../enums/APIStatus";

export class GridConfigValidation {
    public static validateConfig(req: Request, res: Response, next: NextFunction) {
        try {
            if (req.headers['x-auth-interface'] !== process.env.AUTH_INTERFACE_AGENT) {
                CommonInputValidation.gridConfig().parse(req.body.config);
            }
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
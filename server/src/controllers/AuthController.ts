import { CookieOptions, Request, Response } from "express";
import { UserRepo } from "../repositories/user/UserRepo";
import { User } from "../models/User";
import { HttpStatus, ResponseStatus } from "../enums/APIStatus";
import { LogManager } from "../utilities/logManager/LogManager";
import { compare, genSalt, hash } from "bcryptjs";
import { UserJWTPayload, Verification } from "../middlewares/Verification";
import CurrentUserData from "../configs/CurrentUserData";

export default class AuthController {

    /**
     * Register new user
     * @param req Request Handler
     * @param res Response Handler
     */
    async register(req: Request, res: Response) {
        try {
            const salt = await genSalt(10);
            const hashedPassword = await hash(req.body.password, salt);
            const userRepo = new UserRepo();
            const new_user: User = new User();
            new_user.firstName = req.body.firstName;
            new_user.lastName = req.body.lastName;
            new_user.email = req.body.email;
            new_user.password = hashedPassword;
            new_user.isRoot = true;

            const doesEmailExists = await userRepo.getByEmail(new_user.email);
            if (doesEmailExists) {
                LogManager.warning("User email already exists.");
                /*
                    Returning 200 http status instead of 409 for already exists email ,
                    for security reasons
                */
                return res.status(HttpStatus.Ok).send({
                    status: ResponseStatus.Warning,
                    message: "User email already exists.",
                });
            }

            await userRepo.create(new_user);

            res.status(HttpStatus.Created).json({
                status: ResponseStatus.Success,
                message: "Successfully created a user.",
            });
        } catch (error) {
            const err = error as Error;
            LogManager.error(err.message ?? "Failed to create a user.", err);
            res.status(HttpStatus.BadRequest).json({
                status: ResponseStatus.Error,
                message: "Failed to create a user.",
            });
        }
    }

    // ------------------------------------------------------------

    /**
     * User login
     * @param req Request Handler
     * @param res Response Handler
     */
    async login(req: Request, res: Response) {
        try {
            const userRepo = new UserRepo();
            let user: User | null;
            try {
                user = await userRepo.getByEmail(req.body.email, true);
                if (!user || !(await compare(req.body.password, user.password))) {
                    throw new Error("Invalid login credentials.");
                }
                if (!user.isRoot) {
                    LogManager.warning("User is not admin/root. Only admin can login.");
                    res.status(HttpStatus.UnAuthorised).json({
                        status: ResponseStatus.Error,
                        message: "Only admin can login.",
                    });
                } else {
                    const token = Verification.signJWT({ firstName: user.firstName, lastName: user.lastName, email: user.email });
                    const cookieOption: CookieOptions = {
                        httpOnly: true,
                        secure: true,
                        maxAge: 1 * 60 * 60 * 10000,
                        path: "/",
                        sameSite: "none"
                    }
                    res.cookie("X-Auth-Token", token, cookieOption);
                    res.status(HttpStatus.Ok).send({
                        status: ResponseStatus.Success,
                        message: "Successfully logged in."
                    });
                }
            } catch (error) {
                const err = error as Error;
                LogManager.error("Invalid login credentials.", err);
                res.status(HttpStatus.UnAuthorised).json({
                    status: ResponseStatus.Error,
                    message: "Invalid login credentials.",
                });
            }
        } catch (error) {
            const err = error as Error;
            const errMessage = err.message ?? "Something went wrong, please try again.";
            LogManager.error(errMessage, err);
            res.status(HttpStatus.BadRequest).json({
                status: ResponseStatus.Error,
                message: "Something went wrong, please try again.",
            });
        }
    }

    /**
     * User login
     * @param req Request Handler
     * @param res Response Handler
     */
    async me(req: Request, res: Response) {
        try {
            const user = await new UserRepo().getByEmail(req.user.email);
            if (!user) {
                throw new Error("User not found.");
            }
            const userResult: UserJWTPayload = {
                email: req.user.email,
                firstName: req.user.firstName,
                lastName: req.user.lastName
            }
            res.status(HttpStatus.Ok).json({
                status: ResponseStatus.Success,
                message: "Successfully get user token details.",
                data: userResult
            });
        } catch (error) {
            const err = error as Error;
            LogManager.error("Failed to authenticate user.", err);
            res.status(HttpStatus.BadRequest).json({
                status: ResponseStatus.Error,
                message: "Failed to authenticate user.",
            });
        }

    }

    /**
     * User login
     * @param req Request Handler
     * @param res Response Handler
     */
    async logout(req: Request, res: Response) {
        try {
            res.clearCookie("X-Auth-Token", {
                httpOnly: true,
                secure: true,
                path: "/",
                sameSite: "none"
            });
            res.status(HttpStatus.Ok).json({
                status: ResponseStatus.Success,
                message: "Successfully logged out.",
            });
        } catch (error) {
            const err = error as Error;
            LogManager.error("Failed to logout user.", err);
            res.status(HttpStatus.BadRequest).json({
                status: ResponseStatus.Error,
                message: "Failed to logout user.",
            });
        }
    }
}
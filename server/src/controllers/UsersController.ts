import { Request, Response } from "express";
import { User } from "../models/User";
import { UserRepo } from "../repositories/user/UserRepo";
import { HttpStatus, ResponseStatus } from "../enums/APIStatus";
import { LogManager } from "../utilities/logManager/LogManager";
import { genSalt, hash, compare } from "bcryptjs";
import { ModelColumnProperyMapping } from "../utilities/pgSQL/helpers/ModelColumnPropertyMapping";
import { GridColumnConfig, IGridColumnConfig } from "../configs/GridConfig";
import { ModelKey } from "../enums/ModelKey";

export default class UsersController {

    /**
     * Create new user
     * @param req Request
     * @param res Response
     */
    async create(req: Request, res: Response) {
        try {
            const salt = await genSalt(10);
            const hashedPassword = await hash(req.body.password, salt);
            const userRepo = new UserRepo();
            const new_user: User = new User();
            new_user.firstName = req.body.firstName;
            new_user.lastName = req.body.lastName;
            new_user.email = req.body.email;
            new_user.password = hashedPassword;

            const doesEmailExists = await userRepo.getByEmail(new_user.email);
            if (doesEmailExists) {
                LogManager.warning("User email already exists.");
                return res.status(HttpStatus.Ok).send({
                    status: ResponseStatus.Warning,
                    message: "User email already exists.",
                });
            }

            await userRepo.create(new_user);

            res.status(HttpStatus.Ok).json({
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

    /**
     * Update a user
     * @param req Request
     * @param res Response
     */
    async update(req: Request, res: Response) {
        try {
            const userRepo = new UserRepo();
            const new_user: User = new User();

            new_user.userId = req.body.userId;
            new_user.firstName = req.body.firstName ?? null;
            new_user.lastName = req.body.lastName ?? null;
            new_user.email = req.body.email ?? null;

            if (new_user.email !== null) {
                const doesEmailExists = await userRepo.getByEmail(new_user.email);
                if (doesEmailExists) {
                    LogManager.warning("User email already exists.");
                    return res.status(HttpStatus.Ok).send({
                        status: ResponseStatus.Warning,
                        message: "User email already exists.",
                    });
                }
            }

            await userRepo.update(new_user);

            res.status(HttpStatus.Ok).json({
                status: ResponseStatus.Success,
                message: "Successfully updated a user.",
            });
        } catch (error) {
            const err = error as Error;
            LogManager.error(err.message ?? "Failed to update a user.", err);
            res.status(HttpStatus.BadRequest).json({
                status: ResponseStatus.Error,
                message: "Failed to update a user.",
            });
        }
    }

    /**
     * Delete a user
     * @param req Request
     * @param res Response
     */
    async delete(req: Request, res: Response) {
        try {
            const userRepo = new UserRepo();
            const user = await userRepo.getByEmail(req.body.email, true, true);
            if (!user || !(await compare(req.body.password, user.password))) {
                LogManager.warning("Invalid credentials.");
                return res.status(HttpStatus.Ok).send({
                    status: ResponseStatus.Warning,
                    message: "Invalid credentials.",
                });
            }
            if (user && user.isRoot) {
                LogManager.warning("Deletion of admin user is not permitted.");
                return res.status(HttpStatus.Ok).send({
                    status: ResponseStatus.Warning,
                    message: "Deletion of admin user is not permitted.",
                });
            }
            await userRepo.delete(user.userId);

            res.status(HttpStatus.Ok).json({
                status: ResponseStatus.Success,
                message: "Successfully deleted a user.",
            });
        } catch (error) {
            const err = error as Error;
            LogManager.error(err.message ?? "Failed to delete a user.", err);
            res.status(HttpStatus.BadRequest).json({
                status: ResponseStatus.Error,
                message: "Failed to delete a user.",
            });
        }
    }

    /**
     * Delete all test users
     */
    async deleteAllTestUser() {
        try {
            const userRepo = new UserRepo();
            await userRepo.deleteAllTestUser();
        } catch (error) {
            const err = error as Error;
            LogManager.error(err.message ?? "Failed to delete all test users.", err);
        }
    }

    /**
     * Find specified user
     * @param req Request
     * @param res Response
     */
    async findOne(req: Request, res: Response): Promise<void> {
        try {
            const userRepo = new UserRepo();
            const user = await userRepo.getById(req.body.userId);

            res.status(HttpStatus.Ok).json({
                status: ResponseStatus.Success,
                message: "Successfully fetched user data.",
                data: user,
            });
        } catch (error) {
            const err = error as Error;
            LogManager.error(err.message ?? "Failed to fetch a user data.", err);
            res.status(HttpStatus.BadRequest).json({
                status: ResponseStatus.Error,
                message: "Failed to fetch a user data",
            });
        }
    }

    /**
     * Fetch users count
     * @param req Request
     * @param res Response
     */
    public async countAll(req: Request, res: Response): Promise<void> {
        try {
            const userRepo = new UserRepo();
            const count = await userRepo.countAll(req.body.config);

            res.status(HttpStatus.Ok).json({
                status: ResponseStatus.Success,
                message: "Successfully fetched users count.",
                data: count,
            });
        } catch (error) {
            const err = error as Error;
            LogManager.error(err.message ?? "Failed to fetch users count.", err);
            res.status(HttpStatus.BadRequest).json({
                status: ResponseStatus.Error,
                message: "Failed to fetch users count.",
            });
        }
    }

    /**
     * Find all users
     * @param req Request
     * @param res Response
     */
    public async findAll(req: Request, res: Response): Promise<void> {
        try {
            const userRepo = new UserRepo();
            const users: User[] = await userRepo.getAll(req.body.config);

            res.status(HttpStatus.Ok).json({
                status: ResponseStatus.Success,
                message: "Successfully fetched users.",
                data: users,
            });
        } catch (error) {
            const err = error as Error;
            LogManager.error(err.message ?? "Failed to fetch users.", err);
            res.status(HttpStatus.BadRequest).json({
                status: ResponseStatus.Error,
                message: "Failed to fetch users.",
            });
        }
    }

    /**
     * Get grid column configuration
     * @param req Request
     * @param res Resposne
     */
    public async gridColumnConfig(req: Request, res: Response): Promise<void> {
        try {
            const moduleColumnMapping = ModelColumnProperyMapping.getColumnMappings(User);
            const gridColumnConfig: IGridColumnConfig[] = [
                { columnName: ModelColumnProperyMapping.getPropertyByColumnName(User.USER_ID, moduleColumnMapping), columnLabel: "User Id", modelKey: ModelKey.User },
                { columnName: ModelColumnProperyMapping.getPropertyByColumnName(User.USER_FIRSTNAME, moduleColumnMapping), columnLabel: "First Name", modelKey: ModelKey.User },
                { columnName: ModelColumnProperyMapping.getPropertyByColumnName(User.USER_LASTNAME, moduleColumnMapping), columnLabel: "Last Name", modelKey: ModelKey.User },
                { columnName: ModelColumnProperyMapping.getPropertyByColumnName(User.USER_EMAIL, moduleColumnMapping), columnLabel: "Email", modelKey: ModelKey.User },
            ]
            gridColumnConfig.push(...GridColumnConfig.getOperatedByColumnConfig(ModelKey.User));

            res.status(HttpStatus.Ok).json({
                status: ResponseStatus.Success,
                message: "Successfully fetched grid column configuration.",
                data: gridColumnConfig,
            });
        } catch (error) {
            const err = error as Error;
            LogManager.error(err.message ?? "Failed to fetch grid column configuration.", err);
            res.status(HttpStatus.BadRequest).json({
                status: ResponseStatus.Error,
                message: "Failed to fetch grid column configuration.",
            });
        }
    }
}
import UserController from "../controllers/UsersController";
import { GridConfigValidation } from "../middlewares/validations/GridConfigValidation";
import { UserValidation } from "../middlewares/validations/UserValidation";
import { Verification } from "../middlewares/Verification";
import BaseRoutes from "./base/BaseRouter";

class UserRoutes extends BaseRoutes {

    private users = new UserController();

    async routes(): Promise<void> {
        this.router.post(
            "/",
            GridConfigValidation.validateConfig,
            Verification.userVerification,
            async (req, res) => {
                await this.users.findAll(req, res);
            }
        );

        this.router.get(
            "/gridConfig/",
            Verification.userVerification,
            async (req, res) => {
                await this.users.gridColumnConfig(req, res);
            }
        );

        this.router.post(
            "/count/",
            GridConfigValidation.validateConfig,
            Verification.userVerification,
            async (req, res) => {
                await this.users.countAll(req, res);
            }
        );

        this.router.post(
            "/create/",
            UserValidation.validateUser,
            Verification.userVerification,
            async (req, res) => {
                await this.users.create(req, res);
            }
        );

        this.router.post(
            "/update/",
            UserValidation.validateNullableUser,
            UserValidation.validateUserId,
            Verification.userVerification,
            async (req, res) => {
                await this.users.update(req, res);
            }
        );

        this.router.post(
            "/delete/",
            UserValidation.validateUserAuth,
            Verification.userVerification,
            async (req, res) => {
                await this.users.delete(req, res);
            }
        );

        this.router.post(
            "/findOne",
            UserValidation.validateUserId,
            Verification.userVerification,
            async (req, res) => {
                await this.users.findOne(req, res);
            }
        );
    }
}

export default new UserRoutes().router;
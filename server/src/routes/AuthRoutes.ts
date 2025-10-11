import AuthController from "../controllers/AuthController";
import { AuthValidation } from "../middlewares/validations/AuthValidation";
import { Verification } from "../middlewares/Verification";
import BaseRoutes from "./base/BaseRouter";

class AuthRoutes extends BaseRoutes {

    private auth = new AuthController();

    routes(): void {
        this.router.post(
            "/login",
            AuthValidation.validateUserLogin,
            async(req, res) => {
                await this.auth.login(req, res);
            }
        );

        this.router.post(
            "/register",
            AuthValidation.validateUserRegistration,
            async(req, res) => {
                await this.auth.register(req, res);
            }
        );

        this.router.post(
            "/logout",
            async(req, res) => {
                await this.auth.logout(req, res);
            }
        );

        this.router.get(
            "/me",
            Verification.userVerification,
            async(req, res) => {
                await this.auth.me(req, res);
            }
        );
    }
}

export default new AuthRoutes().router;

import { CurrentUser } from "../configs/CurrentUserData";

declare module "express-serve-static-core" {
    interface Request {
        user: CurrentUser;
    }
}
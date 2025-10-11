import { UserJWTPayload } from "../middlewares/Verification";
import { UserRepo } from "../repositories/user/UserRepo";

export interface CurrentUser {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}

export default class CurrentUserData {
    private static currentUser: CurrentUser;

    /**
     * Set Current User Data by User Id
     * @param userId User Id
     */
    public static async setCurrentUserById(userId: number): Promise<void> {
        const user = await new UserRepo().getById(userId);
        this.currentUser = {
            id: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        };
    }

    /**
     * Set Current User Data
     * @param userJWTPayload User JWT Payload
     * @param [returnData=false] Is required to return data after performing an action
     */
    public static async setCurrentUser(userJWTPayload: UserJWTPayload, returnData: boolean = false): Promise<void | CurrentUser> {
        const user = await new UserRepo().getByEmail(userJWTPayload.email, false, true);
        if (!user) {
            throw new Error("User not found.");
        }
        this.currentUser = {
            id: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        };
        if (returnData) {
            return this.currentUser;
        }
    }

    /**
     * Get Current User Data
     * @returns Current User
     */
    public static getCurrentUser(): CurrentUser {
        return this.currentUser;
    }
}
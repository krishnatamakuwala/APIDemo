import { ColumnName } from "../customs/Decorators";
import { Model } from "./Model";

export class User extends Model {
    public static TABLE_NAME = "t_sys_users" as string;
    public static USER_ID = "c_userid" as string;
    public static USER_FIRSTNAME = "c_firstname" as string;
    public static USER_LASTNAME = "c_lastname" as string;
    public static USER_EMAIL = "c_email" as string;
    public static USER_PASSWORD = "c_password" as string;
    public static USER_ISROOT = "c_isroot" as string;

    @ColumnName("c_userid")
    userId!: number;

    @ColumnName("c_firstname")
    firstName!: string;

    @ColumnName("c_lastname")
    lastName!: string;

    @ColumnName("c_email")
    email!: string;

    @ColumnName("c_password")
    password!: string;

    @ColumnName("c_isroot")
    isRoot!: boolean;
}
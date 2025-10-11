import { z, ZodTypeAny } from "zod";
import { Conditions } from "../../customs/Conditions";
import { OrderDirection } from "../../utilities/pgSQL/enums/OrderDirection";

export class CommonInputValidation {
    public static name = (name: string) => {
        return z.string({
            required_error: `${name} is required.`
        })
            .min(3, { message: `${name} must be 3 to 35 characters long.` })
            .max(35, { message: `${name} must be 3 to 35 characters long.` });
    }

    public static password = z.string({
        required_error: "Password is required."
    }).regex(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,30}$"),
        { message: "Password must be between 8 and 30 character, having at least one lower case, one upper case, one number, and one special character." }
    );

    public static email = z.string({
        required_error: "Email address is required."
    }).email({ message: "Invalid email address." });

    public static string = (name: string, min?: number, max?: number, length?: number, shouldSanitize: boolean = false) => {
        const base = z.string({
            required_error: `${name} is required.`
        });
        const betweenMessage = `${name} must be between ${min} and ${max} characters long.`;
        const minMessage = `${name} must be ${min} or more characters long.`;
        const maxMessage = `${name} must be ${max} or less characters long.`;
        const lengthMessage = `${name} must be ${max} characters long.`;
        if (length) {
            base.length(length, { message: lengthMessage });
        } else {
            if (min && !max) {
                base.min(min, { message: minMessage });
            }
            if (!min && max) {
                base.max(max, { message: maxMessage });
            }
            if (min && max) {
                base.min(min, { message: betweenMessage });
                base.max(max, { message: betweenMessage });
            }
        }
        if (shouldSanitize) {
            base.regex(new RegExp("^[^();, \"']+$"),
                { message: `${name} must not have space, (,),",',;,and ,(semicolon) characters.` }
            );
        }
        return base;
    }

    public static boolean = (name: string) => {
        return z.boolean({
            required_error: `${name} is required.`,
            invalid_type_error: `${name} must be a boolean.`
        });
    }

    public static number = (name: string) => {
        return z.number({
            required_error: `${name} is required.`,
            invalid_type_error: `${name} must be a number.`
        }).positive({ message: `${name} must be > 0.` });
    }

    public static nonEmptyArray = (name: string, type: ZodTypeAny) => {
        return z.array(type, {
            invalid_type_error: `${name} must be an array of ${type._def.typeName}.`,
            required_error: `${name} is required.`
        }).nonempty({
            message: `${name} can't be empty.`,
        })
    }

    public static gridConfig = () => {
        return z.object({
            recordPerPage: z.number({
                required_error: "Record per page configuration is required.",
                invalid_type_error: "Record per page configuration must be a number."
            }).nonnegative(),
            totalPage: z.number({
                required_error: "Total page configuration is required.",
                invalid_type_error: "Total page configuration must be a number."
            }).nonnegative(),
            currentPage: z.number({
                required_error: "Current page configuration is required.",
                invalid_type_error: "Current page configuration must be a number."
            }).nonnegative(),
            orders: z.array(z.object({
                columnName: z.string({
                    invalid_type_error: "Order column names configuration must be a valid enum."
                }).regex(
                    new RegExp("^[^();, \"']+$"),
                    { message: "Order column names configuration must not have space, (,),\",',;,and ,(semicolon) characters." }
                ).optional(),
                direction: z.nativeEnum(OrderDirection, {
                    invalid_type_error: "Order column direction configuration must be a valid enum."
                }).optional()
            }), {
                required_error: "Order configuration is required."
            })
        }, {
            required_error: "Grid configuration is required."
        });
    }

    public static editedModulePermissions = () => {
        return z.array(z.object({
            permissionId: z.number({
                required_error: "Permission id is required.",
                invalid_type_error: "Permission id must be a number."
            }).nonnegative({ message: "Permission id must be > 0." }),
            isModule: z.literal(true, {
                required_error: "Is module is required.",
                invalid_type_error: "Is module must be a boolean.",
                message: "Is module must be a true."
            }),
            viewPermission: z.object({
                oldValue: z.boolean({
                    required_error: "Old value is required.",
                    invalid_type_error: "Old value must be a boolean."
                }),
                newValue: z.boolean({
                    required_error: "New value is required.",
                    invalid_type_error: "New value must be a boolean."
                }),
            }, {
                required_error: "View permission is required."
            }),
            addPermission: z.object({
                oldValue: z.boolean({
                    required_error: "Old value is required.",
                    invalid_type_error: "Old value must be a boolean."
                }),
                newValue: z.boolean({
                    required_error: "New value is required.",
                    invalid_type_error: "New value must be a boolean."
                }),
            }, {
                required_error: "Add permission is required."
            }),
            editPermission: z.object({
                oldValue: z.boolean({
                    required_error: "Old value is required.",
                    invalid_type_error: "Old value must be a boolean."
                }),
                newValue: z.boolean({
                    required_error: "New value is required.",
                    invalid_type_error: "New value must be a boolean."
                }),
            }, {
                required_error: "Edit permission is required."
            }),
            deletePermission: z.object({
                oldValue: z.boolean({
                    required_error: "Old value is required.",
                    invalid_type_error: "Old value must be a boolean."
                }),
                newValue: z.boolean({
                    required_error: "New value is required.",
                    invalid_type_error: "New value must be a boolean."
                }),
            }, {
                required_error: "Delete permission is required."
            }),
            executePermission: z.undefined({
                required_error: "Execute permission is required.",
                invalid_type_error: "Execute permission must be undefined if it is for module."
            }),
        }, {
            required_error: "Module permission is required."
        }), {
            invalid_type_error: "Module permissions must be an array.",
            required_error: "Module permissions array is required."
        });
    }

    public static editedRolePermissions = () => {
        return z.array(z.object({
            permissionId: z.number({
                required_error: "Permission id is required.",
                invalid_type_error: "Permission id must be a number."
            }).nonnegative({ message: "Permission id must be > 0." }),
            isModule: z.literal(false, {
                required_error: "Is module is required.",
                invalid_type_error: "Is module must be a boolean.",
                message: "Is module must be a false."
            }),
            viewPermission: z.undefined({
                required_error: "View permission is required.",
                invalid_type_error: "View permission must be undefined if it is not for module."
            }),
            addPermission: z.undefined({
                required_error: "View permission is required.",
                invalid_type_error: "View permission must be undefined if it is not for module."
            }),
            editPermission: z.undefined({
                required_error: "View permission is required.",
                invalid_type_error: "View permission must be undefined if it is not for module."
            }),
            deletePermission: z.undefined({
                required_error: "View permission is required.",
                invalid_type_error: "View permission must be undefined if it is not for module."
            }),
            executePermission: z.object({
                oldValue: z.boolean({
                    required_error: "Old value is required.",
                    invalid_type_error: "Old value must be a boolean."
                }),
                newValue: z.boolean({
                    required_error: "New value is required.",
                    invalid_type_error: "New value must be a boolean."
                }),
            }, {
                required_error: "Execute permission is required."
            }),
        }, {
            required_error: "Role permission is required."
        }), {
            invalid_type_error: "Role permissions must be an array.",
            required_error: "Role permissions array is required."
        });
    }

    /**
     * Get Zod error message from error message
     * @param message Zod error message
     */
    public static getZodErrorMessage(message: string): string {
        const jsonObject = JSON.parse(message);
        if (Conditions.hasAny(jsonObject)) {
            return jsonObject[0].message;
        }
        return "";
    }
}
import { Request, Response, NextFunction } from "express";
import { readFileSync } from "fs";
import { Secret, sign, SignOptions, verify } from "jsonwebtoken";
import { join } from "path";
import CurrentUserData from "../configs/CurrentUserData";
import { HttpStatus, ResponseStatus } from "../enums/APIStatus";
import { LogManager } from "../utilities/logManager/LogManager";
import { DatabaseError } from "pg";

export class Verification {
    private static certificatePath = process.env.CERT_JWT as string;

    public static signJWT(payload: string | object, expiresIn: string = '1 day'): string {
        const privateKey = readFileSync(join(this.certificatePath, '.private.key'), 'utf-8');
        const token = sign(payload, {
            key: privateKey,
            passphrase: process.env.JWT_PASSPHRASE,
        } as Secret, {
            algorithm: 'RS256',
            expiresIn: expiresIn,
            issuer: process.env.JWT_ISSUER,
            keyid: process.env.JWT_KEYID
        } as SignOptions);
        return token;
    }

    public static verifyJWT(token: string, maxAge: string = '1 day'): UserJWTPayload | undefined {
        const publicKey = readFileSync(join(this.certificatePath, '.public.key'), 'utf-8');
        let decodedToken: UserJWTPayload | undefined = undefined;
        verify(token, publicKey, {
            issuer: process.env.JWT_ISSUER,
            algorithms: ['RS256'],
            maxAge: maxAge
        }, function (err, decoded) {
            if (err) {
                throw err;
            } else {
                decodedToken = decoded as UserJWTPayload
            }
        });
        return decodedToken;
    }

    public static userVerification = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let maxAge;
            const decodedToken = Verification.verifyJWT(req.cookies["X-Auth-Token"], maxAge);
            if (!decodedToken) {
                throw new Error("Invalid JWT Token");
            }
            const user = await CurrentUserData.setCurrentUser(decodedToken, true);
            if (user) {
                req.user = user;
            } else {
                throw new Error("User does not exists.");
            }
            next();
        } catch (error) {
            const err = error as Error;
            let responseMessage = err.message;
            if (error instanceof DatabaseError) {
                responseMessage = "Failed to authenticate user."
            }
            LogManager.error(err.message ?? "Failed to authenticate user.", err);
            res.status(HttpStatus.UnAuthorised).json({
                status: ResponseStatus.Error,
                message: responseMessage,
            });
        }
    }
}

export interface UserJWTPayload {
    firstName: string;
    lastName: string;
    email: string;
}
import dotenv from "dotenv";
import path, { join } from "path";
const getDotEnvPath = (_env?: string) => {
    if (_env) {
        return `.env.${_env}`
    }
    return '.env'
}
const result = dotenv.config({ path: path.resolve(process.cwd(), getDotEnvPath(process.env.NODE_ENV)) });
if (result.error) {
    throw result.error;
}

import express, { Application, Request, Response } from "express";
import * as https from "https";
import cookieParser from "cookie-parser";
import cors from "cors";
import AuthRoutes from "./routes/AuthRoutes";
import UserRoutes from "./routes/UserRoutes";
import { readFileSync } from "fs";
import { LogManager } from "./utilities/logManager/LogManager";

class App {
    public app: Application;

    constructor() {
        this.app = express();
        this.initializeServer();
    }

    protected async initializeServer(): Promise<void> {
        this.plugins();
        await LogManager.setupFileLogger();
        await LogManager.setupLogger();
        this.routes();
    }

    protected plugins(): void {
        this.app.use(express.json());
        this.app.use(cookieParser());
        this.app.use(cors({
            origin: process.env.UI_URL,
            credentials: true
        }));
    }

    protected routes(): void {
        this.app.route("/").get((req: Request, res: Response) => {
            res.send("welcome home");
        });
        this.app.use("/api/v1/auth", AuthRoutes);
        this.app.use("/api/v1/users", UserRoutes);
    }
}

const port: number = process.env.API_PORT as unknown as number | 3000;
const app = new App().app;

https.createServer({
    key: readFileSync(join(process.env.CERT_HTTPS as string, 'https.key'), 'utf-8'),
    cert: readFileSync(join(process.env.CERT_HTTPS as string, 'https.crt'), 'utf-8'),
    ca: readFileSync(join(process.env.CERT_HTTPS as string, 'ca.crt'), 'utf-8')
}, app).listen(port, () => {
    console.log(`Server started on port: ${port}.`);
});

export default app;
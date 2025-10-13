import winston, { createLogger, Logger, transports } from "winston";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { DateTime } from "../../customs/DateTime";

export class LogManager {

    public static logger: Logger;
    private static fileLogger: Logger;

    private static _env = process.env.NODE_ENV || 'development';

    /**
     * Setup File Logger
     */
    public static async setupFileLogger() {
        try {
            this.fileLogger = createLogger({
                transports: [
                    new transports.File({
                        filename: this.getLogFilePath(),
                        handleExceptions: true
                    }),
                ],
                format: winston.format.combine(
                    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                    winston.format.errors({ stack: true }),
                    winston.format.printf(({ timestamp, level, message, stack }) => {
                        return stack ? `[${timestamp}] [${level.toUpperCase()}]: ${message}\n${stack}\n----------` : `[${timestamp}] [${level.toUpperCase()}]: ${message}\n----------`;
                    })
                ),
                level: process.env.LOG_LEVEL
            });
            this.scheduleDailyLogFileRotation();
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
     * Setup Elastic Logger
     */
    public static async setupLogger() {
        try {
            this.logger = winston.createLogger({
                level: process.env.LOG_LEVEL || 'info',
                format: winston.format.combine(
                    winston.format.colorize({ all: true }),
                    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                    winston.format.errors({ stack: true }),
                    winston.format.printf(({ timestamp, level, message, stack }) => {
                        return stack ? `[${timestamp}] [${level.toUpperCase()}]: ${message}\n${stack}\n----------` : `[${timestamp}] [${level.toUpperCase()}]: ${message}\n----------`;
                    })
                ),
                transports: [new winston.transports.Console()],
            });
        } catch (error) {
            this.fileLogger.error(error + "\n------------------------------\n");
        }
    }

    /**
     * Log error
     * @param message Message if any
     * @param error Error object if any
     */
    public static error(message: string, error?: Error) {
        try {
            if (this._env !== "test") {
                this.logger.error(message, { err: error });
            }
            this.fileLogger.error(message, { err: error });
        } catch (error) {
            this.fileLogger.error("An error occured while logging in logstash.", error);
        }
    }

    public static fileError(message: string, error?: Error) {
        this.fileLogger.error(message, error);
    }

    /**
     * Log warning
     * @param message Message
     */
    public static warning(message: string) {
        try {
            if (this._env !== "test") {
                this.logger.warn(message);
            }
            this.fileLogger.warn(message);
        } catch (error) {
            this.fileLogger.error("An error occured while logging in logstash.", error);
        }
    }

    /**
     * Log Information
     * @param message Message
     */
    public static information(message: string) {
        try {
            if (this._env !== "test") {
                this.logger.info(message);
            }
            this.fileLogger.info(message);
        } catch (error) {
            this.fileLogger.error("An error occured while logging in logstash.", error);
        }
    }

    /**
     * Schedule daily log file rotation
     */
    private static scheduleDailyLogFileRotation() {
        const now = new Date();
        const tomorrow = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1,
            0, 0, 0, 0
        );
        const msUntilMidnight = tomorrow.getTime() - now.getTime();

        setTimeout(() => {
            this.fileLogger.clear();
            this.fileLogger.add(
                new transports.File({
                    filename: this.getLogFilePath(),
                    handleExceptions: true
                }),
            )
            this.scheduleDailyLogFileRotation();
        }, msUntilMidnight);
    }

    /**
     * Get log file path
     * @returns Log file path
     */
    private static getLogFilePath(): string {
        const logDirectory = process.env.LOGFILE_PATH as string;
        if (!existsSync(logDirectory)) {
            mkdirSync(logDirectory);
        }
        let filePath = `app-`;
        if (this._env === "test") {
            filePath += "test-";
        }
        filePath += `${DateTime.CurrentISOTime().split('T')[0]}.log`;
        return join(logDirectory, filePath);
    }
}
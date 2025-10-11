/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pool } from "pg";
import { DBConnection } from "./enums/StaticValues";
import { LogManager } from "../logManager/LogManager";
import { IPreparedQuery } from "./query/BaseQuery";
import { ModelColumnProperyMapping } from "./helpers/ModelColumnPropertyMapping";

class DBConnector {
    private defaultPGSQLConfig: PostgreSQLConfig = this.createDatabaseConfig(DBConnection.CORE_CONNECTION);
    private pool: Pool;

    constructor(config?: PostgreSQLConfig) {
        if (config) {
            this.pool = new Pool({
                user: config.user,
                host: config.host,
                database: config.database,
                password: config.password,
                port: config.port,
            });
        } else {
            this.pool = new Pool({
                user: this.defaultPGSQLConfig.user,
                host: this.defaultPGSQLConfig.host,
                database: this.defaultPGSQLConfig.database,
                password: this.defaultPGSQLConfig.password,
                port: this.defaultPGSQLConfig.port,
            });
        }
    }

    /**
     * Create Database config
     * @param connection Database connection string
     * @returns Parsed PostgreSQL config
     */
    public createDatabaseConfig(connection: string | undefined): PostgreSQLConfig {
        if (connection) {
            return JSON.parse(connection);
        } else {
            throw new Error("PostgreSQL connection not found.")
        }
    }

    /**
     * Run prepared query in PostgreSQL
     * @param preparedQuery Prepared Query
     * @param modelClass Model class, if want to convert result to model
     * @returns Result
     */
    public async runPreparedQuery<T = unknown>(preparedQuery: IPreparedQuery, modelClass?: { new (): T }): Promise<T[]> {
        try {
            const result = await this.pool.query(preparedQuery.query, preparedQuery.params);
            if (modelClass) {
                return this.mapToModel(result.rows, modelClass);
            } else {
                return result.rows as T[];
            }
        } catch (error) {
            const err = error as Error;
            LogManager.error("Failed to run a query.", err);
            throw error;
        }
    }

    /**
     * Map result rows to model
     * @param rows Result rows
     * @param modelClass Model class
     * @returns Model data
     */
    private mapToModel<T>(rows: any[], modelClass: new () => T): T[] {
        const columnMappings = ModelColumnProperyMapping.getColumnMappings(modelClass);
        return rows.map((row) => {
            const instance = new modelClass();
            for (const [propertyKey, columnName] of Object.entries(columnMappings)) {
                if (row[columnName] !== undefined) {
                    (instance as any)[propertyKey] = row[columnName];
                } else if (row[propertyKey] !== undefined) {
                    (instance as any)[propertyKey] = row[propertyKey];
                } else if (row[(modelClass as any).TABLE_NAME + "." + columnName] !== undefined) {
                    (instance as any)[propertyKey] = row[(modelClass as any).TABLE_NAME + "." + columnName];
                }
            }
            return instance;
        });
    }
}

export interface PostgreSQLConfig {
    user: string,
    host: string,
    database: string,
    password: string,
    port: number,
}

export default DBConnector;
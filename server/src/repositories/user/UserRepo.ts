import CurrentUserData from "../../configs/CurrentUserData";
import { IGridConfig } from "../../configs/GridConfig";
import { Conditions } from "../../customs/Conditions";
import { DateTime } from "../../customs/DateTime";
import { User } from "../../models/User";
import DBConnector, { PostgreSQLConfig } from "../../utilities/pgSQL/DBConnector";
import { JoinType } from "../../utilities/pgSQL/enums/JoinType";
import { QueryAggregateFunction } from "../../utilities/pgSQL/enums/QueryAggregateFunction";
import { QueryOperator } from "../../utilities/pgSQL/enums/QueryOperator";
import { ICount, IOrders, IPreparedQuery } from "../../utilities/pgSQL/query/BaseQuery";
import { DeleteQuery } from "../../utilities/pgSQL/query/DeleteQuery";
import { InsertQuery, InsertQueryParams } from "../../utilities/pgSQL/query/InsertQuery";
import { SelectQuery, SelectQueryParams } from "../../utilities/pgSQL/query/SelectQuery";
import { UpdateQuery } from "../../utilities/pgSQL/query/UpdateQuery";
import { IUserRepo } from "./IUserRepo";

export class UserRepo implements IUserRepo {

    private databaseConnection: DBConnector;
    private _env = process.env.NODE_ENV || 'development';

    /**
     * Get an instance of a repository with default or specific database
     * @param connection PostgreSQL database config
     */
    constructor(connection?: PostgreSQLConfig) {
        this.databaseConnection = new DBConnector(connection);
    }

    /**
     * Create a user
     * @param user User Data
     * @param returnData Is required to return data after performing action
     * @returns Created User or Null
     */
    async create(user: User, returnData?: boolean): Promise<User | null> {
        const insertQueryParams: InsertQueryParams = {
            tableName: User.TABLE_NAME,
            insertColumns: [User.USER_FIRSTNAME, User.USER_LASTNAME, User.USER_EMAIL, User.USER_PASSWORD, User.USER_ISROOT, User.CREATEDDATE],
            values: [user.firstName, user.lastName, user.email, user.password, user.isRoot ?? false, DateTime.CurrentISOTime()]
        }
        if (CurrentUserData.getCurrentUser()) {
            insertQueryParams.insertColumns?.push(User.CREATEDBY);
            insertQueryParams.values = [user.firstName, user.lastName, user.email, user.password, user.isRoot ?? false, DateTime.CurrentISOTime(), CurrentUserData.getCurrentUser().id]
        }
        const insertQuery: InsertQuery = new InsertQuery(insertQueryParams);
        const preparedQuery: IPreparedQuery = insertQuery.generateQuery();
        const insertedUser = await this.databaseConnection.runPreparedQuery(preparedQuery, User);
        if (!Conditions.hasAny(insertedUser)) {
            throw new Error("Failed to create user.");
        }
        if (returnData) {
            return insertedUser[0];
        }
        return null;
    }

    /**
     * Update a user
     * @param user User Data
     * @param returnData Is required to return data after performing action
     * @returns Upadted User or Null
     */
    async update(user: User, returnData?: boolean): Promise<User | null> {
        const updateQuery: UpdateQuery = new UpdateQuery({
            tableName: User.TABLE_NAME,
            updates: [
                { columnName: User.USER_FIRSTNAME, columnValue: user.firstName, updateIfNull: false },
                { columnName: User.USER_LASTNAME, columnValue: user.lastName, updateIfNull: false },
                { columnName: User.USER_EMAIL, columnValue: user.email, updateIfNull: false },
                { columnName: User.UPDATEDBY, columnValue: CurrentUserData.getCurrentUser().id },
                { columnName: User.UPDATEDDATE, columnValue: DateTime.CurrentISOTime() }
            ],
            conditions: [{
                columnName: User.USER_ID,
                columnValue: user.userId,
                operator: QueryOperator.equal
            }]
        });
        const preparedQuery: IPreparedQuery = updateQuery.generateQuery();
        const updatedUser = await this.databaseConnection.runPreparedQuery(preparedQuery, User);
        if (returnData && Conditions.hasAny(updatedUser)) {
            return updatedUser[0];
        }
        return null;
    }

    /**
     * Delete a user
     * @param userId User Id
     * @param returnData Is required to return data after performing action
     * @returns Deleted User or Null
     */
    async delete(userId: number, returnData?: boolean): Promise<User | null> {
        const updateQuery: UpdateQuery = new UpdateQuery({
            tableName: User.TABLE_NAME,
            updates: [
                { columnName: User.DELETEDBY, columnValue: CurrentUserData.getCurrentUser().id },
                { columnName: User.DELETEDDATE, columnValue: DateTime.CurrentISOTime() }
            ],
            conditions: [{
                columnName: User.USER_ID,
                columnValue: userId,
                operator: QueryOperator.equal
            }, {
                columnName: User.USER_ISROOT,
                columnValue: false,
                operator: QueryOperator.equal
            }]
        });
        const preparedQuery: IPreparedQuery = updateQuery.generateQuery();
        const deletedUser = await this.databaseConnection.runPreparedQuery(preparedQuery, User);
        if (returnData && Conditions.hasAny(deletedUser)) {
            return deletedUser[0];
        }
        return null;
    }

    /**
     * Delete all test users
     * @param userId User Id
     * @param returnData Is required to return data after performing action
     * @returns Deleted User or Null
     */
    async deleteAllTestUser(returnData?: boolean): Promise<User | null> {
        if (this._env === "test") {
            const deleteQuery: DeleteQuery = new DeleteQuery({
                tableName: User.TABLE_NAME,
            });
            const preparedQuery: IPreparedQuery = deleteQuery.generateQuery();
            const deletedUser = await this.databaseConnection.runPreparedQuery(preparedQuery, User);
            if (returnData && Conditions.hasAny(deletedUser)) {
                return deletedUser[0];
            }
            return null;
        }
        return null;
    }

    /**
     * Get user details by email address
     * @param email Email Address
     * @returns Fetched User
     */
    async getByEmail(email: string, isAuthRequired: boolean = false, isUserIdRequired: boolean = false): Promise<User | null> {
        const selectQueryParams: SelectQueryParams = {
            tableName: User.TABLE_NAME,
            columns: [
                { columnName: User.USER_FIRSTNAME },
                { columnName: User.USER_LASTNAME },
                { columnName: User.USER_EMAIL },
                { columnName: User.USER_ISROOT }
            ],
            conditions: [
                {
                    columnName: User.USER_EMAIL,
                    columnValue: email,
                    operator: QueryOperator.equal
                },
                {
                    columnName: User.DELETEDDATE,
                    columnValue: "",
                    operator: QueryOperator.isNull
                }
            ]
        }
        if (isAuthRequired) {
            selectQueryParams.columns?.push({
                columnName: User.USER_PASSWORD
            }, {
                columnName: User.USER_ISROOT
            });
        }
        if (isUserIdRequired) {
            selectQueryParams.columns?.push({
                columnName: User.USER_ID
            })
        }
        const getUserQuery: SelectQuery = new SelectQuery(selectQueryParams);
        const preparedQuery: IPreparedQuery = getUserQuery.generateQuery();
        const user = await this.databaseConnection.runPreparedQuery<User>(preparedQuery, User);
        if (!Conditions.hasAny(user)) {
            return null;
        }
        return user[0];
    }

    /**
     * Get user by Id
     * @param userId User Id
     * @returns Fetched User
     */
    async getById(userId: number): Promise<User> {
        const getRoleQuery: SelectQuery = new SelectQuery({
            tableName: User.TABLE_NAME,
            columns: [
                { columnName: User.USER_FIRSTNAME },
                { columnName: User.USER_LASTNAME },
                { columnName: User.USER_EMAIL }
            ],
            conditions: [{
                columnName: User.USER_ID,
                columnValue: userId,
                operator: QueryOperator.equal
            }]
        });
        const preparedQuery: IPreparedQuery = getRoleQuery.generateQuery();
        const user = await this.databaseConnection.runPreparedQuery<User>(preparedQuery, User);
        if (!Conditions.hasAny(user)) {
            throw new Error("User not found.");
        }
        return user[0];
    }

    /**
     * Get count of users
     * @returns Count of users
     */
    async countAll(gridConfig?: IGridConfig): Promise<ICount> {
        let searchText: string | undefined;
        if (gridConfig) {
            searchText = gridConfig.searchText;
        }
        const selectQueryParams: SelectQueryParams = {
            columns: [
                { columnName: User.USER_ID, aggregateFunction: [QueryAggregateFunction.count, QueryAggregateFunction.distinst], alias: "count" }
            ],
            tableName: User.TABLE_NAME,
        }
        if (searchText && searchText !== "") {
            selectQueryParams.conditions = [
                {
                    tableName: User.TABLE_NAME, columnName: User.USER_EMAIL, columnValue: "%" + searchText + "%", operator: QueryOperator.iLike
                },
                {
                    tableName: User.TABLE_NAME, columnName: User.DELETEDDATE, columnValue: "", operator: QueryOperator.isNull
                }
            ];
        } else {
            selectQueryParams.conditions = [{
                tableName: User.TABLE_NAME, columnName: User.DELETEDDATE, columnValue: "", operator: QueryOperator.isNull
            }];
        }
        const getUserCountQuery: SelectQuery = new SelectQuery(selectQueryParams);
        const preparedQuery: IPreparedQuery = getUserCountQuery.generateQuery();
        const users = await this.databaseConnection.runPreparedQuery<ICount>(preparedQuery);
        return users[0];
    }

    /**
     * Get all users
     * @param gridConfig Grid configuration
     * @returns All users
     */
    async getAll(gridConfig?: IGridConfig): Promise<User[]> {
        let limit: number | undefined, offset: number | undefined, orders: IOrders[] | undefined, searchText: string | undefined;
        if (gridConfig) {
            limit = gridConfig.recordPerPage;
            offset = (gridConfig.recordPerPage ?? 0) * (gridConfig.currentPage ?? 0);
            orders = gridConfig.orders;
            searchText = gridConfig.searchText;
        }
        const selectQueryParams: SelectQueryParams = {
            tableName: User.TABLE_NAME,
            columns: [
                { columnName: User.USER_ID, alias: "userId" },
                { columnName: User.USER_FIRSTNAME, alias: "firstName" },
                { columnName: User.USER_LASTNAME, alias: "lastName" },
                { columnName: User.USER_EMAIL, alias: "email" },
                { columnName: User.USER_FIRSTNAME, tableName: User.TABLE_NAME + 1, alias: "createdByUsername" },
                { columnName: User.CREATEDDATE, alias: "createdDate" },
                { columnName: User.USER_FIRSTNAME, tableName: User.TABLE_NAME + 2, alias: "updatedByUsername" },
                { columnName: User.UPDATEDDATE, alias: "updatedDate" }
            ],
            joins: [
                {
                    joinType: JoinType.LeftJoin, tableName: User.TABLE_NAME, tableAliasName: User.TABLE_NAME + 1, joinCondition: [
                        { primaryTableName: User.TABLE_NAME, primaryColumnName: User.CREATEDBY, operator: QueryOperator.equal, secondaryTableName: User.TABLE_NAME + 1, secondaryColumnName: User.USER_ID }
                    ]
                },
                {
                    joinType: JoinType.LeftJoin, tableName: User.TABLE_NAME, tableAliasName: User.TABLE_NAME + 2, joinCondition: [
                        { primaryTableName: User.TABLE_NAME, primaryColumnName: User.UPDATEDBY, operator: QueryOperator.equal, secondaryTableName: User.TABLE_NAME + 2, secondaryColumnName: User.USER_ID }
                    ]
                }
            ],
            limit: limit,
            offset: offset,
            orders: orders
        };
        if (searchText && searchText !== "") {
            selectQueryParams.conditions = [
                {
                    tableName: User.TABLE_NAME, columnName: User.USER_EMAIL, columnValue: "%" + searchText + "%", operator: QueryOperator.iLike
                },
                {
                    tableName: User.TABLE_NAME, columnName: User.DELETEDDATE, columnValue: "", operator: QueryOperator.isNull
                }
            ];
        } else {
            selectQueryParams.conditions = [{
                tableName: User.TABLE_NAME, columnName: User.DELETEDDATE, columnValue: "", operator: QueryOperator.isNull
            }];
        }
        const getAllUsersQuery: SelectQuery = new SelectQuery(selectQueryParams);
        const preparedQuery: IPreparedQuery = getAllUsersQuery.generateQuery();
        const users = await this.databaseConnection.runPreparedQuery(preparedQuery, User);
        return users;
    }
}
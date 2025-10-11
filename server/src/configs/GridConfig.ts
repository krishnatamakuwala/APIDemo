import { ModelKey } from "../enums/ModelKey";
import { User } from "../models/User";
import { ModelColumnProperyMapping } from "../utilities/pgSQL/helpers/ModelColumnPropertyMapping";
import { IOrders } from "../utilities/pgSQL/query/BaseQuery";

export interface IGridConfig {
    recordPerPage?: number;
    totalPage?: number;
    currentPage?: number;
    orders?: IOrders[];
    searchText?: string;
}

export enum ColumnDataType {
    string = 1,
    number = 2,
    date = 3,
    boolean = 4
}

export interface IGridColumnConfig {
    columnName: string;
    columnLabel: string;
    dataType?: ColumnDataType;
    modelKey: string;
    aliasId?: number;
    isPrimaryKey?: boolean;
}

export interface IDefaultPermissions {
    viewPermission: boolean;
    addPermission: boolean;
    editPermission: boolean;
    deletePermission: boolean;
}

export interface IActionPermissions {
    actionId: number;
    actionName: string;
    isAllowed: boolean;
}

export class GridColumnConfig {
    public static getOperatedByColumnConfig(modelKey: ModelKey): IGridColumnConfig[] {
        const userColumnMapping = ModelColumnProperyMapping.getColumnMappings(User);
        const gridColumnConfig: IGridColumnConfig[] = [
            { columnName: ModelColumnProperyMapping.getPropertyByColumnName(User.CREATEDBYUSERNAME, userColumnMapping), columnLabel: "Created By", modelKey: ModelKey.User, aliasId: 1, isPrimaryKey: false },
            { columnName: ModelColumnProperyMapping.getPropertyByColumnName(User.CREATEDDATE, userColumnMapping), columnLabel: "Created Date", modelKey: modelKey, isPrimaryKey: false },
            { columnName: ModelColumnProperyMapping.getPropertyByColumnName(User.UPDATEDBYUSERNAME, userColumnMapping), columnLabel: "Updated By", modelKey: ModelKey.User, aliasId: 2, isPrimaryKey: false },
            { columnName: ModelColumnProperyMapping.getPropertyByColumnName(User.UPDATEDDATE, userColumnMapping), columnLabel: "Updated Date", modelKey: modelKey, isPrimaryKey: false }
        ];
        return gridColumnConfig;
    }
}
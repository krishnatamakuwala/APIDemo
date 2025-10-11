import React, { useState } from 'react';
import { OrderDirection } from '../../../../enums/OrderDirection';
import { DataGrid, GridActionsCellItem, GridColDef, GridColumnVisibilityModel, GridPaginationModel, GridRowParams, GridSortModel } from '@mui/x-data-grid';
import { Delete, Edit, ContentCopy } from '@mui/icons-material';
import { Box, SxProps, Theme } from '@mui/material';

interface IGridProps {
    rowId: string;
    gridData: Record<string, number | string | boolean>[];
    columnConfig: IGridColumnConfig[];
    gridColumnDefinition: GridColDef[];
    gridConfig: IGridConfig;
    setGridConfig: (gridConfig: IGridConfig) => void;
    columnVisibilityModel?: GridColumnVisibilityModel;
    gridLoading?: boolean;
    actions?: IGridAction[];
    defaultActions?: IGridDefaultAction[];
    sx?: SxProps<Theme>;
}

export interface IGridConfig {
    count: number;
    recordPerPage: number;
    totalPage?: number;
    currentPage: number;
    orders: IOrders[];
    searchText?: string;
}

export interface IOrders {
    columnName: string;
    modelKey: string;
    direction: OrderDirection;
    aliasId?: number;
}

export interface IGridAction {
    actionName: string;
    actionIcon: React.JSX.Element;
    actionCallback: (params: GridRowParams) => Promise<void>;
}

export interface IGridDefaultAction {
    isVisible: boolean;
    defaultAction: GridDeaultAction;
    defaultActionCallback: (params: GridRowParams) => Promise<void>;
}

export interface IGridColumnConfig {
    columnName: string;
    columnLabel: string;
    modelKey: string;
    dataType?: ColumnDataType;
    aliasId?: number;
    isPrimaryKey?: boolean;
}

export interface ICount {
    count: number;
}

export enum GridDeaultAction {
    edit = 1,
    clone = 2,
    delete = 3
}

export enum ColumnDataType {
    string = 1,
    number = 2,
    date = 3,
    boolean = 4
}

export default function Grid(props: IGridProps) {
    const [sortModel, setSortModel] = useState<GridSortModel>([]);
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 2,
    });

    const handleChangePage = (
        gridPaginationModel: GridPaginationModel
    ) => {
        setPaginationModel(gridPaginationModel);
        props.setGridConfig({
            ...props.gridConfig,
            recordPerPage: gridPaginationModel.pageSize,
            currentPage: gridPaginationModel.page,
        });
    };

    const handleChangeSorting = (gridSortModel: GridSortModel) => {
        setSortModel(gridSortModel);
        const orders = gridSortModel.map(sort => {
            const column = props.columnConfig.find(column => column.columnName === sort.field);
            let sortOrder = OrderDirection.ASC;
            if (sort.sort === "desc") {
                sortOrder = OrderDirection.DESC;
            }
            if (column) {
                return {
                    columnName: column.columnName,
                    direction: sortOrder,
                    modelKey: column.modelKey,
                    aliasId: column.aliasId
                } as IOrders;
            } else {
                return {
                    columnName: sort.field,
                    direction: sortOrder,
                    modelKey: "",
                } as IOrders;
            }
        })
        props.setGridConfig({
            ...props.gridConfig,
            orders: orders
        });
    }

    const gridColumnDefinition: GridColDef[] = React.useMemo(() => {
        const columns = [...props.gridColumnDefinition];
        const actions: IGridAction[] = [];
        let actionColumnDefinition: GridColDef | undefined;
        function configureDefaultAction() {
            if (props.defaultActions) {
                props.defaultActions.forEach((gridDefaultAction) => {
                    if (gridDefaultAction.isVisible) {
                        let label: string = "";
                        let icon: React.JSX.Element = <></>;
                        switch (gridDefaultAction.defaultAction) {
                            case GridDeaultAction.delete:
                                label = "Delete";
                                icon = <Delete color="error" />
                                break;
                            case GridDeaultAction.edit:
                                label = "Edit";
                                icon = <Edit color="action" />
                                break;
                            case GridDeaultAction.clone:
                                label = "Clone";
                                icon = <ContentCopy color="action" />
                                break;
                        }

                        const gridAction: IGridAction = {
                            actionName: label,
                            actionIcon: icon,
                            actionCallback: gridDefaultAction.defaultActionCallback
                        }
                        actions.push(gridAction);
                    }
                });
            }
            if (props.actions) {
                props.actions.forEach((_action) => {
                    actions.push(_action);
                });
            }
            if (actions.length > 0) {
                actionColumnDefinition = {
                    field: "actions",
                    type: "actions",
                    width: (actions.length * 36) + ((actions.length + 1) * 8),
                    getActions: (params) => [
                        ...actions.map((action, i) => {
                            return (
                                <GridActionsCellItem
                                    key={`${action.actionName}-${params.id}-${i}`}
                                    icon={action.actionIcon}
                                    label={action.actionName}
                                    onClick={() => action.actionCallback(params)}
                                />
                            )
                        })
                    ],
                }
                columns.unshift(actionColumnDefinition);
            }
            return columns;
        }

        return configureDefaultAction();
    }, [props.actions, props.defaultActions, props.gridColumnDefinition]);

    // const drawerWidth = 240;

    return (
        <Box sx={{ height: '100%', width: `100%`, overflowX: 'auto', flexGrow: 1 }}>
            <DataGrid
                rows={props.gridData}
                columns={gridColumnDefinition}
                rowCount={props.gridConfig.count}
                disableColumnSelector
                columnVisibilityModel={props.columnVisibilityModel}
                loading={props.gridLoading}
                pageSizeOptions={[2, 5, 10, 20, 50, 100]}
                paginationModel={paginationModel}
                sortModel={sortModel}
                paginationMode="server"
                sortingMode="server"
                filterMode="server"
                onPaginationModelChange={handleChangePage}
                onSortModelChange={handleChangeSorting}
                getRowId={(row) => {
                    type Key = keyof typeof row;
                    const id: Key = props.rowId;
                    return row[id];
                }}
                sx={{
                    width: "100%",
                    minWidth: "100px",
                    ...props.sx
                }}
            />
        </Box>
    );
}
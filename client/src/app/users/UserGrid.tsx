"use client";

import { forwardRef, Fragment, useEffect, useImperativeHandle, useState } from "react";
import Grid, { GridDeaultAction, ICount, IGridColumnConfig, IGridConfig, IGridDefaultAction } from "@/shared/theme/components/grid/Grid";
import { apiContext, IAPIResponse } from "@/shared/context/APIContext";
import { ResponseStatus } from "@/enums/APIStatus";
import { useAlert } from "@/shared/context/AlertContext";
import { useAuthRedirect, useUserContext } from "@/shared/context/UserContext";
import Loader from "@/shared/theme/components/Loader";
import { GridColDef, GridColumnVisibilityModel, GridRowParams } from "@mui/x-data-grid";
import { ICustomGridProps, ICustomGridRef } from "@/shared/base/CustomGrid";
import { FormType } from "@/shared/base/CustomForm";

const UserGrid = forwardRef<ICustomGridRef, ICustomGridProps>((props, ref) => {
    const { addAlert } = useAlert();
    const { user, loading } = useUserContext();
    useAuthRedirect(user, loading);

    const [gridData, setGridData] = useState<Record<string, number | string | boolean>[]>([]);
    const [gridLoading, setGridLoading] = useState<boolean>(false);
    const [gridConfig, setGridConfig] = useState<IGridConfig>({
        count: 0,
        currentPage: 0,
        orders: [],
        recordPerPage: 2,
        totalPage: 0,
        searchText: ""
    });
    const [gridColumnConfig, setGridColumnConfig] = useState<IGridColumnConfig[]>([]);

    useImperativeHandle(ref, () => ({
        getGridData,
        setSearchText
    }));

    const gridDefaultActions: IGridDefaultAction[] = [
        {
            defaultAction: GridDeaultAction.delete,
            defaultActionCallback: async (params: GridRowParams) => {
                props.handleConfirmDialogOpen(params.row.email);
            },
            isVisible: true
        },
        {
            defaultAction: GridDeaultAction.edit,
            defaultActionCallback: async (params: GridRowParams) => {
                props.resetForm();
                props.setFormType(FormType.edit);
                props.handleEditAndClone(params.id as number);
            },
            isVisible: true
        },
        {
            defaultAction: GridDeaultAction.clone,
            defaultActionCallback: async (params: GridRowParams) => {
                props.resetForm();
                props.setFormType(FormType.add);
                props.handleEditAndClone(params.id as number);
            },
            isVisible: true
        },
    ]

    const gridColumnDefinition: GridColDef[] = [
        { field: "userId", type: "number", width: 100 },
        { field: "firstName", type: "string", headerName: "First Name", width: 100 },
        { field: "lastName", type: "string", headerName: "Last Name", width: 100 },
        { field: "email", type: "string", headerName: "Email", width: 100 },
        { field: "createdByUsername", type: "string", headerName: "Created By", width: 100 },
        {
            field: "createdDate", type: "dateTime", width: 100, valueGetter: (value: string) => {
                if (!value) {
                    return null;
                }
                return new Date(value);
            }, headerName: "Created Date"
        },
        { field: "updatedByUsername", type: "string", headerName: "Updated By", width: 100 },
        {
            field: "updatedDate", type: "dateTime", width: 100, valueGetter: (value: string) => {
                if (!value) {
                    return null;
                }
                return new Date(value);
            }, headerName: "Updated Date"
        }
    ];

    const columnVisibilityModel: GridColumnVisibilityModel = {
        userId: false,
    }

    function setSearchText(searchtext: string) {
        setGridConfig({
            ...gridConfig,
            searchText: searchtext,
        });
    }

    async function getGridColumnConfig(): Promise<ResponseStatus> {
        setGridLoading(true);
        let responseStatus = ResponseStatus.Success;
        apiContext.get("/v1/users/gridConfig")
            .then((response) => {
                const res = response.data as IAPIResponse;
                if (res.status === ResponseStatus.Success) {
                    setGridColumnConfig(res.data as IGridColumnConfig[]);
                } else {
                    addAlert(res.message, res.status);
                }
            })
            .catch((error) => {
                responseStatus = ResponseStatus.Error;
                if (error.response) {
                    const res = error.response.data as IAPIResponse;
                    if (res.message) {
                        responseStatus = res.status;
                        addAlert(res.message, res.status);
                    } else {
                        addAlert("Something went wrong. Please try again after some time.", ResponseStatus.Error);
                    }
                } else {
                    addAlert("Something went wrong. Please try again after some time.", ResponseStatus.Error);
                }
            }).finally(() => {
                setGridLoading(false);
            });
        return responseStatus;
    }

    async function getGridCount(): Promise<ResponseStatus> {
        setGridLoading(true);
        let responseStatus = ResponseStatus.Success;
        apiContext.post("/v1/users/count", {
            config: gridConfig
        })
            .then((response) => {
                const res = response.data as IAPIResponse;
                if (res.status === ResponseStatus.Success) {
                    const count = (res.data as ICount).count;
                    setGridConfig({
                        ...gridConfig,
                        count: count,
                    });
                } else {
                    addAlert(res.message, res.status);
                }
            })
            .catch((error) => {
                responseStatus = ResponseStatus.Error;
                if (error.response) {
                    const res = error.response.data as IAPIResponse;
                    if (res.message) {
                        responseStatus = res.status;
                        addAlert(res.message, res.status);
                    } else {
                        addAlert("Something went wrong. Please try again after some time.", ResponseStatus.Error);
                    }
                } else {
                    addAlert("Something went wrong. Please try again after some time.", ResponseStatus.Error);
                }
            }).finally(() => { setGridLoading(false); });
        return responseStatus;
    }

    async function getGridData() {
        setGridLoading(true);
        if (!gridColumnConfig || gridColumnConfig.length === 0) {
            const responseStatus = await getGridColumnConfig();
            if (responseStatus !== ResponseStatus.Success) {
                return;
            }
        }
        const responseStatus = await getGridCount();
        if (responseStatus !== ResponseStatus.Success) {
            return;
        }
        apiContext.post("/v1/users/", {
            config: gridConfig
        }).then((response) => {
            const res = response.data as IAPIResponse;
            if (res.status === ResponseStatus.Success) {
                setGridData(res.data as Record<string, number | string | boolean>[]);
            } else {
                addAlert(res.message, res.status);
            }
        }).catch((error) => {
            if (error.response) {
                const res = error.response.data as IAPIResponse;
                if (res.message) {
                    addAlert(res.message, res.status);
                } else {
                    addAlert("Something went wrong. Please try again after some time.", ResponseStatus.Error);
                }
            } else {
                addAlert("Something went wrong. Please try again after some time.", ResponseStatus.Error);
            }
        })
            .finally(() => {
                setGridLoading(false);
            });
    }

    useEffect(() => {
        if (!loading && user) {
            getGridData();
        }
    }, [loading, user, gridConfig.currentPage, gridConfig.recordPerPage, gridConfig.orders, gridConfig.searchText]);

    return (
        <Fragment>
            {!loading && user ? (
                <Fragment>
                    <Grid
                        rowId="userId"
                        gridData={gridData}
                        gridColumnDefinition={gridColumnDefinition}
                        columnVisibilityModel={columnVisibilityModel}
                        gridConfig={gridConfig}
                        setGridConfig={setGridConfig}
                        gridLoading={gridLoading}
                        columnConfig={gridColumnConfig}
                        defaultActions={gridDefaultActions}
                    />
                </Fragment>
            ) : (
                <Loader />
            )}
        </Fragment>
    );
});
UserGrid.displayName = "UserGrid";

export default UserGrid;
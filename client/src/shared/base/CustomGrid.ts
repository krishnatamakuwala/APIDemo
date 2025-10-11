import { FormType } from "./CustomForm";

export interface ICustomGridProps {
    handleEditAndClone: (id: number) => void;
    handleConfirmDialogOpen: (value: string) => void;
    setFormType: (formType: FormType) => void;
    resetForm: () => void;
}

export interface ICustomGridRef {
    getGridData: () => void;
    setSearchText: (searchText: string) => void;
}
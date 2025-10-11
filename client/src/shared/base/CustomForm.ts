export enum FormType {
    add = "Add",
    edit = "Edit"
}

export interface ICustomFormProps {
    formOpen: boolean;
    formType: FormType;
    setFormOpen: (open: boolean) => void;
    refreshGrid?: () => void;
}

export interface ICustomFormRef {
    resetForm: () => void;
    getFormData: (id: number) => void;
    handleDelete: (email: string, password: string) => void;
}
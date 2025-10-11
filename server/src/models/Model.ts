import { ColumnName } from "../customs/Decorators";

export class Model {
    public static columnMappings: Record<string, string> = {};

    public static TABLE_NAME:string = "";
    public static CREATEDBY:string = "c_createdby";
	public static CREATEDDATE:string = "c_createddate";
	public static UPDATEDBY:string = "c_updatedby";
	public static UPDATEDDATE:string = "c_updateddate";
    public static DELETEDBY:string = "c_deletedby";
	public static DELETEDDATE:string = "c_deleteddate";
    public static CREATEDBYUSERNAME:string = "c_createdbyusername";
    public static UPDATEDBYUSERNAME:string = "c_updatedbyusername";
    public static DELETEDBYUSERNAME:string = "c_deletedbyusername";

    @ColumnName("c_createdby")
    createdBy!: number;
    
    @ColumnName("c_createddate")
    createdDate!: string;
    
    @ColumnName("c_updatedby")
    updatedBy!: number;
    
    @ColumnName("c_updateddate")
    updatedDate!: string;

    @ColumnName("c_deletedby")
    deletedBy!: number;
    
    @ColumnName("c_deleteddate")
    deletedDate!: string;

    @ColumnName("c_createdbyusername")
    createdByUsername!: string;

    @ColumnName("c_updatedbyusername")
    updatedByUsername!: string;

    @ColumnName("c_deletedbyusername")
    deletedByUsername!: string;
}
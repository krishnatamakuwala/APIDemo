import { IGridConfig } from "../../configs/GridConfig";
import { User } from "../../models/User";
import { ICount } from "../../utilities/pgSQL/query/BaseQuery";

export interface IUserRepo {
    create(user: User, returnData?: boolean): Promise<User | null>;
    update(user: User, returnData?: boolean): Promise<User | null>;
    delete(userId: number, returnData?: boolean): Promise<User | null>;
    getByEmail(email: string, isAuthRequired: boolean): Promise<User | null>;
    getById(userId: number): Promise<User>;
    countAll(gridConfig?: IGridConfig): Promise<ICount>;
    getAll(gridConfig?: IGridConfig): Promise<User[]>
}
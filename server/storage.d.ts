import { type User, type UpsertUser } from "../shared/schema";
export interface IStorage {
    getUser(id: string): Promise<User | undefined>;
    upsertUser(user: UpsertUser): Promise<User>;
}
export declare class DatabaseStorage implements IStorage {
    getUser(id: string): Promise<User | undefined>;
    upsertUser(userData: UpsertUser): Promise<User>;
}
export declare const storage: DatabaseStorage;
//# sourceMappingURL=storage.d.ts.map
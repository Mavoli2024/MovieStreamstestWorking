import { users, } from "../shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
export class DatabaseStorage {
    // User operations
    // (IMPORTANT) these user operations are mandatory for Replit Auth.
    async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
    }
    async upsertUser(userData) {
        const [user] = await db
            .insert(users)
            .values(userData)
            .onConflictDoUpdate({
            target: users.id,
            set: {
                ...userData,
                updatedAt: new Date(),
            },
        })
            .returning();
        return user;
    }
}
export const storage = new DatabaseStorage();
//# sourceMappingURL=storage.js.map
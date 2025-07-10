import { UserState } from "@/common/Common";

export class User {
    uniqueId: string;
    name: string;
    state: UserState;

    constructor(uniqueId: string, name: string, state: UserState) {
        this.uniqueId = uniqueId;
        this.name = name;
        this.state = state;
    }
}

export class UserStorage {
    private connectionIdToUser: Map<string, User> = new Map();

    constructor() {
        this.connectionIdToUser = new Map();
    }

    getUser(connectionId: string): User | undefined {
        return this.connectionIdToUser.get(connectionId);
    }

    createUser(connectionId: string, name: string, state: UserState) {
        const user = new User(connectionId, name, state);
        this.connectionIdToUser.set(connectionId, user);
        return user;
    }

    updateUniqueId(connectionId: string, uniqueId: string) {
        let users = Array.from(this.connectionIdToUser.entries())
            .filter(([key, user]) => user.uniqueId === uniqueId);

        if(users.length === 0) {
            throw new Error("User not found");
        }

        this.connectionIdToUser.delete(users[0][0]);
        this.connectionIdToUser.set(connectionId, users[0][1]);
        
        if (users.length > 1) {
            for (let i = 1; i < users.length; i++) {
                this.connectionIdToUser.delete(users[i][0]);
            }
        }
    }

    getUniqueId(connectionId: string): string {
        const user = this.getUser(connectionId)
        if (user === undefined) {
            throw new Error("User not found");
        }
        return user.uniqueId;
    }
}

export const userStorage = new UserStorage();

export { UserState };

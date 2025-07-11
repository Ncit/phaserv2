import { ClientUserRegister } from "@/common/Game";

export class User {
    uniqueId: string;
    name: string;
    avatarUrl: string;
    isAnonymous: boolean;
    balance: number;

    constructor(uniqueId: string, name: string, avatarUrl: string, isAnonymous: boolean) {
        this.uniqueId = uniqueId;
        this.name = name;
        this.avatarUrl = avatarUrl;
        this.isAnonymous = isAnonymous;
        this.balance = 20000;
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

    createUser(connectionId: string) {
        const user = new User(connectionId, "Unknown", "", true);
        this.connectionIdToUser.set(connectionId, user);
        return user;
    }

    updateUniqueId(connectionId: string, uniqueId: string) {
        let users = Array.from(this.connectionIdToUser.entries())
            .filter(([key, user]) => user.uniqueId === uniqueId);

        if (users.length === 0) {
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

    registerUser(connectionId: string, data: ClientUserRegister) {
        let user = this.connectionIdToUser.get(connectionId)
        if (user === undefined) {
            user = new User(data.uniqueId, data.name, data.avatarUrl, false);
            this.connectionIdToUser.set(connectionId, user);
        } else {
            user.uniqueId = data.uniqueId;
            user.name = data.name;
            user.avatarUrl = data.avatarUrl;
            user.isAnonymous = false;
        }
        return this.getUser(connectionId);
    }

    getBalanceForUniqueId(uniqueId: string): number {
        const user = Array.from(this
            .connectionIdToUser
            .values())
            .find(u => u.uniqueId === uniqueId)
        if (user === undefined) {
            throw new Error("User not found");
        }
        return user.balance;
    }

    balanceAddForUniqueId(uniqueId: string, amount: number) {
        const user = Array.from(this
            .connectionIdToUser
            .values())
            .find(u => u.uniqueId === uniqueId)
        if (user === undefined) {
            throw new Error("User not found");
        }
        user.balance += amount;
    }

    balanceSubForUniqueId(uniqueId: string, amount: number) {
        const user = Array.from(this
            .connectionIdToUser
            .values())
            .find(u => u.uniqueId === uniqueId)
        if (user === undefined) {
            throw new Error("User not found");
        }
        user.balance -= amount;
    }
}

export const userStorage = new UserStorage();

import { randomString, sha256 } from "./utils";
import { v4 as uuidv4 } from "uuid";

const SALT_SIZE: number = 10;

export type UserID = string;
export type Username = string;

export class User {
    private salt: string;
    private hash: string;
    private id: UserID;

    constructor(password: string, id: UserID) {
        this.salt = randomString(SALT_SIZE);
        this.hash = sha256(password + this.salt);
        this.id = id;
    }

    validate_password(password: string): boolean {
        if (password == null) {
            return false;
        }

        return this.hash == sha256(password + this.salt)
    }
    
    get_id(): UserID {
        return this.id;
    }
}

class UserManager {
    private user_map: Map<UserID, User>;
    private id_map: Map<Username, UserID>;

    constructor() {
        this.user_map = new Map();
        this.id_map = new Map();
    }

    add_user(username: Username, password: string): boolean {
        if (username == null || password == null) {
            return false;
        }

        if (this.id_map.has(username)) {
            return false
        }

        const id = uuidv4();

        this.id_map.set(username, id);
        this.user_map.set(id, new User(password, id));

        return true;
    }

    get_user(username: Username): User | undefined {
        if (username == undefined) {
            return undefined
        }

        const id = this.id_map.get(username)
        if (id == undefined) {
            return undefined;
        }
        return this.user_map.get(id);
    }
}

const USER_MANAGER = new UserManager();

export const get_user = (username: Username) => USER_MANAGER.get_user(username)

export function load_user() {
    let user = process.env.USERNAME
    let password = process.env.PASSWORD

    if (user == undefined || password == undefined) {
        throw "USERNAME and PASSWORD environement variables needs to be set"
    }

    USER_MANAGER.add_user(user, password)
}

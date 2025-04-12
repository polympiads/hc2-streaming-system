import { revoke_session_for_user } from "./session";
import { randomString, sha256 } from "./utils";
import { v4 as uuidv4 } from "uuid";

const SALT_SIZE: number = 10;

export type UserID = string;
export type Username = string;

export enum UserType {
    Admin,
    Camera
};

export class User {
    private name: string;
    private salt: string;
    private hash: string;
    private id: UserID;
    private type: UserType;

    constructor(name: string, password: string, id: UserID, type: UserType) {
        this.salt = randomString(SALT_SIZE);
        this.hash = sha256(password + this.salt);
        this.id = id;
        this.type = type;
        this.name = name;
    }

    with_new_password(password: string): User {
        return new User(this.name, password, this.id, this.type);
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

    get_type(): UserType {
        return this.type;
    }

    get_name(): string {
        return this.name;
    }
}

class UserManager {
    private user_map: Map<UserID, User>;
    private id_map: Map<Username, UserID>;

    constructor() {
        this.user_map = new Map();
        this.id_map = new Map();
    }

    add_user(username: Username, password: string, type: UserType): boolean {
        if (username == null || password == null) {
            return false;
        }

        if (this.id_map.has(username)) {
            return false
        }

        const id = uuidv4();

        this.id_map.set(username, id);
        this.user_map.set(id, new User(username, password, id, type));

        return true;
    }

    remove_user(username: Username): boolean {
        if (username == null) {
            return false;
        }

        const user_id = this.id_map.get(username);
        if (user_id == undefined) {
            return false
        }

        const user = this.user_map.get(user_id);
        if (user == undefined) {
            this.id_map.delete(user_id);
            return true;
        }
        if (user.get_type() == UserType.Admin) {
            return false;
        }

        this.user_map.delete(user_id);

        revoke_session_for_user(user_id);

        return true;
    }

    set_new_password(username: Username, password: string): boolean {
        let id = this.id_map.get(username)
        if (id == undefined) {
            return false;
        }

        let user = this.user_map.get(id);
        if (user == undefined) {
            return false;
        }

        this.user_map.set(id, user.with_new_password(password));
        revoke_session_for_user(id);

        return true;
    }

    get_user_by_name(username: Username): User | undefined {
        if (username == undefined) {
            return undefined
        }

        const id = this.id_map.get(username);
        if (id == undefined) {
            return undefined;
        }

        return this.get_user_by_id(id);
    }

    get_user_by_id(id: UserID): User | undefined {
        if (id == undefined) {
            return undefined
        }

        return this.user_map.get(id);
    }

    get_all_users(): MapIterator<[Username, UserID]> {
        return this.id_map.entries()
    }
}

const USER_MANAGER = new UserManager();

export const add_user = (username: Username, password: string) => USER_MANAGER.add_user(username, password, UserType.Camera);
export const remove_user = (username: Username) => USER_MANAGER.remove_user(username);

export const set_new_password = (username: Username, password: string) => USER_MANAGER.set_new_password(username, password)
export const get_user_by_name = (username: Username) => USER_MANAGER.get_user_by_name(username)
export const get_user = (username: UserID) => USER_MANAGER.get_user_by_id(username)
export const all_user_iterator = () => USER_MANAGER.get_all_users()

export function load_user() {
    let user = process.env.USERNAME
    let password = process.env.PASSWORD

    if (user == undefined || password == undefined) {
        throw "USERNAME and PASSWORD environement variables needs to be set"
    }

    USER_MANAGER.add_user(user, password, UserType.Admin)
}
